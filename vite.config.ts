import { defineConfig } from 'vite';

// No explicit server.port: Vite defaults to 5173 (README quick-start).
export default defineConfig({
  build: {
    target: 'es2020',
  },
});
