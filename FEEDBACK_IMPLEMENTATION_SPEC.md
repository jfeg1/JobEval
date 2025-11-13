# JobEval Feedback System Implementation Guide

**Date:** November 13, 2025  
**Status:** Backend Complete - Frontend Implementation Ready  
**For:** Claude Code or New Conversation  

---

## 🎯 Mission

Implement the in-app feedback system for JobEval v0.9 beta. Users need to report bugs and request features **without leaving the application**.

---

## ✅ What's Already Complete

### 1. Backend Infrastructure (100% Done)
- ✅ Vercel serverless function at `/api/feedback.js`
- ✅ GitHub API integration (creates issues automatically)
- ✅ Rate limiting (5 requests/hour per IP)
- ✅ Input sanitization and security
- ✅ Production deployment tested and working
- ✅ Test confirmed: Issue #88 created successfully

**API Endpoint:** `POST /api/feedback`

**Request Format:**
```typescript
{
  type: 'bug' | 'feature',
  data: {
    title: string,
    // Bug-specific fields
    description?: string,
    stepsToReproduce?: string,
    expectedBehavior?: string,
    actualBehavior?: string,
    environment?: {
      version: string,
      flow: string,
      browser: string,
      os: string,
      device: string
    },
    dataContext?: string,
    additionalContext?: string,
    
    // Feature-specific fields
    problem?: string,
    proposedSolution?: string,
    alternatives?: string,
    scope?: string,
    priority?: string
  }
}
```

**Response Format:**
```typescript
// Success (201)
{
  success: true,
  issueNumber: number,
  issueUrl: string,
  message: string
}

// Error (400/429/500)
{
  error: string,
  details?: string
}
```

### 2. Documentation Complete
- ✅ README with beta badges and disclaimers
- ✅ GitHub issue templates (bug_report.md, feature_request.md)
- ✅ API documentation in `api/README.md`
- ✅ Setup guides for Vercel deployment
- ✅ All placeholder URLs and emails updated

### 3. Project Configuration
- ✅ Vercel CLI configured with npm scripts
- ✅ Environment variables set (local + production)
- ✅ GitHub repository connected to Vercel
- ✅ Auto-deploy on push enabled
- ✅ Deployment protection configured

---

## 🎨 Design Requirements

### Design Philosophy: Scandinavian Minimalist
- Clean lines, ample whitespace
- Functional over decorative
- Sage/slate color palette (existing theme)
- Accessibility-first (WCAG 2.1 AA)
- Mobile-responsive

### Component Library
- **Primary:** Flowbite (already installed) - for modals, forms, alerts
- **Secondary:** DevExtreme (already installed) - for data grids (existing usage)
- **Styling:** Tailwind CSS v4

### Color Palette (from existing theme)
```css
/* Sage/Slate Theme */
--sage-50: #f6f7f6;
--sage-100: #e3e6e3;
--sage-200: #c7ccc7;
--sage-500: #6b7c6b;
--sage-600: #556955;
--sage-700: #3d4d3d;

--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
```

---

## 📦 Components to Build

### 1. API Client Service (HIGH PRIORITY - Build First)

**File:** `src/lib/api/feedbackService.ts`

**Purpose:** Abstraction layer for calling the feedback API

**Exports:**
```typescript
// Types
export interface BugReportData {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  dataContext?: string;
  additionalContext?: string;
}

export interface FeatureRequestData {
  title: string;
  description: string;
  problem: string;
  proposedSolution: string;
  alternatives?: string;
  scope?: string;
  priority?: string;
}

export interface FeedbackResponse {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  message?: string;
  error?: string;
}

// Functions
export async function submitBugReport(data: BugReportData): Promise<FeedbackResponse>
export async function submitFeatureRequest(data: FeatureRequestData): Promise<FeedbackResponse>
export function detectEnvironment(): EnvironmentInfo
```

**Implementation Notes:**
- Use `fetch()` to call `/api/feedback`
- Include proper error handling
- Auto-detect browser, OS, device from user agent
- Get JobEval version from `package.json`
- Detect current flow from route (Quick Advisory vs In-Depth Analysis)
- Handle network errors gracefully
- Return typed responses

