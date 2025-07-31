"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Music, UserPlus, UserCheck, UserX, Heart, Lock } from "lucide-react"
import { PostCard } from "./post-card"
import { sendFriendRequest, respondToFriendRequest, removeFriend } from "@/app/actions/friends"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ProfileContentProps {
  profileUser: any
  currentUser: any
  posts: any[]
  likedSongs: any[]
  friends: any[]
  friendship: any
  likedGenres: any[]
  friendsCount: number
  canViewFriends: boolean
  canViewLikedSongs: boolean
}

export function ProfileContent({
  profileUser,
  currentUser,
  posts,
  likedSongs,
  friends,
  friendship,
  likedGenres,
  friendsCount,
  canViewFriends,
  canViewLikedSongs,
}: ProfileContentProps) {
  const { toast } = useToast()
  const isOwnProfile = currentUser.id === profileUser.id

  const handleFriendAction = async (action: string, friendshipId?: string) => {
    let result

    switch (action) {
      case "send":
        result = await sendFriendRequest(profileUser.id, currentUser.id)
        break
      case "accept":
        result = await respondToFriendRequest(friendshipId!, "accepted")
        break
      case "decline":
        result = await respondToFriendRequest(friendshipId!, "declined")
        break
      case "remove":
        result = await removeFriend(friendshipId!)
        break
    }

    if (result?.success) {
      toast({
        title: "Success!",
        description: "Friend action completed.",
      })
    } else {
      toast({
        title: "Error",
        description: result?.error || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const getFriendButton = () => {
    if (isOwnProfile) return null

    if (!friendship) {
      return (
        <Button onClick={() => handleFriendAction("send")} className="music-button">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      )
    }

    if (friendship.status === "pending") {
      if (friendship.requester_id === currentUser.id) {
        return (
          <Button variant="outline" disabled>
            <UserCheck className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        )
      } else {
        return (
          <div className="flex space-x-2">
            <Button onClick={() => handleFriendAction("accept", friendship.id)} className="music-button">
              Accept
            </Button>
            <Button variant="outline" onClick={() => handleFriendAction("decline", friendship.id)}>
              Decline
            </Button>
          </div>
        )
      }
    }

    if (friendship.status === "accepted") {
      return (
        <Button variant="outline" onClick={() => handleFriendAction("remove", friendship.id)}>
          <UserX className="w-4 h-4 mr-2" />
          Remove Friend
        </Button>
      )
    }

    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card className="music-card shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto ring-4 ring-purple-200 dark:ring-purple-800">
                  <AvatarImage src={profileUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                    {profileUser.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-xl font-bold music-gradient-text">{profileUser.full_name}</h1>
                  <p className="text-muted-foreground">@{profileUser.username}</p>
                </div>

                {profileUser.bio && <p className="text-sm text-center">{profileUser.bio}</p>}

                <div className="space-y-2 text-sm text-muted-foreground">
                  {(profileUser.city || profileUser.state || profileUser.country) && profileUser.show_location && (
                    <div className="flex items-center justify-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[profileUser.city, profileUser.state, profileUser.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDistanceToNow(new Date(profileUser.created_at))} ago</span>
                  </div>

                  <div className="flex items-center justify-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{friendsCount} friends</span>
                  </div>
                </div>

                {getFriendButton()}
              </div>
            </CardContent>
          </Card>

          {likedGenres.length > 0 && (
            <Card className="mt-4 music-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center music-gradient-text">
                  <Music className="w-5 h-5 mr-2" />
                  Favorite Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {likedGenres.map((genre: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200"
                    >
                      {genre.genres.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="liked">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Liked Songs</span>
                  {!canViewLikedSongs && <Lock className="w-3 h-3" />}
                </div>
              </TabsTrigger>
              <TabsTrigger value="friends">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Friends</span>
                  {!canViewFriends && <Lock className="w-3 h-3" />}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6 mt-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
              ) : (
                <Card className="music-card shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isOwnProfile ? "You haven't shared any songs yet." : "No songs shared yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="liked" className="mt-6">
              {canViewLikedSongs ? (
                <div className="space-y-6">
                  {likedSongs.length > 0 ? (
                    likedSongs.map((likedSong) => (
                      <PostCard key={likedSong.posts.id} post={likedSong.posts} currentUser={currentUser} />
                    ))
                  ) : (
                    <Card className="music-card shadow-lg">
                      <CardContent className="p-8 text-center">
                        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {isOwnProfile ? "You haven't liked any songs yet." : "No liked songs to show."}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="music-card shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">This user's liked songs are private.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="friends" className="mt-6">
              {canViewFriends ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.length > 0 ? (
                    friends.map((friend) => {
                      const friendUser = friend.requester?.id === profileUser.id ? friend.addressee : friend.requester
                      return (
                        <Card key={friend.id} className="music-card shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
                                <AvatarImage src={friendUser?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                  {friendUser?.full_name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/profile/${friendUser?.username}`}
                                  className="font-semibold hover:underline music-gradient-text block truncate"
                                >
                                  {friendUser?.full_name}
                                </Link>
                                <p className="text-sm text-muted-foreground truncate">@{friendUser?.username}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="col-span-full">
                      <Card className="music-card shadow-lg">
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            {isOwnProfile ? "You don't have any friends yet." : "No friends to show."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="music-card shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">This user's friends list is private.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
