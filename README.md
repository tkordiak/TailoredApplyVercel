# Tailored Apply — AI Resume & Cover Letter Generator

Tailor your resume & cover letter to any company in minutes. Private, fast, and ATS-friendly.

## Tech Stack

- Next.js App Router, TypeScript, Tailwind CSS
- shadcn/ui for UI primitives
- AI SDK with OpenAI provider (uses `OPENAI_API_KEY`)
- Zod + react-hook-form for validation
- Vercel Analytics
- Utilities: react-markdown, pdf-lib, sonner, lucide-react, Vitest

## Getting Started

1. Install dependencies

\`\`\`
pnpm i
# or npm i / yarn / bun
\`\`\`

2. Set environment variables (Vercel → Settings → Environment Variables)

- `OPENAI_API_KEY` — required.
- Optional: `SCRAPER_USER_AGENT`, `SCRAPER_TIMEOUT_MS`

3. Dev

\`\`\`
pnpm dev
\`\`\`

Open http://localhost:3000

## Environment

- No .env file is required on Vercel. Locally, you can create a `.env.local` with `OPENAI_API_KEY=...`.

## Scripts

- `dev` — next dev
- `build` — next build
- `start` — next start
- `lint` — next lint
- `test` — vitest run

## How it works

- Home: Enter Company, Job Title, optional Job URL and notes.
- API `/api/generate`:
  - Validates with Zod, sanitizes input, best-effort fetch of job URL with timeout.
  - Builds system prompt and user prompt.
  - Calls AI via AI SDK.
  - Splits content into Resume and Cover Letter.
- Results:
  - Tabs render Markdown (react-markdown).
  - Actions: Copy, Download PDF.
  - Stored in localStorage (`last`, `history`).

## Security and Performance

- In-memory rate limit: 10/hr/IP (MVP).
- Same-origin CORS (default).
- Security headers on API JSON responses.
- No PII logs (masked inputs, request id).
- Serverless functions runtime for API (see `vercel.json`).

## PDF Export

- `/api/export-pdf` uses pdf-lib to generate a 2-page PDF (resume then cover letter).
- If you need higher fidelity HTML rendering, consider a background function with Headless Chrome.

## Testing

- Minimal Vitest tests for prompt builder and splitter.
- Add more route-level tests by mocking `generateText` from `ai`.

## Common Pitfalls

- Missing `OPENAI_API_KEY`.
- Overly long inputs — we sanitize and cap; consider trimming.
- Expecting perfect formatting in PDF — this MVP converts Markdown to plain text with simple wrapping.

## Deploy on Vercel

- Push to GitHub and click Deploy on Vercel, or deploy directly.
- Ensure `OPENAI_API_KEY` is set in Production.
- Analytics are enabled via `<Analytics />` in `app/layout.tsx`.

## Switching Models

- Edit `app/api/generate/route.ts` and change `openai("gpt-4o-mini")` to another compatible model.

## License

MIT
