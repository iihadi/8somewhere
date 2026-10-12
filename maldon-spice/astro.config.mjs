// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maldonspice.co.uk',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Keep every script external so the Content-Security-Policy can stay script-src 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
