export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), interest-cohort=(), browsing-topics=()",
}

export function jsonError(error: string, code: string, extra?: Record<string, unknown>): Record<string, unknown> {
  return { error, code, ...(extra || {}) }
}

export function maskForLogs(obj: Record<string, unknown>) {
  // Avoid logging PII; keep lengths only
  const masked: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      masked[k] = `${v.slice(0, 2)}…(${v.length})`
    } else {
      masked[k] = v
    }
  }
  return masked
}
