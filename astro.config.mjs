import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://bysandries.github.io',
  base: '/mext-physics/',
  integrations: [preact()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    syntaxHighlight: false,
  },
  vite: {
    ssr: { noExternal: ['katex'] },
  },
});
