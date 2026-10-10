import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    legacy: z.boolean().default(false),
    cover: z.string().optional(),            // thumbnail; defaults to the first image in the post
    coverFit: z.enum(['cover', 'contain']).default('cover'),  // 'contain' for charts that shouldn't be cropped
    demo: z.string().optional(),             // link to an interactive demo; shows a 'Live demo' badge // imported from the old divergentblue.com blog
  }),
});


export const collections = { blog };
