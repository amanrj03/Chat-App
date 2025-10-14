import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-balance">Private Chat</h1>
        <p className="text-muted-foreground">Fast, modern, end‑to‑end encrypted messaging.</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/chat">Open chat</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
