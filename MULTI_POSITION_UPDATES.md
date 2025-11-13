# Multi-Position Evaluation Updates

**Date:** November 13, 2025  
**Version:** v0.9.0  
**Issue:** "Start New Evaluation" was clearing company profile unnecessarily

---

## 🎯 Problem Identified

During end-to-end testing, you discovered that clicking "Start New Evaluation" cleared ALL data including the company profile. This created unnecessary friction for users evaluating multiple positions for the same company.

### Key Issues:
1. Users had to re-enter company information for every position
2. No way to track cumulative payroll impact across multiple positions
3. Unclear user experience around multi-position workflows

---

## ✅ Changes Implemented

### 1. **Results Page** (`src/features/results/components/Results.tsx`)

**Changed:**
- ❌ Removed `clearProfile()` call from new evaluation handler
- ✅ Now only clears position-related data (position, matching, calculator)
- ✅ Preserves company profile for reuse

**UI Updates:**
- Button text: "Start New Evaluation" → "Evaluate Another Position"
- Dialog title: "Start New Evaluation?" → "Evaluate Another Position?"
- Dialog message: Clarified that company profile is preserved
- Dialog button: "Clear & Start Over" → "Continue"
- Added helper tip about updating payroll after each evaluation

**Navigation Change:**
- Previously navigated to `/setup/company` (company setup)
- Now navigates to `/position/basic` (position wizard)

---

### 2. **Company Setup** (`src/features/company-setup/components/CompanySetup.tsx`)

**Changed:**
- Enhanced help text for "Current Annual Payroll" field
- Added guidance: "If evaluating multiple positions, update this after each evaluation to track cumulative impact."

**Why:**
- Educates users about manual payroll tracking workflow
- Sets expectation for v0.9 beta functionality
- Prepares users for v1.0 automatic tracking

---

### 3. **Settings Page** (`src/features/settings/components/SettingsPage.tsx`)

**Added:**
- Company Profile section showing current company data
- "Edit Company Profile" button to navigate back to company setup
- Informational callout explaining multi-position tracking workflow

**Why:**
- Provides easy access to update payroll after each evaluation
- Makes company data visible and editable
- Reinforces best practice for tracking cumulative impact

---

### 4. **README.md**

**Added:**
- New section: "Evaluating Multiple Positions"
- Step-by-step workflow documentation
- Clarification that v0.9 uses manual tracking, v1.0 will be automatic
- Updated roadmap to reflect multi-position features
- Updated known limitations to mention manual payroll tracking

**Why:**
- Documents the supported workflow
- Sets proper expectations for beta users
- Provides clear guidance on best practices

---

## 🔄 User Workflow (v0.9)

### Before Changes:
1. Complete evaluation for Position A
2. Click "Start New Evaluation"
3. ❌ Re-enter entire company profile
4. ❌ No way to track cumulative payroll
5. Complete evaluation for Position B

### After Changes:
1. Complete evaluation for Position A
2. Click "Evaluate Another Position"
3. ✅ Company profile automatically preserved
4. ✅ Go to Settings → Update current payroll (+Position A salary)
5. Complete evaluation for Position B
6. ✅ Results reflect updated payroll baseline

---

## 📋 What's Still Manual (v0.9)

✅ **Automated:**
- Company profile persistence across evaluations
- Position data reset for new evaluations
- Navigation directly to position wizard

⚠️ **Manual (v1.0 Feature):**
- Updating payroll after each evaluation
- Position history tracking
- Aggregate payroll calculations
- Multi-position PDF reports

---

## 🎯 Design Decisions

### Why Not Build Automatic Tracking Now?

**Pragmatic reasoning:**
1. **Validate demand** - Beta testing will confirm users need this
2. **Complexity** - Requires position history, aggregate calcs, edit capabilities
3. **Timeline** - Would delay beta release by 1-2 weeks
4. **Workaround exists** - Manual update is acceptable for beta

**v1.0 Planned Features:**
- Position history dashboard
- Automatic cumulative payroll tracking
- Edit/delete previous positions
- Multi-position PDF export
- Budget tracking visualizations

### Why Not Build Multi-Position PDF Now?

**Same reasoning:**
- Unvalidated requirement
- Significant design work needed
- Beta workaround works (individual PDFs)
- User feedback will inform v1.0 design

---

## 🧪 Testing Checklist

Before release, verify:

- [ ] "Evaluate Another Position" button appears on Results page
- [ ] Clicking button shows updated confirmation dialog
- [ ] Confirming clears position data but keeps company profile
- [ ] Navigation goes to `/position/basic` (not `/setup/company`)
- [ ] Company profile remains intact through multiple evaluations
- [ ] Settings page shows current company data
- [ ] "Edit Company Profile" button navigates to company setup
- [ ] Payroll can be updated via Settings → Company Setup
- [ ] Helper text appears in relevant places
- [ ] README accurately documents workflow

---

## 📝 Documentation Updates

**Files Updated:**
1. `src/features/results/components/Results.tsx` - Core logic fix
2. `src/features/company-setup/components/CompanySetup.tsx` - Help text
3. `src/features/settings/components/SettingsPage.tsx` - Profile editing
4. `README.md` - User-facing documentation

**Total Lines Changed:** ~150 lines across 4 files

---

## 🚀 Future Roadmap (v1.0)

Based on this change, v1.0 should include:

1. **Position History:**
   - List of all evaluated positions
   - Edit/delete capabilities
   - Status tracking (hired, pending, rejected)

2. **Automatic Payroll Tracking:**
   - Auto-increment payroll with each hire
   - Cumulative budget visualization
   - Payroll-to-revenue ratio tracking

3. **Multi-Position Reports:**
   - Single PDF with all positions
   - Aggregate budget analysis
   - Position selection for export

4. **Dashboard View:**
   - Overview of all positions
   - Budget utilization charts
   - Market comparison across roles

---

## ✅ Conclusion

**Problem:** Unnecessary data clearing created friction for multi-position evaluation.

**Solution:** Preserve company profile, add helper text, document workflow.

**Result:** Users can efficiently evaluate multiple positions without re-entering company data.

**Trade-off:** Manual payroll tracking in v0.9, automatic in v1.0 (validated by beta feedback).

**Philosophy:** "Solve problems when they exist" - we discovered this through testing, implemented the minimum viable fix, and plan comprehensive features for v1.0 based on user feedback.

---

**All changes committed and ready for beta testing! 🎉**
