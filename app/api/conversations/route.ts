import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { getDb } from "@/lib/db"
import crypto from "crypto"

export async function GET(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const sql = getDb()
  if (id) {
    // Single conversation with details
    const convo = await sql`
      select c.id, c.created_at
      from conversations c
      where c.id = ${id}
      limit 1
    `
    if (!convo[0]) return Response.json({ error: "Not found" }, { status: 404 })
    const members = await sql`
      select u.id, u.name, u.mobile, u.public_key
      from conversation_members cm
      join users u on u.id = cm.user_id
      where cm.conversation_id = ${id}
    `
    const otherUser = members.find((m: any) => m.id !== session.user!.id)
    return Response.json({ conversation: { id, otherUser } })
  }

  // List my conversations with last message preview
  const rows = await sql`
    select c.id,
      -- return a single JSON column instead of multiple columns to fix "subquery must return only one column"
      (select json_build_object('id', u.id, 'name', u.name, 'mobile', u.mobile, 'public_key', u.public_key)
       from conversation_members cm2
       join users u on u.id = cm2.user_id
       where cm2.conversation_id = c.id and u.id <> ${session.user.id}
       limit 1) as other_user,
      (select ciphertext from messages m where m.conversation_id = c.id order by created_at desc limit 1) as last_cipher
    from conversations c
    where exists (
      select 1 from conversation_members cm where cm.conversation_id = c.id and cm.user_id = ${session.user.id}
    )
    order by c.created_at desc
  `
  const conversations = rows.map((r: any) => ({
    id: r.id,
    otherUser: r.other_user,
    lastMessagePreview: r.last_cipher ? "Encrypted message" : null,
  }))
  return Response.json({ conversations })
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body?.targetUserId) return Response.json({ error: "Missing targetUserId" }, { status: 400 })

  const sql = getDb()
  const me = session.user.id
  const other = body.targetUserId as string

  // Check if conversation exists
  const existing = await sql`
    select c.id from conversations c
    join conversation_members cm1 on cm1.conversation_id = c.id and cm1.user_id = ${me}
    join conversation_members cm2 on cm2.conversation_id = c.id and cm2.user_id = ${other}
    limit 1
  `
  let convoId: string
  if (existing[0]) {
    convoId = existing[0].id
  } else {
    convoId = crypto.randomUUID()
    await sql`insert into conversations (id) values (${convoId})`
    await sql`insert into conversation_members (conversation_id, user_id) values (${convoId}, ${me}), (${convoId}, ${other})`
  }

  const otherUser = (
    await sql`
    select id, name, mobile, public_key from users where id = ${other} limit 1
  `
  )[0]

  return Response.json({ id: convoId, otherUser })
}
