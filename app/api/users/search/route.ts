import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mobile = searchParams.get("mobile")
  if (!mobile) return Response.json({ error: "Missing mobile" }, { status: 400 })

  const sql = getDb()
  const rows = await sql`
    select id, name, mobile, public_key from users where mobile = ${mobile} limit 1
  `
  const user = rows[0] || null
  return Response.json({ user })
}
