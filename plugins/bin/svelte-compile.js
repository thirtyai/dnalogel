#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const glob = require('glob')
const path = require('path')
const replace = require('replace')
const sveltePreprocessor = require('svelte-preprocess')
const { compile, preprocess } = require('svelte/compiler')
const { readFile, writeFile, unlink } = require('fs/promises')
const postcssConfig = require('../postcss.config')
const libsPath = path.resolve(path.resolve(), 'libs')

replace({
  regex: /\.svelte/g,
  replacement: '',
  paths: [libsPath],
  recursive: true,
})
const processes = sveltePreprocessor({
  scss: {},
  postcss: {
    plugins: postcssConfig.plugins,
  },
})

const sveltes = glob.sync('**/*.svelte', { cwd: libsPath })

const run = async () => {
  for (const svelte1 of sveltes.map((svelte) => path.resolve(libsPath, svelte))) {
    let code = (await readFile(svelte1)).toString()
    code = await preprocess(code, processes)
    const { js } = compile(code.code, { css: true })
    await writeFile(svelte1.replace('.svelte', '.js'), js.code)
    await unlink(path.resolve(libsPath, svelte1))
  }
}

run().then((r) => console.log('✨ svelte compile done！ ✨'))
