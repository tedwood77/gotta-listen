import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import Navbar from "@/components/navbar"
import SettingsContent from "@/components/settings-content"

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <SettingsContent user={userProfile} />
        </div>
      </div>
    </div>
  )
}
