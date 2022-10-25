/**
 * build dist
 */

import * as path from 'path'
import { defineConfig, LibraryOptions } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const external = ['three', '@realsee/five', 'three/examples/jsm/renderers/CSS3DRenderer', 'three/examples/jsm/loaders/FBXLoader', '@realsee/five/line', '@tweenjs/tween.js']

const config: Record<string, LibraryOptions & { outDir: string }> = {
  components: {
    entry: path.resolve(__dirname, "./src/components/index.ts"),
    outDir: path.resolve(__dirname, './components'),
    formats: ['es'],
    fileName: () => 'index.js',
  },
  plugins: {
    entry: path.resolve(__dirname, "./src/index.ts"),
    outDir: path.resolve(__dirname, './dist'),
    fileName: (format) => `index.${format}.js`,
  },
};

const currentConfig = process.env.BUILD_MODULE ? config[process.env.BUILD_MODULE] : undefined

if (currentConfig === undefined) {
  throw new Error('BUILD_MODULE is not defined or is not valid');
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
      __DNALOGEL_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    build: {
      emptyOutDir: false,
      outDir: currentConfig.outDir,
      lib: {
        entry: currentConfig.entry,
        name: 'dnalogel',
        formats: currentConfig.formats ?? (mode === 'development' || process.env.BUILD_MODULE === 'components' ? ['es'] : ['es', 'umd', 'cjs']),
        fileName: currentConfig.fileName,
      },
      rollupOptions: { external },
      reportCompressedSize: mode === 'development' ? false : true,
    },
    plugins: [ svelte({ emitCss: false }) as any ],
    optimizeDeps: { exclude: external },
  }
})



