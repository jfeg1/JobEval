# Changelog

All notable changes to JobEval will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Job evaluation** (`/evaluate`): point-factor evaluation on the four criteria in Article 4 of the EU Pay Transparency Directive (skills, effort, responsibility, working conditions), with five defined levels per factor.
  - Imports project files from Open Job Analysis and shows the critical tasks and competencies beside the ratings as evidence.
  - Pay policy set as explicit numbers: internal weight, market position, extra pay per 100 points, anchor (market-pegged or budgeted), range width. Shows the market's own slope next to the organisation's.
  - Two ways to build pay: blended (one number) or layered (base pay from the internal line plus a separate market supplement, as U.S. federal pay separates basic pay and locality pay).
  - Market line fitted only to benchmark jobs (duty match ≥ 70%); used to estimate a market rate for jobs without one.
  - Grades and ranges, pay by component (base, location, market supplement, other), compa ratio on base pay, and an equity check by grade.
  - Worked example using BLS OEWS May 2025 national medians.
- Unit tests (Vitest) for the evaluation engine and the Open Job Analysis import; `npm test` runs in CI.
- `@headlessui/react` for accessible tabs and radio groups.
- Publish workflow: deploys to GitHub Pages and attaches `jobeval.html` to tagged releases.

### Changed
- **Licence is now MIT** (was AGPL-3.0 with a commercial option). JobEval is fully open source, like Open Job Analysis.
- The build is one self-contained `index.html` that opens straight from disk; routing uses URL hashes and the occupation data is bundled. This fixes the blank page when opening the built file directly.
- Feedback buttons open a GitHub issue form instead of posting through a server.
- Tailwind now reads `tailwind.config.js`, so the sage and accent colours render again.
- CI runs on Node 20 and 22 (Vite 7 needs 20.19+).

### Removed
- DevExtreme (`devextreme`, `devextreme-react`) and its licence-key setup: the postinstall script, template file, CI secret and setup guide. No component used it; it was only registered in `main.tsx`. JobEval no longer needs a commercial licence to build.
- Flowbite, which was installed but never imported.
- Vercel: the hosted feedback function, `vercel.json`, `.vercelignore`, `.env.local.example` and the `vercel` dev dependency.
- `COMMERCIAL-LICENSE.md`, `TERMS_OF_SERVICE.md` and `PRIVACY_POLICY.md`; the README now has a short privacy note.
- Unused files and dependencies (`dexie`, `dexie-react-hooks`, `autoprefixer`), and the starter `App.css` and Vite logo.

## [0.9.0] - 2025-11-13

### 🎉 Initial MVP Release

**Note:** Pre-release testing identified and fixed critical issues in the in-depth analysis flow:
1. Company Setup wasn't collecting annual revenue (budget calculator showed $0)
2. In-depth analysis lacked payroll ratio analysis (less comprehensive than Quick Advisory)

### Fixed
- Added annual revenue field to Company Setup form
- Added current payroll field to Company Setup form  
- Added employee count field to Company Setup form
- Integrated payroll ratio analysis into Budget Calculator
- Calculator now shows comprehensive affordability metrics (payroll-to-revenue ratios)
- In-depth analysis now more comprehensive than Quick Advisory (as intended)

**Mission:** Democratize fair compensation for small and medium enterprises (5-25 employees).

### Added

#### Core Features
- **Quick Advisory** - Fast 2-3 minute salary evaluation
  - Market benchmarking against BLS data
  - Affordability analysis with revenue/payroll inputs
  - Market positioning comparison
  - PDF export functionality
  - Match confidence indicators
  
- **In-Depth Analysis** - Comprehensive 30-minute evaluation
  - Company profile setup with financial inputs
  - Position wizard (basic info + detailed requirements)
  - BLS occupation matching with fuzzy search
  - Point-factor evaluation methodology
  - Salary calculator with affordability constraints
  - Results page with market comparison
  
#### Data & Integration
- O*NET 30.0 occupational data (20 common SME roles)
- BLS wage data (May 2024) with full percentile distributions
- 20 pre-integrated occupations covering:
  - Management (5 roles)
  - Business & Financial Operations (5 roles)
  - Computer & Mathematical (3 roles)
  - Office & Administrative Support (2 roles)
  - Sales, Media, Healthcare, Engineering, Education (1 each)

#### International Support
- Multi-currency support (USD, CAD, EUR, GBP, AUD, JPY, SGD)
- Country-specific formatting (US, Canada + 11 additional countries)
- Extensible i18n framework for future expansion

#### User Experience
- Responsive design (desktop + mobile)
- Auto-save functionality (20-second intervals)
- Data export/import utilities
- Startup modal for restoring previous work
- Progress indicators and navigation breadcrumbs
- Accessibility-focused UI components

#### Technical Infrastructure
- React 19 + TypeScript
- Vite build system
- Zustand state management
- Dexie (IndexedDB) for local storage
- Tailwind CSS v4 for styling
- jsPDF for PDF generation
- React Router v7 for navigation

#### Quality & Developer Experience
- ESLint with zero-warning policy
- Prettier code formatting
- Pre-commit hooks with Husky + lint-staged
- GitHub Actions CI/CD pipeline
- Multi-node testing (Node 18.x, 20.x)
- Type checking with TypeScript
- Automated build verification

#### Privacy & Security
- 100% local data storage (no cloud, no servers)
- No user accounts or authentication required
- No tracking or analytics
- Complete user control over data
- Export/import for backup and portability

#### Licensing
- AGPL-3.0 for SMEs, nonprofits, and open source projects
- Commercial licensing model for enterprises (>25 employees)
- Dual licensing documentation

### Known Limitations

- Occupation coverage: 20 roles (expanding to 1,000+ in v1.0)
- Geography: National-level data only (no metro-area specificity)
- PDF export: Quick Advisory only (In-Depth Analysis coming in v1.0)
- Testing: Manual testing only (automated tests post-MVP)

### Technical Notes

- Minimum Node.js version: 18.x
- Browser support: Modern evergreen browsers
- Database: IndexedDB via Dexie
- Build output: Static SPA (Single Page Application)

---

[0.9.0]: https://github.com/jfeg1/JobEval/releases/tag/v0.9.0
