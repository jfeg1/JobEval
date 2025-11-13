/**
 * Error Reporting Utility
 * Generates error reports and GitHub issue links for data persistence errors
 */

export interface ErrorReport {
  timestamp: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  userAction?: string;
  appVersion: string;
  browserInfo: string;
  dataState: {
    hasCompanyData: boolean;
    hasPositionData: boolean;
    hasQuickAdvisory: boolean;
    hasWizardProgress: boolean;
  };
}

/**
 * Flexible error interface to accept various error types
 */
export interface SaveError {
  type?: string;
  message: string;
  stack?: string;
  userAction?: string;
}

// GitHub repository information
const GITHUB_REPO = "jfeg1/JobEval";
const GITHUB_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new`;

/**
 * Gets the app version from package.json
 * In production, this should be injected during build
 */
function getAppVersion(): string {
  // This would typically be injected by the build tool
  // For now, return a placeholder that can be replaced
  return "0.0.0";
}

/**
 * Detects browser information from user agent
 */
function detectBrowser(): string {
  const ua = navigator.userAgent;

  // Detect browser type and version
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    return match ? `Chrome ${match[1]}` : "Chrome (unknown version)";
  } else if (ua.includes("Edg")) {
    const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    return match ? `Edge ${match[1]}` : "Edge (unknown version)";
  } else if (ua.includes("Firefox")) {
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    return match ? `Firefox ${match[1]}` : "Firefox (unknown version)";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const match = ua.match(/Version\/(\d+\.\d+)/);
    return match ? `Safari ${match[1]}` : "Safari (unknown version)";
  }

  return "Unknown Browser";
}

/**
 * Checks data state across all Zustand stores
 * Does NOT include any sensitive data, only boolean presence checks
 */
function getDataState() {
  try {
    // Check localStorage for persisted Zustand stores
    const companyData = localStorage.getItem("company-storage");
    const positionData = localStorage.getItem("position-storage");
    const quickAdvisoryData = localStorage.getItem("quick-advisory-storage");
    const wizardData = localStorage.getItem("wizard-storage");

    return {
      hasCompanyData: !!(companyData && JSON.parse(companyData)?.state?.profile),
      hasPositionData: !!(positionData && JSON.parse(positionData)?.state?.basicInfo),
      hasQuickAdvisory: !!(quickAdvisoryData && JSON.parse(quickAdvisoryData)?.state?.formData),
      hasWizardProgress: !!(wizardData && JSON.parse(wizardData)?.state?.currentStep),
    };
  } catch {
    // If we can't read the state, return all false
    return {
      hasCompanyData: false,
      hasPositionData: false,
      hasQuickAdvisory: false,
      hasWizardProgress: false,
    };
  }
}

/**
 * Generates a formatted error report
 */
export function generateErrorReport(error: SaveError): ErrorReport {
  return {
    timestamp: new Date().toISOString(),
    errorType: error.type || "unknown_error",
    errorMessage: error.message,
    stackTrace: error.stack,
    userAction: error.userAction,
    appVersion: getAppVersion(),
    browserInfo: detectBrowser(),
    dataState: getDataState(),
  };
}

/**
 * Formats error report as markdown for GitHub issues
 */
export function formatErrorReportMarkdown(report: ErrorReport): string {
  const dataStateLines = [
    `- Company data present: ${report.dataState.hasCompanyData ? "Yes" : "No"}`,
    `- Position data present: ${report.dataState.hasPositionData ? "Yes" : "No"}`,
    `- Quick Advisory completed: ${report.dataState.hasQuickAdvisory ? "Yes" : "No"}`,
    `- Wizard in progress: ${report.dataState.hasWizardProgress ? "Yes" : "No"}`,
  ].join("\n");

  return `## Error Report

**Timestamp:** ${report.timestamp}
**Error Type:** ${report.errorType}
**App Version:** ${report.appVersion}
**Browser:** ${report.browserInfo}

${report.userAction ? `### User Action\n${report.userAction}\n\n` : ""}### Error Message
\`\`\`
${report.errorMessage}
\`\`\`

${report.stackTrace ? `### Stack Trace\n\`\`\`\n${report.stackTrace}\n\`\`\`\n\n` : ""}### Data State
${dataStateLines}

### Additional Context
<!-- Add any additional context about the problem here -->`;
}

/**
 * Creates GitHub issue URL with pre-filled template
 */
export function createGitHubIssueUrl(report: ErrorReport): string {
  const title = `[Bug] Save Error: ${report.errorType}`;
  const body = formatErrorReportMarkdown(report);
  const labels = ["bug", "data-persistence"];

  // URL encode the parameters
  const params = new URLSearchParams({
    title,
    body,
    labels: labels.join(","),
  });

  return `${GITHUB_ISSUE_URL}?${params.toString()}`;
}
