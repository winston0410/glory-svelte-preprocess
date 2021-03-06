import { parse } from "svelte/compiler";
import createTokenizer from "./tokenizer.js";
import createTransformer from "./transformer.js";
import { getProxiedObject } from "./helper.js";
import { hoistDeclaration } from "./hoister.js";
import { sortCacheByKey } from "./sorter.js";
import path from "path";

//  Keep state outside default function as it will be called multiple times
let classCache = getProxiedObject();
let declarationCache = getProxiedObject();
let tokernizer = createTokenizer(classCache, declarationCache);

const defaultOpts = {
  lazyLoad: true,
};

export default function (opts = {}) {
  opts = {...defaultOpts, ...opts}
  return {
    markup: function ({ content, filename }) {
      //  Ignore all default code
      if (!filename.includes(".svelte-kit")) {
        const parsedPath = path.parse(filename);
        const ast = parse(content, { filename });
        tokernizer.generateToken(ast.css, parsedPath);

        const transformer = createTransformer(content, parsedPath);

        const hoisted = hoistDeclaration(
          opts,
          parsedPath,
          classCache,
          declarationCache
        );

        const sorted = sortCacheByKey(hoisted)

        const result = transformer
          .transformHtml(ast.html, classCache)
          .transformCss(ast.css, sorted)
          .toString();

        return {
          code: result,
        };
      }
    },
  };
}

//  reset cache manually
export const reset = () => {
  classCache = getProxiedObject();
  declarationCache = getProxiedObject();
  tokernizer = createTokenizer(classCache, declarationCache);
};
