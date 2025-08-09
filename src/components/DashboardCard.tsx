"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  'aria-label'?: string
}

export function DashboardCard({ href, onClick, children, className = "", ...rest }: DashboardCardProps) {
  const content = (
    <Card
      className={`transition-all hover:scale-[1.01] shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      role={href ? "link" : onClick ? "button" : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      {...rest}
    >
      {children}
    </Card>
  )

  if (href) return <Link href={href} aria-label={rest["aria-label"] || undefined}>{content}</Link>
  return <div onClick={onClick} aria-label={rest["aria-label"] || undefined}>{content}</div>
} 