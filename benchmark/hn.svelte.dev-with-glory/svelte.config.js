import netlify from "@sveltejs/adapter-netlify";
//  import gloryPreprocess from "glory-svelte-preprocess";
import gloryPreprocess from "../../src/index.js";

export default {
  preprocess: [
    gloryPreprocess({
      lazyLoad: false,
    }),
  ],
  kit: {
    adapter: netlify(),
    target: "#svelte",
  },
};
