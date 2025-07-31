"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface AdSenseAdProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
}

export function AdSenseAd({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
  className = "",
}: AdSenseAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadAd = () => {
      if (adRef.current && !isLoaded) {
        // Check if the container has proper dimensions
        const rect = adRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          try {
            // @ts-ignore
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
            setIsLoaded(true)
          } catch (err) {
            console.error("AdSense error:", err)
          }
        }
      }
    }

    // Wait for the component to be mounted and visible
    const timer = setTimeout(loadAd, 100)

    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6988793191718332"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  )
}