**Example Usage:**
```typescript
import { submitBugReport, detectEnvironment } from '@/lib/api/feedbackService';

const result = await submitBugReport({
  title: "Calculator shows NaN",
  description: "When entering salary...",
  stepsToReproduce: "1. Go to Calculator\n2. Enter $50,000",
  expectedBehavior: "Should show calculation",
  actualBehavior: "Shows NaN",
});

if (result.success) {
  showToast(`Bug reported! Issue #${result.issueNumber}`);
}
```

---

### 2. Bug Report Modal

**File:** `src/components/feedback/BugReportModal.tsx`

**Design:**
- Flowbite modal component
- Form with validation
- Auto-populated environment data (non-editable, shown for transparency)
- Loading state during submission
- Success/error notifications

**Form Fields:**
1. **Title*** (required, max 200 chars)
   - Placeholder: "Brief description of the bug"
   - Validation: Required, min 10 chars

2. **Description*** (required, textarea)
   - Placeholder: "Detailed description of what's wrong"
   - Validation: Required, min 20 chars

3. **Steps to Reproduce*** (required, textarea)
   - Placeholder: "1. Go to...\n2. Click on...\n3. See error"
   - Validation: Required

4. **Expected Behavior*** (required, textarea)
   - Placeholder: "What should happen?"
   - Validation: Required

5. **Actual Behavior*** (required, textarea)
   - Placeholder: "What actually happens?"
   - Validation: Required

6. **Additional Context** (optional, textarea)
   - Placeholder: "Any other details?"

7. **Environment Info** (auto-detected, read-only, displayed)
   - Show: Version, Browser, OS, Device, Current Flow
   - Display in collapsed section with "Show Details" toggle

**UI Elements:**
- Modal backdrop (semi-transparent)
- Close button (X in top right)
- Cancel button (bottom left)
- Submit button (bottom right, primary color)
- Loading spinner on submit button during submission
- Character count for title field

**States:**
- Default (empty form)
- Validating (show errors inline)
- Submitting (disabled form, loading spinner)
- Success (show success message, auto-close after 2 seconds)
- Error (show error message, allow retry)

**Accessibility:**
- Focus trap within modal
- ESC key closes modal
- ARIA labels on all inputs
- Error messages announced to screen readers
- Keyboard navigation (Tab, Shift+Tab)

---

### 3. Feature Request Modal

**File:** `src/components/feedback/FeatureRequestModal.tsx`

**Design:** Similar to Bug Report Modal but with different fields

**Form Fields:**
1. **Title*** (required, max 200 chars)
   - Placeholder: "Brief description of the feature"

2. **Description*** (required, textarea)
   - Placeholder: "What feature would you like to see?"

3. **Problem or Use Case*** (required, textarea)
   - Placeholder: "What problem does this solve?"
   - Help text: "Describe the user need or pain point"

4. **Proposed Solution*** (required, textarea)
   - Placeholder: "How do you envision this working?"

5. **Alternatives Considered** (optional, textarea)
   - Placeholder: "What other approaches did you consider?"

6. **Feature Scope** (optional, checkboxes)
   - [ ] Quick Advisory
   - [ ] In-Depth Analysis
   - [ ] Both flows
   - [ ] Settings/Configuration
   - [ ] Other

7. **Priority** (optional, radio buttons)
   - Critical - Blocking my use
   - High - Would significantly improve experience
   - Medium - Nice to have
   - Low - Not urgent

8. **Additional Context** (optional, textarea)

**Same UI patterns as Bug Report Modal**

---

### 4. Beta Banner Component

**File:** `src/components/BetaBanner/BetaBanner.tsx`

**Design:**
- Flowbite alert component (warning style, orange/amber color)
- Dismissible with X button
- Sticky at top of viewport (below any global nav if present)
- Responsive (stacks on mobile)

**Copy:**
```
⚠️ You're exploring JobEval v0.9 Beta!

