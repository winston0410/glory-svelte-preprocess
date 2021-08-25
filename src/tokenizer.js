import joli from "@blackblock/joli-string";
import { walk } from "svelte/compiler";
import {
  getMediaQuery,
  getClassName,
  getDeclaration,
  getPseudoSelector,
  getSelectorNode,
} from "./helper.js";

const tokenizeRules = (
  rule,
  declarationCache,
  next,
  pseudo,
  relatedAtRule = "none"
) => {
  let generatedClassList = {};

  if (!declarationCache[relatedAtRule]) {
      declarationCache[relatedAtRule] = {}
  }

  if (!declarationCache[relatedAtRule][pseudo]) {
      declarationCache[relatedAtRule][pseudo] = {}
  }

  const targetCache = declarationCache[relatedAtRule][pseudo]

  for (const declarationNode of rule.block.children) {
    const declaration = getDeclaration(declarationNode);

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
  const shouldMinify = getClassName(rule);
  if (shouldMinify) {
    const selector = getSelectorNode(rule);
    const pseudo = getPseudoSelector(selector);

    tempCache.set(
      selector,
      tokenizeRules(rule, declarationCache, next, pseudo, mediaQueryName)
    );
  }
};

const createTokenizer = (classCache, declarationCache) => {
  const next = joli("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_");

  return {
    generateToken(cssAst, { dir, base }) {
      const tempCache = new Map();

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
      classCache[dir][base] = tempCache;
    },
  };
};

export default createTokenizer;
