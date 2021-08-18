export const buildCss = (cache) => {
  let code = "";

  for (const mediaQuery in cache) {
    for (const property in cache[mediaQuery]) {
      let rule = `.${cache[mediaQuery][property]}{${property}}`;
      if (mediaQuery !== "none") {
        rule = `${mediaQuery}{${rule}}`;
      }
      code += rule;
    }
  }

  return code;
};

const assembleAttributes = (nodeList, cache) => {
  let code = "";

  for (const node of nodeList) {
    let value = node.value[0].raw;
    if (node.name === "class") {
      let classNames = "";
      for (const value of node.value[0].raw.split(" ")) {
        for (const token in cache[value]) {
            classNames += ` ${token}`
        }
      }
      value = classNames;
    }
    code += ` ${node.name}="${value}"`;
  }

  return code;
};

const assembleElement = (node, cache) => {
  return `<${node.name} ${assembleAttributes(
    node.attributes,
    cache
  )}>${assembleChildren(node.children, cache)}</${node.name}>`;
};

//  Not sure how to get rid of recursion here
const assembleChildren = (nodeList, cache) => {
  let code = "";
  for (const child of nodeList) {
    switch (child.type) {
      case "Text": {
        code += child.raw;
        break;
      }
      case "Element": {
        code += assembleElement(child, cache);
        break;
      }

      default:
        break;
    }
  }
  return code;
};

export const buildHtml = (cache, rootNode) => {
  return assembleChildren(rootNode.children, cache);
};
