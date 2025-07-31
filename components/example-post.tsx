import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Music2 } from "lucide-react"

export function ExamplePost() {
  return (
    <Card className="w-full music-card shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">BJ</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold music-gradient-text">Music Lover</p>
              <p className="text-sm text-muted-foreground">@musicjunkie • 2 hours ago</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700"
          >
            <Music2 className="w-3 h-3 mr-1" />
            Classic Rock
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
          <h3 className="text-lg font-semibold music-gradient-text">Piano Man</h3>
          <p className="text-muted-foreground">by Billy Joel</p>
        </div>

        <div className="w-full rounded-lg overflow-hidden shadow-lg ring-1 ring-purple-200 dark:ring-purple-800">
          <iframe
            src="https://open.spotify.com/embed/track/70C4NyhjD5OZUMzvWZ3njJ?utm_source=generator"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
          <p className="text-sm leading-relaxed">
            This song is a timeless masterpiece! Billy Joel's storytelling is incredible, painting vivid pictures of the
            characters in the bar. The piano melody is iconic, and the lyrics about shared human experiences resonate
            deeply. It's a perfect song for a reflective evening or a sing-along with friends. 🎹
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            #classic
          </Badge>
          <Badge
            variant="outline"
            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            #storytelling
          </Badge>
          <Badge
            variant="outline"
            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            #piano
          </Badge>
          <Badge
            variant="outline"
            className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            #timeless
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-800">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-red-500 bg-red-50 dark:bg-red-950/50">
              <Heart className="w-4 h-4 mr-1 fill-current" />
              24
            </Button>

            <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-950/50">
              <MessageCircle className="w-4 h-4 mr-1" />8
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-950/50">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
