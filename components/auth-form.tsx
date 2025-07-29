"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle } from "lucide-react"
import { loginUser, registerUser } from "@/app/actions/auth"

// Import the locations data
import { countries, statesProvinces, majorCities } from "@/lib/locations"

const genres = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Indie",
  "Alternative",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
]

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [rememberMe, setRememberMe] = useState(true) // Default to true for long-lasting sessions

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Add remember me to form data
    if (rememberMe) {
      formData.append("rememberMe", "on")
    }

    try {
      const result = await loginUser(formData)

      if (result?.error) {
        setError(result.error)
      }
      // If no error, the action will redirect
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser(formData)

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess("Account created successfully! Redirecting...")
      }
      // If no error, the action will redirect
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to Gotta Listen</CardTitle>
        <CardDescription>Join the music community</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              onClick={() => {
                setError(null)
                setSuccess(null)
              }}
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              onClick={() => {
                setError(null)
                setSuccess(null)
              }}
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} disabled={isLoading} />
                <Label htmlFor="rememberMe" className="text-sm">
                  Keep me signed in (recommended)
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                {rememberMe ? "You'll stay signed in for up to 1 year" : "You'll stay signed in for 7 days"}
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form action={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="username"
                    disabled={isLoading}
                    minLength={3}
                    pattern="[a-zA-Z0-9_]+"
                    title="Username can only contain letters, numbers, and underscores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input id="displayName" name="displayName" required placeholder="Your Name" disabled={isLoading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password *</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea id="bio" name="bio" placeholder="Tell us about your music taste..." disabled={isLoading} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select name="country" onValueChange={(value) => setSelectedCountry(value)} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && statesProvinces[selectedCountry] && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Select name="state" onValueChange={(value) => setSelectedState(value)} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state/province" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesProvinces[selectedCountry].map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedCountry && majorCities[selectedCountry] && (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select name="city" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city or type custom" />
                      </SelectTrigger>
                      <SelectContent>
                        {majorCities[selectedCountry].map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customCity">Or enter custom city</Label>
                  <Input id="customCity" name="customCity" placeholder="Enter your city" disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteGenres">Favorite Genres</Label>
                <Select name="favoriteGenres" disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your favorite genres" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-gray-500 mb-4">* Required fields</div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-xs text-gray-500 text-center">You'll automatically stay signed in for up to 1 year</p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
