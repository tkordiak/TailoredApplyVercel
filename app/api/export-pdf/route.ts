import { type NextRequest, NextResponse } from "next/server"
import { SECURITY_HEADERS, jsonError } from "@/lib/security"
import { z } from "zod"
import { buildPdfFromMarkdown } from "@/lib/pdf"

const ExportSchema = z.object({
  resumeMd: z.string().min(1),
  coverLetterMd: z.string().min(1),
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
  const parsed = ExportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(jsonError("Validation error", "VALIDATION_ERROR", { details: parsed.error.flatten() }), {
      status: 400,
      headers: SECURITY_HEADERS,
    })
  }
  try {
    const pdfBytes = await buildPdfFromMarkdown(parsed.data.resumeMd, parsed.data.coverLetterMd)
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="tailored-apply.pdf"',
        ...SECURITY_HEADERS,
      },
    })
  } catch (e: any) {
    return NextResponse.json(jsonError("Failed to export PDF", "EXPORT_FAILED", { message: e?.message }), {
      status: 500,
      headers: SECURITY_HEADERS,
    })
  }
}
