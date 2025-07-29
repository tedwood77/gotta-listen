import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import AuthForm from "@/components/auth-form"

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    redirect("/feed")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">Gotta Listen</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Share the music that moves you. Discover songs worth listening to through the stories of fellow music
            lovers.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>

        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-white">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-2">Share Your Discoveries</h3>
              <p className="text-gray-300">
                Post songs with Spotify previews and explain why they're worth listening to
              </p>
            </div>
            <div className="text-white">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Global Community</h3>
              <p className="text-gray-300">Connect with music lovers worldwide and filter by location or genre</p>
            </div>
            <div className="text-white">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
              <p className="text-gray-300">Add friends and discover music through your personal network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
