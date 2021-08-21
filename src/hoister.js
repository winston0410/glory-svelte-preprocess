import { getProxiedObject } from "./helper.js";

const foundInLayout = (layoutClassList, className) => {
  for (const original in layoutClassList) {
    for (const minified in layoutClassList[original]) {
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
  if (!opts.lazyLoad) {
    return removeComponentDecl(opts.layoutFilename, curBase, declarationCache);
  }

  if (curBase === opts.layoutFilename) {
    return declarationCache;
  }

  const currentComponentDecl = classCache[curDir][curBase];
  const layoutDecl = findClosestLayout(curDir, opts.layoutFilename, classCache);

  //  hoisting won't work without a __layout.svelte
  if (!layoutDecl) {
    return declarationCache;
  }

  const list = [];

  for (const original in currentComponentDecl) {
    for (const minified in currentComponentDecl[original]) {
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
    for (const originalDecl in declarationCache[mediaQuery]) {
      const token = declarationCache[mediaQuery][originalDecl];
      if (list.includes(token)) {
        result[mediaQuery][originalDecl] = token;
      }
    }
  }

  return result;
};
