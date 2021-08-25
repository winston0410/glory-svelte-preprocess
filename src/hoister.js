import { getProxiedObject } from "./helper.js";

const foundInLayout = (layoutDeclCache, className) => {
  for (const [, tokenList] of layoutDeclCache) {
    for (const minified in tokenList) {
      if (minified === className) {
        return true;
      }
    }
  }
  return false;
};

const removeComponentDecl = (layoutFilename, base, declarationCache) => {
  if (base === layoutFilename) {
    return declarationCache;
  }

  return {};
};

const hasReachedSrc = (path) => {
  const dirList = path.split("/");
  return dirList[dirList.length - 1] === "src";
};

const goPreviousDir = (path) => {
  return path.substring(0, path.lastIndexOf("/"));
};

const findClosestLayout = (dir, layoutFilename, classCache) => {
  if (classCache[dir][layoutFilename]) {
    return classCache[dir][layoutFilename];
  } else {
    if (hasReachedSrc(dir)) {
      return false;
    }
    return findClosestLayout(goPreviousDir(dir), layoutFilename, classCache);
  }
};

export const hoistDeclaration = (
  opts,
  { dir: curDir, base: curBase },
  classCache,
  declarationCache
) => {
  const layoutFilename =  "__layout.svelte"
  if (!opts.lazyLoad) {
    return removeComponentDecl(layoutFilename, curBase, declarationCache);
  }

  if (curBase === layoutFilename) {
    return declarationCache;
  }

  const currentComponentDecl = classCache[curDir][curBase];
  const layoutDecl = findClosestLayout(curDir, layoutFilename, classCache);

  //  hoisting won't work without a __layout.svelte
  if (!layoutDecl) {
    return declarationCache;
  }

  const list = [];

  for (const [, tokenList] of currentComponentDecl) {
    for (const minified in tokenList) {
      if (!foundInLayout(layoutDecl, minified)) {
        list.push(minified);
      }
    }
  }

  return filterDeclaration(list, declarationCache);
};

const filterDeclaration = (list, declarationCache) => {
  const result = getProxiedObject();

  for (const mediaQuery in declarationCache) {
    if (!result[mediaQuery]) {
      result[mediaQuery] = {};
    }
    for (const pseudo in declarationCache[mediaQuery]) {
      if (!result[mediaQuery][pseudo]) {
        result[mediaQuery][pseudo] = {};
      }
      for (const original in declarationCache[mediaQuery][pseudo]) {
        const token = declarationCache[mediaQuery][pseudo][original];
        if (list.includes(token)) {
          result[mediaQuery][pseudo][original] = token;
        }
      }
    }
  }

  return result;
};
