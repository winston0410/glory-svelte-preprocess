import joli from "@blackblock/joli-string";
import { walk } from "svelte/compiler";

const getClassName = (rule) => {
  let className = "";
  for (const selectorNode of rule.prelude.children[0].children) {
    if (selectorNode.type === "IdSelector") {
      return false;
    } else {
      className += selectorNode.name;
    }
  }
  return className;
};

const hydrateCache = (rule, classCache, declarationCache, next) => {
  const className = getClassName(rule);
  let minifiedClassName = "";
  for (const declarationNode of rule.block.children) {
    let declaration = "";
    declaration += declarationNode.property;
    for (const valueNode of declarationNode.value.children) {
      if (valueNode.value) {
        declaration += `:${valueNode.value}${valueNode.unit};`;
      } else {
        declaration += `:${valueNode.name};`;
      }
    }

    let nameHash = declarationCache[declaration];

    if (!nameHash) {
      nameHash = declarationCache[declaration] = next();
    }

    minifiedClassName += ` ${nameHash}`;
  }
  classCache[className] = minifiedClassName;
};

const createTransformer = (classCache, declarationCache) => {
  const next = joli("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_");

  return {
    generateToken(cssAst) {
      walk(cssAst, {
        enter(node, parent, prop, index) {
          if (node.type !== "Rule") {
            return;
          }

          hydrateCache(node, classCache, declarationCache, next);
        },
      });
    },
  };
};

export default createTransformer;
