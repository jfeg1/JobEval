# Vercel Serverless Function Setup - Complete Guide

**Date:** November 13, 2025  
**Status:** Ready for Implementation  
**Purpose:** Secure GitHub issue creation via Vercel serverless function

---

## ✅ What's Been Created

### 1. Serverless Function
**File:** `/api/feedback.js`

**Features:**
- ✅ Creates GitHub issues via API
- ✅ Rate limiting (5 requests/hour per IP)
- ✅ Input sanitization (prevents injection)
- ✅ CORS handling
- ✅ Error handling and logging
- ✅ Formats bug reports and feature requests
- ✅ Edge runtime (fast, globally distributed)

### 2. Configuration Files
- **`vercel.json`** - Vercel deployment configuration
- **`.env.local.example`** - Template for local development
- **`.vercelignore`** - Files to exclude from deployment
- **`api/README.md`** - Complete API documentation

---

## 🔐 Step-by-Step Setup

### Step 1: Create GitHub Token (5 minutes)

You should have already done this, but here's the recap:

1. ✅ Go to: https://github.com/settings/tokens?type=beta
2. ✅ Click "Generate new token"
3. ✅ Configure:
   - Name: `JobEval-Vercel-Function`
   - Expiration: No expiration
   - Repository: Only `JobEval`
   - Permissions: **Issues** = Read and write
4. ✅ Copy token (starts with `github_pat_11A...`)

**You should have this token ready now.**

---

### Step 2: Local Development Setup (5 minutes)

#### A. Install Vercel CLI

```bash
npm install -g vercel
```

#### B. Create Local Environment File

```bash
cd /Users/johnathenevans/jobeval
cp .env.local.example .env.local
```

#### C. Add Your Token

Open `.env.local` and replace `your_github_token_here` with your actual token:

```env
GITHUB_TOKEN=github_pat_11A...your_actual_token_here
GITHUB_REPO_OWNER=jfeg1
GITHUB_REPO_NAME=JobEval
NODE_ENV=development
```

**Save and close.** This file is already in `.gitignore` so it won't be committed.

#### D. Test Local Development

```bash
vercel dev
```

This command:
- Starts Vercel dev server
- Runs your Vite app
- Makes `/api/feedback` available locally
- Hot-reloads on changes

**Access:**
- Frontend: `http://localhost:3000` (or port shown)
- API: `http://localhost:3000/api/feedback`

---

### Step 3: Vercel Production Setup (10 minutes)

#### A. Link Your Project to Vercel

If not already linked:

```bash
cd /Users/johnathenevans/jobeval
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (or Yes if you already have one)
- Project name? **JobEval** (or accept default)
- Directory with code? **./** (current directory)
- Override settings? **No**

This creates a `.vercel` directory with project config.

#### B. Add Environment Variables to Vercel Dashboard

**Method 1: Via Dashboard (Recommended)**

1. Go to: https://vercel.com/dashboard
2. Find your **JobEval** project
3. Click **Settings**
4. Click **Environment Variables** (left sidebar)
5. Add three variables:

**Variable 1:**
- Key: `GITHUB_TOKEN`
- Value: `github_pat_11A...` (your token)
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Key: `GITHUB_REPO_OWNER`
- Value: `jfeg1`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 3:**
- Key: `GITHUB_REPO_NAME`
- Value: `JobEval`
- Environments: ✅ Production ✅ Preview ✅ Development

Click **Save** after each one.

**Method 2: Via CLI (Alternative)**

```bash
vercel env add GITHUB_TOKEN production
# Paste your token when prompted

vercel env add GITHUB_TOKEN preview
# Paste your token again

vercel env add GITHUB_TOKEN development
# Paste your token again

# Repeat for other variables (though they're already in vercel.json)
```

#### C. Deploy to Production

```bash
vercel --prod
```

This:
- Builds your app
- Deploys to Vercel
- Activates serverless functions
- Provides a production URL

**You'll get a URL like:** `https://jobeval-xyz.vercel.app`

---

### Step 4: Verify Deployment (5 minutes)

#### A. Check Function is Live

Visit: `https://your-app.vercel.app/api/feedback`

You should see: `{"error":"Method not allowed"}` (because we sent GET instead of POST)

This confirms the function is deployed!

#### B. Test with Curl

