# JobEval v0.9 Beta Release Checklist

**Target Release Date:** [Set your date]  
**Release Type:** Public Beta  
**GitHub Repository:** [Your repo URL]

---

## 📋 Pre-Release Tasks

### ✅ 1. Code & Documentation Updates

#### Update Version & Beta Badge
- [x] Version 0.9.0 in `package.json` ✅
- [ ] Add "BETA" badge to README.md header
- [ ] Add beta disclaimer to landing page
- [ ] Update all user-facing copy to mention "Beta" status

#### Documentation Review
- [x] README.md is complete and accurate ✅
- [x] CONTRIBUTING.md exists and is comprehensive ✅
- [x] CHANGELOG.md has v0.9.0 entry ✅
- [x] LICENSE file is present (AGPL-3.0) ✅
- [ ] Add COMMERCIAL-LICENSE.md with enterprise terms
- [ ] Create PRIVACY_POLICY.md
- [ ] Create TERMS_OF_SERVICE.md
- [ ] Update README with actual GitHub repo URL (currently has placeholder)

#### Code Quality Verification
- [ ] Run full build: `npm run build`
- [ ] Verify zero ESLint warnings: `npm run lint`
- [ ] Verify type checking passes: `npm run type-check`
- [ ] Verify formatting is correct: `npm run format:check`
- [ ] Verify all CI checks pass on GitHub Actions

---

### ✅ 2. Testing & Validation

#### Quick Advisory Flow Testing
- [ ] Test with **high-confidence match** (>90%, e.g., "Software Developer")
- [ ] Test with **medium-confidence match** (50-80%, verify warning displays)
- [ ] Test with **no match** (verify error handling and upgrade prompt)
- [ ] Test **with affordability data** (revenue + payroll provided)
- [ ] Test **without affordability data** (optional fields empty)
- [ ] Test **PDF export** functionality
- [ ] Test all **market positioning strategies** (Leader, Competitive, Budget, Value)
- [ ] Test **form validation** (all required fields, error messages)
- [ ] Test **currency formatting** (USD works correctly)

#### In-Depth Analysis Flow Testing
- [ ] **New user journey**: Setup → Position → Details → Match → Calculator → Results
- [ ] **Auto-restore**: Close browser mid-flow, reopen, verify startup modal
- [ ] **Save/Export**: Test manual save and export from nav menu
- [ ] **Import**: Test importing saved data file
- [ ] **Auto-save**: Verify saves happen every 20 seconds (check browser DevTools)
- [ ] **Navigation**: Forward/backward through steps
- [ ] **Data persistence**: Complete flow, refresh browser, verify data remains
- [ ] **Clear data**: Verify "Clear All Data" works from settings
- [ ] Test **PDF export** from Results page (when implemented)

#### Cross-Browser Testing
- [ ] **Chrome** (latest): Full functionality
- [ ] **Firefox** (latest): Full functionality
- [ ] **Safari** (latest): Full functionality
- [ ] **Edge** (latest): Full functionality
- [ ] **Mobile Safari** (iOS): Responsive behavior
- [ ] **Mobile Chrome** (Android): Responsive behavior

#### Data Validation
- [ ] Verify all **20 occupations** have complete wage data
- [ ] Check `occupation-stats.json` shows 100% coverage
- [ ] Test occupation matching with each of the 20 titles
- [ ] Verify BLS data dates are accurate (May 2024)

#### Performance Testing
- [ ] **Page load time** < 3 seconds on 3G
- [ ] **Build size** check: `du -sh dist/`
- [ ] **Lighthouse audit** score > 90 (Performance, Accessibility)
- [ ] No console errors in production build
- [ ] No console warnings in production build

#### Accessibility Audit
- [ ] **Keyboard navigation** works throughout app
- [ ] **Screen reader** compatibility (test with NVDA or JAWS)
- [ ] All form inputs have **proper labels**
- [ ] **Color contrast** meets WCAG 2.1 AA standards
- [ ] **Focus indicators** visible on all interactive elements
- [ ] All images have **alt text**

---

### ✅ 3. Legal & Compliance

#### Required Documents (Create if missing)
- [x] LICENSE (AGPL-3.0) ✅
- [ ] COMMERCIAL-LICENSE.md (terms for enterprise >25 employees)
- [ ] PRIVACY_POLICY.md
- [ ] TERMS_OF_SERVICE.md
- [ ] DATA_ATTRIBUTION.md (BLS, O*NET credits)

