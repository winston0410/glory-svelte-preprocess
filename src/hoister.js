import path from "path/posix";
import { getProxiedObject } from "./helper.js";

const foundInLayout = (layoutClassList, className) => {
  for (const key in layoutClassList) {
    for (const layoutClassName in layoutClassList[key]) {
      if (layoutClassName === className) {
        return true;
      }
    }
  }
  return false;
};

export const hoistClass = (classCache, hoistedClassCache) => {
  const layoutFilename = "__layout.svelte";

  //  no need for in loop here for filename?
  for (const filename in classCache) {
    const { dir, base } = path.parse(filename);

    const currentComponentClassList = classCache[filename];

    if (base === layoutFilename) {
      hoistedClassCache[dir][base] = currentComponentClassList;
      continue;
    }

    const layoutClassList = hoistedClassCache[dir][layoutFilename];

    if (!layoutClassList) {
      hoistedClassCache[dir][base] = currentComponentClassList;
      continue;
    }

    const filteredClassList = getProxiedObject();

    for (const original in currentComponentClassList) {
      for (const minified in currentComponentClassList[original]) {
        if (!foundInLayout(layoutClassList, minified)) {
          filteredClassList[original][minified] = true;
        }
      }
    }

    hoistedClassCache[dir][base] = filteredClassList;
  }
};

export const hoistDeclaration = (
  filename,
  hoistedClassCache,
  declarationCache
) => {
  const { dir, base } = path.parse(filename);
  const hoistedDeclarationCache = getProxiedObject();
  const currentComponentCache = hoistedClassCache[dir][base];
  //  This is hell
  for (const original in currentComponentCache) {
    for (const minified of Object.keys(currentComponentCache[original])) {
      for (const mediaQuery in declarationCache) {
        for (const decl in declarationCache[mediaQuery]) {
          if (minified === declarationCache[mediaQuery][decl]) {
            hoistedDeclarationCache[mediaQuery][decl] = minified;
          }
        }
      }
    }
  }
  return hoistedDeclarationCache;
};
