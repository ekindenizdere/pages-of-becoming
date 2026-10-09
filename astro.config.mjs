// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypePiece from './src/plugins/rehype-piece.mjs';

// GitHub Pages serves this project at ekindenizdere.github.io/pages-of-becoming.
// Once a custom domain is added: set `site` to it and remove `base`.
export default defineConfig({
  site: 'https://ekindenizdere.github.io',
  base: '/pages-of-becoming',
  trailingSlash: 'always',
  // every piece is shaped by the piece template (people, concepts, italics, etymology): see src/plugins/rehype-piece.mjs
  markdown: { processor: unified({ rehypePlugins: [rehypePiece] }) },
});
