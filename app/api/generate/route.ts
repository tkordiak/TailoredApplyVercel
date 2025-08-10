import { type NextRequest, NextResponse } from "next/server"
import { GenerateRequestSchema } from "@/lib/schemas"
import { rateLimitOk } from "@/lib/rate-limit"
import { sanitizeAll } from "@/lib/sanitize"
import { buildUserPrompt, splitArtifacts } from "@/lib/prompt"
import { maskForLogs, SECURITY_HEADERS, jsonError } from "@/lib/security"
import { randomUUID } from "crypto"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Explicitly pass the API key to the AI SDK provider (server-only)
const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"

  // Rate limit MVP: 10 per hour per IP
  if (!rateLimitOk(ip)) {
    return NextResponse.json(jsonError("Rate limit exceeded. Try again later.", "RATE_LIMITED", { requestId }), {
      status: 429,
      headers: SECURITY_HEADERS,
    })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(jsonError("Invalid JSON body", "BAD_REQUEST", { requestId }), {
      status: 400,
      headers: SECURITY_HEADERS,
    })
  }

  const parsed = GenerateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      jsonError("Validation error", "VALIDATION_ERROR", {
        requestId,
        details: parsed.error.flatten(),
      }),
      { status: 400, headers: SECURITY_HEADERS },
    )
  }

  const { company, role, jobUrl, extra } = sanitizeAll(parsed.data)

  // Optional: fetch job URL (best-effort, non-fatal)
  let jobExtract = "N/A"
  if (jobUrl) {
    try {
      const controller = new AbortController()
      const timeoutMs = Number(process.env.SCRAPER_TIMEOUT_MS || 6000)
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(jobUrl, {
        headers: {
          "user-agent":
            process.env.SCRAPER_USER_AGENT || "Mozilla/5.0 (compatible; TailoredApplyBot/1.0; +https://example.com)",
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        const text = await res.text()
        // crude extract: strip tags, truncate
        jobExtract = text
          .replace(/<script[\s\S]*?<\/script>/g, " ")
          .replace(/<style[\s\S]*?<\/style>/g, " ")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 4000)
      }
    } catch {
      jobExtract = "N/A"
    }
  }

  const systemPrompt =
    "You are a precise, conservative career-writing assistant. Output clean Markdown (no code fences, no HTML). Never invent employers, titles, dates, or certifications not present in the candidate input. Write ATS-friendly content with concise, quantifiable bullets. Use neutral, professional tone tailored to the target company's public style. If essential data is missing, include a single line at the very top:  MISSING: <short request>."

  // Build user prompt
  const userPrompt = buildUserPrompt({
    company,
    role,
    jobExtractOrNA: jobExtract || "N/A",
    candidateText: extra || "",
  })

  try {
    const { text, usage } = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    })

    const { resumeMd, coverLetterMd } = splitArtifacts(text)

    // Minimal masked log
    console.log(
      JSON.stringify({
        requestId,
        ipMasked: ip === "unknown" ? "unknown" : ip.split(".").slice(0, 3).join(".") + ".*",
        req: maskForLogs({ company, role, jobUrl, extra }),
        usage,
      }),
    )

    const payload = {
      resumeMd,
      coverLetterMd,
      tokensUsed: usage?.totalTokens ?? undefined,
      requestId,
    }

    return new NextResponse(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json", ...SECURITY_HEADERS },
    })
  } catch (err: any) {
    const msg = String(err?.message || err || "")
    console.error(JSON.stringify({ requestId, error: msg }))
    const isKeyIssue =
      msg.toLowerCase().includes("api key") ||
      msg.toLowerCase().includes("unauthorized") ||
      msg.toLowerCase().includes("401")
    if (isKeyIssue) {
      return NextResponse.json(
        jsonError("Server misconfiguration: missing or invalid API key", "SERVER_CONFIG", { requestId }),
        { status: 500, headers: SECURITY_HEADERS },
      )
    }
    return NextResponse.json(jsonError("Generation failed, please try again.", "GENERATION_ERROR", { requestId }), {
      status: 500,
      headers: SECURITY_HEADERS,
    })
  }
}
