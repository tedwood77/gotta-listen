"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Shield, User, Bell, MapPin, Trash2, Users, Lock, Globe, X } from "lucide-react"
import { countries, statesProvinces, majorCities } from "@/lib/locations"
import { updateProfile, updatePrivacySettings, deleteAccount } from "@/app/actions/settings"

const genres = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Indie",
  "Alternative",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
  "Punk",
  "Funk",
  "Soul",
  "Gospel",
  "World",
  "Latin",
  "Ambient",
  "House",
  "Techno",
  "Dubstep",
]

interface SettingsContentProps {
  user: any
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "")
  const [selectedState, setSelectedState] = useState(user?.state_region || "")
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user?.favorite_genres || [])
  const [privacySettings, setPrivacySettings] = useState(
    user?.privacy_settings || {
      profile_visibility: "public",
      post_visibility: "public",
      location_visibility: "public",
      friend_list_visibility: "friends",
      liked_songs_visibility: "public",
      allow_friend_requests: true,
      show_online_status: true,
      email_notifications: true,
      push_notifications: true,
    },
  )

  const addGenre = (genre: string) => {
    if (!favoriteGenres.includes(genre)) {
      setFavoriteGenres([...favoriteGenres, genre])
    }
  }

  const removeGenre = (genre: string) => {
    setFavoriteGenres(favoriteGenres.filter((g) => g !== genre))
  }

  const handleProfileUpdate = async (formData: FormData) => {
    setIsLoading(true)
    try {
      formData.append("favoriteGenres", JSON.stringify(favoriteGenres))
      formData.append("userId", user.id)
      await updateProfile(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    setIsLoading(true)
    try {
      await updatePrivacySettings(user.id, privacySettings)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    await deleteAccount(user.id)
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Privacy
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Account
        </TabsTrigger>
      </TabsList>

      {/* Profile Settings */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleProfileUpdate} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">
                    {user?.display_name?.charAt(0) || user?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" defaultValue={user?.username} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" name="displayName" defaultValue={user?.display_name} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user?.email} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={user?.bio || ""}
                  placeholder="Tell us about your music taste..."
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select name="country" value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && statesProvinces[selectedCountry] && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Select name="state" value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state/province" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesProvinces[selectedCountry].map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedCountry && majorCities[selectedCountry] && (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select name="city" defaultValue={user?.city}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {majorCities[selectedCountry].map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customCity">Or enter custom city</Label>
                  <Input id="customCity" name="customCity" placeholder="Enter your city" />
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Favorite Genres</h3>
                <div className="space-y-2">
                  <Select onValueChange={addGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres
                        .filter((g) => !favoriteGenres.includes(g))
                        .map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {favoriteGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteGenres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                        {genre}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Settings */}
      <TabsContent value="privacy">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your profile</p>
                </div>
                <Select
                  value={privacySettings.profile_visibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, profile_visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Friends
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Post Visibility</Label>
                  <p className="text-sm text-gray-500">Default visibility for your posts</p>
                </div>
                <Select
                  value={privacySettings.post_visibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, post_visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Location Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your location</p>
                </div>
                <Select
                  value={privacySettings.location_visibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, location_visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Friend List Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your friends</p>
                </div>
                <Select
                  value={privacySettings.friend_list_visibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, friend_list_visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Liked Songs Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see songs you've liked</p>
                </div>
                <Select
                  value={privacySettings.liked_songs_visibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, liked_songs_visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-gray-500">Let others send you friend requests</p>
                </div>
                <Switch
                  checked={privacySettings.allow_friend_requests}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, allow_friend_requests: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <Switch
                  checked={privacySettings.show_online_status}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_online_status: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handlePrivacyUpdate} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      </TabsContent>

      {/* Notification Settings */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={privacySettings.email_notifications}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, email_notifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
              </div>
              <Switch
                checked={privacySettings.push_notifications}
                onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, push_notifications: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Email Notification Types</h4>
              <div className="space-y-4 pl-4">
                <div className="flex items-center justify-between">
                  <Label>New friend requests</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>New likes on your posts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>New comments on your posts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekly music digest</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>New posts from friends</Label>
                  <Switch />
                </div>
              </div>
            </div>

            <Button onClick={handlePrivacyUpdate} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Account Settings */}
      <TabsContent value="account">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password</Label>
                  <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-gray-500">Manage your active sessions</p>
                </div>
                <Button variant="outline">View Sessions</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Download Your Data</Label>
                  <p className="text-sm text-gray-500">Get a copy of your data</p>
                </div>
                <Button variant="outline">Request Download</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Blocked Users</Label>
                  <p className="text-sm text-gray-500">Manage blocked users</p>
                </div>
                <Button variant="outline">Manage Blocks</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Delete Account</Label>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Your profile and all posts</li>
                          <li>Your liked songs and playlists</li>
                          <li>Your friends and connections</li>
                          <li>All comments and interactions</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
