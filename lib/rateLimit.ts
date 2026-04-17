// Rate limiting in-memory — best-effort, ne persiste pas entre instances
const store = new Map<string, { count: number; reset: number }>()

/** Retourne true si la requête est autorisée, false si throttlée */
export function checkRateLimit(ip: string, max: number, windowSec: number): boolean {
  const now = Date.now()
  const entry = store.get(ip)
  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowSec * 1000 })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  )
}
