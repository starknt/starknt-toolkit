import { defineConfig } from 'taze'

export default defineConfig({
  mode: 'major',
  interactive: true,
  ignoreOtherWorkspaces: false,
  recursive: true,
  force: true,
  write: false,
  install: false,
  ignorePaths: [
    '**/node_modules/**',
    '**/test/**',
  ],
})