#### Privacy Policy Content
```markdown
# Privacy Policy

**Last Updated:** [Date]

## Data Storage
JobEval stores all data locally in your browser using IndexedDB. We do not:
- Collect personal information
- Track user behavior
- Store data on external servers
- Use cookies or analytics
- Require user accounts

## Your Rights
- You own all data created in JobEval
- Export your data anytime via Settings → Export
- Delete your data anytime via Settings → Clear All Data
- No data is transmitted to our servers

## Changes to Policy
We will notify users of privacy policy changes through GitHub releases.

## Contact
For privacy questions: [your email]
```

#### Terms of Service Content
```markdown
# Terms of Service

**Last Updated:** [Date]

## Acceptance of Terms
By using JobEval, you agree to these terms.

## License Grant
JobEval is licensed under AGPL-3.0 for SMEs and nonprofits.
Enterprises (>25 employees) require commercial licensing.

## Warranty Disclaimer
JobEval is provided "AS IS" without warranty of any kind.
Salary decisions are your responsibility.

## Limitation of Liability
We are not liable for compensation decisions made using JobEval.
Consult legal and financial professionals for final decisions.

## Data Responsibility
You are responsible for backing up your data via Export function.

## Changes to Terms
Updates will be posted on GitHub with version updates.

## Contact
For terms questions: [your email]
```

#### Attribution Requirements
- [ ] BLS data attribution in footer of all wage-related pages
- [ ] O*NET attribution in occupation matching pages
- [ ] Open source licenses for all dependencies

---

### ✅ 4. Repository Setup

#### GitHub Repository Configuration
- [ ] Create repository (if not already created)
- [ ] Set repository to **Public**
- [ ] Add repository description: "Open-source salary evaluation tool for SMEs"
- [ ] Add topics: `compensation`, `hr`, `salary`, `open-source`, `typescript`, `react`
- [ ] Enable Issues
- [ ] Enable Discussions
- [ ] Enable Wiki (optional)

#### Branch Protection
- [ ] Set `main` as default branch
- [ ] Enable branch protection for `main`:
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass (CI)
  - [ ] Require branches to be up to date
  - [ ] Include administrators

#### Issue Templates
- [ ] Create Bug Report template
- [ ] Create Feature Request template
- [ ] Create Question/Support template

#### GitHub Actions
- [x] CI workflow exists (`.github/workflows/ci.yml`) ✅
- [ ] Verify CI passes on main branch
- [ ] Add build status badge to README

#### README Updates
- [ ] Replace `[Your repo URL]` with actual repository URL
- [ ] Replace `[your email]` with actual contact email
- [ ] Update beta disclaimer section
- [ ] Add "Report Issues" link to GitHub Issues
- [ ] Add "Join Discussion" link to GitHub Discussions

---

### ✅ 5. Beta-Specific Additions

#### Beta Badge & Warnings
- [ ] Add prominent **"BETA"** badge to README header
- [ ] Add beta notice to landing page hero section
- [ ] Add beta disclaimer to Settings page
- [ ] Create beta feedback form (Google Form or TypeForm)

#### Beta Disclaimer Text
```markdown
⚠️ **BETA VERSION**: JobEval is currently in public beta testing. 

**Current Limitations:**
- Occupation coverage: 20 common roles (expanding to 1,000+ in v1.0)
- National wage data only (no metro-area specificity)
- Limited testing in production environments

**We Need Your Feedback!**
Please report issues, suggest improvements, and share your experience:
- [Submit Feedback Form]
- [Report Issues on GitHub]
- [Join Community Discussion]
```

#### Beta Features to Add
- [ ] Add "Beta Feedback" button in main navigation
- [ ] Add "Report Bug" link in footer
- [ ] Add beta banner at top of app (dismissible)
- [ ] Track beta issues in GitHub Projects board

---

### ✅ 6. Deployment Preparation

#### Build Verification
- [ ] Clean build: `rm -rf dist node_modules && npm install && npm run build`
- [ ] Verify build artifacts in `dist/` directory
- [ ] Test production build locally: `npm run preview`
- [ ] Check for any build warnings or errors

#### Hosting Options (Choose One)

**Option A: GitHub Pages**
- [ ] Enable GitHub Pages in repository settings
- [ ] Set source to `gh-pages` branch (or `/docs`)
- [ ] Add deployment workflow (`.github/workflows/deploy.yml`)
- [ ] Configure custom domain (optional)

**Option B: Vercel**
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings (already correct for Vite)
- [ ] Set environment variables (if any)
- [ ] Configure custom domain (optional)

**Option C: Netlify**
- [ ] Connect GitHub repository to Netlify
- [ ] Configure build settings (already correct for Vite)
- [ ] Set environment variables (if any)
- [ ] Configure custom domain (optional)

