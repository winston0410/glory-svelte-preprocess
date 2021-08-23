export const getAttribute = (elem, name) =>
  elem?.attributes.find((attr) => attr.name === name);

export const getInjectionSlot = (elem) => {
  let start, end
  let append = false
  
  if (elem.attributes.length < 1) {
    append = true
    end = elem.start + elem.name.length + 1
    return [append, start, end]
  }
  const classAttr = getAttribute(elem, "class");
  if (classAttr) {
    const classAttrValue = classAttr.value[0];
    start = classAttrValue.start;
    end = classAttrValue.end;
  } else {
    const lastAttr = elem.attributes[elem.attributes.length - 1].value[0]
    end = lastAttr.end + 1
    append = true
  }

  return [append, start, end];
};

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

export const getSelectorNode = (rule) => rule.prelude.children[0];

export const getClassName = (rule) => {
  let className = "";
  let shouldMinify = true;
  for (const selectorNode of getSelectorNode(rule).children) {
    switch (selectorNode.type) {
      case "ClassSelector":
        className += `.${selectorNode.name}`;
        break;

      case "PseudoElementSelector":
        className += `::${selectorNode.name}`;
        break;

      case "PseudoClassSelector":
        className += `:${selectorNode.name}`;
        break;

      case "TypeSelector":
        className += `${selectorNode.name}`;
        break;

      case "IdSelector":
        className += `#${selectorNode.name}`;
        break;

      case "AttributeSelector":
        shouldMinify = false;
        className += `[${selectorNode.name.name}${selectorNode.matcher}${selectorNode.value.value}]`;
        break;

      case "WhiteSpace":
        className += selectorNode.value;
        break;

      case "Combinator":
        className += selectorNode.name;
        break;

      default:
        break;
    }
  }
  return [className, shouldMinify];
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
      get: function (target, prop) {
        if (!target[prop]) {
          target[prop] = {};
        }
        return target[prop];
      },
    }
  );
};

export const matchWithSelector = (element, selector) => {
  if (element.type === "Fragment") {
    return false;
  }

  switch (selector.type) {
    case "TypeSelector": {
      if (element.name === selector.name) {
        return true;
      }
      return false;
    }
  }

  if (element.attributes.length < 1) {
    return false;
  }

  switch (selector.type) {
    case "ClassSelector": {
      const attr = getAttribute(element, "class");
      for (const className of attr.value[0].raw.split(" ")) {
        if (className === selector.name) {
          return true;
        }
      }
      return false;
    }
    case "IdSelector": {
      const attr = getAttribute(element, "id");
      if (attr.value[0].raw === selector.name) {
        return true;
      }
      return false;
    }
  }

  return false;
};

export const getMinifiedToken = (tokenList) => {
  let minified = "";
  let index = 0;
  for (const token in tokenList) {
    minified += index === 0 ? token : " " + token;
    index++;
  }
  return minified;
};

//  Not using a generator function here, as slower in performance due to context switch
export const createGenerator = (list) => {
  let index = list.length - 1
  return {
    prev(){
        if (index < 0) {
            return null
        }
        const result = list[index--]
        return result
    },
    getIndex(){
        return index + 1
    },
    length(){
        return list.length
    }
  };
}

export const isCombinator = (selector) => {
    switch (selector.type) {
        case 'WhiteSpace':{
            return selector.value
        }

        case 'Combinator':{
            return selector.name
        }

        default:{
            return false
        }
    }
}
