import { parse } from "svelte/compiler";
import createTokenizer from "./tokenizer.js";
import createTransformer from "./transformer.js";

//  Keep state outside default function as it will be called multiple times
const classCache = {};
const declarationCache = {};
const tokernizer = createTokenizer(classCache, declarationCache);

export default function () {
  return {
    markup: function ({ content, filename }) {
      //  Ignore all default code
      if (!filename.includes(".svelte-kit")) {
        const ast = parse(content, { filename });
        tokernizer.generateToken(ast.css, filename);

        const transformer = createTransformer(content, filename);

        const result = transformer
          .transformHtml(ast.html, classCache)
          .transformCss(ast.css, declarationCache)
          .toString();

        return {
          code: result,
        };
      }
    },
  };
}
