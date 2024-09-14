import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts', './src/globals.ts'],
  dts: true,
  format: ['cjs', 'esm'],
  clean: true,
  splitting: true,
})
