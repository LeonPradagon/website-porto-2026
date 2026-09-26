import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import viteReact from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [tanstackStart(), ...(command === 'build' ? [netlify()] : []), viteReact()],
}))
