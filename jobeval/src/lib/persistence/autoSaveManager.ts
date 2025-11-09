/**
 * Auto-save manager for JobEval data persistence
 *
 * Provides automatic saving to localStorage with debouncing,
 * backup management, and status broadcasting.
 */

import { useCompanyStore } from "@/features/company-setup/companyStore";
import { useMatchingStore } from "@/features/bls-matching/matchingStore";
import { useQuickAdvisoryStore } from "@/features/quick-advisory/quickAdvisoryStore";
import { useWizardStore } from "@/features/position-wizard/wizardStore";
import { usePositionStore } from "@/features/position-wizard/positionStore";
import { gatherAllData } from "./exportService";
import type { SaveError } from "./dataStructure";

/**
 * Auto-save status information
 */
export interface AutoSaveStatus {
  /** Timestamp of last successful save */
  lastSaved: Date | null;

  /** Whether a save operation is currently in progress */
  isSaving: boolean;

  /** Error from last save attempt, if any */
  error: SaveError | null;

  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
}

/**
 * Auto-save configuration options
 */
interface AutoSaveOptions {
  /** Interval in milliseconds between saves (default: 20000) */
  intervalMs?: number;

  /** localStorage key prefix for backups (default: "jobeval-backup") */
  storageKey?: string;
}

/**
 * Status change callback function
 */
type StatusCallback = (status: AutoSaveStatus) => void;

// Module state
let initialized = false;
let saveTimeoutId: number | null = null;
let storeUnsubscribers: Array<() => void> = [];
const statusCallbacks: Set<StatusCallback> = new Set();

// Current status
const currentStatus: AutoSaveStatus = {
  lastSaved: null,
  isSaving: false,
  error: null,
  hasUnsavedChanges: false,
};

// Configuration
let config: Required<AutoSaveOptions> = {
  intervalMs: 20000,
  storageKey: "jobeval-backup",
};

/**
 * Notify all subscribers of status change
 */
function notifyStatusChange(): void {
  statusCallbacks.forEach((callback) => {
    try {
      callback({ ...currentStatus });
    } catch (error) {
      console.error("Error in auto-save status callback:", error);
    }
  });
}

/**
 * Update status and notify subscribers
 */
function updateStatus(partial: Partial<AutoSaveStatus>): void {
  Object.assign(currentStatus, partial);
  notifyStatusChange();

  // Persist status metadata to localStorage
  try {
    const metadata = {
      lastSaved: currentStatus.lastSaved?.toISOString() || null,
      hasUnsavedChanges: currentStatus.hasUnsavedChanges,
    };
    localStorage.setItem("jobeval-autosave-status", JSON.stringify(metadata));
  } catch (error) {
    // Fail silently for metadata - not critical
    console.warn("Failed to save auto-save metadata:", error);
  }
}

/**
 * Load persisted status from localStorage
 */
function loadPersistedStatus(): void {
  try {
    const metadata = localStorage.getItem("jobeval-autosave-status");
    if (metadata) {
      const parsed = JSON.parse(metadata);
      if (parsed.lastSaved) {
        currentStatus.lastSaved = new Date(parsed.lastSaved);
      }
      currentStatus.hasUnsavedChanges = parsed.hasUnsavedChanges || false;
    }
  } catch (error) {
    console.warn("Failed to load auto-save metadata:", error);
  }
}

/**
 * Get all backup keys from localStorage
 */
function getBackupKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${config.storageKey}-`)) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error("Failed to enumerate localStorage keys:", error);
  }
  return keys.sort().reverse(); // Most recent first
}

/**
 * Clean up old backups (keep only last 3)
 */
export function cleanOldBackups(): void {
  try {
    const backupKeys = getBackupKeys();

    // Keep only the 3 most recent backups
    if (backupKeys.length > 3) {
      const keysToDelete = backupKeys.slice(3);
      keysToDelete.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to delete old backup: ${key}`, error);
        }
      });
    }
  } catch (error) {
    console.error("Failed to clean old backups:", error);
  }
}

/**
 * Perform the actual save operation
 */
