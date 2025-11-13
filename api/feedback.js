/**
 * Vercel Serverless Function: Create GitHub Issue
 * 
 * This function receives feedback from the JobEval client app
 * and creates a GitHub issue using a securely stored token.
 * 
 * Environment variables required:
 * - GITHUB_TOKEN: Fine-grained personal access token with Issues write permission
 * - GITHUB_REPO_OWNER: GitHub username (e.g., 'jfeg1')
 * - GITHUB_REPO_NAME: Repository name (e.g., 'JobEval')
 */

export const config = {
  runtime: 'edge',
};

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will restrict to specific domain in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Rate limiting in-memory store (resets on function cold start)
 * Format: { [ip]: { count: number, resetAt: timestamp } }
 */
const rateLimitStore = new Map();
const RATE_LIMIT = 5; // Max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    // First request or window expired
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { 
      allowed: false, 
      remaining: 0,
      resetAt: record.resetAt 
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT - record.count 
  };
}

/**
 * Sanitize user input to prevent injection attacks
 */
function sanitizeInput(text, maxLength = 10000) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove any HTML tags
  const sanitized = text.replace(/<[^>]*>/g, '');
  
  // Truncate to max length
  return sanitized.slice(0, maxLength).trim();
}

/**
 * Format bug report for GitHub issue
 */
function formatBugReport(data) {
  const {
    title,
    description,
    stepsToReproduce,
    expectedBehavior,
    actualBehavior,
    environment,
    dataContext,
    additionalContext,
  } = data;

  return `## 🐛 Bug Description

${sanitizeInput(description)}

## 📋 Steps to Reproduce

${sanitizeInput(stepsToReproduce)}

## ✅ Expected Behavior

${sanitizeInput(expectedBehavior)}

## ❌ Actual Behavior

${sanitizeInput(actualBehavior)}

## 💻 Environment

- **JobEval Version:** ${sanitizeInput(environment.version)}
- **Flow:** ${sanitizeInput(environment.flow)}
- **Browser:** ${sanitizeInput(environment.browser)}
- **OS:** ${sanitizeInput(environment.os)}
- **Device:** ${sanitizeInput(environment.device)}

## 📊 Data Context

${sanitizeInput(dataContext || 'Not provided')}

## 🔍 Additional Context

${sanitizeInput(additionalContext || 'None provided')}

---

*This issue was automatically created via the JobEval in-app feedback system.*`;
}

/**
 * Format feature request for GitHub issue
 */
function formatFeatureRequest(data) {
  const {
    title,
    description,
    problem,
    proposedSolution,
    alternatives,
    scope,
    priority,
    additionalContext,
  } = data;

  return `## 💡 Feature Description

${sanitizeInput(description)}

## 🎯 Problem or Use Case

${sanitizeInput(problem)}

## 🔧 Proposed Solution

${sanitizeInput(proposedSolution)}

## 🔀 Alternatives Considered

${sanitizeInput(alternatives || 'Not provided')}

## 📊 Feature Scope

${sanitizeInput(scope || 'Not specified')}

## Priority

${sanitizeInput(priority || 'Medium')}

## 🔍 Additional Context

${sanitizeInput(additionalContext || 'None provided')}

---

*This feature request was automatically created via the JobEval in-app feedback system.*`;
}

/**
 * Create GitHub issue via API
 */
async function createGitHubIssue(issueData) {
  const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    throw new Error('Missing required environment variables');
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'JobEval-Feedback-System',
    },
    body: JSON.stringify(issueData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GitHub API Error:', error);
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Main handler
 */
export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateCheck = checkRateLimit(ip);
    
    if (!rateCheck.allowed) {
      const resetDate = new Date(rateCheck.resetAt).toISOString();
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: resetDate,
        }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate,
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data } = body;

    // Validate required fields
    if (!type || !data || !data.title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format issue based on type
    let issueBody;
    let labels;

    if (type === 'bug') {
      issueBody = formatBugReport(data);
      labels = ['bug', 'needs-triage', 'feedback'];
    } else if (type === 'feature') {
      issueBody = formatFeatureRequest(data);
      labels = ['enhancement', 'needs-review', 'feedback'];
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid feedback type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create GitHub issue
    const issue = await createGitHubIssue({
      title: sanitizeInput(data.title, 200),
      body: issueBody,
      labels: labels,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        issueNumber: issue.number,
        issueUrl: issue.html_url,
        message: 'Feedback submitted successfully!',
      }),
      {
        status: 201,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      }
    );

  } catch (error) {
    console.error('Error creating issue:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to submit feedback. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
