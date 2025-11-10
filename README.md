# JobEval

**Open-source base pay determination tool for small and medium enterprises (SMEs)**

JobEval helps SMEs establish fair, defensible, and market-aligned base salaries through a systematic job evaluation process—without requiring expensive consultants or HR specialists.

## 📜 License & Dual Licensing

JobEval is dual-licensed to ensure it remains free for small and medium enterprises while creating a sustainable funding model:

### For SMEs, Nonprofits, and Individuals: FREE ✅

JobEval is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE). You can:
- ✅ Use it for free, forever
- ✅ Self-host on your own infrastructure
- ✅ Modify and customize for your needs
- ✅ Contribute improvements back to the community

**No revenue limits. No employee limits. Completely free for SMEs.**

### For Large Enterprises: Commercial License Required 💼

Organizations meeting **any** of the following criteria require a [Commercial License](COMMERCIAL-LICENSE.md):
- Annual revenue exceeding **$10 million USD**
- More than **100 employees**
- Need to use JobEval in proprietary/closed-source products
- Require priority support, SLA, or custom development

**Why?** Large enterprises can afford to pay, and their contributions fund ongoing development that benefits everyone.

[📧 Contact us for Enterprise Licensing](mailto:enterprise@jobeval.org)

---

### Our Mission 🎯

**We believe sound HR practices shouldn't be a luxury reserved for Fortune 500 companies.**

JobEval exists to democratize compensation analysis and job evaluation for small and medium businesses who can't afford expensive consultants or proprietary HR software. By making this open source, we ensure that every organization—regardless of size or budget—has access to fair, data-driven compensation tools.

