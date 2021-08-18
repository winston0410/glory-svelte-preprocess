import MagicString from "magic-string";
import { walk } from "svelte/compiler";
import { getMediaQuery, getClassName, getDeclaration, assembleRules } from "./helper.js";

export default function (code) {
  const changeable = new MagicString(code);

  return {
    transformCss(ast, cache) {
      walk(ast, {
        enter(node) {
          switch (node.type) {
            case "Style": {
              for (const child of node.children) {
                  if (child.type === "Rule") {
                      changeable.overwrite(child.start, child.end, "")
                  }
              }
              changeable.appendRight(node.children[0].start, assembleRules(cache))
              return;
            }

            case "Atrule": {
              if (node.name !== "media") {
                return;
              }
              return changeable.overwrite(node.start, node.end, "")
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
            for (const token in cache[value]) {
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
