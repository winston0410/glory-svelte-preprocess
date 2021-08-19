import joli from "@blackblock/joli-string";
import { walk } from "svelte/compiler";
import { getMediaQuery, getClassName, getDeclaration } from "./helper.js";

const tokenizeRules = (
  rule,
  declarationCache,
  next,
  relatedAtRule = "none"
) => {
  let generatedClassList = {};
  for (const declarationNode of rule.block.children) {
    const declaration = getDeclaration(declarationNode);
    //  console.log('check declaration', declaration)
    if (!declarationCache[relatedAtRule]) {
      declarationCache[relatedAtRule] = {};
    }

    const targetCache = declarationCache[relatedAtRule];

    if (!targetCache[declaration]) {
      const token = next();
      targetCache[declaration] = token;
      generatedClassList[token] = true;
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
  const className = getClassName(rule);
  tempCache[className] = Object.assign(
    tempCache[className] ?? {},
    tokenizeRules(rule, declarationCache, next, mediaQueryName)
  );
};

const createTokenizer = (classCache, declarationCache) => {
  const next = joli("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_");

  return {
    generateToken(cssAst, filename) {
      const tempCache = {};

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
      classCache[filename] = {};
      Object.assign(classCache[filename], tempCache);
    },
  };
};

export default createTokenizer;