Large enterprises who benefit from our work help fund the continued development that keeps it free for everyone else.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Commercial License](https://img.shields.io/badge/Commercial-License_Available-green.svg)](COMMERCIAL-LICENSE.md)

---

## 🎯 The Problem

Setting fair base pay is challenging for SMEs:
- **Expensive consultants** put professional job evaluation out of reach
- **Gut-feel decisions** create internal equity issues and legal risk
- **Market-only approaches** ignore organizational context and affordability
- **Spreadsheet chaos** makes it hard to document and justify pay decisions

## ✨ The Solution

JobEval provides a structured, evidence-based approach to base pay:

1. **Job Evaluation** - Systematically assess positions using point-factor methodology
2. **Market Alignment** - Compare against Bureau of Labor Statistics (BLS) wage data
3. **Affordability Analysis** - Consider your organization's financial constraints
4. **Transparent Documentation** - Create defensible salary structures

**Result:** Fair, affordable salaries that you can explain and defend.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A modern web browser
- Basic understanding of your organization's positions

### Installation

```bash
# Clone the repository
git clone https://github.com/jfeg1/jobeval.git
cd jobeval

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to access JobEval.

### Quick Start

1. **Set up your company profile** (industry, size, location)
2. **Add positions** to evaluate
3. **Complete job evaluation** using our point-factor wizard
4. **Match to BLS data** for market context
5. **Review recommendations** and adjust for affordability
6. **Export results** for documentation and implementation

---

## 📖 Key Features

### ✅ Currently Available

- **Point-Factor Job Evaluation** - Structured assessment of job value
- **BLS Data Integration** - ~830 standard occupational classifications with wage data
- **Local-First Architecture** - All data stored on your device (privacy-first)
- **Visual Mockups** - See the complete user flow before building

### 🚧 In Development (Phase 2B)

- Company setup forms
- Position entry wizard
- BLS occupation search and matching
- Affordability calculator
- Salary recommendation engine
- Export and reporting

**Want to help build these features?** See [Contributing](#-contributing) below.

---

## 🛠️ Technical Overview

### Architecture

JobEval is built as a client-side web application with no backend required:

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Storage**: IndexedDB via Dexie.js (local storage)
- **Data Source**: Bureau of Labor Statistics Occupational Employment and Wage Statistics

### Data Strategy

**Sample Data (Included)**
- 20 representative occupations for testing and development
- Located in `public/data/bls-data.json`

**Full Dataset**
```bash
# Download and process ~830 BLS occupations
npm run data:setup
```

**Data Source**
- BLS OEWS Special Requests (Excel format)
- Simple, reliable XLSX-based data pipeline
- Public access, no authentication required

**Data Updates**
- BLS releases new data each May
- Run `npm run data:setup` annually to stay current

### Project Structure

```
jobeval/
├── public/
│   └── data/
│       └── bls-data.json           # BLS wage data
├── src/
│   ├── components/                 # React components
│   ├── lib/                        # Utilities and helpers
│   ├── pages/                      # Page components
│   ├── types/                      # TypeScript definitions
│   └── App.tsx                     # Main application
├── scripts/
│   ├── download-bls-data.js        # Fetches BLS data
│   └── process-bls-data.js         # Processes Excel → JSON
└── docs/
    ├── PHASE_2A_SUMMARY.md         # What's built so far
    ├── PROJECT_PLAN.md             # Technical architecture
    └── jobeval-mockups.html        # UI mockups
```

---

## 💼 Use Cases

### For Small Businesses (1-50 employees)
- Establish your first formal pay structure
- Document pay decisions for compliance
- Reduce bias in salary-setting

### For Medium Enterprises (50-500 employees)
- Standardize pay practices across departments
- Support internal equity goals
- Prepare for growth and scaling

### For HR Consultants & Advisors
- Offer structured pay analysis to SME clients
- Customize the tool for client-specific factors
- Generate professional documentation

---

## 📊 Methodology

JobEval implements the **Point-Factor Method** of job evaluation, widely considered the most reliable approach for systematic job valuation.

### The Process

1. **Define Compensable Factors** - Identify what creates value in your organization (e.g., education, experience, responsibility, complexity)

2. **Weight Factors** - Assign relative importance to each factor based on organizational priorities

3. **Evaluate Jobs** - Score each position against the factors using defined levels

4. **Calculate Point Totals** - Sum weighted scores to determine relative job worth

5. **Market-Align** - Compare to BLS data for market context

6. **Set Pay Ranges** - Establish salary ranges considering both internal equity and external competitiveness

### Academic Foundation

Our approach draws from established research in job evaluation:
- Point-factor methodology (Kilgour, 2008)
- Human capital measurement (Koziol & Mikos, 2020)
- Analytical job evaluation (Senol & Dagdeviren, 2019)

See the [Research](docs/research/) folder for academic papers informing our design.

---

## 🔒 Privacy & Data

### Your Data Stays Yours

- **No cloud storage** - All data stored locally in your browser
- **No tracking** - We don't collect usage data or analytics
- **No accounts** - Use immediately without registration
- **Export anytime** - Full data portability

### What Gets Stored

- Company profile information
- Position descriptions and evaluations
- Salary calculations and recommendations
- BLS reference data (public domain)

### Security Note

JobEval runs entirely in your browser. For sensitive pay data:
- Use on trusted devices only
- Be aware of browser sync features
- Export and secure backups as needed

---

## 🤝 Contributing

JobEval is in active development and we welcome contributions!

### Current Priority: Phase 2B Features

We're building the core evaluation workflow. Help us develop:

1. **Company Setup** - Form capturing industry, size, location, budget
2. **Position Wizard** - Multi-step form for job details
3. **BLS Search & Matching** - Smart search for occupation codes
4. **Affordability Calculator** - Financial constraint modeling
5. **Recommendation Engine** - Salary range generation logic
6. **Results & Export** - Professional reporting

### How to Contribute

1. **Review the mockups**: Open `docs/jobeval-mockups.html` in your browser
2. **Check the project plan**: Read `docs/PROJECT_PLAN.md` for architecture details
3. **Pick a feature**: See [Issues](https://github.com/jfeg1/jobeval/issues) for current priorities
4. **Build & submit**: Fork, develop, test, and open a PR

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Update BLS data
npm run data:setup
```

### Code Standards

- TypeScript strict mode enabled
- Follow existing component patterns
- Write self-documenting code
- Add comments for complex logic
- Test with sample data before full dataset

---

## 📚 Documentation

- **[Project Plan](docs/PROJECT_PLAN.md)** - Technical architecture and design decisions
- **[Phase 2A Summary](docs/PHASE_2A_SUMMARY.md)** - What's currently implemented
- **[UI Mockups](docs/jobeval-mockups.html)** - Visual design reference
- **[Research Papers](docs/research/)** - Academic foundation

---

## 🗺️ Roadmap

### Phase 2A: Foundation ✅ Complete
- Project setup and configuration
- Design system and mockups
- BLS data pipeline
- Sample data integration

### Phase 2B: Core Features 🚧 In Progress
- User interface implementation
- Job evaluation workflow
- BLS matching logic
- Basic calculations and recommendations

### Phase 3: Enhancement 📋 Planned
- Custom compensable factors
- Multi-location support
- Team collaboration features
- Advanced reporting

### Phase 4: Refinement 💡 Future
- Machine learning for job matching
- Industry benchmarking beyond BLS
- Mobile application
- API for integrations

---

## ⚖️ Legal & Compliance

### Fair Labor Standards Act (FLSA)

JobEval helps document your pay decisions, but you remain responsible for:
- Compliance with minimum wage laws
- Proper exempt/non-exempt classification
- Overtime pay requirements
- Equal pay for equal work

**Not Legal Advice**: JobEval is a tool, not a legal service. Consult qualified legal counsel for compliance questions.

### Data Sources

Bureau of Labor Statistics data is **public domain** (U.S. Government work).
- Source: [BLS OES Special Requests](https://www.bls.gov/oes/special.requests/)
- Format: XLSX (Excel) files with complete national occupation data
- Updated annually each May
- No attribution required (but we appreciate it!)

---

## 🐛 Known Issues & Limitations

### Current Limitations

- **Sample data only**: Full BLS dataset requires manual setup
- **Single location**: Multi-location support coming in Phase 3
- **U.S. focus**: BLS data covers U.S. labor markets only
- **Browser storage**: Data not synced across devices

### Reporting Issues

Found a bug? Have a suggestion? [Open an issue](https://github.com/jfeg1/jobeval/issues).

Please include:
- What you were trying to do
- What you expected to happen
- What actually happened
- Browser and OS information

---

## 💬 Support & Community

### Get Help

- **Documentation**: Check the [docs](docs/) folder first
- **Issues**: Search [existing issues](https://github.com/jfeg1/jobeval/issues) or open a new one
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/jfeg1/jobeval/discussions)

### Stay Updated

- ⭐ **Star this repo** to follow development
- 👀 **Watch releases** for new features
- 🐦 **Follow us** on [Twitter](https://twitter.com/johnathenfevans) for updates

---

## 📜 License

JobEval is released under the **MIT License**. See [LICENSE](LICENSE) for details.

**In plain English**: You can use JobEval for any purpose (including commercial), modify it, and distribute it. Just keep the copyright notice. No warranty provided.

---

## 🙏 Acknowledgments

### Built On

- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper

### Inspired By

Research from scholars advancing fair compensation practices:
- Koziol & Mikos (2020) - Human capital measurement
- Berrocal et al. (2018) - Comparative job evaluation methods
- Senol & Dagdeviren (2019) - Analytical job evaluation approaches

### Created By

JobEval is an open-source project created to democratize access to professional job evaluation tools.

**Contributing?** Your name goes here! We appreciate every contribution.

---

## 📬 Contact

- **Project Issues**: [GitHub Issues](https://github.com/jfeg1/jobeval/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/jfeg1/jobeval/discussions)
- **Email**: johnathen.evans-guilbault@proton.me

---

<div align="center">

**[Get Started](#-getting-started)** • **[Documentation](docs/)** • **[Contributing](#-contributing)** • **[License](#-license)**

Made with ❤️ for small and medium enterprises everywhere

</div>
