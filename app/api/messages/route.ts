import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get("conversationId")
  if (!conversationId) return Response.json({ error: "Missing conversationId" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    select id, conversation_id, sender_id, ciphertext, iv, created_at
    from messages
    where conversation_id = ${conversationId}
    order by created_at asc
  `
  return Response.json({ messages: rows })
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const { conversationId, ciphertext, iv } = body || {}
  if (!conversationId || !ciphertext || !iv) return Response.json({ error: "Missing fields" }, { status: 400 })
  const sql = getDb()
  const id = crypto.randomUUID()
  await sql`
    insert into messages (id, conversation_id, sender_id, ciphertext, iv)
    values (${id}, ${conversationId}, ${session.user.id}, ${ciphertext}, ${iv})
  `
  return Response.json({ id })
}
