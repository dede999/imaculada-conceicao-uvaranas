import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
    }),

    events: defineCollection({
      type: 'page',
      source: 'events/*.md',
      schema: z.object({
        title: z.string(),
        type: z.enum(['event', 'announcement']),
        date: z.string(),
        end_date: z.string().optional(),
        status: z.enum(['active', 'cancelled', 'postponed']),
        summary: z.string(),
      }),
    }),

    noticias: defineCollection({
      type: 'page',
      source: 'noticias/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        summary: z.string(),
      }),
    }),

    capelas: defineCollection({
      type: 'page',
      source: 'capelas/*.md',
      schema: z.object({
        name: z.string(),
        type: z.enum(['matriz', 'branch']),
        address: z.string(),
        images: z.array(z.string()).default([]),
        pastor: z.string().optional(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number(),
        }).optional(),
        contact: z.object({
          phone: z.string().optional(),
          whatsapp: z.string().optional(),
          email: z.string().optional(),
        }).optional(),
        social: z.object({
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          youtube: z.string().optional(),
        }).optional(),
        masses: z.array(
          z.object({
            days: z.array(z.number()),
            times: z.array(z.string()),
            note: z.string().optional(),
            note_only_on: z.array(z.number()).optional(),
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
