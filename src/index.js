import { parse } from "svelte/compiler";
import createTransformer from "./transformer.js";
import { buildCss, buildHtml } from "./builder.js";
//  Keep state outside default function as it will be called multiple times
const classCache = {};
const declarationCache = {};
const transformer = createTransformer(classCache, declarationCache);

export default function () {
  return {
    markup: function ({ content, filename }) {
      //  Ignore all default code
      if (!filename.includes(".svelte-kit")) {
        const ast = parse(content, { filename });

        transformer.generateToken(ast.css);

        return {
          code: `<style>${buildCss(declarationCache)}</style>${buildHtml(
            classCache,
            ast.html
          )}`,
        };
      }
    },
  };
}
