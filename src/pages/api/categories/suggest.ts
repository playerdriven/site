import type { APIRoute } from 'astro'

import { queries } from '@/db'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const categoryId = await queries.createCategory(body)

    return new Response(JSON.stringify({ id: categoryId }), { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create category' }),
      {
        status: 500,
      }
    )
  }
}
