import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import Navbar from "@/components/navbar"
import NewPostForm from "@/components/new-post-form"

export default async function NewPostPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Share a Song</h1>
          <NewPostForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}
