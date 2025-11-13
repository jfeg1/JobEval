# Contributing to JobEval

Thank you for your interest in contributing to JobEval! This document provides guidelines and instructions for contributing to the project.

## 🎯 Mission Alignment

Before contributing, please ensure your contribution aligns with JobEval's core mission:
- **Democratize fair compensation** for small and medium enterprises
- **Privacy-first** design (local data storage, no tracking)
- **Open source** accessibility for SMEs and nonprofits
- **High quality** standards with professional-grade output

## 🚀 Getting Started

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/yourusername/jobeval.git
cd jobeval
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Run quality checks**
```bash
npm run lint          # Check for code issues
npm run type-check    # TypeScript validation
npm run format:check  # Code formatting check
```

### Development Workflow

1. **Create a feature branch** from `main`
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following our code standards

3. **Test your changes** manually (automated tests coming in v1.0)

4. **Commit your changes** with clear messages
```bash
git commit -m "feat: add amazing feature"
```

5. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

6. **Open a Pull Request** to the main repository

## 📋 Code Standards

### TypeScript
- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` types - use `unknown` or proper types
- Use type inference where possible

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing with interfaces

### Naming Conventions
- **Components:** PascalCase (`UserProfile.tsx`)
- **Files:** camelCase for utilities (`formatCurrency.ts`)
- **Functions:** camelCase (`calculateSalary`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_SALARY_RANGE`)
- **Interfaces/Types:** PascalCase with descriptive names

### Code Style
- **Linting:** ESLint enforces our standards (zero warnings policy)
- **Formatting:** Prettier handles all formatting automatically
- **Pre-commit hooks:** Husky runs checks before each commit
- **Line length:** 100 characters max (enforced by Prettier)

### Project Structure
```
src/
├── app/              # App initialization and routing
├── components/       # Shared/global components
├── features/         # Feature-specific modules
│   ├── [feature]/
│   │   ├── components/
│   │   ├── [feature]Store.ts
│   │   └── types.ts
├── lib/              # Core utilities and services
├── shared/           # Shared utilities and components
├── types/            # Global TypeScript types
└── utils/            # Helper functions
```

## 🎨 UI/UX Guidelines

### Design Principles
- **Accessibility first:** WCAG 2.1 AA compliance
- **Mobile responsive:** Test on mobile, tablet, desktop
- **Clear hierarchy:** Use proper heading levels (h1-h6)
- **Consistent spacing:** Use Tailwind's spacing scale
- **Color palette:** Sage/slate tones (see Tailwind config)

### Component Library
- Use shared components from `/shared/components/ui`
- Follow existing patterns for forms, buttons, inputs
- Maintain consistent styling across features

## 🐛 Bug Reports

### Before Submitting
1. Check if the bug has already been reported in Issues
2. Test in the latest version
3. Verify it's reproducible

### What to Include
- **Clear title:** Brief description of the issue
- **Steps to reproduce:** Numbered list of exact steps
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** Browser, OS, version
- **Screenshots:** If applicable

**Template:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: Chrome 120.0
- OS: macOS 14.0
- JobEval Version: 0.9.0

## Screenshots
(if applicable)
```

## 💡 Feature Requests

### What Makes a Good Feature Request
- **Aligned with mission:** Serves SME needs
- **Well-defined:** Clear scope and requirements
- **User-focused:** Solves a real user problem
- **Feasible:** Technically possible within constraints

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem it Solves
What user problem does this address?

## Proposed Solution
How would this feature work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

## 📝 Pull Request Guidelines

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] All linting checks pass (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Code formatting is correct (`npm run format:check`)
- [ ] Manual testing completed
- [ ] PR description clearly explains changes
- [ ] Commits have meaningful messages
- [ ] No breaking changes (or clearly documented)

### PR Description Template
```markdown
## What does this PR do?
Brief description of changes

## Why is this needed?
Context and motivation

## How was this tested?
Manual testing steps performed

## Screenshots (if applicable)
Visual changes

## Related Issues
Closes #123
```

### Commit Message Format
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Build process or auxiliary tool changes

Example:
```
feat: add PDF export for in-depth analysis

- Implemented PDF generation service
- Added export button to results page
- Includes company branding and formatting
```

## 🧪 Testing (Coming in v1.0)

Currently, testing is manual. When automated testing is added:
- Write unit tests for new utilities
- Add integration tests for new features
- Update existing tests when modifying code
- Maintain test coverage above 80%

## 📚 Documentation

### When to Update Docs
- Adding new features
- Changing existing functionality
- Adding new configuration options
- Modifying installation steps

### Where to Update
- `README.md` - Project overview and setup
- `CHANGELOG.md` - Version history
- Inline code comments - Complex logic
- Type definitions - Public interfaces

## 🤝 Community

### Code of Conduct
- Be respectful and inclusive
- Focus on what's best for the community
- Show empathy towards others
- Accept constructive criticism gracefully

### Getting Help
- **Questions:** Open a Discussion on GitHub
- **Bugs:** File an Issue
- **Chat:** [Coming soon]
- **Email:** [Coming soon]

## 📄 License

By contributing to JobEval, you agree that your contributions will be licensed under the AGPL-3.0 license (for SMEs/nonprofits) with commercial licensing available for enterprises.

## 🙏 Recognition

All contributors will be:
- Listed in our README
- Credited in release notes
- Celebrated in our community

Thank you for helping make fair compensation accessible to everyone! 🎉
