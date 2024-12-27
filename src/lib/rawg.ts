const RAWG_API_KEY = import.meta.env.PUBLIC_RAWG_API_KEY

if (!RAWG_API_KEY) {
  throw new Error('Missing RAWG_API_KEY environment variable')
}

export interface RAWGGame {
  id: number
  name: string
  background_image: string
  slug: string
}

export async function getGameInfo(gameName: string): Promise<RAWGGame | null> {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameName)}&page_size=1`
    )
    const data = await response.json()

    if (!data.results || data.results.length === 0) return null

    const game = data.results[0]
    return {
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      slug: game.slug,
    }
  } catch (error) {
    console.error(`Error fetching game info for ${gameName}:`, error)
    return null
  }
}