This is a beta release - core features work great, but you might find rough edges. 
Your feedback makes JobEval better!

[🐛 Report Bug]  [💡 Request Feature]  [✕ Dismiss]
```

**Behavior:**
- Shows on app load (first time)
- Can be dismissed
- Stores dismissal in localStorage with timestamp
- Reappears after 14 days
- Resets on version change (check package.json version)

**localStorage Schema:**
```typescript
interface BetaBannerState {
  dismissed: boolean;
  dismissedAt: number; // timestamp
  version: string;      // e.g., "0.9.0"
}

// Key: 'jobeval_beta_banner'
```

**Integration:**
- Buttons open respective modals (Bug Report or Feature Request)
- Clicking outside banner doesn't dismiss (only X button)
- Keyboard accessible (Tab to buttons, Enter to activate)

---

### 5. Settings Menu Integration

**File:** Update existing Settings component

**Add "Help & Feedback" Section:**

```
Settings
├── Company Profile (existing)
├── Data Management (existing)
└── Help & Feedback (NEW)
    ├── 🐛 Report a Bug        → Opens Bug Report Modal
    ├── 💡 Request a Feature   → Opens Feature Request Modal
    ├── 💬 Community Discussions → External: https://github.com/jfeg1/JobEval/discussions
    └── 📧 Contact Support     → mailto:johnathen.evans-guilbault@proton.me
```

**Implementation Notes:**
- Use existing Settings menu structure
- Match existing menu styling
- Icons from lucide-react (already used in project)
- Modal triggers same as banner buttons

---

### 6. Footer Component

**File:** `src/components/Footer/Footer.tsx`

**Design:** Minimalist, single-line footer

**Content:**
```
JobEval v0.9 (Beta) | Privacy-First Salary Evaluation

[Documentation] • [Report Bug] • [Request Feature] • [Discussions] • [Privacy Policy] • [Terms]

Built with ❤️ for small businesses | Open-sourced under AGPL-3.0
```

**Links:**
- Documentation → README on GitHub
- Report Bug → Opens Bug Report Modal
- Request Feature → Opens Feature Request Modal
- Discussions → GitHub Discussions (external)
- Privacy Policy → /privacy (or PRIVACY_POLICY.md)
- Terms → /terms (or TERMS_OF_SERVICE.md)

**Styling:**
- Sage-500 text color
- Small font (13px)
- Monospace font for version/license info
- Padding: 30px vertical, 20px horizontal
- Border-top: 1px solid sage-200
- Background: sage-50

**Placement:**
- Fixed at bottom of page on all routes
- Not sticky (scrolls with content)

---

### 7. Toast Notification System

**File:** `src/components/feedback/Toast.tsx`

**Design:** Simple, minimal toast notifications

**Types:**
- Success (green background, checkmark icon)
- Error (red background, X icon)
- Info (blue background, info icon)

**Behavior:**
- Appears top-right corner
- Auto-dismiss after 5 seconds (success) or 8 seconds (error)
- Can be manually dismissed
- Stacks if multiple toasts
- Slide-in animation
- Accessible (ARIA live region)

**Usage:**
```typescript
import { useToast } from '@/components/feedback/Toast';

const { showToast } = useToast();

showToast({
  type: 'success',
  message: 'Bug report submitted! Issue #88',
  duration: 5000,
});
```

**Alternative:** If you prefer to use a library, `react-hot-toast` is lightweight and works well with Tailwind.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── BetaBanner/
│   │   ├── BetaBanner.tsx
│   │   └── useBetaBanner.ts
│   ├── feedback/
│   │   ├── BugReportModal.tsx
│   │   ├── FeatureRequestModal.tsx
│   │   ├── FeedbackModal.tsx (shared base)
│   │   └── Toast.tsx
│   └── Footer/
│       └── Footer.tsx
├── lib/
│   └── api/
│       └── feedbackService.ts
├── types/
│   └── feedback.ts
└── app/
    └── App.tsx (integrate banner)
```

---

