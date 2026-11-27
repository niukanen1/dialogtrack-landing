import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const keys = ['SITE_URL', 'SITE_DOMAIN', 'SITE_BASE_PATH', 'SITE_PRICING', 'VITE_FORM_ENDPOINT', 'VITE_TURNSTILE_SITEKEY']
export default defineConfig({
  base: process.env.SITE_BASE_PATH || '/',
  plugins: [vue()],
  define: { __SITE_ENV__: JSON.stringify(Object.fromEntries(keys.map(key => [key, process.env[key]]))) },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
