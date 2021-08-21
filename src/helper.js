export const getMediaQuery = (rule) => {
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

export const getClassName = (rule) => {
  let className = "";
  let shouldMinify = true
  for (const selectorNode of rule.prelude.children[0].children) {
    switch (selectorNode.type) {
      case "ClassSelector":
        className += selectorNode.name;
        break;

      case "PseudoElementSelector":
        className += `::${selectorNode.name}`;
        break;

      case "PseudoClassSelector":
        className += `:${selectorNode.name}`;
        break;
        
      case "TypeSelector":
        shouldMinify = false
        className += `${selectorNode.name}`;
        break;
        
      case "IdSelector":
        shouldMinify = false
        className += `#${selectorNode.name}`;
        break;
        
      case "AttributeSelector":
        shouldMinify = false
        className += `[${selectorNode.name.name}${selectorNode.matcher}${selectorNode.value.value}]`;
        break;

      default:
        break;
    }
  }
  return [className, shouldMinify]
};

const stringifyDeclarationNode = (node) => {
  switch (node.type) {
    case "Url": {
      return `url(${node.value.value})`;
    }
    case "Hash": {
      return `#${node.value}`;
    }
    case "Dimension": {
      return `${node.value}${node.unit}`;
    }
    case "Percentage": {
      return `${node.value}%`;
    }
    case "Function": {
      let func = `${node.name}(`;
      for (const child of node.children) {
        func += stringifyDeclarationNode(child);
      }
      return `${func})`;
    }

    default: {
      if (node.value) {
        return node.value;
      } else {
        return node.name;
      }
    }
  }
};

export const getDeclaration = (declarationNode) => {
  let declaration = `${declarationNode.property}:`;
  for (const valueNode of declarationNode.value.children) {
    declaration += stringifyDeclarationNode(valueNode);
  }
  return `${declaration};`;
};

export const assembleRules = (cache) => {
  let code = "";

  for (const mediaQuery in cache) {
    for (const property in cache[mediaQuery]) {
      //  let rule = `.${cache[mediaQuery][property]}{${property}}`;
      let rule = `:global(.${cache[mediaQuery][property]}){${property}}`;
      if (mediaQuery !== "none") {
        rule = `${mediaQuery}{${rule}}`;
      }
      code += rule;
    }
  }

  return code;
};

export const getProxiedObject = () => {
  return new Proxy(
    {},
    {
      get: function (target,prop) {
        if (!target[prop]) {
          target[prop] = {};
        }
        return target[prop];
      },
    }
  );
};
