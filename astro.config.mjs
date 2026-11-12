// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkStripComments from './src/remark-strip-comments.mjs';

export default defineConfig({
  site: 'https://convergentblue.com',
  integrations: [sitemap({ filter: (page) => !/\/armory\//.test(page) })],  // /armory/ stays unlisted; /bot/ is public
  // `npm run dev` has no Worker, so the armory page reads its (public, read-only) data from the live site
  vite: { server: { proxy: { '/api/bot/armory': { target: 'https://convergentblue.com', changeOrigin: true } } } },
  markdown: {
    // remark-math + KaTeX: write $x^2$ inline or $$...$$ for display math
    processor: unified({ remarkPlugins: [remarkMath, remarkStripComments], rehypePlugins: [rehypeKatex] }),
  },
});
