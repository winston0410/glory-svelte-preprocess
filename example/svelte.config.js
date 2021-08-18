import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import gloryPreprocess from "../src/index.js"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		//  {
			//  markup: function (values) {
				//  console.log('check value', values);
			//  }
		//  },
        gloryPreprocess(),
		preprocess()
	],

	kit: {
		target: '#svelte',
		adapter: adapter()
	}
};

export default config;
