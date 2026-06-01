import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/websites/splash-studio/' : '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: '/index.html',
        about: '/pages/about.html',
        contacts: '/pages/contacts.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
