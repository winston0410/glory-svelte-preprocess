import MagicString from "magic-string";
import { walk } from "svelte/compiler";
import {
  assembleRules,
  getClassName,
  matchWithSelector,
  getMinifiedToken,
  getInjectionSlot,
  createGenerator,
  isCombinator,
} from "./helper.js";
import createLinker from "./linker.js";

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
      if (!ast && Object.keys(cache).length > 0) {
        changeable.appendRight(0, `<style>${assembleRules(cache)}</style>`);
        return this;
      }
      walk(ast, {
        enter(node) {
          switch (node.type) {
            case "Style": {
              for (const child of node.children) {
                if (child.type === "Rule") {
                  if (getClassName(child)[0]) {
                    changeable.overwrite(child.start, child.end, "");
                  }
                }
              }
              if (node.children.length > 0) {
                changeable.appendRight(
                  node.children[0].start,
                  assembleRules(cache)
                );
              }
              return;
            }

            case "Atrule": {
              if (node.name !== "media") {
                return;
              }
              return changeable.overwrite(node.start, node.end, "");
            }

            default: {
              return;
            }
          }
        },
      });
      return this;
    },
    transformHtml(ast, cache) {
      const replaceList = cache[dir][base];
      const linker = createLinker();
      const overwriteCache = new Map();

      walk(ast, {
        enter(node, parent) {
          if (node.type !== "Element") {
            return;
          }

          linker.link(node, parent);

          for (const selectorNode of replaceList.keys()) {
            const result = isTargetElement(selectorNode, node, linker);

            if (result) {
              const classList = overwriteCache.get(node);
              const newClassList = replaceList.get(selectorNode);
              if (!classList) {
                overwriteCache.set(node, newClassList);
              } else {
                overwriteCache.set(node, Object.assign(classList, newClassList));
              }
            }
          }
        },
      });

      for (const [node, classList] of overwriteCache) {
        const minified = getMinifiedToken(classList);
        const [append, start, end] = getInjectionSlot(node);

        if (append) {
          changeable.appendRight(end, ` class="${minified}"`);
        } else {
          changeable.overwrite(start, end, minified);
        }
      }

      return this;
    },
    toString() {
      return changeable.toString();
    },
  };
}
