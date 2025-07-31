"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Home, Users, User, LogOut, Plus, Settings, Music, Shield } from "lucide-react"
import { logoutUser } from "@/app/actions/auth"
import { ModeToggle } from "./mode-toggle"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface NavigationProps {
  user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_admin?: boolean // Add is_admin to user type
  }
}

export function Navigation({ user }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setSearchResults(null)
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/feed" className="flex items-center space-x-2">
            <div className="relative">
              <Music className="w-8 h-8 text-purple-600 floating-animation" />
              <div className="absolute -inset-1 pulse-ring opacity-20 w-10 h-10"></div>
            </div>
            <span className="text-xl font-bold music-gradient-text">Gotta Listen</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900/50">
                <Home className="w-4 h-4 mr-2" />
                Feed
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900/50">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </Button>
            </Link>
            {user.is_admin && ( // Conditionally render admin link
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900/50">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search songs, artists, or users..."
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.posts && searchResults.posts.length > 0 && (
                <div className="p-2">
                  <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Songs</h4>
                  {searchResults.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/feed#${post.id}`}
                      className="block p-2 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded"
                    >
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">by {post.artist}</p>
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.users && searchResults.users.length > 0 && (
                <div className="p-2 border-t border-purple-100 dark:border-purple-800">
                  <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Users</h4>
                  {searchResults.users.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center space-x-2 p-2 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/create">
            <Button size="sm" className="music-button">
              <Plus className="w-4 h-4 mr-2" />
              Share Song
            </Button>
          </Link>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50"
              >
                <Avatar className="h-8 w-8 ring-2 ring-purple-200 dark:ring-purple-800">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
              align="end"
              forceMount
            >
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.username}`} className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {user.is_admin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="hover:bg-purple-50 dark:hover:bg-purple-900/50">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <form action={logoutUser}>
                  <button className="flex w-full items-center hover:bg-red-50 dark:hover:bg-red-900/50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
