import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.email || !session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 })

  const { name, age, gender, mobile, publicKeyJwk } = body
  if (!mobile || !publicKeyJwk) return Response.json({ error: "Missing fields" }, { status: 400 })

  const sql = getDb()
  const id = session.user.id
  const email = session.user.email!
  const public_key = JSON.stringify(publicKeyJwk)

  // Upsert user
  await sql`
    insert into users (id, email, google_id, name, age, gender, mobile, public_key)
    values (${id}, ${email}, ${id}, ${name || null}, ${age || null}, ${gender || null}, ${mobile}, ${public_key})
    on conflict (id) do update set
      name = excluded.name,
      age = excluded.age,
      gender = excluded.gender,
      mobile = excluded.mobile,
      public_key = excluded.public_key
  `

  return Response.json({ ok: true })
}
