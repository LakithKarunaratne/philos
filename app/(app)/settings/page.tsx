"use client"

import { useState } from "react"
import { AppleIcon, HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [email, setEmail] = useState("alex@example.com")

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>The address we use for account notices.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button variant="outline" className="self-start">
              Save email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Send a reset link to your email.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary">Reset password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>Sign in with linked providers.</CardDescription>
          </CardHeader>
          <CardContent className="gap-0 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold">
                  G
                </span>
                <div>
                  <p className="text-sm font-semibold">Google</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Disconnect
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-secondary">
                  <AppleIcon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Apple</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
            <CardDescription>Your recent help across the network.</CardDescription>
          </CardHeader>
          <CardContent className="gap-0 p-0">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold">Transport for Bruno</p>
              <p className="text-xs text-muted-foreground">Today · Riverside Clinic</p>
            </div>
            <Separator />
            <div className="px-4 py-3">
              <p className="text-sm font-semibold">Evening feeding round</p>
              <p className="text-xs text-muted-foreground">Yesterday · Shelter block C</p>
            </div>
            <Separator />
            <div className="px-4 py-3">
              <p className="text-sm font-semibold">Foster check-in for Milo</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-accent/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartIcon className="size-4 text-primary" />
              Donate
            </CardTitle>
            <CardDescription>
              Support clinic bills, food, and transport for dogs still waiting on help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Donate to Philos</Button>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
