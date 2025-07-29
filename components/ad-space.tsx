"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react"

interface AdSpaceProps {
  position: "feed-top" | "feed-middle" | "feed-bottom" | "sidebar" | "profile-top" | "comments" | "mobile-banner"
  className?: string
}

const adContent = {
  "feed-top": {
    title: "Discover New Music Gear",
    description: "Premium headphones and audio equipment for music lovers",
    cta: "Shop Now",
    image: "/placeholder.svg?height=120&width=300",
    arrow: ArrowDown,
    arrowPosition: "top-right",
  },
  "feed-middle": {
    title: "Spotify Premium",
    description: "Listen to millions of songs ad-free with premium quality",
    cta: "Try Free",
    image: "/placeholder.svg?height=100&width=250",
    arrow: ArrowLeft,
    arrowPosition: "right",
  },
  "feed-bottom": {
    title: "Music Production Course",
    description: "Learn to create beats and produce music like a pro",
    cta: "Learn More",
    image: "/placeholder.svg?height=100&width=250",
    arrow: ArrowUp,
    arrowPosition: "bottom-left",
  },
  sidebar: {
    title: "Concert Tickets",
    description: "Find live music events near you",
    cta: "Browse Events",
    image: "/placeholder.svg?height=150&width=200",
    arrow: ArrowLeft,
    arrowPosition: "left",
  },
  "profile-top": {
    title: "Music Streaming Service",
    description: "Access millions of songs from every genre",
    cta: "Start Listening",
    image: "/placeholder.svg?height=80&width=300",
    arrow: ArrowDown,
    arrowPosition: "top-center",
  },
  comments: {
    title: "Music Lessons Online",
    description: "Learn guitar, piano, and more with expert instructors",
    cta: "Start Learning",
    image: "/placeholder.svg?height=80&width=280",
    arrow: ArrowRight,
    arrowPosition: "left",
  },
  "mobile-banner": {
    title: "Music App",
    description: "Download our mobile app for the best experience",
    cta: "Download",
    image: "/placeholder.svg?height=60&width=200",
    arrow: ArrowDown,
    arrowPosition: "top",
  },
}

export default function AdSpace({ position, className = "" }: AdSpaceProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  if (!isVisible) return null

  const ad = adContent[position]
  const ArrowIcon = ad.arrow

  const getArrowClasses = () => {
    const base = "absolute text-purple-400 transition-all duration-300"
    const size = position === "mobile-banner" ? "w-4 h-4" : "w-5 h-5"

    switch (ad.arrowPosition) {
      case "top-right":
        return `${base} ${size} -top-6 right-4 ${isHovered ? "-top-7" : ""}`
      case "top-center":
        return `${base} ${size} -top-6 left-1/2 transform -translate-x-1/2 ${isHovered ? "-top-7" : ""}`
      case "top":
        return `${base} ${size} -top-6 left-4 ${isHovered ? "-top-7" : ""}`
      case "right":
        return `${base} ${size} top-1/2 -right-6 transform -translate-y-1/2 ${isHovered ? "-right-7" : ""}`
      case "bottom-left":
        return `${base} ${size} -bottom-6 left-4 ${isHovered ? "-bottom-7" : ""}`
      case "left":
        return `${base} ${size} top-1/2 -left-6 transform -translate-y-1/2 ${isHovered ? "-left-7" : ""}`
      default:
        return `${base} ${size} -top-6 right-4`
    }
  }

  const getCardClasses = () => {
    const base =
      "relative transition-all duration-300 hover:shadow-lg border-2 border-dashed border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"

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

  const handleAdClick = () => {
    // Track ad click analytics here
    console.log(`Ad clicked: ${position}`)
  }

  return (
    <div className={`${className} ${getCardClasses()}`}>
      <Card
        className="border-0 bg-transparent cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAdClick}
      >
        <CardContent className="p-4">
          {/* Arrow with message */}
          <div className={getArrowClasses()}>
            <ArrowIcon />
          </div>

          {/* "This is how we pay our bills" message */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
              💰 This is how we pay our bills
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Ad Image */}
            <div className="flex-shrink-0">
              <img
                src={ad.image || "/placeholder.svg"}
                alt={ad.title}
                className={`rounded-lg object-cover ${
                  position === "mobile-banner" ? "w-16 h-12" : position === "sidebar" ? "w-20 h-16" : "w-24 h-20"
                }`}
              />
            </div>

            {/* Ad Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-gray-800 mb-1 ${position === "mobile-banner" ? "text-sm" : "text-base"}`}
              >
                {ad.title}
              </h3>
              <p className={`text-gray-600 mb-2 ${position === "mobile-banner" ? "text-xs" : "text-sm"}`}>
                {ad.description}
              </p>
              <Button
                size={position === "mobile-banner" ? "sm" : "default"}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {ad.cta}
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsVisible(false)
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Sponsored label */}
          <div className="absolute top-2 right-2">
            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">Sponsored</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