async function performSave(): Promise<void> {
  // Set saving status
  updateStatus({ isSaving: true, error: null });

  try {
    // Gather all data from stores
    const data = gatherAllData();

    // Serialize to JSON
    const jsonString = JSON.stringify(data);

    // Generate key with timestamp
    const timestamp = new Date().toISOString();
    const key = `${config.storageKey}-${timestamp}`;

    // Save to localStorage
    try {
      localStorage.setItem(key, jsonString);
    } catch (storageError) {
      // Check if it's a quota exceeded error
      if (
        storageError instanceof Error &&
        (storageError.name === "QuotaExceededError" || storageError.message.includes("quota"))
      ) {
        // Try to clean old backups and retry once
        cleanOldBackups();
        localStorage.setItem(key, jsonString);
      } else {
        throw storageError;
      }
    }

    // Clean old backups after successful save
    cleanOldBackups();

    // Update status
    updateStatus({
      lastSaved: new Date(),
      isSaving: false,
      error: null,
      hasUnsavedChanges: false,
    });
  } catch (error) {
    // Create error object
    const saveError: SaveError = {
      timestamp: new Date(),
      errorType: "storage_full",
      message: error instanceof Error ? error.message : "Unknown auto-save error",
      stack: error instanceof Error ? error.stack : undefined,
      userAction: "auto_save",
    };

    // Update status with error
    updateStatus({
      isSaving: false,
      error: saveError,
    });

    // Log error but don't throw - fail gracefully
    console.error("Auto-save failed:", error);
  }
}

/**
 * Schedule a debounced save
 */
function scheduleSave(): void {
  // Clear existing timeout
  if (saveTimeoutId !== null) {
    clearTimeout(saveTimeoutId);
  }

  // Mark as having unsaved changes
  updateStatus({ hasUnsavedChanges: true });

  // Schedule new save
  saveTimeoutId = window.setTimeout(() => {
    performSave();
    saveTimeoutId = null;
  }, config.intervalMs);
}

/**
 * Handle store change event
 */
function handleStoreChange(): void {
  scheduleSave();
}

/**
 * Subscribe to all stores
 */
function subscribeToStores(): void {
  // Subscribe to each store
  const companyUnsubscribe = useCompanyStore.subscribe(handleStoreChange);
  const matchingUnsubscribe = useMatchingStore.subscribe(handleStoreChange);
  const quickAdvisoryUnsubscribe = useQuickAdvisoryStore.subscribe(handleStoreChange);
  const wizardUnsubscribe = useWizardStore.subscribe(handleStoreChange);
  const positionUnsubscribe = usePositionStore.subscribe(handleStoreChange);

  // Store unsubscribers for cleanup
  storeUnsubscribers = [
    companyUnsubscribe,
    matchingUnsubscribe,
    quickAdvisoryUnsubscribe,
    wizardUnsubscribe,
    positionUnsubscribe,
  ];
}

/**
 * Unsubscribe from all stores
 */
function unsubscribeFromStores(): void {
  storeUnsubscribers.forEach((unsubscribe) => unsubscribe());
  storeUnsubscribers = [];
}

/**
 * Initialize auto-save manager
 * Starts listening to store changes and saves periodically
 *
 * @param options - Configuration options
 */
export function initializeAutoSave(options?: AutoSaveOptions): void {
  // Guard against double initialization
  if (initialized) {
    console.warn("Auto-save manager already initialized");
    return;
  }

  // Merge options with defaults
  config = {
    intervalMs: options?.intervalMs ?? 20000,
    storageKey: options?.storageKey ?? "jobeval-backup",
  };

  // Load persisted status
  loadPersistedStatus();

  // Subscribe to stores
  subscribeToStores();

  // Mark as initialized
  initialized = true;

  console.log(
    `Auto-save initialized (interval: ${config.intervalMs}ms, key: ${config.storageKey})`
  );
}

/**
 * Manually trigger a save
 * Cancels any pending debounced save and saves immediately
 */
export async function triggerSave(): Promise<void> {
  // Cancel pending save
  if (saveTimeoutId !== null) {
    clearTimeout(saveTimeoutId);
    saveTimeoutId = null;
  }

  // Perform immediate save
  await performSave();
}

/**
 * Get current auto-save status
 *
 * @returns Current status snapshot
 */
export function getAutoSaveStatus(): AutoSaveStatus {
  return { ...currentStatus };
}

/**
 * Subscribe to auto-save status changes
 *
 * @param callback - Function to call when status changes
 * @returns Unsubscribe function
 */
export function subscribeToAutoSave(callback: StatusCallback): () => void {
  statusCallbacks.add(callback);

  // Call immediately with current status
  callback({ ...currentStatus });

  // Return unsubscribe function
  return () => {
    statusCallbacks.delete(callback);
  };
}

/**
 * Cleanup function (for testing or shutdown)
 * Not exported as part of public API
 */
export function __cleanup(): void {
  if (saveTimeoutId !== null) {
    clearTimeout(saveTimeoutId);
    saveTimeoutId = null;
  }
  unsubscribeFromStores();
  statusCallbacks.clear();
  initialized = false;
  currentStatus.lastSaved = null;
  currentStatus.isSaving = false;
  currentStatus.error = null;
  currentStatus.hasUnsavedChanges = false;
}