```bash
curl -X POST https://your-app.vercel.app/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug",
    "data": {
      "title": "Test from Production",
      "description": "Testing the serverless function",
      "stepsToReproduce": "1. Deploy\n2. Test",
      "expectedBehavior": "Should work",
      "actualBehavior": "Testing",
      "environment": {
        "version": "0.9.0",
        "flow": "Test",
        "browser": "Chrome",
        "os": "macOS",
        "device": "Desktop"
      }
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "issueNumber": 1,
  "issueUrl": "https://github.com/jfeg1/JobEval/issues/1",
  "message": "Feedback submitted successfully!"
}
```

#### C. Check GitHub

Go to: https://github.com/jfeg1/JobEval/issues

You should see a new issue with:
- Title: "Test from Production"
- Labels: bug, needs-triage, feedback
- Formatted body with all sections

**If you see this, everything works! 🎉**

---

## 🔧 Integration with Frontend

Now that the API is working, we need to update the frontend to use it.

### Current Status

The serverless function is ready, but the React app doesn't know about it yet.

### Next Steps (I'll implement these)

1. **Create API Client Service**
   - `src/lib/api/feedbackService.ts`
   - Handles POST requests to `/api/feedback`
   - Error handling and retry logic

2. **Create Feedback Modal Components**
   - `BugReportModal.tsx`
   - `FeatureRequestModal.tsx`
   - Form validation
   - Loading states
   - Success/error notifications

3. **Beta Banner Component**
   - Shows at top of app
   - Dismissible with 14-day timer
   - Links to feedback modals

4. **Settings Menu Integration**
   - Add "Help & Feedback" section
   - Links to open feedback modals

5. **Footer Links**
   - Add feedback links
   - Opens modals instead of external links

**Implementation time:** ~8-10 hours

---

## 🔍 Monitoring & Debugging

### View Function Logs

1. Go to Vercel Dashboard
2. Click your project
3. Click **Deployments**
4. Click latest deployment
5. Click **Functions** tab
6. Click `api/feedback.js`
7. See real-time logs

### Common Issues

**"Missing required environment variables"**
- Solution: Check Vercel Dashboard → Settings → Environment Variables
- Ensure all three checkboxes are selected for each variable
- Redeploy after adding variables

**GitHub API errors**
- 401: Token is invalid → Regenerate token
- 403: Rate limit hit → Wait and retry
- 404: Repository not found → Check GITHUB_REPO_OWNER and GITHUB_REPO_NAME

**Rate limit (429)**
- User exceeded 5 requests/hour
- This is intentional
- They'll see the reset time in the error

### Testing Rate Limits

```bash
# Send 6 requests quickly
for i in {1..6}; do
  curl -X POST https://your-app.vercel.app/api/feedback \
    -H "Content-Type: application/json" \
    -d '{"type":"bug","data":{"title":"Test '$i'","description":"Test"}}' \
    && echo "\nRequest $i done\n"
done
```

Request 6 should return 429 with rate limit error.

---

## 📋 Checklist

### Initial Setup
- [ ] GitHub token created with Issues permission
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] `.env.local` created with token
- [ ] Local dev tested (`vercel dev`)
- [ ] Project linked to Vercel (`vercel`)

### Production Deployment
- [ ] Environment variables added in Vercel Dashboard
  - [ ] GITHUB_TOKEN
  - [ ] GITHUB_REPO_OWNER
  - [ ] GITHUB_REPO_NAME
- [ ] All three environment checkboxes selected
- [ ] Deployed to production (`vercel --prod`)
- [ ] Function accessible at `/api/feedback`
- [ ] Test issue created successfully

### Frontend Integration (Next Phase)
- [ ] API client service created
- [ ] Bug report modal component
- [ ] Feature request modal component
- [ ] Beta banner with feedback buttons
- [ ] Settings menu integration
- [ ] Footer links added
- [ ] Success/error notifications
- [ ] End-to-end testing

---

## 🎯 Current Status

**Backend (API):** ✅ Complete and ready
**Frontend (UI):** ⏳ Awaiting implementation

---

## 💬 Questions?

If you encounter any issues during setup, let me know at which step and I'll help troubleshoot!

**Ready to set up your token in Vercel?** Follow Step 3B above and let me know when you're done!
