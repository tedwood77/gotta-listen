import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>Information We Collect</h2>
              <p>
                Gotta Listen collects information to provide better services to our users. We collect information in the
                following ways:
              </p>

              <h3>Information You Give Us</h3>
              <ul>
                <li>Account information (username, email, profile details)</li>
                <li>Posts and content you share</li>
                <li>Comments and interactions</li>
                <li>Music preferences and playlists</li>
              </ul>

              <h3>Information We Get from Your Use of Our Services</h3>
              <ul>
                <li>Device information</li>
                <li>Log information</li>
                <li>Location information</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h2>How We Use Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Develop new features and services</li>
                <li>Communicate with you</li>
                <li>Show you relevant advertisements</li>
              </ul>

              <h2>Advertising</h2>
              <p>
                We use Google AdSense to display advertisements on our platform. Google may use cookies and other
                technologies to:
              </p>
              <ul>
                <li>Show you personalized ads based on your interests</li>
                <li>Measure ad performance</li>
                <li>Prevent fraud and abuse</li>
              </ul>
              <p>
                You can control ad personalization by visiting{" "}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                  Google Ad Settings
                </a>
                .
              </p>

              <h2>Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information:
              </p>
              <ul>
                <li>With your consent</li>
                <li>For legal reasons</li>
                <li>With service providers who help us operate our platform</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt out of certain communications</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@gottalisten.com">privacy@gottalisten.com</a>.
              </p>

              <div className="mt-8 pt-4 border-t">
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
