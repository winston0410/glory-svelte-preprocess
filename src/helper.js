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
  for (const selectorNode of rule.prelude.children[0].children) {
    console.log("check node", selectorNode);
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

      default:
        break;
    }
  }
  return className;
};

export const getDeclaration = (declarationNode) => {
  let declaration = "";
  declaration += declarationNode.property;
  for (const valueNode of declarationNode.value.children) {
    if (valueNode.value) {
      declaration += `:${valueNode.value}${valueNode.unit};`;
    } else {
      declaration += `:${valueNode.name};`;
    }
  }
  return declaration;
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
