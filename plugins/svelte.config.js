import sveltePreprocess from 'svelte-preprocess'

const isEnvDevelopment = process.env.NODE_ENV === 'development'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    sourceMap: isEnvDevelopment,
    scss: true,
    postcss: true,
    typescript: true,
  }),
}
