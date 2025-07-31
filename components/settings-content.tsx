import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  updateProfile,
  updatePrivacySettings,
  updateNotificationSettings,
  updateAppearanceSettings,
} from "@/app/actions/settings"
import { createServerClient } from "@/lib/supabase"
import { User, Shield, Bell, Palette, Globe } from "lucide-react"

interface SettingsContentProps {
  user: any
}

export async function SettingsContent({ user }: SettingsContentProps) {
  const supabase = createServerClient()

  // Get full user data with all settings
  const { data: fullUser } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 music-gradient-text">Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="account">
              <Globe className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="music-card shadow-lg">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateProfile} className="space-y-4">
                  <input type="hidden" name="userId" value={user.id} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={fullUser?.full_name}
                        className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={fullUser?.username} disabled />
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={fullUser?.bio || ""}
                      rows={3}
                      className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        defaultValue={fullUser?.country || ""}
                        className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Region</Label>
                      <Input
                        id="state"
                        name="state"
                        defaultValue={fullUser?.state || ""}
                        className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={fullUser?.city || ""}
                        className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="music-button">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="music-card shadow-lg">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updatePrivacySettings} className="space-y-6">
                  <input type="hidden" name="userId" value={user.id} />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select name="profileVisibility" defaultValue={fullUser?.profile_visibility || "public"}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Friends List Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your friends list</p>
                    </div>
                    <Select name="friendsListVisibility" defaultValue={fullUser?.friends_list_visibility || "friends"}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Liked Songs Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your liked songs</p>
                    </div>
                    <Select name="likedSongsVisibility" defaultValue={fullUser?.liked_songs_visibility || "friends"}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                    </div>
                    <Switch name="showLocation" defaultChecked={fullUser?.show_location ?? true} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                    </div>
                    <Switch name="allowFriendRequests" defaultChecked={fullUser?.allow_friend_requests ?? true} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Switch name="showActivityStatus" defaultChecked={fullUser?.show_activity_status ?? true} />
                  </div>

                  <Button type="submit" className="music-button">
                    Save Privacy Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="music-card shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateNotificationSettings} className="space-y-6">
                  <input type="hidden" name="userId" value={user.id} />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch name="emailNotifications" defaultChecked={fullUser?.email_notifications ?? true} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone sends a friend request</p>
                    </div>
                    <Switch
                      name="friendRequestNotifications"
                      defaultChecked={fullUser?.friend_request_notifications ?? true}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Comments</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                    </div>
                    <Switch name="commentNotifications" defaultChecked={fullUser?.comment_notifications ?? true} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Likes</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone likes your posts</p>
                    </div>
                    <Switch name="likeNotifications" defaultChecked={fullUser?.like_notifications ?? false} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                    </div>
                    <Switch name="weeklyDigest" defaultChecked={fullUser?.weekly_digest ?? true} />
                  </div>

                  <Button type="submit" className="music-button">
                    Save Notification Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card className="music-card shadow-lg">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateAppearanceSettings} className="space-y-6">
                  <input type="hidden" name="userId" value={user.id} />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <Select name="theme" defaultValue={fullUser?.theme || "system"}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Show more content in less space</p>
                    </div>
                    <Switch name="compactMode" defaultChecked={fullUser?.compact_mode ?? false} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-play Music</Label>
                      <p className="text-sm text-muted-foreground">Automatically play music previews</p>
                    </div>
                    <Switch name="autoPlayMusic" defaultChecked={fullUser?.auto_play_music ?? false} />
                  </div>

                  <Button type="submit" className="music-button">
                    Save Appearance Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            <Card className="music-card shadow-lg">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={fullUser?.email} disabled />
                  <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Delete Account</Label>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
