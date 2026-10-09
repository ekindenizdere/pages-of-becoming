// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves this project at ekindenizdere.github.io/pages-of-becoming.
// Once a custom domain is added: set `site` to it and remove `base`.
export default defineConfig({
  site: 'https://ekindenizdere.github.io',
  base: '/pages-of-becoming',
  trailingSlash: 'always',
});
