"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/app/actions/auth"
import { FormError } from "@/components/form-error"
import Link from "next/link"
import { Music, Users, Globe } from "lucide-react"
import { ExamplePost } from "@/components/example-post"
import { useState, useTransition } from "react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await registerUser(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 floating-animation"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Left side - Example Post */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h3 className="text-lg font-semibold mb-4 music-gradient-text">See what others are sharing</h3>
            <ExamplePost />
          </div>
        </div>

        {/* Middle - Registration form */}
        <Card className="w-full max-w-md mx-auto music-card shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold music-gradient-text">Join Gotta Listen</CardTitle>
            <CardDescription>Share music worth hearing with the world</CardDescription>
          </CardHeader>
          <CardContent>
            <FormError error={error} />

            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    disabled={isPending}
                    className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    disabled={isPending}
                    minLength={3}
                    className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isPending}
                  className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending}
                  minLength={6}
                  className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="USA"
                    disabled={isPending}
                    className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="CA"
                    disabled={isPending}
                    className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="LA"
                    disabled={isPending}
                    className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full music-button" disabled={isPending}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Features */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="relative">
              <Music className="w-12 h-12 text-purple-600 floating-animation" />
              <div className="absolute -inset-2 pulse-ring opacity-30 w-16 h-16"></div>
            </div>
            <h1 className="text-4xl font-bold music-gradient-text">Gotta Listen</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Join the Music Community</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Start sharing your musical discoveries with a community that truly appreciates great music.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Share Your Discoveries</h3>
                <p className="text-sm text-muted-foreground">Post songs with Spotify integration</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Connect with Friends</h3>
                <p className="text-sm text-muted-foreground">Build your music-loving network</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Discover New Music</h3>
                <p className="text-sm text-muted-foreground">Find your next favorite song</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
