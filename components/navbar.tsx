import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Home, User, Settings, Users, ListMusic, LogOut, Smartphone } from "lucide-react"
import { logoutUser, logoutAllDevices } from "@/app/actions/auth"

interface NavbarProps {
  user: any
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/feed" className="text-2xl font-bold text-purple-600">
            Gotta Listen
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search songs, artists, or users..." className="pl-10" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/feed">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Feed
              </Button>
            </Link>
            <Link href="/post/new">
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Post
              </Button>
            </Link>
            <Link href={`/profile/${user?.username}`}>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </Button>
            </Link>
            <Link href="/playlists">
              <Button variant="ghost" size="sm">
                <ListMusic className="w-4 h-4 mr-2" />
                Playlists
              </Button>
            </Link>

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{user?.display_name?.charAt(0) || user?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.display_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">@{user?.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutUser}>
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={logoutAllDevices}>
                    <button type="submit" className="flex w-full items-center text-red-600">
                      <Smartphone className="mr-2 h-4 w-4" />
                      <span>Log out all devices</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
