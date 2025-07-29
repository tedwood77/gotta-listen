"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Shield, Cookie, Eye } from "lucide-react"
import Link from "next/link"

export default function AdPolicyBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted the policy
    const hasAccepted = localStorage.getItem("ad-policy-accepted")
    if (!hasAccepted) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("ad-policy-accepted", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Ads & Privacy Notice</h3>
              <p className="text-sm text-blue-800 mb-3">
                We use Google Ads to keep Gotta Listen free. These ads may use cookies to personalize your experience.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Link href="/privacy-policy">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    <Eye className="w-3 h-3 mr-1" />
                    Privacy Policy
                  </Button>
                </Link>
                <Link href="/ad-choices">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    <Cookie className="w-3 h-3 mr-1" />
                    Ad Choices
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAccept} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Got it
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
