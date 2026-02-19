'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const t = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(t)
  }, [pathname])

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        height: '100%',
      }}
    >
      {children}
    </div>
  )
}
