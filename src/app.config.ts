import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  tsr: {
    routeTreeFile: './src/routeTree.gen.ts',
  },
})
