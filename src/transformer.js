import MagicString from "magic-string";
import { walk } from "svelte/compiler";
import { assembleRules, getClassName } from "./helper.js";

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
      walk(ast, {
        enter(node) {
          if (node.type !== "Attribute") {
            return;
          }
          if (node.name !== "class") {
            return;
          }

          const attrValue = node.value[0];

          for (const value of attrValue.raw.split(" ")) {
            let minifiedClass = "";
            let index = 0;
            for (const token in cache[dir][base][`.${value}`]) {
              minifiedClass += index === 0 ? token : " " + token;
              index++;
            }
            changeable.overwrite(attrValue.start, attrValue.end, minifiedClass);
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
