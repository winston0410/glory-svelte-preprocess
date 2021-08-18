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

const tokenizeRules = (
  rule,
  declarationCache,
  next,
  relatedAtRule = "none"
) => {
  let generatedClassList = {};
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

const getMediaQuery = (rule) => {
  let name = "@" + rule.name;
  for (const child of rule.prelude.children[0].children[0].children) {
    switch (child.type) {
      case "Identifier":
        name += child.name;
        break;

      case "WhiteSpace":
        name += child.value;
        break;

      case "MediaFeature":
        name += `(${child.name}:${child.value.value}${child.value.unit})`;
        break;

      default:
        break;
    }
  }
  return name;
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

const createTransformer = (classCache, declarationCache) => {
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
              //  TODO: patch those removed styling back in, @keyframes() and @font-face
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
              //  console.log(classCache);
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

export default createTransformer;
