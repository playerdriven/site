import { createClient } from '@libsql/client'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema'

const client = createClient({
  url: import.meta.env.TURSO_DB_URL,
  authToken: import.meta.env.TURSO_DB_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

// Type-safe query builders
export const queries = {
  getApprovedCategories: async () => {
    const result = await db
      .select({
        id: schema.categories.id,
        slug: schema.categories.slug,
        title: schema.categories.title,
        description: schema.categories.description,
        status: schema.categories.status,
        votes: schema.categories.votes,
        order: schema.categories.order,
        createdAt: schema.categories.createdAt,
        updatedAt: schema.categories.updatedAt,
        games: {
          id: schema.games.id,
          name: schema.games.name,
          slug: schema.games.slug,
          rawgId: schema.games.rawgId,
          backgroundImage: schema.games.backgroundImage,
        },
      })
      .from(schema.categories)
      .leftJoin(
        schema.categoryGames,
        eq(schema.categoryGames.categoryId, schema.categories.id)
      )
      .leftJoin(schema.games, eq(schema.games.id, schema.categoryGames.gameId))
      .where(eq(schema.categories.status, 'APPROVED'))

    // Group games by category
    const categoriesMap = new Map()
    result.forEach((row) => {
      if (!categoriesMap.has(row.id)) {
        categoriesMap.set(row.id, {
          ...row,
          games: [],
        })
      }
      if (row.games) {
        categoriesMap.get(row.id).games.push(row.games)
      }
    })

    return Array.from(categoriesMap.values())
  },

  createCategory: async (data: {
    title: string
    description: string
    featured: Array<{
      name: string
      rawgId: number
      slug: string
      backgroundImage?: string
    }>
  }) => {
    const categoryId = crypto.randomUUID()

    // First create or get the games
    const gameIds = await Promise.all(
      data.featured.map(async (game) => {
        const existing = await db.query.games.findFirst({
          where: (games, { eq }) => eq(games.rawgId, game.rawgId),
        })

        if (existing) return existing.id

        const gameId = crypto.randomUUID()
        await db.insert(games).values({
          id: gameId,
          name: game.name,
          slug: game.slug,
          rawgId: game.rawgId,
          backgroundImage: game.backgroundImage,
        })
        return gameId
      })
    )

    // Create the category
    await db.insert(categories).values({
      id: categoryId,
      title: data.title,
      description: data.description,
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
    })

    // Create the relationships
    await db.insert(categoryGames).values(
      gameIds.map((gameId) => ({
        categoryId,
        gameId,
      }))
    )

    return categoryId
  },
}
