# JobEval

A free, open source tool that helps a small business set pay it can explain: evaluate each job on clear factors, compare with what the market pays, and build a simple pay structure.

It runs entirely in your web browser. There is nothing to install, no account, and no server. Your data stays on your computer.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![CI](https://github.com/jfeg1/JobEval/workflows/CI/badge.svg)

JobEval is in beta. [Report a bug](https://github.com/jfeg1/JobEval/issues/new?template=bug_report.md), [suggest a feature](https://github.com/jfeg1/JobEval/issues/new?template=feature_request.md) or [start a discussion](https://github.com/jfeg1/JobEval/discussions).

## How to use it

**Online:** open **https://jfeg1.github.io/JobEval/**.

**Offline:** download `jobeval.html` from the [latest release](https://github.com/jfeg1/JobEval/releases/latest) and double-click it. The whole app is in that one file.

Then start a **job evaluation**. It follows the EU toolkit on gender-neutral job evaluation and classification (EIGE), which puts the four criteria of the EU Pay Transparency Directive (skills, responsibility, effort and working conditions) into practice:

1. **Set up.** Enter your number of workers and JobEval suggests the toolkit's method for your size: graduated factor comparison for micro-organisations, paired comparison for up to 15 job roles, or the point-factor method. The default plan is the toolkit's 14 subfactors (40/35/15/10 out of 1,200 points); a simple four-factor plan is also available. Add your own subfactors and committee members, and choose to rate blind (job titles and pay hidden).
2. **Rate jobs.** Each subfactor shows its levels, the toolkit's guidance and "mistakes to avoid". Committee members enter their own levels, see the spread, then agree a level and write down why. Jobs from [Open Job Analysis](https://github.com/jfeg1/work-analyzer.app) arrive with their critical tasks and competencies, and with the job experts' levels on each subfactor.
3. **Gender and groups.** Women- or men-dominated jobs (60/40 rule), job groups, and a quick check for higher-scoring jobs paid less than lower-scoring ones.
4. **Pay structure.** A grade table from your lowest and highest salary and the step between grades, or (point method) a pay line from points and market data with pay in layers.
5. **Employees.** Pay by component, compa ratios and an equity check by grade.
6. **Reports** for the Directive: pay criteria (Art. 6), pay ranges for job adverts (Art. 5), the gender pay gap indicators (Art. 9), pay by category and the 5% joint pay assessment check (Art. 7 and 10), and the job evaluation record. Print each one or save it as PDF.

**From Open Job Analysis:** switch on the job evaluation profile in Open Job Analysis, then use **Send to JobEval** on its Report step. Online, the job opens straight in JobEval. Offline, Open Job Analysis saves the project file; import it on the Rate jobs tab. Importing the same project again updates the evidence and keeps your ratings.

A smaller **budget and market check** for a single job (company profile, job details, occupation match and an affordability calculator) is also available from the home page.

### Saving your work

The app autosaves in your browser, but browser storage can be cleared. On the job evaluation page, use **Save file** to keep a `.json` file of everything (it contains employee pay, so store it like payroll data) and **Open file** to pick it up again on any computer. **Export Data** and **Import Data** in the top bar cover the budget and market check.

## Data

- **Job evaluation:** the factor and subfactor plan, level descriptions and guidance are from EIGE, *EU-wide guidelines on gender-neutral job evaluation and classification: step-by-step toolkit*. Two worked examples: the toolkit's own catering-company example (fictional), and the seven jobs from "From Job Analysis to Pay" with U.S. Bureau of Labor Statistics national medians (OEWS, May 2025). You enter the market rates for your own jobs.
- The Directive reports follow Directive (EU) 2023/970. National laws transposing it set the final rules and formats; check yours.
- **Budget and market check:** this still uses a small **sample** dataset of 20 occupations built for development. Treat its figures as a demonstration, not as market data. Replacing it with full BLS and O*NET data is the next item on the roadmap.

## Privacy

Everything happens in your browser. The app makes no network requests and has no analytics. Your work is stored in your browser and in the files you choose to save. The feedback links open GitHub in a new tab; nothing is sent from the app itself.

## Development

Requires Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/jfeg1/JobEval.git
cd JobEval
npm ci
npm run dev          # development server at http://localhost:5173
npm test             # unit tests
npm run build        # builds dist/index.html, one self-contained file
```

Before a pull request: `npm run type-check && npm run lint && npm run format:check && npm test && npm run build`.

Built with React, TypeScript, Vite, Tailwind CSS, Zustand and jsPDF. Data scripts are described in [`scripts/README.md`](scripts/README.md). See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

### Publishing (for maintainers)

The **Publish** workflow builds the app and deploys it to GitHub Pages on every push to `main`. One-time setup: in the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. To make an offline download, push a version tag (for example `git tag v0.10.0 && git push origin v0.10.0`); the workflow attaches `jobeval.html` to that release.

## Disclaimer

JobEval supports pay decisions; it does not replace professional, legal or financial advice. Check local law, collective agreements and your own circumstances before you set pay.

## License

[MIT](LICENSE). Free to use, change and share.
