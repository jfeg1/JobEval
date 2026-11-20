# JobEval

A free, open source tool that helps a small business set pay it can explain: evaluate each job on clear factors, compare with what the market pays, and build a simple pay structure.

It runs entirely in your web browser. There is nothing to install, no account, and no server. Your data stays on your computer.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![CI](https://github.com/jfeg1/JobEval/workflows/CI/badge.svg)

JobEval is in beta. [Report a bug](https://github.com/jfeg1/JobEval/issues/new?template=bug_report.md), [suggest a feature](https://github.com/jfeg1/JobEval/issues/new?template=feature_request.md) or [start a discussion](https://github.com/jfeg1/JobEval/discussions).

## How to use it

**Online:** open **https://jfeg1.github.io/JobEval/**.

**Offline:** download `jobeval.html` from the [latest release](https://github.com/jfeg1/JobEval/releases/latest) and double-click it. The whole app is in that one file.

Then choose what you need:

- **Job evaluation** – rate each job on skills, effort, responsibility and working conditions (the four criteria in the EU Pay Transparency Directive), set your pay philosophy as numbers, and get grades, pay ranges, pay by component and an equity check. It can import a project file from [Open Job Analysis](https://github.com/jfeg1/work-analyzer.app), so the ratings sit beside the evidence from your job analysis.
- **Quick advisory** – a quick check of one salary against market data, with a PDF summary.
- **In-depth analysis** – company profile, job details, occupation match and an affordability calculator.

### Saving your work

The app autosaves in your browser, but browser storage can be cleared. Use **Export Data** to keep a `.json` file, and **Import Data** to pick it up again on any computer.

## Data

- **Job evaluation:** the built-in example uses U.S. Bureau of Labor Statistics national medians (OEWS, May 2025). You enter the market rates for your own jobs.
- **Quick advisory and in-depth analysis:** these still use a small **sample** dataset of 20 occupations built for development. Treat their figures as a demonstration, not as market data. Replacing it with full BLS and O*NET data is the next item on the roadmap.

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
