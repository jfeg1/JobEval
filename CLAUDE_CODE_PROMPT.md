# Claude Code Prompt: JobEval Feedback System

## Context
You are implementing the in-app feedback system for JobEval, an open-source salary evaluation tool. The backend API is complete and tested. You need to build the frontend React components.

## Your Mission
Build a complete feedback system that allows users to report bugs and request features without leaving the application.

## Quick Facts
- **Project:** JobEval v0.9 (Beta)
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Flowbite
- **Design:** Scandinavian minimalist (sage/slate colors)
- **Backend:** Vercel serverless function at `/api/feedback` (working)
- **Test Confirmed:** API creates GitHub issues successfully

## What You're Building

### 1. API Client Service
**File:** `src/lib/api/feedbackService.ts`
- TypeScript service to call `/api/feedback`
- Functions: `submitBugReport()`, `submitFeatureRequest()`, `detectEnvironment()`
- Proper error handling and types

### 2. Bug Report Modal
**File:** `src/components/feedback/BugReportModal.tsx`
- Flowbite modal with form validation
- Fields: title, description, steps, expected, actual, context
- Auto-detect environment (browser, OS, device, version)
- Loading states and success/error handling

### 3. Feature Request Modal
**File:** `src/components/feedback/FeatureRequestModal.tsx`
- Similar structure to bug report
- Fields: title, description, problem, solution, alternatives, scope, priority
- Same UX patterns

### 4. Beta Banner
**File:** `src/components/BetaBanner/BetaBanner.tsx`
- Orange alert at top of app
- Dismissible, reappears after 14 days
- Buttons open modals
- localStorage persistence

### 5. Toast Notifications
**File:** `src/components/feedback/Toast.tsx`
- Simple success/error toasts
- Top-right corner, auto-dismiss
- For feedback submission results

### 6. Settings Integration
Update existing Settings to add:
- "Help & Feedback" section
- Links to open modals
- External links (discussions, email)

### 7. Footer Component
**File:** `src/components/Footer/Footer.tsx`
- Minimal footer with feedback links
- Documentation, bug report, feature request, privacy, terms
- Sage/slate styling

## Complete Specification
Read the full specification in: `FEEDBACK_IMPLEMENTATION_SPEC.md`

This file contains:
- Exact API request/response formats
- Detailed component designs
- Code style guidelines
- Accessibility requirements
- Testing checklist
- Implementation steps with time estimates

## Design Reference
- **Colors:** Sage (#6b7c6b) and Slate (#64748b) palette
- **Components:** Use Flowbite (already installed)
- **Style:** Scandinavian minimalist - clean, functional, accessible
- **Font:** Use existing app fonts
- **Spacing:** Generous whitespace, clean layouts

## Key Requirements

### Accessibility (Critical)
- Keyboard navigation (Tab, Enter, ESC)
- Focus trap in modals
- ARIA labels on all inputs
- Error messages announced to screen readers
- Color contrast WCAG AA (4.5:1)

### Validation
- Required fields marked with *
- Inline error messages
- Character limits shown
- Prevent submission until valid

### User Experience
- Auto-populate environment data
- Show loading spinners during API calls
- Success toast with issue number
- Clear error messages with retry option
- Modal closes after successful submission

### Mobile Responsive
- Works on 320px width
- Touch targets 44x44px minimum
- Stacks appropriately on small screens

## API Endpoint Details

**Production:** `https://jobeval-app.vercel.app/api/feedback`  
**Local Dev:** `http://localhost:3000/api/feedback`

**Request:**
```typescript
POST /api/feedback
Content-Type: application/json

{
  type: 'bug' | 'feature',
  data: {
    title: string,
    description: string,
    // ... other fields (see spec)
    environment: {
      version: string,
      flow: string,
      browser: string,
      os: string,
      device: string
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "issueNumber": 88,
  "issueUrl": "https://github.com/jfeg1/JobEval/issues/88",
  "message": "Feedback submitted successfully!"
}
```

## Implementation Order

1. **Start here:** API service (`feedbackService.ts`) - Foundation for everything
2. Toast system - Needed for user feedback
3. Bug Report Modal - First full feature
4. Feature Request Modal - Similar pattern
5. Beta Banner - User entry point
6. Settings integration - Alternative entry point
7. Footer - Additional access point
8. Testing & polish - Make it production-ready

**Estimated Time:** 6-7 hours total

## Testing Commands

```bash
# Start dev server (runs both Vite and Vercel functions)
npm run vercel:dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Success Criteria

You're done when:
- [ ] Users can report bugs from banner, settings, or footer
- [ ] Users can request features from banner, settings, or footer
- [ ] Forms validate properly
- [ ] API calls work (creates real GitHub issues)
- [ ] Success toasts show with issue numbers
- [ ] Error handling works (network failures, rate limits)
- [ ] Beta banner dismisses and remembers for 14 days
- [ ] Everything is keyboard accessible
- [ ] Mobile responsive
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings

## Important Notes

- **Privacy:** All JobEval data stays local (IndexedDB). API only sends feedback, not user data.
- **Rate Limiting:** API allows 5 requests/hour per IP. Handle 429 errors gracefully.
- **Environment Detection:** Auto-detect from user agent, don't ask user.
- **Version:** Get from package.json (`0.9.0`)
- **Flow Detection:** Determine from current route (Quick Advisory vs In-Depth Analysis)

## Files to Reference

- `FEEDBACK_IMPLEMENTATION_SPEC.md` - Complete specification (READ THIS FIRST)
- `api/README.md` - API documentation
- `src/app/App.tsx` - Main app structure
- `tailwind.config.js` - Theme colors
- `package.json` - Version and dependencies

## Quick Win: Start Here

Create the API service first. It's the foundation. Here's a skeleton:

```typescript
// src/lib/api/feedbackService.ts

export interface BugReportData {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  dataContext?: string;
  additionalContext?: string;
}

export async function submitBugReport(data: BugReportData): Promise<FeedbackResponse> {
  const environment = detectEnvironment();
  
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'bug',
      data: { ...data, environment }
    })
  });
  
  return await response.json();
}

export function detectEnvironment() {
  // Auto-detect browser, OS, device, version, current flow
  // Return structured EnvironmentInfo object
}
```

Once you have the API service working, everything else builds naturally on top of it.

## Questions?

Everything you need is in `FEEDBACK_IMPLEMENTATION_SPEC.md`. If something is unclear, check that file first. It has detailed designs, code examples, and troubleshooting tips.

**You've got this! Start with the API service and build up from there.** 🚀
