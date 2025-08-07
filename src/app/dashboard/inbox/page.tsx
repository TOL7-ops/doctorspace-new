import React, { Suspense } from 'react'
import { InboxClient } from './InboxClient'

export default function InboxPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InboxClient />
    </Suspense>
  )
} 