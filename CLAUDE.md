---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '31881e89-64f3-4479-be95-4405dec7f936'
  PropagateID: '31881e89-64f3-4479-be95-4405dec7f936'
  ReservedCode1: '75ec7101-bda5-4eb5-a01d-2574a984cb0c'
  ReservedCode2: '75ec7101-bda5-4eb5-a01d-2574a984cb0c'
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
bun run dev          # Start both Vite (frontend) and Convex (backend) dev servers
bun run build        # Type check and build for production
bun run typecheck    # TypeScript type checking only
bun run lint         # Run ESLint
bun test             # Run tests with Vitest (watch mode)
bun test --run       # Run tests once
```

## Running Single Tests

```bash
bun test convex/__tests__/content.test.ts    # Run specific test file
bun test -t "returns videos"                  # Run tests matching pattern
```

## Development Workflow

- **Always typecheck** before committing: `bun run typecheck`
- **Run tests regularly** during development, especially after modifying Convex functions
- **Write tests** for new Convex queries/mutations in `convex/__tests__/`
- This is a **TypeScript-first** codebase - maintain strict typing, avoid `any`

## Project Architecture

This is a content aggregation portfolio built with **React + Vite** (frontend) and **Convex** (backend). It aggregates content from YouTube, Convex Stack articles, X (Twitter) posts, and GitHub code contributions for a specific creator.

### Data Sources & Flow

1. **YouTube** (`convex/youtube.ts`) - Node action that fetches videos from YouTube Data API v3
   - Channel ID hardcoded: `UCMiDzhfU0VZdTh6C_Igz0IQ`
   - Extracts video metadata (title, description, thumbnail, stats, duration)
   - New videos marked `isMikes: "undecided"`, admin reviews and marks "mine" or "notMine"
   - When marked "mine", triggers AI project extraction (Claude API)
2. **Stack** (`convex/stack.ts`) - Scrapes articles from stack.convex.dev/author/mike-cann
3. **X/Twitter** (`convex/x.ts`) - Fetches tweets via X API v2 using Bearer Token
4. **GitHub** (`convex/github.ts`) - Fetches commits from get-convex/convex-backend by author mikecann

### Scheduled Refresh (`convex/crons.ts`)

- YouTube latest: every 12 hours
- YouTube all: every 48 hours
- Stack: hourly (offset 30 min)
- X: daily 6AM UTC
- GitHub: daily 7AM UTC
- Set `DISABLE_CRONS=true` in Convex env to disable

### Data Layer (`convex/model/`)

- `videos.ts` - Video CRUD with aggregate sync (views/likes/comments)
- `articles.ts` - Article CRUD
- `projects.ts` - Project CRUD, link extraction, fuzzy dedup via `normalizedName`
- `tweets.ts` - Tweet CRUD
- `codeContributions.ts` - Code contribution CRUD with commit title cleaning

### API Layer (`convex/videos.ts`, `articles.ts`, `projects.ts`, `tweets.ts`, `codeContributions.ts`)

- Public queries: `list` (filters to show only visible items)
- Internal mutations: `upsert`, `add` (used by refresh actions)

### AI Project Extraction (`convex/lib/extractProjects.ts`)

- Uses Anthropic Claude API (`claude-sonnet-4-5`) to extract project info from video/article text
- Falls back to regex extraction if no API key or LLM fails
- Extracts GitHub/demo URLs, project name, description
- Fetches README images from GitHub for thumbnails (`convex/lib/githubReadme.ts`)
- Fuzzy name matching for dedup (`convex/lib/normalization.ts`): Levenshtein + Jaccard + substring

### Video Aggregates (`convex/videoAggregates.ts`)

- Three `@convex-dev/aggregate` instances: views, likes, comments
- Split by video type: `longform` (>=3min) vs `shorts` (<3min)
- Only aggregates videos where `isMikes === "mine"`

### Email Notifications (`convex/notifications.ts`)

- Uses `@convex-dev/resend` to send moderation emails
- Sends to admin when new videos are fetched
- From: `Hugo's Portfolio <portfolio@isllm.com>`
- To: `hhwjsw711@gmail.com`

### Admin (`convex/admin.ts`)

- Protected by session-based auth (`convex/auth.ts`)
- `setVideoIsMikes` - set video ownership, triggers project extraction when marked "mine"
- `getAllContent` - returns all items (including hidden) for admin review
- `setProjectHidden`, `updateProjectLinks`, `deleteProject` - project management
- `triggerYouTubeRefresh`, `triggerStackRefresh`, `triggerXRefresh`, `triggerGitHubRefresh` - manual refresh
- `sendTestEmail` - sends a test moderation email

### Authentication (`convex/auth.ts`)

- Self-built session mechanism (not Clerk)
- Login with email + password → store session token in DB (7-day expiry)
- Admin email: `hhwjsw711@gmail.com`
- Token stored in localStorage on frontend

### Frontend Structure

- `src/main.tsx` - ConvexProvider setup
- `src/App.tsx` - Routes: `/` (Home), `/login` (Login), `/admin` (Admin)
- `src/pages/Home.tsx` - Public content display with filter bar
- `src/pages/Login.tsx` - Email + password login
- `src/pages/Admin.tsx` - Admin panel with tabs (Videos, Articles, Projects, Code Contributions)
- `src/components/` - UI components (Header, ContentGrid, ContentCard, FilterBar, VideoStatsCards, ProjectCard, TweetCard, CodeContributionCard, etc.)

### Database Schema (`convex/schema.ts`)

Six tables:
- `videos` - indexed by `youtubeId`, `publishedAt`, `isMikes`
  - `isMikes` field: "undecided" (new), "mine" (visible), "notMine" (hidden)
  - Only videos with `isMikes === "mine"` are shown publicly
- `articles` - indexed by `slug`, `publishedAt` (always visible)
- `tweets` - indexed by `tweetId`, `publishedAt` (always visible)
- `projects` - indexed by `name`, `sourceId`, `sourceUrl`, `normalizedName`
  - Uses fuzzy name matching to prevent duplicates
  - Can be hidden by admin
- `codeContributions` - indexed by `sha`, `committedAt`
- `sessions` - indexed by `token` (auth sessions)

### Migrations (`convex/migrations/`)

- `backfillVideoAggregates.ts` - Backfill aggregates for existing videos
- `migrateIsHiddenToIsMikes.ts` - Convert old `isHidden` boolean to `isMikes` field

## Environment Variables

See `.env.local.example` for required variables:
- `VITE_CONVEX_URL` - Convex deployment URL
- `YOUTUBE_API_KEY` - YouTube Data API v3 key (set in Convex dashboard)
- `YOUTUBE_CHANNEL_ID` - Target YouTube channel ID
- `STACK_AUTHOR_SLUG` - Author slug for stack.convex.dev
- `X_BEARER_TOKEN` - X API Bearer Token
- `X_USER_ID` - X numeric user ID
- `GITHUB_TOKEN` - GitHub API token (optional, raises rate limits)
- `ADMIN_PASSWORD` - Admin login password
- `ANTHROPIC_API_KEY` - Claude API key for project extraction
- `ANTHROPIC_BASE_URL` - Optional Claude API proxy URL
- `DISABLE_CRONS` - Set to "true" to disable cron jobs

## Testing

Tests use `convex-test` with Vitest. Test files are in `convex/__tests__/` and test Convex functions directly without network calls.

## Deployment

Deployed on Cloudflare Workers via `wrangler.jsonc` (SPA mode). Convex backend deployed separately.

> AI生成