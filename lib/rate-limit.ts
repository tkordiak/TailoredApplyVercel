const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const LIMIT = 10

type Entry = { count: number; windowStart: number }
const store = new Map<string, Entry>()

export function rateLimitOk(key: string): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry) {
    store.set(key, { count: 1, windowStart: now })
    return true
  }
  if (now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= LIMIT) {
    return false
  }
  entry.count += 1
  return true
}
