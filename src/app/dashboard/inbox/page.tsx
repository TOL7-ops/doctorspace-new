import React, { Suspense } from 'react'
import { InboxClient } from './InboxClient'

export default function InboxPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={<div>Loading...</div>}>
          <InboxClient />
        </Suspense>
      </div>
    </main>
  )
} 