import { parse } from "svelte/compiler";
import createTokenizer from "./tokenizer.js";
import createTransformer from "./transformer.js";
import { getProxiedObject } from "./helper.js";
import { hoistDeclaration, hoistClass } from "./hoister.js";

//  Keep state outside default function as it will be called multiple times
const classCache = getProxiedObject();
const hoistedClassCache = getProxiedObject();
const declarationCache = getProxiedObject();
const tokernizer = createTokenizer(classCache, declarationCache);

const defaultOpts = {
    lazyLoad: true
}

export default function (opts = {}) {
  Object.assign(opts, defaultOpts)
  return {
    markup: function ({ content, filename }) {
      //  Ignore all default code
      if (!filename.includes(".svelte-kit")) {
        const ast = parse(content, { filename });
        tokernizer.generateToken(ast.css, filename);

        const transformer = createTransformer(content, filename, opts);

        hoistClass(classCache, hoistedClassCache);
        const hoistedDeclarationCache = hoistDeclaration(
          filename,
          hoistedClassCache,
          declarationCache
        );
        
        const result = transformer
          .transformHtml(ast.html, classCache)
          .transformCss(ast.css, hoistedDeclarationCache)
          .toString();

        return {
          code: result,
        };
      }
    },
  };
}
