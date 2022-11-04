import sveltePreprocess from 'svelte-preprocess'
import { plugins } from './postcss.config.js'

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    scss: {},
    postcss: { plugins },
  }),
}
