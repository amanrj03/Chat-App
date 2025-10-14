"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ChatList() {
  const { data } = useSWR("/api/conversations", fetcher, { refreshInterval: 10000 })
  const conversations = data?.conversations || []

  return (
    <div className="divide-y">
      {conversations.map((c: any) => {
        const initial = c.otherUser.name?.[0]?.toUpperCase() || "?"
        return (
          <a key={c.id} href={`?c=${c.id}`} className="flex items-center gap-3 p-3 hover:bg-accent">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{c.otherUser.name || c.otherUser.mobile}</div>
              <div className="text-xs text-muted-foreground truncate">{c.lastMessagePreview || "No messages yet"}</div>
            </div>
          </a>
        )
      })}
      {conversations.length === 0 && (
        <div className="p-6 text-sm text-muted-foreground">No conversations yet. Search by mobile to start one.</div>
      )}
    </div>
  )
}
