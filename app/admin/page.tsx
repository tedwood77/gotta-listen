import { requireAdminAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getAllUsersAdmin } from "@/app/actions/admin"

export default async function AdminPage() {
  const user = await requireAdminAuth() // This will redirect if not admin

  const { data: users, error } = await getAllUsersAdmin()

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold mb-6 music-gradient-text">Admin Dashboard</h1>
          <p className="text-red-500">Error loading users: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <AdminDashboard initialUsers={users || []} currentUser={user} />
    </div>
  )
}
