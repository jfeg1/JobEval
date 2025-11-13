/**
 * Beta Banner Component
 *
 * Dismissible banner that appears at the top of the app to inform users
 * that JobEval is in beta and encourage them to provide feedback.
 * Reappears after 14 days when dismissed.
 */

import { useState, useEffect } from "react";

interface BetaBannerProps {
  onReportBug: () => void;
  onRequestFeature: () => void;
}

const STORAGE_KEY = "jobeval_beta_banner_dismissed";
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

export function BetaBanner({ onReportBug, onRequestFeature }: BetaBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the banner was previously dismissed
    const dismissedAt = localStorage.getItem(STORAGE_KEY);

    if (!dismissedAt) {
      // Never dismissed, show the banner
      setIsVisible(true);
      return;
    }

    const dismissedTimestamp = parseInt(dismissedAt, 10);
    const now = Date.now();
    const timeSinceDismissed = now - dismissedTimestamp;

    if (timeSinceDismissed >= DISMISS_DURATION_MS) {
      // More than 14 days have passed, show the banner again
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="bg-orange-50 border-b-2 border-orange-200"
      role="banner"
      aria-label="Beta version notice"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Message */}
          <div className="flex items-start gap-3 flex-1 min-w-[280px]">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                <strong>JobEval Beta v0.9</strong> - Help us improve!
              </p>
              <p className="text-sm text-orange-800 mt-1">
                This is a beta release. Found a bug or have a feature idea? Let us know!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onReportBug}
              className="text-sm font-medium text-orange-900 hover:text-orange-700 underline transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Report a bug"
            >
              Report Bug
            </button>
            <button
              onClick={onRequestFeature}
              className="text-sm font-medium text-orange-900 hover:text-orange-700 underline transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Request a feature"
            >
              Request Feature
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-2 p-1 text-orange-600 hover:text-orange-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
              aria-label="Dismiss banner"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
