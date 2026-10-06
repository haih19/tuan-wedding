import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
if (process.env.VERCEL && !process.env.SITE_URL) {
  throw new Error(
    'Set SITE_URL to the real public wedding URL in Vercel before building.',
  );
}
export default defineConfig({
  output: 'static',
  redirects: { '/': { status: 302, destination: '/bride/' } },
  adapter: vercel(),
  site: process.env.SITE_URL || 'https://wedding.example.com',
  vite: { plugins: [tailwindcss()] },
});
