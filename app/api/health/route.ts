import { NextResponse } from "next/server"
import { SECURITY_HEADERS } from "@/lib/security"

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      ok: true,
      openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
    }),
    {
      status: 200,
      headers: { "content-type": "application/json", ...SECURITY_HEADERS },
    },
  )
}
