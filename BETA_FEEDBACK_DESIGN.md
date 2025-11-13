# In-App Beta Banner & Feedback System Design

**Date:** November 13, 2025  
**Status:** Design Proposal - Awaiting Review  
**Purpose:** Add beta warnings and feedback mechanisms to the JobEval UI

---

## Overview

This document outlines the design for in-app beta warnings and feedback collection mechanisms. The goal is to:
1. Set appropriate expectations for beta users
2. Make it easy to report issues and request features
3. Maintain a clean, unobtrusive UI

---

## 1. Beta Banner Component

### Design Specifications

**Visual Design:**
- Dismissible banner at the top of the application
- Orange/amber color scheme (matches beta badge)
- Clean, modern design that doesn't feel alarming
- Sticky/fixed position so it's always visible (optional: only show on first visit)

**Content:**
```
⚠️ Beta Version - You're using JobEval v0.9 (Beta)

This is a beta release. While core features are tested and functional, you may encounter bugs or limitations. Your feedback helps us improve!

[Report Issue] [Request Feature] [Dismiss]
```

**Behavior:**
- Appears on first launch
- Can be dismissed (stored in localStorage)
- Option to "Don't show again" 
- Reappears after 30 days or on version updates

**Placement:**
- Top of viewport, below any global navigation
- Z-index high enough to be above most content but below modals

### Technical Implementation

**Component Structure:**
```
src/components/BetaBanner/
├── BetaBanner.tsx          # Main component
├── BetaBanner.module.css   # Styles (or Tailwind classes)
└── useBetaBanner.ts        # Hook for state management
```

**State Management:**
- Use localStorage to track dismissal
- Key: `jobeval_beta_banner_dismissed`
- Value: { dismissed: boolean, timestamp: number, version: string }

**Integration Points:**
- Add to main App.tsx layout (top-level)
- Should appear on all pages/routes

---

## 2. Feedback Links/Buttons

### Primary Feedback Actions

Two distinct actions for collecting feedback:

#### A. Report Issue (Bug Report)
**Visual Design:**
- 🐛 Bug icon
- Red/pink accent color
- Primary button style

**User Flow:**
1. User clicks "Report Issue"
2. Opens external link to GitHub Issues with bug_report template
3. URL: `https://github.com/jfeg1/JobEval/issues/new?template=bug_report.md`
4. Opens in new tab

**Pre-filled Context (Optional Enhancement for v1.0):**
- Could pre-fill some environment data in the URL:
  - Browser: detected from user agent
  - Version: from package.json
  - Flow: current route/page
- Example: `&title=[BUG]%20Issue%20in%20Calculator&labels=bug,needs-triage`

#### B. Request Feature
**Visual Design:**
- 💡 Lightbulb icon
- Blue/teal accent color
- Secondary button style

**User Flow:**
1. User clicks "Request Feature"
2. Opens external link to GitHub Issues with feature_request template
3. URL: `https://github.com/jfeg1/JobEval/issues/new?template=feature_request.md`
4. Opens in new tab

### Placement Options

**Option 1: In Beta Banner (Recommended for MVP)**
- Pro: Centralized, always visible when banner is shown
- Pro: Clear connection to beta status
- Con: Hidden once banner is dismissed

**Option 2: In Settings/Help Menu**
- Pro: Always accessible even after banner dismissal
- Pro: Logical location for feedback options
- Con: Less discoverable

**Option 3: Floating Action Button (FAB)**
- Pro: Always visible, highly accessible
- Pro: Common pattern in modern apps
- Con: Can feel intrusive
- Con: Takes up screen real estate

**Option 4: Footer Links**
- Pro: Always present but unobtrusive
- Pro: Standard pattern for feedback/support
- Con: May be overlooked

**Recommended Approach: Combination**
- Primary: Beta banner (when visible)
- Secondary: Settings menu under "Help & Feedback"
- Tertiary: Footer links on all pages

---

## 3. Persistent Feedback Access

