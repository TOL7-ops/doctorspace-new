"use client"

import React from 'react'
import { WelcomeText } from './WelcomeText'

export const SimpleTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="space-y-8 text-center">
        <WelcomeText 
          text="WELCOME TO DOCTORSPACE"
          className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl"
        />
        
        <div className="space-y-4">
          <WelcomeText 
            text="HEALTHCARE REIMAGINED"
            className="text-2xl font-semibold text-muted-foreground sm:text-3xl"
          />
          
          <WelcomeText 
            text="BOOK APPOINTMENTS EASILY"
            className="text-xl font-medium text-primary sm:text-2xl"
          />
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl">
          Experience the future of healthcare with our innovative platform.
        </p>
      </div>
    </div>
  )
} 