"use client"

import { useState, useTransition, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { resetPassword } from "@/app/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get("type")
    const accessToken = searchParams.get("access_token")

    if (type === "recovery" && accessToken) {
      // This is crucial for Supabase to recognize the session from the magic link
      const supabase = getSupabaseClient()
      supabase.auth.setSession({ access_token: accessToken, refresh_token: "" }) // Refresh token might not be present or needed here
    } else if (!type || !accessToken) {
      setError("Invalid password reset link. Please request a new one.")
    }
  }, [searchParams])

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message || "Password reset successfully!")
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login?success=password_reset")
        }, 2000)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormError error={error} />
      <FormSuccess message={success} />

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          disabled={isPending || !!success}
          minLength={6}
          className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
        />
        <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          disabled={isPending || !!success}
          minLength={6}
          className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
        />
      </div>

      <Button type="submit" className="w-full music-button" disabled={isPending || !!success}>
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  )
}
