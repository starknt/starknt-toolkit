import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index', './src/fetch'],
  rollup: {
    emitCJS: true,
  },
  declaration: true,
  clean: true,
})
