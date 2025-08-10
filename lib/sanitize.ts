export function sanitizeString(s: string): string {
  return s
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000)
}

export function sanitizeAll(input: {
  company: string
  role: string
  jobUrl?: string
  extra?: string
}) {
  return {
    company: sanitizeString(input.company),
    role: sanitizeString(input.role),
    jobUrl: input.jobUrl ? sanitizeString(input.jobUrl) : undefined,
    extra: input.extra ? sanitizeString(input.extra) : undefined,
  }
}
