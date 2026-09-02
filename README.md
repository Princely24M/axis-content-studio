# AXIS Content Studio

AI-powered content creation platform for generating text, images, and code from a single intelligent workspace.

## Features

### Text Generation
Create blogs, emails, social media posts, marketing copy, product descriptions, reports, summaries, and study content. Customize by content type, target audience, tone, length, and language. Refine generated text with improve, shorten, expand, and change-tone actions.

### Image Generation
Turn natural-language descriptions into creative visuals. Control style (photorealistic, cinematic, 3D, illustration, digital art, minimalist, anime, and more), aspect ratio, quality level, and batch count. The system interprets your prompt to preserve colors, quantities, spatial relationships, text requirements, and negative constraints, then constructs an optimized prompt sent to the image model.

### Code Generation
Generate, explain, debug, and optimize code across 9 languages (HTML, CSS, JavaScript, TypeScript, Python, Java, C#, SQL, Kotlin) with framework-aware templates (React, Next.js, Node.js, Django, Flask, Spring, ASP.NET, and more). Post-generation actions include explain, fix, optimize, and add comments.

### Prompt Lab
Transform simple prompts into structured, optimized prompts using a role-context-task-requirements-constraints-tone-output-format framework. Compare original vs. optimized prompts side by side, then generate output directly from the optimized version.

### Prompt Library
Browse 13 built-in prompt templates across text, image, and code categories. Save templates to your personal library, create custom prompts, mark favorites, and jump directly to the relevant generator with a pre-filled prompt.

### History & Saved Content
Every generation is automatically saved to your history. Bookmark specific outputs to your saved content library for easy reuse. Download text and code as files, or download images directly.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React icons
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Image Generation:** Pollinations.ai (Flux model) via Supabase Edge Function with prompt interpretation and optimization pipeline
- **Routing:** React Router v7

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the required migrations applied

### Installation

```bash
npm install
```

### Environment Variables

The following are pre-configured in `.env`:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

## Database Schema

Four core tables with Row Level Security (RLS) enabled, scoped to authenticated users via `auth.uid()`:

| Table | Purpose |
|---|---|
| `profiles` | User profile data (name, avatar), 1:1 with `auth.users` |
| `generations` | AI generation results (text, image, code) with input/output metadata |
| `saved_content` | Bookmarked generations or standalone saved content |
| `prompts` | User-saved custom prompt templates with category and favorite support |

A database trigger (`handle_new_user`) automatically creates a profile row when a new user signs up.

## Edge Functions

### `generate-image`

Accepts a prompt with style, aspect ratio, quality, and count parameters. Runs a multi-stage pipeline:

1. **Interpret** — Extracts structured meaning (subject, colors, quantities, spatial relationships, text requirements, exclusions, camera angle, lighting, mood, environment) from the user's prompt
2. **Optimize** — Constructs a detailed, faithful generation prompt using style and quality enhancers
3. **Validate** — Verifies key terms from the original prompt survive in the optimized version; appends any missing terms
4. **Generate** — Produces image URLs via Pollinations.ai with the optimized prompt, specified dimensions, and random seeds

All responses include proper CORS headers.

## Project Structure

```
src/
  components/          # Shared UI components (CodeBlock, CustomCursor, DashboardLayout, Logo)
    ui/                # Reusable primitives (Button, Card, Input, Modal)
  context/             # React contexts (Auth, Theme, Toast)
  lib/                 # Utilities (AI logic, Supabase client, helpers)
  pages/
    auth/              # Login, Signup, Forgot Password
    dashboard/         # All authenticated app pages
  App.tsx              # Router and route guards
  main.tsx             # App entry point
supabase/
  functions/           # Edge functions (generate-image)
  migrations/          # SQL migrations (schema + metadata)
```

## Authentication

Email/password authentication via Supabase Auth. Protected routes redirect unauthenticated users to the login page. Session persistence and automatic token refresh are enabled.

## License

This project is private and proprietary.
