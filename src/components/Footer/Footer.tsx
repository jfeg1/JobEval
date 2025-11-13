/**
 * Footer Component
 *
 * Minimal footer with links to feedback, documentation, and legal pages.
 * Uses Scandinavian minimalist design with sage/slate colors.
 */

interface FooterProps {
  onReportBug: () => void;
  onRequestFeature: () => void;
}

export function Footer({ onReportBug, onRequestFeature }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-slate-50 border-t border-slate-200 mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">JobEval</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Open-source salary evaluation tool for making data-driven hiring decisions.
            </p>
            <p className="text-xs text-slate-500 mt-3">Version 0.9.0 (Beta)</p>
          </div>

          {/* Help & Feedback */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Help & Feedback</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/jfeg1/JobEval#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                >
                  Documentation
                </a>
              </li>
              <li>
                <button
                  onClick={onReportBug}
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                >
                  Report a Bug
                </button>
              </li>
              <li>
                <button
                  onClick={onRequestFeature}
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                >
                  Request a Feature
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/jfeg1/JobEval/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                >
                  Community Discussions
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      "https://github.com/jfeg1/JobEval/blob/main/PRIVACY_POLICY.md",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      "https://github.com/jfeg1/JobEval/blob/main/TERMS_OF_SERVICE.md",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/jfeg1/JobEval/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-sage-600 transition-colors focus:outline-none focus:underline"
                >
                  License (AGPL-3.0)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {currentYear} JobEval. Open source under AGPL-3.0 license.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/jfeg1/JobEval"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="View source on GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
