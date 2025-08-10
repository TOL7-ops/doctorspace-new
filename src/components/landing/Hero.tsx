"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useInteractiveBg } from "@/lib/useInteractiveBg"

export function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)
  useInteractiveBg(bgRef)

  return (
    <section className="relative h-screen flex items-end">
      {/* Interactive background layer */}
      <div
        id="interactive-bg"
        ref={bgRef}
        data-bg="interactive"
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-muted/10 dark:from-primary/10 dark:via-secondary/10 dark:to-muted/20"
      />

      <div className="container px-6 md:px-12 pb-12 md:pb-16">
        <div className="max-w-4xl">
          {/* Headline - anchored to lower-left */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            <div className="overflow-hidden">
              <div className="overflow-hidden">
                <span>WELCOME</span>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="overflow-hidden">
                <span>TO</span>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="overflow-hidden">
                <span>DOCTORSPACE.</span>
              </div>
            </div>
          </h1>

          {/* CTA Button */}
          <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
            <Link href="/signup" aria-label="Try DoctorSpace">
              Try it out
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 