## 🔧 Implementation Steps

### Step 1: API Service (30 minutes)
1. Create `src/lib/api/feedbackService.ts`
2. Implement type definitions
3. Implement `submitBugReport` function
4. Implement `submitFeatureRequest` function
5. Implement `detectEnvironment` utility
6. Add error handling and retries
7. Test with curl or Postman

### Step 2: Bug Report Modal (1 hour)
1. Create modal component with Flowbite
2. Build form with validation
3. Wire up to API service
4. Add loading states
5. Add success/error handling
6. Test accessibility

### Step 3: Feature Request Modal (45 minutes)
1. Duplicate Bug Report Modal structure
2. Replace fields
3. Wire up to API service
4. Test functionality

### Step 4: Toast System (30 minutes)
1. Create Toast component
2. Implement ToastProvider context
3. Add useToast hook
4. Style with Tailwind
5. Test animations

### Step 5: Beta Banner (45 minutes)
1. Create BetaBanner component
2. Implement localStorage logic
3. Wire up modal triggers
4. Add to App.tsx
5. Test dismissal and reappearance

### Step 6: Settings Integration (30 minutes)
1. Find Settings component
2. Add "Help & Feedback" section
3. Wire up modal triggers
4. Test navigation

### Step 7: Footer (30 minutes)
1. Create Footer component
2. Add to main layout
3. Wire up modal triggers
4. Test responsive design

### Step 8: Testing & Polish (1 hour)
1. End-to-end user flow testing
2. Accessibility audit (keyboard nav, screen readers)
3. Mobile responsive testing
4. Error scenario testing
5. Cross-browser testing

**Total Time:** ~6-7 hours of focused implementation

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Bug report modal opens from banner
- [ ] Bug report modal opens from settings
- [ ] Bug report modal opens from footer
- [ ] Form validation works correctly
- [ ] Environment data is auto-detected
- [ ] API submission succeeds
- [ ] GitHub issue is created
- [ ] Success toast appears
- [ ] Modal closes after success
- [ ] Error handling works (network failure)
- [ ] Rate limiting error is handled (429)

- [ ] Feature request modal opens from banner
- [ ] Feature request modal opens from settings
- [ ] Feature request modal opens from footer
- [ ] All form fields work correctly
- [ ] Checkbox/radio selections work
- [ ] API submission succeeds
- [ ] GitHub issue is created with correct labels

- [ ] Beta banner appears on first load
- [ ] Banner can be dismissed
- [ ] Banner stays dismissed for 14 days
- [ ] Banner reappears after 14 days
- [ ] Banner reappears on version change
- [ ] Modal buttons work from banner

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, ESC)
- [ ] Focus trap works in modals
- [ ] ESC key closes modals
- [ ] ARIA labels are present
- [ ] Error messages announced to screen readers
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] All interactive elements keyboard accessible

### Responsive Testing
- [ ] Modals work on mobile (320px width)
- [ ] Forms are usable on tablet
- [ ] Banner stacks properly on mobile
- [ ] Footer is readable on mobile
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable (min 16px on mobile)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🎨 Code Style Guidelines

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` types
- Use type inference where possible
- Export types from separate files when shared

### React
- Functional components with hooks
- Use TypeScript for props
- Extract complex logic into custom hooks
- Keep components focused (single responsibility)
- Use proper React patterns (don't mutate state)

### Naming Conventions
- Components: PascalCase (`BugReportModal.tsx`)
- Files: camelCase for utilities (`feedbackService.ts`)
- Functions: camelCase (`submitBugReport`)
- Constants: UPPER_SNAKE_CASE (`MAX_TITLE_LENGTH`)
- Interfaces: PascalCase (`BugReportData`)

### File Organization
```typescript
// 1. Imports
import React from 'react';
import { useToast } from './Toast';

// 2. Types
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// 3. Constants
const MAX_TITLE_LENGTH = 200;

