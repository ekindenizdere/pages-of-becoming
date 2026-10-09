import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per piece in src/content/pieces/. Footnotes use [^1] markers.
const pieces = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pieces' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['opinion', 'article']),
    status: z.enum(['published', 'upcoming']),
    order: z.number(),            // position within its section
    dedication: z.string().optional(),
    teaser: z.string().optional(),  // shown for upcoming pieces
    date: z.coerce.date().optional(),
    keywords: z.array(z.string()).optional(),  // automatic: the words most particular to this piece (shown small, after the text)
  }),
});

// German and Turkish versions in translations/<lang>/, same filenames as the English pieces.
const translations = defineCollection({
  loader: glob({ pattern: '{de,tr}/*.md', base: './translations' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['opinion', 'article']),
    status: z.enum(['published', 'upcoming']),
    order: z.number(),
    lang: z.enum(['de', 'tr']),
    source: z.string(),
    dedication: z.string().optional(),
    teaser: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

export const collections = { pieces, translations };
