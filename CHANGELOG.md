# Changelog

All notable changes to JobEval will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2024-11-13

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

## [Unreleased]

### Planned for v1.0
- Full O*NET occupation database (1,000+ occupations)
- PDF export for In-Depth Analysis results
- Enhanced visualization components
- Metro-area geographic specificity
- Automated testing suite
- Expanded documentation

### Future Considerations
- Multi-user role-based access controls
- Advanced analytics and reporting
- Salary gap analysis tools
- HRIS system integrations
- Optional cloud sync (paid feature)
- Mobile native applications

---

[0.9.0]: https://github.com/jfeg1/JobEval/releases/tag/v0.9.0
