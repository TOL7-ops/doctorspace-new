'use client'

import { Button } from '@/components/ui/button'

export function ServiceButtons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Button 
        variant="outline" 
        className="h-16 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
        onClick={() => {
          console.log('Video Consultation clicked')
          // Implement video consultation functionality
        }}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xs font-medium">Video Consultation</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-16 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
        onClick={() => {
          console.log('Pharmacy clicked')
          // Implement pharmacy functionality
        }}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span className="text-xs font-medium">Pharmacy</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="h-16 flex-col space-y-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
        onClick={() => {
          console.log('Lab Tests clicked')
          // Implement lab tests functionality
        }}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
          <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-medium">Lab Tests</span>
      </Button>
    </div>
  )
} 