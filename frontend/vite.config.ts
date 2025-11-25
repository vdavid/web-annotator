import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
// @ts-ignore - CRXJS handles manifest.json import
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});