// 4. Component
export function BugReportModal({ isOpen, onClose }: Props) {
  // Hooks first
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  
  // Event handlers
  const handleSubmit = async () => {
    // ...
  };
  
  // Render
  return (
    // JSX
  );
}
```

### Tailwind Usage
- Use existing theme colors (sage/slate)
- Responsive modifiers: `sm:`, `md:`, `lg:`
- Hover states: `hover:bg-sage-600`
- Focus states: `focus:ring-2 focus:ring-sage-500`
- Dark mode: Not required for v0.9 (future consideration)

---

## 📚 Key Files to Reference

### Existing Codebase
- `src/app/App.tsx` - Main app structure
- `src/shared/components/ui/` - Existing UI components
- `tailwind.config.js` - Theme configuration
- `package.json` - Dependencies and versions

### Documentation
- `README.md` - Beta badges and disclaimers
- `api/README.md` - API documentation
- `BETA_FEEDBACK_DESIGN.md` - Original design spec
- `.github/ISSUE_TEMPLATE/` - GitHub issue templates

### Backend
- `api/feedback.js` - Serverless function
- `vercel.json` - Vercel configuration

---

## 🚨 Common Pitfalls to Avoid

### 1. CORS Issues
The API is on the same domain, so CORS shouldn't be an issue. But if testing locally with different ports:
- Frontend: `localhost:5173` (Vite)
- API: `localhost:3000` (Vercel dev)
Use `npm run vercel:dev` to run both together.

### 2. Environment Detection
Don't hardcode environment values. Use the `detectEnvironment()` utility to get accurate browser/OS/device info from the user agent.

### 3. Form State
Use controlled components for all form inputs. Don't rely on refs or uncontrolled inputs for validation.

### 4. Modal Focus Management
Implement proper focus trap to prevent keyboard users from tabbing outside the modal. Return focus to trigger button on close.

### 5. Loading States
Always show loading states during API calls. Disable submit button to prevent double-submissions.

### 6. Error Messages
Be specific with error messages. Don't just say "Error occurred" - explain what went wrong and what the user can do.

### 7. Rate Limiting
The API has rate limiting (5/hour per IP). Handle 429 responses gracefully with a clear message about trying again later.

### 8. localStorage
Check if localStorage is available (private browsing blocks it). Gracefully degrade if unavailable.

---

## 🔗 External Links

- **GitHub Repo:** https://github.com/jfeg1/JobEval
- **Vercel Dashboard:** https://vercel.com/dashboard (search for jobeval-app)
- **Production URL:** https://jobeval-app.vercel.app
- **API Endpoint:** https://jobeval-app.vercel.app/api/feedback
- **GitHub Issues:** https://github.com/jfeg1/JobEval/issues
- **GitHub Discussions:** https://github.com/jfeg1/JobEval/discussions

---

## 📞 Support

- **Email:** johnathen.evans-guilbault@proton.me
- **GitHub:** @jfeg1

---

## ✅ Definition of Done

A feature is complete when:
- [ ] Code is written and tested
- [ ] TypeScript has no errors
- [ ] ESLint has no warnings
- [ ] Component is accessible (keyboard nav, ARIA labels)
- [ ] Mobile responsive
- [ ] Integrated into app
- [ ] Documented (if complex)
- [ ] Git committed with clear message

---

## 🎯 Success Criteria

The feedback system is successful when:
1. Users can report bugs without leaving JobEval
2. Users can request features without leaving JobEval
3. GitHub issues are created automatically
4. The experience is smooth and intuitive
5. Zero accessibility violations
6. Works on all major browsers
7. Mobile-friendly

---

## 🚀 Quick Start Commands

```bash
# Start development
npm run vercel:dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Deploy
npm run vercel:deploy
```

---

## 📝 Notes

- JobEval uses IndexedDB for local storage (via Dexie)
- All user data stays local (privacy-first)
- No authentication required
- Beta version (v0.9.0)
- Target users: SMEs with 5-25 employees
- Mission: Democratize fair compensation

---

**This document contains everything needed to implement the feedback system. Start with the API service, then build modals, then integrate into the app. Test thoroughly at each step. You've got this!** 🚀
