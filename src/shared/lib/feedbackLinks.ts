/**
 * Feedback goes straight to GitHub. JobEval has no server, so nothing is sent
 * from the app itself: these open a new GitHub issue form in a new tab.
 */
const REPO_URL = "https://github.com/jfeg1/JobEval";

export const BUG_REPORT_URL = `${REPO_URL}/issues/new?template=bug_report.md`;
export const FEATURE_REQUEST_URL = `${REPO_URL}/issues/new?template=feature_request.md`;

export function openBugReport(): void {
  window.open(BUG_REPORT_URL, "_blank", "noopener,noreferrer");
}

export function openFeatureRequest(): void {
  window.open(FEATURE_REQUEST_URL, "_blank", "noopener,noreferrer");
}
