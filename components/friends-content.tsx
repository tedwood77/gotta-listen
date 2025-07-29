"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, UserX, MapPin, Music, Users, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from "@/app/actions/friends"
import AdSpace from "./ad-space"

interface FriendsContentProps {
  currentUser: any
  incomingRequests: any[]
  outgoingRequests: any[]
  friends: any[]
  suggestedFriends: any[]
}

export default function FriendsContent({
  currentUser,
  incomingRequests,
  outgoingRequests,
  friends,
  suggestedFriends,
}: FriendsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleFriendAction = async (action: string, userId: string, friendshipId?: string) => {
    setIsLoading(userId)
    try {
      switch (action) {
        case "send":
          await sendFriendRequest(currentUser.id, userId)
          break
        case "accept":
          if (friendshipId) await acceptFriendRequest(friendshipId)
          break
        case "decline":
          if (friendshipId) await declineFriendRequest(friendshipId)
          break
        case "remove":
          if (friendshipId) await removeFriend(friendshipId)
          break
      }
      window.location.reload()
    } finally {
      setIsLoading(null)
    }
  }

  const filteredSuggested = suggestedFriends.filter(
    (user) =>
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Add ads to friend lists
  const friendsWithAds = []
  friends.forEach((friendship, index) => {
    friendsWithAds.push(
      <Card key={friendship.id}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/profile/${friendship.friend.username}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={friendship.friend.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {friendship.friend.display_name?.charAt(0) || friendship.friend.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link href={`/profile/${friendship.friend.username}`}>
                <h3 className="font-semibold hover:text-purple-600">{friendship.friend.display_name}</h3>
                <p className="text-sm text-gray-500">@{friendship.friend.username}</p>
              </Link>
            </div>
          </div>

          {(friendship.friend.city || friendship.friend.state_region || friendship.friend.country) && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              {[friendship.friend.city, friendship.friend.state_region, friendship.friend.country]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Friends since {new Date(friendship.updated_at).toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFriendAction("remove", friendship.friend.id, friendship.id)}
              disabled={isLoading === friendship.friend.id}
            >
              <UserX className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>,
    )

    // Add ad after every 6 friends
    if ((index + 1) % 6 === 0) {
      friendsWithAds.push(<AdSpace key={`friends-ad-${index}`} position="feed-middle" />)
    }
  })

  const suggestedWithAds = []
  filteredSuggested.forEach((user, index) => {
    suggestedWithAds.push(
      <Card key={user.id}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/profile/${user.username}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{user.display_name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link href={`/profile/${user.username}`}>
                <h3 className="font-semibold hover:text-purple-600">{user.display_name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </Link>
            </div>
          </div>

          {(user.city || user.state_region || user.country) && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              {[user.city, user.state_region, user.country].filter(Boolean).join(", ")}
            </div>
          )}

          {user.favorite_genres && user.favorite_genres.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Music className="w-4 h-4 mr-1" />
                Favorite Genres
              </div>
              <div className="flex flex-wrap gap-1">
                {user.favorite_genres.slice(0, 3).map((genre: string) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {user.favorite_genres.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.favorite_genres.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => handleFriendAction("send", user.id)}
            disabled={isLoading === user.id}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isLoading === user.id ? "Sending..." : "Add Friend"}
          </Button>
        </CardContent>
      </Card>,
    )

    // Add ad after every 8 suggested friends
    if ((index + 1) % 8 === 0) {
      suggestedWithAds.push(<AdSpace key={`suggested-ad-${index}`} position="feed-middle" />)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Ad */}
        <AdSpace position="feed-top" />

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Friends</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Requests ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sent ({outgoingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends" className="mt-6">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You don't have any friends yet</p>
                  <Button onClick={() => document.querySelector('[value="discover"]')?.click()}>
                    Discover Friends
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{friendsWithAds}</div>
            )}
          </TabsContent>

          {/* Incoming Requests */}
          <TabsContent value="requests" className="mt-6">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending friend requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Link href={`/profile/${request.users.username}`}>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={request.users.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {request.users.display_name?.charAt(0) || request.users.username?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link href={`/profile/${request.users.username}`}>
                              <h3 className="font-semibold hover:text-purple-600">{request.users.display_name}</h3>
                              <p className="text-sm text-gray-500">@{request.users.username}</p>
                            </Link>
                            {(request.users.city || request.users.state_region || request.users.country) && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {[request.users.city, request.users.state_region, request.users.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleFriendAction("accept", request.users.id, request.id)}
                            disabled={isLoading === request.users.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFriendAction("decline", request.users.id, request.id)}
                            disabled={isLoading === request.users.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent" className="mt-6">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending sent requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Link href={`/profile/${request.users.username}`}>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={request.users.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {request.users.display_name?.charAt(0) || request.users.username?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link href={`/profile/${request.users.username}`}>
                              <h3 className="font-semibold hover:text-purple-600">{request.users.display_name}</h3>
                              <p className="text-sm text-gray-500">@{request.users.username}</p>
                            </Link>
                            <p className="text-xs text-gray-400">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Friends */}
          <TabsContent value="discover" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{suggestedWithAds}</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
