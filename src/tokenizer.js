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
    const declaration = getDeclaration(declarationNode)

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
  classCache,
  declarationCache,
  next,
  mediaQueryName
) => {
  const className = getClassName(rule);
  classCache[className] = Object.assign(
    classCache[className] ?? {},
    tokenizeRules(rule, declarationCache, next, mediaQueryName)
  );
};

const createTokenizer = (classCache, declarationCache) => {
  const next = joli("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_");

  return {
    generateToken(cssAst) {
      walk(cssAst, {
        enter(node, parent, prop, index) {
          switch (node.type) {
            case "Style": {
              for (const rule of node.children) {
                if (rule.type === "Rule") {
                  hydrateClassCache(rule, classCache, declarationCache, next);
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
                  classCache,
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
    },
  };
};

export default createTokenizer;