### Settings Menu Integration

**Navigation Path:**
Settings → Help & Feedback

**Menu Items:**
```
Help & Feedback
├── 📚 Documentation (link to GitHub README)
├── 🐛 Report a Bug (link to GitHub Issues)
├── 💡 Request a Feature (link to GitHub Issues)
├── 💬 Community Discussions (link to GitHub Discussions)
├── 📧 Contact Support (mailto link)
└── ℹ️ About JobEval (version info, licenses)
```

### Footer Implementation

**Footer Content:**
```
JobEval v0.9 (Beta) | Privacy-First Salary Evaluation

[Documentation] • [Report Bug] • [Request Feature] • [Discussions] • [Privacy Policy] • [Terms]

Built with ❤️ for small businesses | Open-sourced under AGPL-3.0
```

**Footer Behavior:**
- Sticky footer on all pages
- Minimal, unobtrusive design
- Links open in new tabs

---

## 4. User Journey Examples

### Journey 1: Encountering a Bug

1. User experiences unexpected behavior in Calculator step
2. Sees beta banner with "Report Issue" button
3. Clicks "Report Issue"
4. GitHub issue template opens with structured form
5. User fills in details about the bug
6. Submits issue
7. Receives GitHub notification when team responds

### Journey 2: Requesting a Feature

1. User completes evaluation, wishes there was PDF export for In-Depth
2. Notices "Request Feature" in beta banner
3. Clicks "Request Feature"
4. GitHub feature request template opens
5. User describes desired feature and use case
6. Submits request
7. Can track feature request progress via GitHub

### Journey 3: Banner Dismissed, Later Issue

1. User dismissed beta banner on Day 1
2. On Day 5, encounters a bug
3. Goes to Settings → Help & Feedback → Report a Bug
4. Same GitHub issue flow
5. Successfully reports issue despite dismissed banner

---

## 5. Copy & Messaging

### Beta Banner Copy Options

**Option A (Friendly & Encouraging):**
```
⚠️ You're exploring JobEval v0.9 Beta!
This is a beta release - core features work great, but you might find rough edges. 
Your feedback makes JobEval better! 
[Report Issue] [Request Feature] [Dismiss]
```

**Option B (Straightforward):**
```
⚠️ Beta Version v0.9
JobEval is in beta. Features are functional but may have bugs. Help us improve!
[Report Issue] [Request Feature] [Dismiss]
```

**Option C (Mission-Focused):**
```
⚠️ Beta Release - Help Us Democratize Fair Compensation
You're using JobEval v0.9 Beta. Together, we're making salary evaluation accessible to everyone.
Report bugs or suggest features to shape the future!
[Report Issue] [Request Feature] [Dismiss]
```

**Recommendation:** Option A - friendly, encouraging, clear

### Button Labels

**Report Issue Options:**
- "Report Bug" ← Clear and specific ✓
- "Report Issue" ← Slightly more general
- "Found a Bug?" ← Question format, approachable
- "Something Wrong?" ← Too vague

**Request Feature Options:**
- "Request Feature" ← Clear and direct ✓
- "Suggest Feature" ← Implies opinion vs. request
- "Got Ideas?" ← Too casual
- "Feedback" ← Too generic

**Recommendation:** "Report Bug" and "Request Feature" - clear, action-oriented

---

## 6. Technical Implementation Notes

### Component Hierarchy
```
App.tsx
├── BetaBanner (if not dismissed)
│   ├── dismissal logic
│   └── feedback buttons
├── MainNavigation
│   └── Settings → Help & Feedback submenu
├── Routes
│   └── [Various pages]
└── Footer
    └── feedback links
```

### LocalStorage Schema
```typescript
interface BetaBannerState {
  dismissed: boolean;
  dismissedAt: number; // timestamp
  version: string;      // e.g., "0.9.0"
  dontShowAgain: boolean;
}
```

