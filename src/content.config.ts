import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { aboutIdFromEntry, postIdFromEntry } from "./lib/content/ids";

const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => postIdFromEntry(entry),
  }),
  schema: z.object({
    title: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const about = defineCollection({
  loader: glob({
    base: "./src/content/about",
    pattern: "*.{md,mdx}",
    generateId: ({ entry }) => aboutIdFromEntry(entry),
  }),
  schema: z.object({}),
});

export const collections = { about, posts };