#### Domain & Analytics (Optional)
- [ ] Configure custom domain (if using)
- [ ] Set up SSL certificate (automatic with Vercel/Netlify/GitHub Pages)
- [ ] Add privacy-respecting analytics (Plausible, Fathom, or skip entirely)
- [ ] Add error monitoring (Sentry, or skip for beta)

---

### ✅ 7. Pre-Release Communication

#### Create Release Notes
- [ ] Draft GitHub Release (v0.9.0-beta)
- [ ] Include changelog from CHANGELOG.md
- [ ] Add "Known Limitations" section
- [ ] Add "How to Report Issues" section
- [ ] Add "Beta Testing Goals" section

#### Prepare Announcement Content
- [ ] Draft announcement for GitHub Discussions
- [ ] Prepare social media posts (if applicable)
- [ ] Create Open-HR website announcement (if applicable)
- [ ] Draft email to interested parties (if applicable)

---

### ✅ 8. Release Day Actions

#### Final Pre-Flight Check
- [ ] All CI checks pass ✅
- [ ] Production build succeeds ✅
- [ ] All critical bugs resolved ✅
- [ ] Documentation complete ✅
- [ ] Legal documents in place ✅

#### Git Tagging & Release
```bash
# Ensure you're on main branch with latest changes
git checkout main
git pull origin main

# Verify everything is committed
git status

# Create and push tag
git tag -a v0.9.0-beta -m "Beta Release v0.9.0 - Initial Public Beta"
git push origin v0.9.0-beta

# Create GitHub Release from tag
# (Do this through GitHub UI or CLI)
```

#### Deployment
- [ ] Deploy to chosen hosting platform
- [ ] Verify deployment succeeded
- [ ] Test production URL
- [ ] Verify all features work on production

#### GitHub Release
- [ ] Create release from v0.9.0-beta tag
- [ ] Mark as "Pre-release" checkbox
- [ ] Add release notes
- [ ] Attach any relevant files
- [ ] Publish release

#### Post-Release
- [ ] Verify production site is live
- [ ] Test one complete user flow on production
- [ ] Post announcement to GitHub Discussions
- [ ] Share on social media (if applicable)
- [ ] Update Open-HR website (if applicable)
- [ ] Monitor for immediate issues

---

### ✅ 9. Beta Feedback Collection

#### Set Up Feedback Channels
- [ ] Create feedback form (Google Forms, TypeForm, etc.)
- [ ] Enable GitHub Issues for bug reports
- [ ] Enable GitHub Discussions for questions
- [ ] Set up email for direct feedback (optional)

#### Feedback Tracking
- [ ] Create GitHub Projects board for beta feedback
- [ ] Label issues: `beta-feedback`, `bug`, `enhancement`
- [ ] Triage incoming issues regularly
- [ ] Respond to users within 48 hours

#### Beta Success Metrics
- [ ] Track number of users (via analytics if enabled)
- [ ] Track completion rate (Quick vs In-Depth)
- [ ] Track most common occupations searched
- [ ] Collect qualitative feedback on usefulness
- [ ] Identify most common bugs/issues

---

### ✅ 10. Post-Beta Planning

#### Path to v1.0
- [ ] Document beta learnings
- [ ] Prioritize v1.0 features based on feedback
- [ ] Address critical bugs found during beta
- [ ] Plan BLS API integration timeline
- [ ] Set v1.0 release target date

#### Community Building
- [ ] Engage with beta testers
- [ ] Highlight user success stories
- [ ] Build contributor community
- [ ] Document common use cases
- [ ] Create tutorial content

---

## 🎯 Beta Success Criteria

**Minimum for Public Beta:**
- ✅ All core features functional
- ✅ Zero critical bugs
- ✅ 20 occupations with complete data
- ✅ Documentation complete
- ✅ Legal compliance in place
- ✅ CI/CD passing

**Optional but Recommended:**
- Privacy-respecting analytics
- Error monitoring
- Custom domain
- Social media presence

---

## 📞 Launch Day Checklist

**Morning of Launch:**
- [ ] Final production test
- [ ] Verify all links work
- [ ] Check GitHub is ready
- [ ] Prepare announcements
- [ ] Have coffee ☕

**Launch:**
1. [ ] Tag and push v0.9.0-beta
2. [ ] Create GitHub Release
3. [ ] Deploy to production
4. [ ] Post announcements
5. [ ] Monitor for issues

**Evening:**
- [ ] Check for immediate bug reports
- [ ] Respond to any questions
- [ ] Celebrate! 🎉

---

**Remember:** This is a beta release. It's okay to be imperfect. The goal is to get real user feedback and learn what works!

**Good luck! 🚀**
