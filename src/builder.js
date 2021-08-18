export const buildCss = (cache) => {
  let code = "";

  for (const property in cache) {
    code += `.${cache[property]}{${property}}`;
  }

  return code;
};

const assembleAttributes = (nodeList, cache) => {
  let code = "";

  for (const node of nodeList) {
    let value = node.value[0].raw
    if (node.name === "class") {
      let classNames = "";
      for (const value of node.value[0].raw.split(" ")) {
        classNames += ` ${cache[value] ?? ""}`;
      }
      value = classNames
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
