"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SearchUser() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any | null>(null)
  const router = useRouter()

  const onSearch = async () => {
    const res = await fetch(`/api/users/search?mobile=${encodeURIComponent(query)}`)
    const j = await res.json()
    setResult(j.user || null)
  }

  const startChat = async () => {
    if (!result) return
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: result.id }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || "Could not start conversation")
    }
  }

  const initial = result?.name?.[0]?.toUpperCase() || "?"

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Input placeholder="Search by mobile number" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={onSearch}>Search</Button>
      </div>
      {result && (
        <div className="flex items-center justify-between p-3 rounded-md border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {initial}
            </div>
            <div className="text-sm">
              <div className="font-medium">{result.name}</div>
              <div className="text-muted-foreground">{result.mobile}</div>
            </div>
          </div>
          <Button size="sm" onClick={startChat}>
            Chat
          </Button>
        </div>
      )}
    </div>
  )
}
