import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
    }),

    capelas: defineCollection({
      type: 'page',
      source: 'capelas/*.md',
      schema: z.object({
        name: z.string(),
        type: z.enum(['matriz', 'branch']),
        address: z.string(),
        images: z.array(z.string()).default([]),
        masses: z.array(
          z.object({
            days: z.array(z.number()),
            times: z.array(z.string()),
          })
        ).default([]),
        confession: z.array(
          z.object({
            time_start: z.string(),
            time_end: z.string(),
            days: z.array(z.number()),
          })
        ).default([]),
        catechism: z.array(
          z.object({
            group: z.string(),
            days: z.array(z.number()),
            time: z.string(),
          })
        ).default([]),
      }),
    }),
  },
})
