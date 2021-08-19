import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
//  import gloryPreprocess from "../src/index.js"
import gloryPreprocess from "glory-svelte-preprocess"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
        gloryPreprocess(),
		preprocess()
	],

	kit: {
		target: '#svelte',
		adapter: adapter()
	}
};

export default config;
