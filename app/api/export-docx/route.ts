import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { SECURITY_HEADERS, jsonError } from "@/lib/security"
import { buildDocxFromMarkdown } from "@/lib/docx"

const Schema = z.object({
  resumeMd: z.string().min(1),
  coverLetterMd: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(jsonError("Invalid JSON body", "BAD_REQUEST"), {
      status: 400,
      headers: SECURITY_HEADERS,
    })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(jsonError("Validation error", "VALIDATION_ERROR", { details: parsed.error.flatten() }), {
      status: 400,
      headers: SECURITY_HEADERS,
    })
  }

  try {
    const bytes = await buildDocxFromMarkdown({
      resumeMd: parsed.data.resumeMd,
      coverLetterMd: parsed.data.coverLetterMd,
      company: parsed.data.company,
      role: parsed.data.role,
    })

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": 'attachment; filename="tailored-apply.docx"',
        ...SECURITY_HEADERS,
      },
    })
  } catch (e: any) {
    return NextResponse.json(jsonError("Failed to export DOCX", "EXPORT_FAILED", { message: e?.message }), {
      status: 500,
      headers: SECURITY_HEADERS,
    })
  }
}
