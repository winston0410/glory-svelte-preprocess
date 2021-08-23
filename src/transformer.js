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

const isTargetElement = (selectorNode, node, linker) => {
  let found = true;
  let matchCount = 0;

  const r = createGenerator(selectorNode.children);

  let curNode = node;
  let selector = r.prev();

  while (r.getIndex() > -1) {
    if (!curNode) {
        linker.reveal()
        return false
    }
    //  console.log("run count", index, selector, curNode);
    const combinator = isCombinator(selector)
    if (combinator) {
      curNode = linker.getParent(curNode);
      selector = r.prev();
      if (combinator === ">") {
          //  prevent linker from providing more than one node for finding direct parent
          linker.hide(curNode)
      } 
    } else {
      const isMatch = matchWithSelector(curNode, selector);
      if (isMatch) {
        selector = r.prev();
        matchCount++;
        if (r.length() === matchCount) {
          found = true;
        }
      } else {
        curNode = linker.getParent(curNode);
      }
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

      walk(ast, {
        enter(node, parent) {
          if (node.type !== "Element") {
            return;
          }

          linker.link(node, parent);

          for (const selectorNode of replaceList.keys()) {
            const result = isTargetElement(selectorNode, node, linker);

            if (result) {
              const minified = getMinifiedToken(replaceList.get(selectorNode));
              const slot = getAttribute(node, "class").value[0];
              changeable.overwrite(slot.start, slot.end, minified);
            }
          }
        },
      });

      return this;
    },
    toString() {
      return changeable.toString();
    },
  };
}
