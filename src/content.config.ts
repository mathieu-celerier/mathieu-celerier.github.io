import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),

    // Optional: show a “Read more” page for this item
    hasPage: z.boolean().default(false),

    // Optional: if it’s just a link announcement
    externalUrl: z.string().url().optional(),

    // Optional: tagging
    tags: z.array(z.string()).default([])
  })
})

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    year: z.number(),
    venue: z.string().optional(),
    type: z.enum(['journal', 'conference', 'workshop', 'preprint', 'thesis', 'demo', 'other']),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    website: z.string().url().optional(),
    pdf: z.string().optional(), // local path under /public or external URL
    code: z.string().url().optional(),
    video: z.string().url().optional(),
    featured: z.boolean().optional(),
    highlights: z.array(z.string()).optional(),
    citations: z.number().int().nonnegative().optional(),
    bibkey: z.string()
  })
})

// Empty for now (no blog posts), but the theme's own utilities (packages/pure/utils/server.ts)
// are statically typed against this collection existing, so keep it declared.
const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Required
  schema: ({ image }) =>
    z.object({
      // Required
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: z.coerce.date(),
      // Optional
      updatedDate: z.coerce.date().optional(),
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional(),
          inferSize: z.boolean().optional(),
          width: z.number().optional(),
          height: z.number().optional(),

          color: z.string().optional()
        })
        .optional(),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
      language: z.string().optional(),
      draft: z.boolean().default(false),
      // Special fields
      comment: z.boolean().default(true)
    })
})

export const collections = { news, publications, blog }
