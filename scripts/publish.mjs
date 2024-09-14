#!/usr/bin/env zx

import 'zx/globals'
import process from 'node:process'
import { join } from 'node:path'
import pacote from 'pacote'
import consola from 'consola'

const root = process.cwd()

const packages = [
  'iter',
  'utils',
  'ts-result',
  'wechat-oauth',
  'wechat-pay-sdk',
  'wechat-miniprogram-server-sdk',
]

for (const pkg of packages) {
  const packageFile = fs.readJSONSync(join(root, 'packages', pkg, 'package.json'))
  const name = packageFile.name
  const version = packageFile.version

  await pacote.manifest(`${name}@${version}`)
    .then(() => {
      consola.info(`[skip] publish ${name}@${version}`)
    })
    .catch(async (_) => {
      await $`cd packages/${pkg} && pnpm publish --access public`
    })
}
