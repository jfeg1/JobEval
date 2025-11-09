import { useEffect, useState, type ReactElement } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { autoSaveManager, type SaveEvent } from "../lib/persistence/autoSaveManager";

type DisplayStatus = "saved" | "saving" | "error" | "hidden";

interface StatusConfig {
  icon: ReactElement;
  text: string;
  textColor: string;
  ariaLabel: string;
}

/**
 * Format time elapsed since last save
 */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

/**
 * Format time for mobile display (short form)
 */
function formatTimeAgoShort(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * SaveStatusIndicator - Shows the current save status in the header bar
 *
 * Displays different states:
 * - Saved: Green checkmark with timestamp
 * - Saving: Animated spinner
 * - Error: Red X with retry option
 * - Hidden: Nothing shown if no data exists yet
 */
export function SaveStatusIndicator(): ReactElement {
  const [status, setStatus] = useState<DisplayStatus>("hidden");
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Subscribe to save events
  useEffect(() => {
    const unsubscribe = autoSaveManager.subscribe((event: SaveEvent) => {
      // Map save event status to display status
      if (event.status === "saving") {
        setStatus("saving");
        setIsVisible(true);
      } else if (event.status === "saved") {
        setStatus("saved");
        setTimestamp(event.timestamp);
        setIsVisible(true);
      } else if (event.status === "error") {
        setStatus("error");
        setError(event.error || "Save failed");
        setIsVisible(true);
      } else {
        // idle state
        setStatus("hidden");
        setIsVisible(false);
      }
    });

    return unsubscribe;
  }, []);

  // Update timestamp display every second
  useEffect(() => {
    if (status !== "saved") return;

    const interval = setInterval(() => {
      setTimestamp((prev) => prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Auto-hide after 5 seconds of no activity (optional)
  useEffect(() => {
    if (status !== "saved") return;

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [status, timestamp]);

  // Handle retry click
  const handleRetry = async () => {
    await autoSaveManager.retry();
  };

  // Status configurations
  const statusConfigs: Record<Exclude<DisplayStatus, "hidden">, StatusConfig> = {
    saved: {
      icon: <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />,
      text: `Saved ${formatTimeAgo(timestamp)}`,
      textColor: "text-emerald-600",
      ariaLabel: `Data saved ${formatTimeAgo(timestamp)}`,
    },
    saving: {
      icon: <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#6b7280" }} />,
      text: "Saving...",
      textColor: "text-gray-600",
      ariaLabel: "Saving data",
    },
    error: {
      icon: <XCircle className="w-4 h-4" style={{ color: "#ef4444" }} />,
      text: "Save failed - Click to retry",
      textColor: "text-red-600",
      ariaLabel: `Save failed: ${error || "Unknown error"}. Click to retry`,
    },
  };

  // Don't render if hidden
  if (status === "hidden" || !isVisible) {
    return <div aria-live="polite" aria-atomic="true" className="sr-only" />;
  }

  const config = statusConfigs[status];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={config.ariaLabel}
      className={`
        flex items-center gap-2 text-sm transition-opacity duration-300
        ${isVisible ? "opacity-100" : "opacity-0"}
        ${status === "error" ? "cursor-pointer hover:opacity-80" : ""}
      `}
      onClick={status === "error" ? handleRetry : undefined}
      onKeyDown={
        status === "error"
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRetry();
              }
            }
          : undefined
      }
      tabIndex={status === "error" ? 0 : -1}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{config.icon}</div>

      {/* Text - Full on desktop, short on mobile */}
      <span className={`hidden sm:inline ${config.textColor}`}>{config.text}</span>

      {/* Mobile: Show only timestamp for saved state */}
      {status === "saved" && (
        <span className={`sm:hidden ${config.textColor}`}>{formatTimeAgoShort(timestamp)}</span>
      )}

      {/* Mobile: Show "Saving..." for saving state */}
      {status === "saving" && <span className={`sm:hidden ${config.textColor}`}>Saving...</span>}

      {/* Mobile: Show "Retry" for error state */}
      {status === "error" && <span className={`sm:hidden ${config.textColor}`}>Retry</span>}
    </div>
  );
}
