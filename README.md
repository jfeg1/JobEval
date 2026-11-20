# JobEval v0.9 ![BETA](https://img.shields.io/badge/status-BETA-orange.svg)

**Fair compensation, democratized.**

JobEval is an open-source salary evaluation tool designed to help small and medium enterprises (5-25 employees) establish defensible, market-aligned base salaries without expensive HR consultants.

![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)
![Version: 0.9.0](https://img.shields.io/badge/version-0.9.0-orange.svg)
![CI Status](https://github.com/jfeg1/JobEval/workflows/CI/badge.svg)

---

## ⚠️ Beta Notice

**JobEval is currently in public beta testing.** While the core features are functional and tested, you may encounter bugs or limitations. We encourage you to:

- 🐛 **[Report Issues](https://github.com/jfeg1/JobEval/issues/new?template=bug_report.md)** - Found a bug? Let us know!
- 💡 **[Request Features](https://github.com/jfeg1/JobEval/issues/new?template=feature_request.md)** - Have ideas? We'd love to hear them!
- 💬 **[Join Discussion](https://github.com/jfeg1/JobEval/discussions)** - Share experiences and ask questions

**Current Beta Limitations:**
- Limited occupation coverage (20 roles, expanding to 1,000+ in v1.0)
- National wage data only (no metro-area specificity yet)
- PDF export available for Quick Advisory only (In-Depth coming in v1.0)
- Manual testing only (automated tests coming post-MVP)

**Your feedback shapes the future of JobEval!** Thank you for being an early adopter. 🙏

---

## 🎯 Purpose

We believe fair compensation shouldn't require expensive consultants. JobEval provides SMEs with the same systematic, data-driven salary evaluation tools used by large organizations—completely free and open source.

**Core Mission:** Level the playing field for smaller organizations who are tired of the underdog having to pay for everything.

---

## ✨ Features

### Quick Advisory (2-3 minutes)
- ⚡ Rapid market benchmarking against BLS wage data
- 💰 Instant affordability analysis
- 📊 Market positioning comparison
- 📄 PDF export of recommendations

### In-Depth Analysis (30 minutes)
- 🎯 Point-factor job evaluation methodology
- 📈 Comprehensive position analysis
- 💼 Detailed skills and knowledge assessment
- 🔍 BLS occupation matching (20+ common roles)
- 💾 Auto-save with data export/import
- 🔁 Multi-position evaluation within same company

### Technical Highlights
- 🌍 International support (US, Canada + 11 more countries)
- 🔒 Privacy-first: 100% local data storage (no cloud, no tracking)
- 📱 Responsive design for desktop and mobile
- ♿ Accessibility-focused UI
- 🔄 Real-time BLS wage data integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jfeg1/JobEval.git
cd JobEval
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

---

## 📊 Data Sources

- **Occupation Data:** O*NET 30.0 (U.S. Department of Labor)
- **Wage Data:** Bureau of Labor Statistics (BLS) - May 2024
- **Coverage:** 20 common SME occupations across management, business operations, technology, and support roles

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Routing:** React Router v7
- **State:** Zustand
- **Styling:** Tailwind CSS v4
- **Database:** Dexie (IndexedDB)
- **PDF Generation:** jsPDF
- **Quality:** ESLint, Prettier, Husky

---

## 📖 Usage

### Quick Advisory Flow
1. Enter job title, location, and proposed salary
2. Specify number of employees in role
3. Select hiring strategy (market leader, competitive, budget-conscious)
4. (Optional) Add revenue/payroll for affordability analysis
5. View instant results with PDF export

### In-Depth Analysis Flow
1. **Company Setup:** Enter company profile and financials
2. **Position Definition:** Define role basics and detailed requirements
3. **BLS Matching:** Match to closest occupation in database
4. **Calculator:** Set affordable salary range
5. **Results:** View comprehensive market analysis

### Evaluating Multiple Positions

JobEval supports evaluating multiple positions for the same company:

1. **Complete your first evaluation** - Follow the In-Depth Analysis flow completely
2. **Click "Evaluate Another Position"** - This keeps your company profile but clears position data
3. **Update payroll tracking (recommended):**
   - Go to Settings → Company Profile
   - Update "Current Payroll" to reflect the newly committed salary
   - This helps track cumulative payroll impact across multiple hires
4. **Continue with next position** - Repeat the process for each role

**Note:** In v0.9, payroll tracking is manual. v1.0 will include automatic position history and cumulative budget tracking.

---

## 🔐 Privacy & Data

**Your data never leaves your device.** JobEval stores all information locally in your browser using IndexedDB. No servers, no cloud, no tracking, no analytics.

- ✅ 100% local storage
- ✅ No user accounts required
- ✅ No data transmission
- ✅ Export your data anytime
- ✅ Complete control over your information

---

## 📜 License

### Dual Licensing Model

**For SMEs, Nonprofits, and Open Source Projects:**
- Licensed under GNU Affero General Public License v3.0 (AGPL-3.0)
- Free to use, modify, and distribute
- Must share modifications under same license
- See [LICENSE](LICENSE) for full terms

**For Large Enterprises (>25 employees):**
- Commercial license available
- Contact: johnathen.evans-guilbault@proton.me

This dual-licensing approach keeps the tool free for our target audience (SMEs) while creating sustainable funding through enterprise licenses.

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style (enforced by ESLint + Prettier)
- Add tests for new features (when testing infrastructure is added)
- Update documentation as needed
- Keep PRs focused and atomic

---

## 🗺️ Roadmap

### v0.9 (Current - Beta)
- ✅ Quick Advisory with PDF export
- ✅ In-Depth Analysis flow
- ✅ Multi-position evaluation support
- ✅ 20 common occupations
- ✅ US/Canada support
- ✅ Auto-save functionality

### v1.0 (Planned)
- Full O*NET occupation database (1,000+ roles)
- Automatic position history tracking
- Cumulative payroll budget management
- Multi-position PDF export
- Enhanced visualization components
- Expanded international support

### Future Releases
- Multi-user role-based access controls
- Advanced analytics and reporting
- Salary gap analysis tools
- Integration with HRIS systems
- Cloud sync option (opt-in, paid feature)

---

## 🐛 Known Limitations (v0.9)

- **Occupation Coverage:** 20 common roles (expanding to 1,000+ in v1.0)
- **Geography:** National-level data only (no metro-area specificity yet)
- **Multi-Position Tracking:** Manual payroll updates (automatic tracking in v1.0)
- **PDF Export:** Individual positions only (multi-position export in v1.0)
- **Testing:** Manual testing only (automated tests coming post-MVP)

---

## 💬 Support & Community

- **Website:** [open-hr.work](https://www.open-hr.work)
- **Issues:** [GitHub Issues](https://github.com/jfeg1/JobEval/issues)
- **Discussions:** [GitHub Discussions](https://github.com/jfeg1/JobEval/discussions)

---

## 🙏 Acknowledgments

- U.S. Department of Labor for O*NET data
- Bureau of Labor Statistics for wage data
- Open source community for excellent tools and libraries

---

## ⚖️ Disclaimer

JobEval provides guidance based on public market data and your company's financial profile. Final compensation decisions should consider:
- Local labor laws and regulations
- Cost of living adjustments
- Industry-specific factors
- Professional legal and financial counsel

This tool is for informational purposes and does not constitute legal or financial advice.

---

**Built with ❤️ for small businesses by people who believe fair compensation should be accessible to everyone.**
