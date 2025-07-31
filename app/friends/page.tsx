import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { FriendsContent } from "@/components/friends-content"

export default async function FriendsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <FriendsContent user={user} />
    </div>
  )
}
