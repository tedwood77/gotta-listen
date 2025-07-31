import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/spotify"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/settings?error=spotify_auth_failed", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", request.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    if (tokens.error) {
      return NextResponse.redirect(new URL("/settings?error=token_exchange_failed", request.url))
    }

    // Get current user
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Save tokens to database
    const supabase = createServerClient()
    await supabase
      .from("users")
      .update({
        spotify_access_token: tokens.access_token,
        spotify_refresh_token: tokens.refresh_token,
        spotify_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq("id", authToken.value)

    return NextResponse.redirect(new URL("/settings?success=spotify_connected", request.url))
  } catch (error) {
    console.error("Spotify callback error:", error)
    return NextResponse.redirect(new URL("/settings?error=callback_failed", request.url))
  }
}
