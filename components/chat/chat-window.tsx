"use client"

import { useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import { useEffect, useRef, useState } from "react"
import { encryptText, decryptText, importPrivateKeyJwk, deriveSharedKey, getStoredPrivateKeyJwk } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ChatWindow() {
  const params = useSearchParams()
  const conversationId = params.get("c")
  const { data } = useSWR(conversationId ? `/api/messages?conversationId=${conversationId}` : null, fetcher, {
    refreshInterval: 8000,
  })
  const { data: convo } = useSWR(conversationId ? `/api/conversations?id=${conversationId}` : null, fetcher)

  const [plainInput, setPlainInput] = useState("")
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Decrypt when data changes
  useEffect(() => {
    async function work() {
      if (!data?.messages || !convo?.conversation?.otherUser?.public_key) {
        setDecryptedMessages([])
        return
      }
      const privJwk = getStoredPrivateKeyJwk()
      if (!privJwk) return
      const priv = await importPrivateKeyJwk(privJwk)
      const peerPub = JSON.parse(convo.conversation.otherUser.public_key)
      const sharedKey = await deriveSharedKey(priv, peerPub)
      const out = []
      for (const m of data.messages) {
        try {
          const text = await decryptText(sharedKey, m.ciphertext, m.iv)
          out.push({ ...m, text })
        } catch {
          out.push({ ...m, text: "[Unable to decrypt]" })
        }
      }
      setDecryptedMessages(out)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    work()
  }, [data, convo])

  const send = async () => {
    if (!plainInput || !convo?.conversation?.otherUser?.public_key || !conversationId) return
    const privJwk = getStoredPrivateKeyJwk()
    if (!privJwk) return alert("Missing private key in browser")
    const priv = await importPrivateKeyJwk(privJwk)
    const peerPub = JSON.parse(convo.conversation.otherUser.public_key)
    const sharedKey = await deriveSharedKey(priv, peerPub)
    const { ciphertextB64, ivB64 } = await encryptText(sharedKey, plainInput)

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, ciphertext: ciphertextB64, iv: ivB64 }),
    })
    if (res.ok) {
      setPlainInput("")
      mutate(`/api/messages?conversationId=${conversationId}`)
      // Optional: ping WebSocket server if configured
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      if (wsUrl) {
        try {
          const ws = new WebSocket(wsUrl)
          ws.onopen = () => {
            ws.send(JSON.stringify({ type: "new-message", conversationId }))
            setTimeout(() => ws.close(), 300)
          }
        } catch {}
      }
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || "Failed to send")
    }
  }

  if (!conversationId) {
    return <div className="p-6 text-sm text-muted-foreground">Select a conversation to start messaging.</div>
  }

  return (
    <div className="h-[70dvh] md:h-[calc(100dvh-4rem)] grid grid-rows-[1fr_auto]">
      <div className="overflow-y-auto p-4 space-y-2">
        {decryptedMessages.map((m) => (
          <div key={m.id} className="max-w-[80%] rounded-md px-3 py-2 bg-secondary">
            <div className="whitespace-pre-wrap text-sm">{m.text}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-2 flex gap-2">
        <Input
          placeholder="Type a message"
          value={plainInput}
          onChange={(e) => setPlainInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  )
}
