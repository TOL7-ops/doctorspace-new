"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function InboxPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold text-foreground">Inbox is under construction 📥 — coming soon</h1>
          <p className="text-muted-foreground">We’re actively working to bring you a new messaging experience.</p>
          <Button asChild>
            <a href="mailto:support@doctorspace.it.com" aria-label="Contact support">Contact support</a>
          </Button>
        </Card>
      </div>
    </main>
  )
} 