import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function AdChoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Ad Choices & Controls</CardTitle>
              <p className="text-gray-600">Manage your advertising preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">About Our Ads</h2>
                <p className="text-gray-700 mb-4">
                  Gotta Listen uses Google AdSense to display relevant advertisements that help keep our platform free.
                  These ads are selected based on the content you're viewing and may use cookies to personalize your
                  experience.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Control Your Ad Experience</h2>
                <div className="grid gap-4">
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Google Ad Settings</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Control how Google personalizes ads across all websites and apps that partner with Google.
                      </p>
                      <Button asChild variant="outline">
                        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Manage Google Ads
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Opt Out of Personalized Ads</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        You can opt out of personalized advertising while still seeing ads that support our platform.
                      </p>
                      <Button asChild variant="outline">
                        <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Opt Out (NAI)
                        </a>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Browser Settings</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        You can also control cookies and tracking through your browser settings.
                      </p>
                      <div className="space-y-2">
                        <Button asChild variant="outline" size="sm">
                          <a
                            href="https://support.google.com/chrome/answer/95647"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Chrome Settings
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Firefox Settings
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href="https://support.apple.com/guide/safari/prevent-cross-site-tracking-sfri40732"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Safari Settings
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Why We Show Ads</h2>
                <p className="text-gray-700 mb-4">
                  Advertising revenue helps us keep Gotta Listen free for all users. We carefully select ad partners and
                  formats that are relevant to our music-loving community while respecting your privacy.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Server costs and infrastructure</li>
                  <li>Development and maintenance</li>
                  <li>New feature development</li>
                  <li>Community support and moderation</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Ad Quality Standards</h2>
                <p className="text-gray-700 mb-4">We maintain high standards for the ads shown on our platform:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>No malicious or deceptive content</li>
                  <li>Relevant to our music community</li>
                  <li>Respectful of user experience</li>
                  <li>Compliant with privacy regulations</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  For questions about our advertising practices, please contact us at{" "}
                  <a href="mailto:ads@gottalisten.com" className="text-purple-600 hover:text-purple-700">
                    ads@gottalisten.com
                  </a>
                  .
                </p>
                <Link href="/feed" className="text-purple-600 hover:text-purple-700">
                  ← Back to Gotta Listen
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
