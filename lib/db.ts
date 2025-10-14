import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!_sql) {
    if (!url) {
      console.warn("[v0] DATABASE_URL is not set. DB calls will fail until you add it.")
    }
    _sql = neon(url || "")
  }
  return _sql
}
