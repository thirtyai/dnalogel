import path from 'path'
import glob from 'glob'
import { fileURLToPath } from 'url'
import { defineConfig, mergeConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'
import { dependencies } from './package.json'

const appRoot = __dirname
const appSrc = path.resolve(appRoot, 'src')

export default defineConfig(({ mode }) => {
  const isEnvProduction = mode === 'production'
  const isEnvDevelopment = mode === 'development'

  const baseConfig = {
    mode,
    define: {
      __DNALOGEL_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [svelte({ emitCss: false, prebundleSvelteLibraries: true, hot: false })],
    appType: 'custom',
    build: {
      target: 'es2015',
      modulePreload: false,
      assetsInlineLimit: Infinity,
      cssCodeSplit: false,
      sourcemap: isEnvDevelopment ? 'inline' : false,
      commonjsOptions: {
        strictRequires: false,
        transformMixedEsModules: true,
        esmExternals: true,
        //   defaultIsModuleExports: false,
      },
      rollupOptions: {
        maxParallelFileOps: 128,
        external: [
          '@realsee/five',
          '@realsee/five/line',
          'three',
          'three/examples/jsm/renderers/CSS3DRenderer',
          'three/examples/jsm/loaders/FBXLoader',
          'swiper/css',
          'swiper/css/autoplay',
          ...Object.keys(dependencies),
        ],
        output: {
          globals: {
            three: 'THREE',
            'three/examples/jsm/renderers/CSS3DRenderer': 'CSS3DRenderer',
            'three/examples/jsm/loaders/FBXLoader': 'FBXLoader',
            '@realsee/five': 'FiveSDK',
            '@realsee/five/line': 'Line',
            '@tweenjs/tween.js': 'TWEEN',
            hammerjs: 'Hammer',
            classnames: 'classNames',
            'polyline-normals': 'getNormals',
            'object-assign-deep': 'objectAssignDeep',
            animejs: 'anime',
            swiper: 'Swiper',
          },
          minifyInternalExports: false,
        },
      },
      minify: isEnvProduction ? 'esbuild' : false,
      write: true,
      emptyOutDir: isEnvProduction,
      copyPublicDir: false,
      reportCompressedSize: isEnvProduction,
      chunkSizeWarningLimit: Infinity,
      watch: isEnvDevelopment
        ? {
            buildDelay: 300, // milliseconds
          }
        : null,
    },
    optimizeDeps: {
      esbuildOptions: {
        keepNames: true,
      },
    },
  }

  const config = (() => {
    const buildModule = process.env.BUILD_MODULE
    switch (buildModule) {
      case 'dist': {
        // 打包dist
        return {
          build: {
            outDir: path.resolve(appRoot, 'dist'),
            lib: {
              entry: path.resolve(appSrc, 'index.ts'),
              name: 'dnalogel',
              formats: ['es', 'cjs', 'umd'],
              fileName: (format, entryName) => (format === 'es' ? `${entryName}.js` : `${entryName}.${format}.js`),
            },
          },
          plugins: [
            dts({
              exclude: ['src/**/*.js'],
            }),
          ],
        }
      }
      case 'components': {
        // 打包components
        return {
          build: {
            outDir: path.resolve(appRoot, 'components'),
            lib: {
              entry: path.resolve(appSrc, 'components/index.ts'),
              name: 'dnalogel',
              formats: ['es'],
              fileName: (_, entryName) => `${entryName}.js`,
            },
          },
        }
      }
      case 'libs': // 打包libs
      default: {
        // 默认打包libs, cjs
        return {
          build: {
            outDir: path.resolve(appRoot, 'libs'),
            rollupOptions: {
              output: {
                manualChunks: (id, helpers) => {
                  if (id.includes('node_modules')) {
                    const name = path.relative('node_modules', id.slice(id.lastIndexOf('node_modules')))
                    return 'vendor/' + name.replace(path.extname(name), '')
                  } else {
                    let filename = path.relative(appSrc, id)
                    filename = filename.replace(path.extname(filename), '')
                    const info = helpers.getModuleInfo(id)
                    return info.isEntry ? `${filename}/index` : filename
                  }
                },
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
              },
            },
            lib: {
              entry: Object.fromEntries(
                glob
                  .sync(path.resolve(appSrc, './**/*.*'))
                  .filter((filepath) => /\.(j|t)s(x)|\.svelte/.test(filepath) && !filepath.endsWith('.d.ts'))
                  .map((file) => [
                    // This remove `src/` as well as the file extension from each file, so e.g.
                    // src/nested/foo.js becomes nested/foo
                    path.relative(appSrc, file.slice(0, file.length - path.extname(file).length)),
                    // This expands the relative paths to absolute paths, so e.g.
                    // src/nested/foo becomes /project/src/nested/foo.js
                    fileURLToPath(new URL(file, import.meta.url)),
                  ])
                  .concat([['index', path.resolve(appSrc, 'index.ts')]]),
              ),
              formats: ['es'],
            },
          },
          plugins: [
            dts({
              exclude: ['src/**/*.js'],
            }),
          ],
        }
      }
    }
  })()

  const finalConfig = mergeConfig(baseConfig, config, true)
  return finalConfig
})
