import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// @ts-ignore - CRXJS handles manifest.json import
import manifest from './manifest.json'

export default defineConfig({
    plugins: [react(), crx({ manifest }), tailwindcss()],
    // build: {
    //   sourcemap: true, // Enable source maps for debugging
    // },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
    },
})
