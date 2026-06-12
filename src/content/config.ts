import { defineCollection, z } from 'astro:content';

const topics = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    number: z.number(),
    title: z.string(),
    part: z.string(),
    partNumber: z.number(),
    anchor: z.string(),
    theory: z.string(),
    formulas: z.array(z.object({
      latex: z.string(),
      description: z.string(),
    })),
    framework: z.array(z.string()),
    problems: z.array(z.object({
      examRef: z.string(),
      title: z.string().default(''),
      year: z.number(),
      parts: z.array(z.object({
        partNum: z.number(),
        title: z.string().default(''),
        parameters: z.string(),
        formulas: z.string(),
        calculations: z.string(),
        answer: z.string(),
        conclusion: z.string(),
      })),
    })),
    connections: z.array(z.string()).default([]),
    tags: z.array(z.string()),
    theoryOnly: z.boolean(),
  }),
});

export const collections = { topics };
