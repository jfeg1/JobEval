# Contributing to JobEval

Thank you for your interest in contributing to JobEval! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm (comes with Node.js)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/JobEval.git
   cd JobEval/jobeval
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Before Committing

Run these commands to ensure your code passes CI checks:

```bash
# Check TypeScript types
npm run type-check

# Lint your code
npm run lint

# Format your code
npm run format

# Build the project
npm run build
```

## Code Quality Standards

### TypeScript

- All code must be written in TypeScript
- No `any` types (use proper typing)
- Code must compile without errors (`npm run type-check` must pass)

### Linting

- Code must pass ESLint with zero warnings
- Run `npm run lint` before committing
- Maximum warnings allowed: 0

### Formatting

- Code must be formatted with Prettier
- Run `npm run format` to auto-format your code
- Settings are in `.prettierrc.json`

### Build

- The project must build successfully
- Run `npm run build` to verify

## Pull Request Process

1. **Ensure CI Passes**: All automated checks must pass
   - TypeScript compilation
   - ESLint (zero warnings)
   - Prettier formatting
   - Successful build

2. **Update Documentation**: Update README.md or other docs if needed

3. **Write Clear Commit Messages**:
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issue numbers when applicable

4. **Fill Out PR Template**: Complete all sections of the pull request template

5. **Request Review**: Tag maintainers for review once checks pass

## Automated Checks (CI)

When you open a pull request, GitHub Actions will automatically run:

- **TypeScript Type Check**: Ensures no type errors
- **ESLint**: Checks code quality (max 0 warnings)
- **Prettier**: Verifies code formatting
- **Build**: Confirms the project builds successfully

**Your PR cannot be merged until all checks pass.**

## Branch Protection

The `main` branch is protected:
- All changes must go through a pull request
- All CI checks must pass
- At least one review is required (for core maintainers)

## Reporting Issues

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)

## Feature Requests

We welcome feature requests! Please:
- Check existing issues first to avoid duplicates
- Provide a clear use case and rationale
- Explain how it aligns with JobEval's goals

## Code Style

### React Components

```typescript
// Use functional components with TypeScript
export default function ComponentName() {
  return <div>Content</div>;
}
```

### Zustand Stores

```typescript
// Follow existing store patterns
export const useStoreName = create<StoreState>()(
  persist(
    (set) => ({
      // state and actions
    }),
    { name: 'store-name' }
  )
);
```

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── store/          # Zustand stores
├── utils/          # Utility functions
├── data/           # Static data files
└── types/          # TypeScript type definitions
```

## Questions?

If you have questions, please:
- Check existing documentation
- Search closed issues
- Open a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for helping make JobEval better! 🎉
