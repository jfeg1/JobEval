/**
 * AutoSaveManager - Manages save status events for the application
 *
 * This service provides a centralized way to track and emit save status events
 * that can be consumed by UI components like SaveStatusIndicator.
 */

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SaveEvent {
  status: SaveStatus;
  timestamp: number;
  error?: string;
}

type SaveEventListener = (event: SaveEvent) => void;

class AutoSaveManager {
  private listeners: Set<SaveEventListener> = new Set();
  private currentStatus: SaveStatus = "idle";
  private lastSaveTime: number | null = null;
  private lastError: string | null = null;
  private retryCallback: (() => Promise<void>) | null = null;

  /**
   * Subscribe to save status events
   */
  subscribe(listener: SaveEventListener): () => void {
    this.listeners.add(listener);

    // Immediately notify the listener of the current state
    if (this.currentStatus !== "idle") {
      listener({
        status: this.currentStatus,
        timestamp: this.lastSaveTime || Date.now(),
        error: this.lastError || undefined,
      });
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit a save event to all listeners
   */
  private emit(event: SaveEvent): void {
    this.currentStatus = event.status;

    if (event.status === "saved") {
      this.lastSaveTime = event.timestamp;
      this.lastError = null;
    } else if (event.status === "error") {
      this.lastError = event.error || "Save failed";
    }

    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Notify that a save operation is starting
   */
  setSaving(): void {
    this.emit({
      status: "saving",
      timestamp: Date.now(),
    });
  }

  /**
   * Notify that a save operation completed successfully
   */
  setSaved(): void {
    this.emit({
      status: "saved",
      timestamp: Date.now(),
    });
  }

  /**
   * Notify that a save operation failed
   */
  setError(error: string, retryCallback?: () => Promise<void>): void {
    this.retryCallback = retryCallback || null;
    this.emit({
      status: "error",
      timestamp: Date.now(),
      error,
    });
  }

  /**
   * Retry the last failed save operation
   */
  async retry(): Promise<void> {
    if (this.retryCallback) {
      try {
        this.setSaving();
        await this.retryCallback();
        this.setSaved();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Save failed";
        this.setError(errorMessage, this.retryCallback);
      }
    }
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.currentStatus = "idle";
    this.lastSaveTime = null;
    this.lastError = null;
    this.retryCallback = null;
    this.emit({
      status: "idle",
      timestamp: Date.now(),
    });
  }

  /**
   * Get the current save status
   */
  getStatus(): {
    status: SaveStatus;
    lastSaveTime: number | null;
    error: string | null;
  } {
    return {
      status: this.currentStatus,
      lastSaveTime: this.lastSaveTime,
      error: this.lastError,
    };
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();
