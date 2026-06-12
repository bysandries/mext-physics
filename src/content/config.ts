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

const practice = defineCollection({
  type: 'data',
  schema: z.object({
    topicId: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      source: z.string(),
      question: z.string(),
      answer: z.string(),
    })),
  }),
});

const questions = defineCollection({
  type: 'data',
  schema: z.object({
    topicId: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      source: z.string(),
      question: z.string(),
      choices: z.array(z.string()).min(4).max(6),
      correctIndex: z.number(),
      explanation: z.string(),
    })),
  }),
});

export const collections = { topics, questions, practice };
