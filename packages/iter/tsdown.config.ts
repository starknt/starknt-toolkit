import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/globals.ts'],
  dts: true,
  format: ['cjs', 'esm'],
  clean: true,
  platform: 'neutral',
  sourcemap: true,
  unbundle: true,
})
