/**
 * build libs
 */

import * as path from 'path'
import glob from 'glob'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const tsFiles = glob.sync(path.resolve(__dirname, './src/**/*.ts'))
const jsFiles = glob.sync(path.resolve(__dirname, './src/**/*.js'))
const svelteFiles = glob.sync(path.resolve(__dirname, './src/**/*.svelte'))
const files = [...jsFiles, ...svelteFiles, ...tsFiles]


// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    define: {
      __DNALOGEL_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    build: {
      emptyOutDir: false, // because need first build ts declaration files in ./libs
      outDir: './libs',
      lib: {
        entry: '',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['three', '@realsee/five', 'three/examples/jsm/renderers/CSS3DRenderer', 'three/examples/jsm/loaders/FBXLoader', '@realsee/five/line', '@tweenjs/tween.js'],
        input: files,
        output: {
          entryFileNames: (entry) => {
            /** {@link https://github.com/vitejs/vite/discussions/8098} */
            const { name, facadeModuleId } = entry;
            const fileName = `${name}.js`;
            if (!facadeModuleId) {
              return fileName;
            }
            const relativeDir = path.relative(
              path.resolve(__dirname, 'src'),
              path.dirname(facadeModuleId),
            );
            return path.join(relativeDir, fileName);
          },
        },
      },
    },
    plugins: [ svelte({ emitCss: false }) as any ]
  }
})



