import { useEffect, useRef } from "react"

export function useInteractiveBg(containerRef: React.RefObject<HTMLElement>) {
  const isMounted = useRef(false)

  useEffect(() => {
    const element = containerRef.current
    if (element && !isMounted.current) {
      isMounted.current = true
      // Add mounted class for demonstration
      element.classList.add("bg-mounted")
      
      // TODO: Add GSAP animations here
      // Example:
      // gsap.to(element, {
      //   duration: 2,
      //   opacity: 0.8,
      //   ease: "power2.out"
      // })
    }

    return () => {
      if (element) {
        element.classList.remove("bg-mounted")
      }
    }
  }, [containerRef])

  return { isMounted: isMounted.current }
} 