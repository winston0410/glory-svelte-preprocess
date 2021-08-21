import joli from "@blackblock/joli-string";
import { walk } from "svelte/compiler";
import {
  getMediaQuery,
  getClassName,
  getDeclaration,
  getProxiedObject,
} from "./helper.js";

const tokenizeRules = (
  rule,
  declarationCache,
  next,
  relatedAtRule = "none"
) => {
  let generatedClassList = {};
  for (const declarationNode of rule.block.children) {
    const declaration = getDeclaration(declarationNode);

    const targetCache = declarationCache[relatedAtRule];

    if (!targetCache[declaration]) {
      const token = next();
      targetCache[declaration] = token;
      generatedClassList[token] = true;
    } else {
      generatedClassList[targetCache[declaration]] = true;
    }
  }
  return generatedClassList;
};

const hydrateClassCache = (
  rule,
  tempCache,
  declarationCache,
  next,
  mediaQueryName
) => {
  const [className, shouldMinify] = getClassName(rule);
  if (shouldMinify) {
    tempCache[className] = Object.assign(
      tempCache[className],
      tokenizeRules(rule, declarationCache, next, mediaQueryName)
    );
  } else {
    //  TODO: handle other selector
  }
};

const createTokenizer = (classCache, declarationCache) => {
  const next = joli("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_");

  return {
    generateToken(cssAst, { dir, base }) {
      const tempCache = getProxiedObject();

      walk(cssAst, {
        enter(node) {
          switch (node.type) {
            case "Style": {
              for (const rule of node.children) {
                if (rule.type === "Rule") {
                  hydrateClassCache(rule, tempCache, declarationCache, next);
                }
              }
              return;
            }

            case "Atrule": {
              if (node.name !== "media") {
                return;
              }

              const mediaQueryName = getMediaQuery(node);

              for (const rule of node.block.children) {
                hydrateClassCache(
                  rule,
                  tempCache,
                  declarationCache,
                  next,
                  mediaQueryName
                );
              }
              return;
            }

            default: {
              return this.skip();
            }
          }
        },
      });

      //  hydrate the classCache once only here
      classCache[dir][base] = {};
      Object.assign(classCache[dir][base], tempCache);
    },
  };
};

export default createTokenizer;
