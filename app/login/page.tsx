"use client"

import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-balance">Sign in to Chat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={() => signIn("google", { callbackUrl: "/chat" })} className="w-full">
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
