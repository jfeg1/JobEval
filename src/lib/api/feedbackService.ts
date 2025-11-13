/**
 * Feedback API Service
 *
 * Handles communication with the /api/feedback endpoint for bug reports and feature requests.
 * Auto-detects environment information from the user's browser.
 */

import packageInfo from "../../../package.json";

// ============================================================================
// Types
// ============================================================================

export interface EnvironmentInfo {
  version: string;
  flow: "Quick Advisory" | "In-Depth Analysis" | "Unknown";
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet";
}

export interface BugReportData {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  dataContext?: string;
  additionalContext?: string;
}

export interface FeatureRequestData {
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  alternatives?: string;
  scope: "Quick Advisory" | "In-Depth Analysis" | "Both" | "Other";
  priority: "Low" | "Medium" | "High";
}

export interface FeedbackResponse {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  message: string;
  error?: string;
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detects the current browser from user agent
 */
function detectBrowser(): string {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox/")) {
    const match = ua.match(/Firefox\/([0-9.]+)/);
    return match ? `Firefox ${match[1]}` : "Firefox";
  }
  if (ua.includes("Edg/")) {
    const match = ua.match(/Edg\/([0-9.]+)/);
    return match ? `Edge ${match[1]}` : "Edge";
  }
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    const match = ua.match(/Chrome\/([0-9.]+)/);
    return match ? `Chrome ${match[1]}` : "Chrome";
  }
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    const match = ua.match(/Version\/([0-9.]+)/);
    return match ? `Safari ${match[1]}` : "Safari";
  }

  return "Unknown Browser";
}

/**
 * Detects the operating system from user agent
 */
function detectOS(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (ua.includes("Windows NT")) {
    const match = ua.match(/Windows NT ([0-9.]+)/);
    if (match) {
      const version = match[1];
      if (version === "10.0") return "Windows 10/11";
      if (version === "6.3") return "Windows 8.1";
      if (version === "6.2") return "Windows 8";
      return `Windows NT ${version}`;
    }
    return "Windows";
  }
  if (platform.includes("Mac") || ua.includes("Macintosh")) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      return `macOS ${version}`;
    }
    return "macOS";
  }
  if (ua.includes("Linux")) {
    if (ua.includes("Android")) {
      const match = ua.match(/Android ([0-9.]+)/);
      return match ? `Android ${match[1]}` : "Android";
    }
    return "Linux";
  }
  if (ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS ([0-9_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      return `iOS ${version}`;
    }
    return "iOS";
  }

  return "Unknown OS";
}

/**
 * Detects the device type
 */
function detectDevice(): "Desktop" | "Mobile" | "Tablet" {
  const ua = navigator.userAgent;

  if (ua.includes("Mobi")) {
    return "Mobile";
  }
  if (ua.includes("Tablet") || ua.includes("iPad")) {
    return "Tablet";
  }

  return "Desktop";
}

/**
 * Detects the current flow based on the URL path
 */
function detectFlow(): "Quick Advisory" | "In-Depth Analysis" | "Unknown" {
  const path = window.location.pathname;

  if (path.includes("/quick")) {
    return "Quick Advisory";
  }
  if (
    path.includes("/setup") ||
    path.includes("/position") ||
    path.includes("/calculator") ||
    path.includes("/results")
  ) {
    return "In-Depth Analysis";
  }

  return "Unknown";
}

/**
 * Gathers all environment information
 */
export function detectEnvironment(): EnvironmentInfo {
  return {
    version: packageInfo.version,
    flow: detectFlow(),
    browser: detectBrowser(),
    os: detectOS(),
    device: detectDevice(),
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Gets the API base URL based on the environment
 */
function getApiUrl(): string {
  // In development with Vite, the API is proxied at /api
  // In production on Vercel, the API is at /api
  return "/api/feedback";
}

/**
 * Submits a bug report to the API
 *
 * @param data Bug report data
 * @returns Response from the API
 * @throws Error if the request fails
 */
export async function submitBugReport(data: BugReportData): Promise<FeedbackResponse> {
  const environment = detectEnvironment();

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "bug",
        data: {
          ...data,
          environment,
        },
      }),
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 429) {
        return {
          success: false,
          message: "Rate limit exceeded. Please try again in a few minutes.",
          error: "RATE_LIMIT",
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
          error: "SERVER_ERROR",
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Failed to submit bug report.",
        error: errorData.error || "UNKNOWN_ERROR",
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to submit bug report:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
      error: "NETWORK_ERROR",
    };
  }
}

/**
 * Submits a feature request to the API
 *
 * @param data Feature request data
 * @returns Response from the API
 * @throws Error if the request fails
 */
export async function submitFeatureRequest(data: FeatureRequestData): Promise<FeedbackResponse> {
  const environment = detectEnvironment();

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "feature",
        data: {
          ...data,
          environment,
        },
      }),
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 429) {
        return {
          success: false,
          message: "Rate limit exceeded. Please try again in a few minutes.",
          error: "RATE_LIMIT",
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          message: "Server error. Please try again later.",
          error: "SERVER_ERROR",
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Failed to submit feature request.",
        error: errorData.error || "UNKNOWN_ERROR",
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to submit feature request:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
      error: "NETWORK_ERROR",
    };
  }
}
