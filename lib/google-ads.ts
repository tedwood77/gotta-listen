// Google AdSense configuration
export const GOOGLE_ADSENSE_CONFIG = {
  clientId: "ca-pub-6988793191718332",
  enabled: process.env.NODE_ENV === "production",
  testMode: process.env.NODE_ENV === "development",
}

// AdSense script configuration
export const adsenseScript = {
  src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
  crossOrigin: "anonymous",
  async: true,
  client: GOOGLE_ADSENSE_CONFIG.clientId,
}

// Initialize AdSense
export function initializeAdSense() {
  if (typeof window !== "undefined" && GOOGLE_ADSENSE_CONFIG.enabled) {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error("AdSense initialization error:", error)
    }
  }
}

// Load AdSense ads
export function loadAds() {
  if (typeof window !== "undefined" && GOOGLE_ADSENSE_CONFIG.enabled) {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error("AdSense loading error:", error)
    }
  }
}