### Utility Functions Needed
```typescript
// Check if banner should show
function shouldShowBetaBanner(): boolean

// Dismiss banner
function dismissBetaBanner(permanent: boolean): void

// Reset banner (for version updates)
function resetBetaBanner(): void

// Open feedback link
function openFeedbackLink(type: 'bug' | 'feature'): void
```

---

## 7. Accessibility Considerations

### Beta Banner
- Use `role="alert"` for screen readers (on first show only)
- Use `role="region"` with `aria-label="Beta notice"` for persistent banner
- Dismiss button needs clear `aria-label="Dismiss beta notice"`
- Keyboard accessible (Tab navigation, Enter to activate)

### Feedback Buttons
- Clear, descriptive labels
- Sufficient color contrast (WCAG AA minimum)
- Focus indicators visible
- Touch targets minimum 44x44px
- Work without JavaScript (direct links)

### Footer Links
- Sufficient spacing between links
- Clear focus indicators
- Semantic HTML (`<nav>`, `<ul>`, `<li>`)

---

## 8. Analytics Considerations

**Note:** JobEval is privacy-first with no analytics. However, for understanding beta feedback patterns, consider:

### What NOT to Track
- User behavior
- Personal data
- Usage patterns
- Any PII

### What We CAN Learn From
- GitHub issue metrics (public data):
  - Number of issues opened
  - Common bug patterns
  - Popular feature requests
  - Time to resolution
- Manual tracking in GitHub Projects board

---

## 9. Design Mockup Guidelines

### Beta Banner Mockup
```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️ You're exploring JobEval v0.9 Beta! Core features work       │
│ great, but you might find rough edges. Your feedback helps!     │
│                                                                  │
│ [🐛 Report Bug]  [💡 Request Feature]  [✕ Dismiss]             │
└──────────────────────────────────────────────────────────────────┘
```

### Footer Mockup
```
─────────────────────────────────────────────────────────────────
JobEval v0.9 (Beta) | Privacy-First Salary Evaluation

Documentation • Report Bug • Request Feature • Discussions • Privacy

Built with ❤️ for small businesses | Open-sourced under AGPL-3.0
─────────────────────────────────────────────────────────────────
```

---

## 10. Implementation Checklist

Once approved, implementation involves:

### Phase 1: Components (1-2 hours)
- [ ] Create BetaBanner component
- [ ] Add localStorage state management
- [ ] Implement dismiss logic
- [ ] Add to App.tsx

### Phase 2: Navigation (30 mins)
- [ ] Add "Help & Feedback" to Settings menu
- [ ] Create submenu items
- [ ] Add external link handlers

### Phase 3: Footer (30 mins)
- [ ] Create Footer component
- [ ] Add feedback links
- [ ] Add to main layout

### Phase 4: Testing (1 hour)
- [ ] Test dismiss functionality
- [ ] Test all feedback links
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Mobile responsive design

### Phase 5: Documentation (30 mins)
- [ ] Update README with feedback instructions
- [ ] Document component usage
- [ ] Add to CHANGELOG

**Total Estimated Time:** 4-5 hours

---

## 11. Questions for Review

Please review and provide feedback on:

1. **Beta Banner Design:**
   - Do you prefer Option A, B, or C for copy?
   - Should it auto-dismiss after 30 days or remain until manually dismissed?
   - Should there be a "Don't show again" option?

2. **Feedback Placement:**
   - Primary placement in banner + Settings menu + Footer? Or simpler approach?
   - Should we include a floating action button (FAB) for quick access?

3. **External Links:**
   - Opening GitHub in new tab is the right approach?
   - Should we show any modal confirmation before leaving the app?

4. **Priority:**
   - Should we implement all three placements (banner, settings, footer) or start simpler?
   - Any specific concerns about the design?

---

## Next Steps

Once you approve this design:
1. I'll implement the beta banner component
2. Add feedback links to Settings and Footer
3. Test accessibility and responsiveness
4. Update documentation
5. Create PR for review

---

**Ready for your review!** Let me know what you think and if any adjustments are needed.
