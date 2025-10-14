"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ensureIdentityKeys, getStoredPublicKeyJwk } from "@/lib/crypto"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [age, setAge] = useState<number | "">("")
  const [gender, setGender] = useState("")
  const [mobile, setMobile] = useState("")

  // Ensure keys exist on load
  useState(() => {
    ensureIdentityKeys().catch(console.error)
  })

  const submit = async () => {
    const pubJwk = getStoredPublicKeyJwk()
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: age ? Number(age) : null,
        gender,
        mobile,
        publicKeyJwk: pubJwk,
      }),
    })
    if (res.ok) {
      router.push("/chat")
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || "Failed to save profile")
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-pretty">Complete your profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Age</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              placeholder="Age"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Gender</label>
            <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Gender" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Mobile number</label>
            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. +1 555 123 4567" />
          </div>
          <Button onClick={submit} className="mt-2">
            Save and continue
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
