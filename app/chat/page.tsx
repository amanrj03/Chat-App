import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { Card } from "@/components/ui/card"
import ChatList from "@/components/chat/chat-list"
import ChatWindow from "@/components/chat/chat-window"
import SearchUser from "@/components/chat/search-user"

async function getCurrentUserOrRedirect() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.email || !session.user.id) redirect("/login")

  const sql = getDb()
  const rows = await sql`
    select * from users where google_id = ${session.user.id} limit 1
  `
  const user = rows[0]
  if (!user?.mobile) {
    redirect("/onboarding")
  }
  return { session, user }
}

export default async function ChatPage() {
  const { session, user } = await getCurrentUserOrRedirect()

  return (
    <main className="min-h-dvh p-4 md:p-6 grid gap-4 md:grid-cols-[320px_1fr]">
      <section aria-label="Search and Conversations" className="grid gap-4">
        <Card className="p-4">
          <SearchUser />
        </Card>
        <Card className="p-0 overflow-hidden">
          <ChatList />
        </Card>
      </section>
      <section aria-label="Messages">
        <Card className="p-0 overflow-hidden">
          <ChatWindow />
        </Card>
      </section>
    </main>
  )
}
