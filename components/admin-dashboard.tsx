"use client"

import { Badge } from "@/components/ui/badge"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Trash2, Ban, CheckCircle, Edit, Search, RefreshCw } from "lucide-react"
import { updateUserByAdmin, deleteUserByAdmin, banUser, unbanUser, getAllUsersAdmin } from "@/app/actions/admin"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface AdminDashboardProps {
  initialUsers: any[]
  currentUser: any
}

export function AdminDashboard({ initialUsers, currentUser }: AdminDashboardProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [banningUser, setBanningUser] = useState<any>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [banError, setBanError] = useState<string | null>(null)
  const [banSuccess, setBanSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const refreshUsers = async () => {
    startTransition(async () => {
      const { data, error } = await getAllUsersAdmin()
      if (error) {
        toast({
          title: "Error",
          description: `Failed to refresh users: ${error}`,
          variant: "destructive",
        })
      } else {
        setUsers(data || [])
        toast({
          title: "Success",
          description: "User list refreshed.",
        })
      }
    })
  }

  const handleEditSubmit = async (formData: FormData) => {
    setEditError(null)
    setEditSuccess(null)
    startTransition(async () => {
      const result = await updateUserByAdmin(formData)
      if (result?.error) {
        setEditError(result.error)
      } else {
        setEditSuccess(result?.message || "User updated successfully!")
        setEditingUser(null) // Close dialog on success
        refreshUsers()
      }
    })
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user @${username}? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await deleteUserByAdmin(userId)
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: result?.message || "User deleted successfully!",
          })
          refreshUsers()
        }
      })
    }
  }

  const handleBanUser = async (formData: FormData) => {
    setBanError(null)
    setBanSuccess(null)
    const duration = Number(formData.get("durationDays"))
    const ipBan = formData.get("ipBan") === "on"

    if (!banningUser?.id) {
      setBanError("No user selected for banning.")
      return
    }

    startTransition(async () => {
      const result = await banUser(banningUser.id, duration, ipBan)
      if (result?.error) {
        setBanError(result.error)
      } else {
        setBanSuccess(result?.message || "User banned successfully!")
        setBanningUser(null) // Close dialog on success
        refreshUsers()
      }
    })
  }

  const handleUnbanUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to unban user @${username}?`)) {
      startTransition(async () => {
        const result = await unbanUser(userId)
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: result?.message || "User unbanned successfully!",
          })
          refreshUsers()
        }
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 music-gradient-text flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          Admin Dashboard
        </h1>

        <Card className="music-card shadow-lg mb-6">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by username, email, or name..."
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={refreshUsers} disabled={isPending}>
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh Users</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="music-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.full_name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.is_admin && (
                            <Badge
                              variant="secondary"
                              className="mr-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              Admin
                            </Badge>
                          )}
                          {user.is_banned ? (
                            <Badge
                              variant="destructive"
                              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            >
                              Banned {user.banned_until && `until ${new Date(user.banned_until).toLocaleDateString()}`}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(user.created_at))} ago</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              disabled={isPending}
                            >
                              <Edit className="w-4 h-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {user.is_banned ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUnbanUser(user.id, user.username)}
                                disabled={isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="sr-only">Unban</span>
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBanningUser(user)}
                                disabled={isPending}
                              >
                                <Ban className="w-4 h-4" />
                                <span className="sr-only">Ban</span>
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={isPending || user.id === currentUser.id}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="sm:max-w-[600px] music-card">
              <DialogHeader>
                <DialogTitle>Edit User: {editingUser.username}</DialogTitle>
                <DialogDescription>Make changes to the user's profile and settings.</DialogDescription>
              </DialogHeader>
              <FormError error={editError} />
              <FormSuccess message={editSuccess} />
              <form action={handleEditSubmit} className="grid gap-4 py-4">
                <input type="hidden" name="userId" value={editingUser.id} />
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={editingUser.full_name}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={editingUser.username}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingUser.email}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newPassword" className="text-right">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bio" className="text-right">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={editingUser.bio || ""}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="country" className="text-right">
                    Location
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="country"
                      name="country"
                      placeholder="Country"
                      defaultValue={editingUser.country || ""}
                      disabled={isPending}
                    />
                    <Input
                      id="state"
                      name="state"
                      placeholder="State"
                      defaultValue={editingUser.state || ""}
                      disabled={isPending}
                    />
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      defaultValue={editingUser.city || ""}
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isAdmin" className="text-right">
                    Is Admin
                  </Label>
                  <Switch
                    id="isAdmin"
                    name="isAdmin"
                    defaultChecked={editingUser.is_admin}
                    className="col-span-3"
                    disabled={isPending || editingUser.id === currentUser.id}
                  />
                </div>

                {/* Privacy Settings */}
                <h3 className="col-span-4 text-lg font-semibold mt-4 music-gradient-text">Privacy Settings</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profileVisibility" className="text-right">
                    Profile Visibility
                  </Label>
                  <Select
                    name="profileVisibility"
                    defaultValue={editingUser.profile_visibility || "public"}
                    disabled={isPending}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="friendsListVisibility" className="text-right">
                    Friends List Visibility
                  </Label>
                  <Select
                    name="friendsListVisibility"
                    defaultValue={editingUser.friends_list_visibility || "friends"}
                    disabled={isPending}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="likedSongsVisibility" className="text-right">
                    Liked Songs Visibility
                  </Label>
                  <Select
                    name="likedSongsVisibility"
                    defaultValue={editingUser.liked_songs_visibility || "friends"}
                    disabled={isPending}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="showLocation" className="text-right">
                    Show Location
                  </Label>
                  <Switch
                    id="showLocation"
                    name="showLocation"
                    defaultChecked={editingUser.show_location ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="allowFriendRequests" className="text-right">
                    Allow Friend Requests
                  </Label>
                  <Switch
                    id="allowFriendRequests"
                    name="allowFriendRequests"
                    defaultChecked={editingUser.allow_friend_requests ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="showActivityStatus" className="text-right">
                    Show Activity Status
                  </Label>
                  <Switch
                    id="showActivityStatus"
                    name="showActivityStatus"
                    defaultChecked={editingUser.show_activity_status ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>

                {/* Notification Settings */}
                <h3 className="col-span-4 text-lg font-semibold mt-4 music-gradient-text">Notification Settings</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emailNotifications" className="text-right">
                    Email Notifications
                  </Label>
                  <Switch
                    id="emailNotifications"
                    name="emailNotifications"
                    defaultChecked={editingUser.email_notifications ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="friendRequestNotifications" className="text-right">
                    Friend Request Notifications
                  </Label>
                  <Switch
                    id="friendRequestNotifications"
                    name="friendRequestNotifications"
                    defaultChecked={editingUser.friend_request_notifications ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commentNotifications" className="text-right">
                    Comment Notifications
                  </Label>
                  <Switch
                    id="commentNotifications"
                    name="commentNotifications"
                    defaultChecked={editingUser.comment_notifications ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="likeNotifications" className="text-right">
                    Like Notifications
                  </Label>
                  <Switch
                    id="likeNotifications"
                    name="likeNotifications"
                    defaultChecked={editingUser.like_notifications ?? false}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weeklyDigest" className="text-right">
                    Weekly Digest
                  </Label>
                  <Switch
                    id="weeklyDigest"
                    name="weeklyDigest"
                    defaultChecked={editingUser.weekly_digest ?? true}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>

                {/* Appearance Settings */}
                <h3 className="col-span-4 text-lg font-semibold mt-4 music-gradient-text">Appearance Settings</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="theme" className="text-right">
                    Theme
                  </Label>
                  <Select name="theme" defaultValue={editingUser.theme || "system"} disabled={isPending}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="compactMode" className="text-right">
                    Compact Mode
                  </Label>
                  <Switch
                    id="compactMode"
                    name="compactMode"
                    defaultChecked={editingUser.compact_mode ?? false}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="autoPlayMusic" className="text-right">
                    Auto-play Music
                  </Label>
                  <Switch
                    id="autoPlayMusic"
                    name="autoPlayMusic"
                    defaultChecked={editingUser.auto_play_music ?? false}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>

                <DialogFooter className="col-span-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" className="music-button" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Ban User Dialog */}
        {banningUser && (
          <Dialog open={!!banningUser} onOpenChange={() => setBanningUser(null)}>
            <DialogContent className="sm:max-w-[425px] music-card">
              <DialogHeader>
                <DialogTitle>Ban User: {banningUser.username}</DialogTitle>
                <DialogDescription>Configure ban settings for this user.</DialogDescription>
              </DialogHeader>
              <FormError error={banError} />
              <FormSuccess message={banSuccess} />
              <form action={handleBanUser} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="durationDays" className="text-right">
                    Duration (Days)
                  </Label>
                  <Input
                    id="durationDays"
                    name="durationDays"
                    type="number"
                    defaultValue={7}
                    min={0}
                    className="col-span-3"
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ipBan" className="text-right">
                    IP Ban
                  </Label>
                  <Switch id="ipBan" name="ipBan" className="col-span-3" disabled={isPending} />
                </div>
                <p className="col-span-4 text-sm text-muted-foreground text-center">
                  {banningUser.last_login_ip ? `Last known IP: ${banningUser.last_login_ip}` : "No recent IP recorded."}
                </p>
                <DialogFooter className="col-span-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setBanningUser(null)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={isPending}>
                    {isPending ? "Banning..." : "Confirm Ban"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
