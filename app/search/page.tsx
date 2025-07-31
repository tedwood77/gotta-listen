import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { SearchResults } from "@/components/search-results"

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await requireAuth()
  const params = await searchParams
  const query = (params.q as string) || ""

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <SearchResults query={query} currentUser={user} />
    </div>
  )
}
