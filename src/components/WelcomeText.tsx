"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface WelcomeTextProps {
  text?: string
  className?: string
}

export const WelcomeText: React.FC<WelcomeTextProps> = ({ 
  text = "WELCOME TO DOCTORSPACE",
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Split text into words and characters
    const words = text.split(' ')
    
    // Create GSAP timeline
    const tl = gsap.timeline()
    
    // Animate each word
    words.forEach((word, wordIndex) => {
      const wordElement = containerRef.current?.querySelector(`[data-word="${wordIndex}"]`)
      if (!wordElement) return
      
      // Get all character spans within this word
      const characters = wordElement.querySelectorAll('[data-char]')
      
      // Animate characters within this word
      tl.fromTo(
        characters,
        {
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        wordIndex * 0.2 // Stagger between words
      )
    })

    // Cleanup function
    return () => {
      tl.kill()
    }
  }, [text])

  return (
    <div 
      ref={containerRef}
      className={`flex flex-wrap justify-start items-center gap-x-2 ${className}`}
    >
      {text.split(' ').map((word, wordIndex) => (
        <div
          key={wordIndex}
          data-word={wordIndex}
          className="overflow-hidden inline-block"
        >
          {word.split('').map((char, charIndex) => (
            <span
              key={charIndex}
              data-char
              className="inline-block"
              style={{ opacity: 0, transform: 'translateY(60px)' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
} 