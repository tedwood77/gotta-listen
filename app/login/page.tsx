"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loginUser, sendPasswordResetEmail } from "@/app/actions/auth"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success" // Import FormSuccess
import Link from "next/link"
import { Music, Headphones } from "lucide-react"
import { ExamplePost } from "@/components/example-post"
import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null)
  const [resetEmailError, setResetEmailError] = useState<string | null>(null)
  const [resetEmailSuccess, setResetEmailSuccess] = useState<string | null>(null)
  const [isLoginPending, startLoginTransition] = useTransition()
  const [isResetPending, startResetTransition] = useTransition()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const handleLoginSubmit = async (formData: FormData) => {
    setLoginError(null)
    startLoginTransition(async () => {
      const result = await loginUser(formData)
      if (result?.error) {
        setLoginError(result.error)
      }
    })
  }

  const handleSendResetEmail = async (formData: FormData) => {
    setResetEmailError(null)
    setResetEmailSuccess(null)
    startResetTransition(async () => {
      const result = await sendPasswordResetEmail(formData)
      if (result?.error) {
        setResetEmailError(result.error)
      } else if (result?.success) {
        setResetEmailSuccess(result.message || "Password reset link sent!")
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
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400 to-red-400 rounded-full opacity-10 floating-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Left side - Example Post */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h3 className="text-lg font-semibold mb-4 music-gradient-text">See what's trending</h3>
            <ExamplePost />
          </div>
        </div>

        {/* Middle - Login form */}
        <Card className="w-full max-w-md mx-auto music-card shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold music-gradient-text">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Gotta Listen account</CardDescription>
          </CardHeader>
          <CardContent>
            <FormError error={loginError} />

            <form action={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isLoginPending}
                  className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoginPending}
                  className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                />
              </div>

              <Button type="submit" className="w-full music-button" disabled={isLoginPending}>
                {isLoginPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:underline"
                  >
                    Forgot password?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] music-card">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>Enter your email to receive a password reset link.</DialogDescription>
                  </DialogHeader>
                  <FormError error={resetEmailError} />
                  <FormSuccess message={resetEmailSuccess} />
                  <form action={handleSendResetEmail} className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        required
                        disabled={isResetPending}
                        className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="music-button" disabled={isResetPending}>
                        {isResetPending ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4 text-center text-sm">
              {"Don't have an account?"}{" "}
              <Link
                href="/register"
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:underline"
              >
                Sign up
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
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Share Music Worth Hearing</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Connect with music lovers worldwide. Discover new songs, share your favorites, and explain why they're
              worth listening to.
            </p>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-purple-500" />
              <span>Discover Music</span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-pink-500" />
              <span>Share Stories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
