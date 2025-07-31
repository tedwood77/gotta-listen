import { createServerClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, Clock } from "lucide-react"
import Link from "next/link"
import { respondToFriendRequest } from "@/app/actions/friends"

interface FriendsContentProps {
  user: {
    id: string
    username: string
    full_name: string
  }
}

export async function FriendsContent({ user }: FriendsContentProps) {
  const supabase = createServerClient()

  // Get accepted friends
  const { data: friends } = await supabase
    .from("friendships")
    .select(`
      *,
      requester:users!friendships_requester_id_fkey (id, username, full_name, avatar_url),
      addressee:users!friendships_addressee_id_fkey (id, username, full_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted")

  // Get pending requests (received)
  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select(`
      *,
      requester:users!friendships_requester_id_fkey (id, username, full_name, avatar_url)
    `)
    .eq("addressee_id", user.id)
    .eq("status", "pending")

  // Get sent requests
  const { data: sentRequests } = await supabase
    .from("friendships")
    .select(`
      *,
      addressee:users!friendships_addressee_id_fkey (id, username, full_name, avatar_url)
    `)
    .eq("requester_id", user.id)
    .eq("status", "pending")

  const FriendCard = ({ friend, friendship, showActions = false }: any) => {
    const friendUser = friend.requester?.id === user.id ? friend.addressee : friend.requester

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={friendUser?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {friendUser?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${friendUser?.username}`} className="font-semibold hover:underline">
                  {friendUser?.full_name}
                </Link>
                <p className="text-sm text-muted-foreground">@{friendUser?.username}</p>
              </div>
            </div>

            {showActions && (
              <div className="flex space-x-2">
                <form action={respondToFriendRequest.bind(null, friendship.id, "accepted")}>
                  <Button size="sm">Accept</Button>
                </form>
                <form action={respondToFriendRequest.bind(null, friendship.id, "declined")}>
                  <Button variant="outline" size="sm">
                    Decline
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Friends ({friends?.length || 0})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({pendingRequests?.length || 0})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentRequests?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4 mt-6">
            {friends && friends.length > 0 ? (
              friends.map((friendship) => (
                <FriendCard key={friendship.id} friend={friendship} friendship={friendship} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No friends yet. Start connecting with other music lovers!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-6">
            {pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <FriendCard key={request.id} friend={request} friendship={request} showActions={true} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending friend requests.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4 mt-6">
            {sentRequests && sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.addressee?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {request.addressee?.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${request.addressee?.username}`}
                            className="font-semibold hover:underline"
                          >
                            {request.addressee?.full_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">@{request.addressee?.username}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Pending
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sent requests.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
