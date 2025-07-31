"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "./post-card"
import { Search, Music, Users, Hash } from "lucide-react"
import Link from "next/link"

interface SearchResultsProps {
  query: string
  currentUser: any
}

export function SearchResults({ query, currentUser }: SearchResultsProps) {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Searching...</p>
        </div>
      </div>
    )
  }

  const totalResults = (results.posts?.length || 0) + (results.users?.length || 0) + (results.genres?.length || 0)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold music-gradient-text mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {totalResults > 0 ? `Found ${totalResults} results for "${query}"` : `No results found for "${query}"`}
          </p>
        </div>

        {totalResults > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="posts">
                <Music className="w-4 h-4 mr-2" />
                Songs ({results.posts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users ({results.users?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="genres">
                <Hash className="w-4 h-4 mr-2" />
                Genres ({results.genres?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {/* Posts */}
              {results.posts && results.posts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 music-gradient-text">Songs</h3>
                  <div className="space-y-4">
                    {results.posts.slice(0, 3).map((post: any) => (
                      <PostCard key={post.id} post={post} currentUser={currentUser} />
                    ))}
                  </div>
                  {results.posts.length > 3 && (
                    <p className="text-sm text-muted-foreground mt-4">And {results.posts.length - 3} more songs...</p>
                  )}
                </div>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 music-gradient-text">Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.slice(0, 6).map((user: any) => (
                      <Card key={user.id} className="music-card shadow-lg">
                        <CardContent className="p-4">
                          <Link href={`/profile/${user.username}`} className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
                              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                {user.full_name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate music-gradient-text">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Genres */}
              {results.genres && results.genres.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 music-gradient-text">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.genres.map((genre: any) => (
                      <Badge
                        key={genre.id}
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-6 mt-6">
              {results.posts && results.posts.length > 0 ? (
                results.posts.map((post: any) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
              ) : (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No songs found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              {results.users && results.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user: any) => (
                    <Card key={user.id} className="music-card shadow-lg">
                      <CardContent className="p-4">
                        <Link href={`/profile/${user.username}`} className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                              {user.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate music-gradient-text">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="genres" className="mt-6">
              {results.genres && results.genres.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {results.genres.map((genre: any) => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 cursor-pointer hover:scale-105 transition-transform p-3 text-base"
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Hash className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No genres found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="music-card shadow-lg">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try searching for different keywords or check your spelling.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
