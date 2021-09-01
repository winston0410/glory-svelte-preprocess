import MagicString from "magic-string";
import { walk } from "svelte/compiler";
import {
  assembleRules,
  getClassName,
  matchWithSelector,
  getMinifiedToken,
  getAttribute,
  createGenerator,
  isCombinator,
} from "./helper.js";
import createLinker from "./linker.js";

const getLastSelector = (node) => {
  const lastSelector = node.children[node.children.length - 1];
  switch (lastSelector.type) {
    case "PseudoClassSelector": {
      if (lastSelector.name === "not") {
        return lastSelector;
      }
      return node.children[node.children.length - 2];
    }

    case "PseudoElementSelector": {
      return node.children[node.children.length - 2];
    }
  }

  return lastSelector;
};

const getOriginalClassPos = (elem, targetClass) => {
  const classAttr = getAttribute(elem, "class");
  const valueNode = classAttr.value[0];
  if (valueNode.type === "MustacheTag") {
    if (valueNode.expression.type === "TemplateLiteral") {
      const start =
        valueNode.expression.quasis[0].value.raw.indexOf(targetClass);
      return [
        valueNode.expression.quasis[0].start + start,
        valueNode.expression.quasis[0].start + start + targetClass.length,
      ];
    } else if (valueNode.expression.type === "Literal") {
      const start = valueNode.expression.raw.indexOf(targetClass);
      return [
        valueNode.expression.start + start,
        valueNode.expression.start + start + targetClass.length,
      ];
    }
  }
  const targetStart = valueNode.raw.indexOf(targetClass);
  return [
    valueNode.start + targetStart,
    valueNode.start + targetStart + targetClass.length,
  ];
};

const isTargetElement = (selectorNode, node, linker) => {
  let found = false;
  let matchCount = 0;

  const r = createGenerator(selectorNode.children);

  let curNode = node;
  let selector = r.prev();

  while (r.getIndex() > -1) {
    //  For debug
    //  console.log("check selector", selector);
    //  console.log("check node", curNode);
    //  console.log('check index', r.getIndex(), ' match cound: ', matchCount)

    if (!curNode) {
      linker.reveal();
      return false;
    }
    const combinator = isCombinator(selector);
    if (combinator) {
      selector = r.prev();
      matchCount++;
      switch (combinator) {
        case ">":
          //  prevent linker from providing more than one node for finding direct parent
          curNode = linker.getParent(curNode);
          linker.hide(curNode);
          break;

        case "~": {
          //  should check its siblings before it
          const parent = linker.getParent(curNode);
          const curNodeIndex = parent.children.findIndex((s) => s === curNode);
          const sliced = parent.children.slice(0, curNodeIndex + 1);

          for (const sibling of sliced) {
            const matched = matchWithSelector(sibling, selector);
            if (matched) {
              matchCount++;
            }
          }
          break;
        }

        case "+": {
          const parent = linker.getParent(curNode);
          const curNodeIndex = parent.children.findIndex((s) => s === curNode);
          if (curNodeIndex > 0) {
            curNode = parent.children[curNodeIndex - 1];
          } else {
            return false;
          }
          break;
        }

        case " ": {
          curNode = linker.getParent(curNode);
          break;
        }
      }
    } else {
      const isMatch = matchWithSelector(curNode, selector);
      if (isMatch) {
        selector = r.prev();
        matchCount++;
      } else {
        return false;
      }
    }

    if (r.length() === matchCount) {
      found = true;
      return found;
    }
  }

  return found;
};

export default function (code, { dir, base }) {
  const changeable = new MagicString(code);

  return {
    transformCss(ast, cache) {
      const rules = assembleRules(cache);
      if (!ast && Object.keys(cache).length > 0) {
        changeable.appendRight(0, `<style>${rules}</style>`);
        return this;
      }
      walk(ast, {
        enter(node) {
          switch (node.type) {
            case "Style": {
              //  Remove class that can be minified
              for (const child of node.children) {
                if (child.type === "Rule") {
                  if (getClassName(child)) {
                    changeable.overwrite(child.start, child.end, "");
                  }
                }
              }
              return;
            }

            case "Atrule": {
              if (node.name !== "media") {
                return;
              }
              //  Remove all media queries
              //  TODO: should only remove minified media queries
              return changeable.overwrite(node.start, node.end, "");
            }

            default: {
              return;
            }
          }
        },
      });
      
      //  Write once only
      changeable.appendRight(ast.children[0].start, rules);
      return this;
    },
    transformHtml(ast, cache) {
      const replaceList = cache[dir][base];
      const linker = createLinker();
      //  Storing node with no class attribute, update them once only after the loop
      const noClassCache = new Map();

      walk(ast, {
        enter(node, parent) {
          if (node.type !== "Element") {
            return;
          }

          linker.link(node, parent);

          for (const selectorNode of replaceList.keys()) {
            const result = isTargetElement(selectorNode, node, linker);

            if (result) {
              const lastSelector = getLastSelector(selectorNode);
              const minified = getMinifiedToken(replaceList.get(selectorNode));

              if (lastSelector.type === "ClassSelector") {
                const [start, end] = getOriginalClassPos(
                  node,
                  lastSelector.name
                );
                changeable.appendRight(end, minified);
                //  Can be reran safely??? Hacky
                changeable.overwrite(start, end, "");
                continue;
              }

              const classAttr = getAttribute(node, "class");
              if (classAttr) {
                const end = classAttr.value[0].end;
                changeable.appendRight(end, minified);
              } else {
                const end = node.start + node.name.length + 1;
                noClassCache.set(
                  end,
                  Object.assign(
                    noClassCache.get(end) ?? {},
                    replaceList.get(selectorNode)
                  )
                );
              }
            }
          }
        },
      });

      for (const [end, classList] of noClassCache) {
        const minified = getMinifiedToken(classList);
        changeable.appendRight(end, ` class="${minified}"`);
      }

      return this;
    },
    toString() {
      return changeable.toString();
    },
  };
}
