import { parse } from "svelte/compiler";
import createTokenizer from "./tokenizer.js";
import createTransformer from "./transformer.js";
import { getProxiedObject } from "./helper.js";
import { hoistDeclaration } from "./hoister.js";
import path from "path";

//  Keep state outside default function as it will be called multiple times
const classCache = getProxiedObject();
const declarationCache = getProxiedObject();
const tokernizer = createTokenizer(classCache, declarationCache);

const defaultOpts = {
    lazyLoad: true,
    layoutFilename: "__layout.svelte"
}

export default function (opts = {}) {
  Object.assign(opts, defaultOpts)
  return {
    markup: function ({ content, filename }) {
      //  Ignore all default code
      if (!filename.includes(".svelte-kit")) {
        const parsedPath = path.parse(filename)
        const ast = parse(content, { filename });
        tokernizer.generateToken(ast.css, parsedPath);

        const transformer = createTransformer(content, parsedPath);

        const hoisted = hoistDeclaration(opts, parsedPath, classCache, declarationCache)

        const result = transformer
          .transformHtml(ast.html, classCache)
          .transformCss(ast.css, hoisted)
          .toString();

        return {
          code: result,
        };
      }
    },
  };
}
