"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Users, MapPin, TrendingUp, Music } from "lucide-react"
import { useState } from "react"

interface FeedFiltersProps {
  genres: any[]
  onFilterChange: (filters: any) => void
}

export function FeedFilters({ genres, onFilterChange }: FeedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState({
    feedType: "global",
    location: "all",
    genres: [] as string[],
  })

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleGenre = (genreId: string) => {
    const newGenres = activeFilters.genres.includes(genreId)
      ? activeFilters.genres.filter((id) => id !== genreId)
      : [...activeFilters.genres, genreId]

    updateFilter("genres", newGenres)
  }

  return (
    <div className="space-y-4">
      <Card className="music-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center music-gradient-text">
            <Music className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Feed Type</h4>
            <div className="space-y-2">
              <Button
                variant={activeFilters.feedType === "global" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("feedType", "global")}
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Feed
              </Button>
              <Button
                variant={activeFilters.feedType === "friends" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("feedType", "friends")}
              >
                <Users className="w-4 h-4 mr-2" />
                Friends Only
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Location</h4>
            <div className="space-y-2">
              <Button
                variant={activeFilters.location === "all" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("location", "all")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                All Locations
              </Button>
              <Button
                variant={activeFilters.location === "country" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("location", "country")}
              >
                My Country
              </Button>
              <Button
                variant={activeFilters.location === "state" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("location", "state")}
              >
                My State
              </Button>
              <Button
                variant={activeFilters.location === "city" ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => updateFilter("location", "city")}
              >
                My City
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {genres?.slice(0, 10).map((genre) => (
                <Badge
                  key={genre.id}
                  variant={activeFilters.genres.includes(genre.id.toString()) ? "default" : "outline"}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => toggleGenre(genre.id.toString())}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="music-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center music-gradient-text">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">#indie</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <span className="text-lg">🎵</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">#newmusic</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <span className="text-lg">🎸</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">#rock</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <span className="text-lg">🎤</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">#vocals</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
