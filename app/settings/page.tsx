import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { SettingsContent } from "@/components/settings-content"

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <SettingsContent user={user} />
    </div>
  )
}
