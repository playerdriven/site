import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).default(
    'PENDING'
  ),
  votes: integer('votes').default(0),
  order: integer('order'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  userId: text('user_id'),
})

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  rawgId: integer('rawg_id').unique().notNull(),
  backgroundImage: text('background_image'),
})

export const categoryGames = sqliteTable('category_games', {
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Define relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  games: many(categoryGames),
}))

export const gamesRelations = relations(games, ({ many }) => ({
  categories: many(categoryGames),
}))

export const categoryGamesRelations = relations(categoryGames, ({ one }) => ({
  category: one(categories, {
    fields: [categoryGames.categoryId],
    references: [categories.id],
  }),
  game: one(games, {
    fields: [categoryGames.gameId],
    references: [games.id],
  }),
}))
