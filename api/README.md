# Vercel Serverless Functions Setup

This directory contains Vercel serverless functions for JobEval's feedback system.

## Overview

The `/api/feedback.js` function handles in-app bug reports and feature requests by creating GitHub issues via the GitHub API. This keeps the GitHub token secure on the server side rather than exposing it in the client bundle.

## Architecture

```
Client (Browser) 
  → POST to /api/feedback 
  → Vercel Serverless Function (secure environment)
  → GitHub API (with token)
  → Issue created
  → Response to client
```

## Local Development Setup

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Create Local Environment File

```bash
cp .env.local.example .env.local
```

### 3. Add Your GitHub Token

Edit `.env.local` and replace `your_github_token_here` with your actual token:

```env
GITHUB_TOKEN=github_pat_11A...your_actual_token
```

**Important:** Never commit `.env.local` to version control! It's already in `.gitignore`.

### 4. Run Vercel Dev Server

```bash
vercel dev
```

This starts both:
- Your Vite dev server (frontend)
- Vercel serverless functions (API routes)

The API will be available at: `http://localhost:3000/api/feedback`

### 5. Test the API

You can test the endpoint with curl:

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug",
    "data": {
      "title": "Test Bug Report",
      "description": "This is a test",
      "stepsToReproduce": "1. Do something\n2. See bug",
      "expectedBehavior": "Should work",
      "actualBehavior": "Does not work",
      "environment": {
        "version": "0.9.0",
        "flow": "Quick Advisory",
        "browser": "Chrome 120",
        "os": "macOS",
        "device": "Desktop"
      }
    }
  }'
```

## Production Deployment

### Setting Environment Variables in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your JobEval project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GITHUB_TOKEN` | `github_pat_11A...` | Production, Preview, Development |
| `GITHUB_REPO_OWNER` | `jfeg1` | Production, Preview, Development |
| `GITHUB_REPO_NAME` | `JobEval` | Production, Preview, Development |

**Important:** Check all three environment boxes (Production, Preview, Development) for each variable.

### Deploy

```bash
# From project root
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy (if connected).

## Security Features

The API includes several security measures:

### Rate Limiting
- **Limit:** 5 requests per hour per IP address
- **Response:** 429 Too Many Requests with reset time
- **Reset:** Sliding window, 1 hour from first request

### Input Sanitization
- Removes HTML tags from all user input
- Truncates to maximum safe lengths
- Prevents injection attacks

### CORS Protection
- Configured to allow requests from your domain
- Update `corsHeaders` in production to restrict origins

### Token Security
- Token never exposed to client
- Stored securely in Vercel environment variables
- Scoped to minimal permissions (Issues only)

## API Endpoint

### POST /api/feedback

Create a bug report or feature request issue on GitHub.

**Request Body:**

```typescript
{
  type: 'bug' | 'feature',
  data: {
    title: string,
    // Bug report fields
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
    
    // Feature request fields
    problem?: string,
    proposedSolution?: string,
    alternatives?: string,
    scope?: string,
    priority?: string
  }
}
```

**Success Response (201):**

```json
{
  "success": true,
  "issueNumber": 42,
  "issueUrl": "https://github.com/jfeg1/JobEval/issues/42",
  "message": "Feedback submitted successfully!"
}
```

**Error Response (400/429/500):**

```json
{
  "error": "Error message",
  "details": "Additional details (dev mode only)"
}
```

## Monitoring

### View Function Logs

In Vercel Dashboard:
1. Go to your project
2. Click on a deployment
3. Click **Functions** tab
4. Click on `api/feedback.js`
5. View real-time logs

### Check Rate Limits

The API returns rate limit headers:
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)

## Troubleshooting

### "Missing required environment variables"
- Verify `GITHUB_TOKEN` is set in Vercel dashboard
- Check all three environment checkboxes are selected
- Redeploy after adding variables

### "GitHub API error: 401"
- Token is invalid or expired
- Token doesn't have Issues permission
- Regenerate token with correct permissions

### "GitHub API error: 403"
- Rate limit exceeded on GitHub side
- Wait and try again
- Consider increasing limits or caching

### "GitHub API error: 404"
- Repository name or owner is incorrect
- Check `GITHUB_REPO_OWNER` and `GITHUB_REPO_NAME` values
- Verify token has access to the repository

### Rate limit errors (429)
- User has exceeded 5 requests per hour
- Wait for the reset time provided in error
- This is intentional to prevent abuse

## Future Enhancements

### v1.0 Considerations

- Add email notification when feedback is submitted
- Implement user authentication for higher rate limits
- Add feedback response system (notify users of updates)
- Add analytics (privacy-respecting) for feedback trends
- Implement feedback categorization/tagging
- Add webhook for Slack/Discord notifications

## License

Same as main project: AGPL-3.0
