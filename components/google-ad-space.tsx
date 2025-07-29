"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Info } from "lucide-react"

interface GoogleAdSpaceProps {
  adSlot: string
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid"
  position: "feed-top" | "feed-middle" | "feed-bottom" | "sidebar" | "profile-top" | "comments" | "mobile-banner"
  className?: string
  fullWidthResponsive?: boolean
}

const adConfig = {
  "feed-top": {
    width: 728,
    height: 90,
    arrow: ArrowDown,
    arrowPosition: "top-right",
    format: "horizontal" as const,
  },
  "feed-middle": {
    width: 336,
    height: 280,
    arrow: ArrowLeft,
    arrowPosition: "right",
    format: "rectangle" as const,
  },
  "feed-bottom": {
    width: 728,
    height: 90,
    arrow: ArrowUp,
    arrowPosition: "bottom-left",
    format: "horizontal" as const,
  },
  sidebar: {
    width: 300,
    height: 250,
    arrow: ArrowLeft,
    arrowPosition: "left",
    format: "rectangle" as const,
  },
  "profile-top": {
    width: 728,
    height: 90,
    arrow: ArrowDown,
    arrowPosition: "top-center",
    format: "horizontal" as const,
  },
  comments: {
    width: 728,
    height: 90,
    arrow: ArrowRight,
    arrowPosition: "left",
    format: "horizontal" as const,
  },
  "mobile-banner": {
    width: 320,
    height: 50,
    arrow: ArrowDown,
    arrowPosition: "top",
    format: "horizontal" as const,
  },
}

// Google AdSense script loader
const loadGoogleAdsScript = () => {
  if (typeof window !== "undefined" && !window.adsbygoogle) {
    const script = document.createElement("script")
    script.async = true
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
    script.crossOrigin = "anonymous"
    document.head.appendChild(script)
  }
}

export default function GoogleAdSpace({
  adSlot,
  adFormat = "auto",
  position,
  className = "",
  fullWidthResponsive = true,
}: GoogleAdSpaceProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [adLoaded, setAdLoaded] = useState(false)

  const config = adConfig[position]
  const ArrowIcon = config.arrow

  useEffect(() => {
    loadGoogleAdsScript()

    const timer = setTimeout(() => {
      if (adRef.current && window.adsbygoogle && !adLoaded) {
        try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          setAdLoaded(true)
        } catch (error) {
          console.error("AdSense error:", error)
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [adLoaded])

  if (!isVisible) return null

  const getArrowClasses = () => {
    const base = "absolute text-blue-500 transition-all duration-300 opacity-60"
    const size = position === "mobile-banner" ? "w-4 h-4" : "w-5 h-5"

    switch (config.arrowPosition) {
      case "top-right":
        return `${base} ${size} -top-6 right-4 ${isHovered ? "-top-7 opacity-80" : ""}`
      case "top-center":
        return `${base} ${size} -top-6 left-1/2 transform -translate-x-1/2 ${isHovered ? "-top-7 opacity-80" : ""}`
      case "top":
        return `${base} ${size} -top-6 left-4 ${isHovered ? "-top-7 opacity-80" : ""}`
      case "right":
        return `${base} ${size} top-1/2 -right-6 transform -translate-y-1/2 ${isHovered ? "-right-7 opacity-80" : ""}`
      case "bottom-left":
        return `${base} ${size} -bottom-6 left-4 ${isHovered ? "-bottom-7 opacity-80" : ""}`
      case "left":
        return `${base} ${size} top-1/2 -left-6 transform -translate-y-1/2 ${isHovered ? "-left-7 opacity-80" : ""}`
      default:
        return `${base} ${size} -top-6 right-4`
    }
  }

  const getContainerClasses = () => {
    const base = "relative transition-all duration-300 border border-gray-200 bg-gray-50 rounded-lg"

    switch (position) {
      case "feed-top":
      case "feed-middle":
      case "feed-bottom":
        return `${base} mb-6`
      case "sidebar":
        return `${base} mb-4`
      case "profile-top":
        return `${base} mb-6`
      case "comments":
        return `${base} my-4`
      case "mobile-banner":
        return `${base} mx-4 mb-4 md:hidden`
      default:
        return base
    }
  }

  const getAdContainerStyle = () => {
    if (position === "mobile-banner") {
      return {
        minHeight: "50px",
        width: "100%",
        maxWidth: "320px",
        margin: "0 auto",
      }
    }

    return {
      minHeight: `${config.height}px`,
      width: fullWidthResponsive ? "100%" : `${config.width}px`,
      maxWidth: `${config.width}px`,
      margin: "0 auto",
    }
  }

  return (
    <div className={`${className} ${getContainerClasses()}`}>
      <div className="relative p-4" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Arrow indicator */}
        <div className={getArrowClasses()}>
          <ArrowIcon />
        </div>

        {/* Revenue message tooltip */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1">
            <Info className="w-3 h-3" />
            This is how we keep the lights on
          </div>
        </div>

        {/* Ad label */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Advertisement</span>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Google Ads</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Google AdSense Ad Unit */}
        <div style={getAdContainerStyle()}>
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              minHeight: `${config.height}px`,
            }}
            data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your AdSense publisher ID
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
            data-ad-layout={position === "sidebar" ? "in-article" : undefined}
          />
        </div>

        {/* Fallback content when ads don't load */}
        {!adLoaded && (
          <div
            className="flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 rounded border-2 border-dashed border-gray-300"
            style={getAdContainerStyle()}
          >
            <div className="text-center text-gray-500">
              <div className="text-sm font-medium mb-1">Advertisement Space</div>
              <div className="text-xs">Loading...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
