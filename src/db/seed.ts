import { eq } from 'drizzle-orm'

import { db } from '.'
import { categories, categoryGames, games } from './schema'

async function seed() {
  // First, create or update all games
  const gamesData = [
    // Best Story games
    {
      id: crypto.randomUUID(),
      name: "Baldur's Gate 3",
      slug: 'baldurs-gate-3',
      rawgId: 494384,
    },
    {
      id: crypto.randomUUID(),
      name: 'Alan Wake 2',
      slug: 'alan-wake-2',
      rawgId: 494859,
    },
    {
      id: crypto.randomUUID(),
      name: 'Final Fantasy XVI',
      slug: 'final-fantasy-xvi',
      rawgId: 452642,
    },
    // Best Gameplay games
    {
      id: crypto.randomUUID(),
      name: "Marvel's Spider-Man 2",
      slug: 'marvels-spider-man-2',
      rawgId: 494385,
    },
    {
      id: crypto.randomUUID(),
      name: 'Street Fighter 6',
      slug: 'street-fighter-6',
      rawgId: 495654,
    },
    {
      id: crypto.randomUUID(),
      name: 'Hi-Fi Rush',
      slug: 'hi-fi-rush',
      rawgId: 892092,
    },
    // Best Indie games
    {
      id: crypto.randomUUID(),
      name: 'Sea of Stars',
      slug: 'sea-of-stars',
      rawgId: 452638,
    },
    {
      id: crypto.randomUUID(),
      name: 'Cocoon',
      slug: 'cocoon',
      rawgId: 889665,
    },
    {
      id: crypto.randomUUID(),
      name: 'Dave the Diver',
      slug: 'dave-the-diver',
      rawgId: 785220,
    },
    // Most Innovative
    {
      id: crypto.randomUUID(),
      name: 'Viewfinder',
      slug: 'viewfinder',
      rawgId: 736011,
    },
    {
      id: crypto.randomUUID(),
      name: 'Humanity',
      slug: 'humanity',
      rawgId: 897533,
    },
    {
      id: crypto.randomUUID(),
      name: 'Party Animals',
      slug: 'party-animals',
      rawgId: 450942,
    },
  ]

  // Upsert games
  for (const game of gamesData) {
    await db
      .insert(games)
      .values(game)
      .onConflictDoUpdate({
        target: games.slug,
        set: {
          name: game.name,
          rawgId: game.rawgId,
        },
      })
  }

  // Create or update categories
  const categoriesData = [
    {
      id: crypto.randomUUID(),
      title: 'Best Story',
      description:
        'Games that set new standards in storytelling, featuring compelling narratives, memorable characters, and emotional depth.',
      slug: 'best-story',
      status: 'APPROVED',
      order: 1,
      votes: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Best Gameplay',
      description:
        'Excellence in game mechanics, controls, and player engagement. These games define what makes playing games fun.',
      slug: 'best-gameplay',
      status: 'APPROVED',
      order: 2,
      votes: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Best Indie',
      description:
        'Outstanding games from independent developers that showcase creativity, innovation, and artistic vision.',
      slug: 'best-indie',
      status: 'APPROVED',
      order: 3,
      votes: 0,
    },
    {
      id: crypto.randomUUID(),
      title: 'Most Innovative',
      description:
        'Games that push boundaries and introduce fresh ideas, mechanics, or technologies to the medium.',
      slug: 'most-innovative',
      status: 'APPROVED',
      order: 4,
      votes: 0,
    },
  ] as const

  // Upsert categories
  for (const category of categoriesData) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          title: category.title,
          description: category.description,
          status: category.status,
          order: category.order,
        },
      })
  }

  // Get the actual IDs of inserted/updated records
  const insertedGames = await Promise.all(
    gamesData.map(async (game) => {
      const result = await db.query.games.findFirst({
        where: eq(games.slug, game.slug),
      })
      return { ...game, id: result!.id }
    })
  )

  const insertedCategories = await Promise.all(
    categoriesData.map(async (category) => {
      const result = await db.query.categories.findFirst({
        where: eq(categories.slug, category.slug),
      })
      return { ...category, id: result!.id }
    })
  )

  // Delete existing category-game relationships and recreate them
  for (let i = 0; i < insertedCategories.length; i++) {
    const category = insertedCategories[i]
    const startIdx = i * 3
    const categoryGamesData = insertedGames.slice(startIdx, startIdx + 3)

    // Delete existing relationships for this category
    await db
      .delete(categoryGames)
      .where(eq(categoryGames.categoryId, category.id))

    // Create new relationships
    await db.insert(categoryGames).values(
      categoryGamesData.map((game) => ({
        categoryId: category.id,
        gameId: game.id,
      }))
    )
  }

  console.log('Seed completed successfully!')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
