import { db } from '..'

export interface CategoryGame {
  name: string
  rawgId: number
  slug: string
  backgroundImage?: string
}

export interface Category {
  id: string
  slug: string
  title: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  votes: number
  order: number | null
  featured: CategoryGame[]
}

export async function getCategories() {
  const categories = await db.query.categories.findMany({
    where: (categories, { eq }) => eq(categories.status, 'APPROVED'),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      games: {
        with: {
          game: true,
        },
      },
    },
  })

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    status: category.status,
    votes: category.votes,
    order: category.order,
    featured: category.games.map((relation) => ({
      name: relation.game.name,
      rawgId: relation.game.rawgId,
      slug: relation.game.slug,
      backgroundImage: relation.game.backgroundImage ?? undefined,
    })),
  }))
}
