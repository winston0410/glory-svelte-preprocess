const parseMediaQuery = (query) => {
    let lowerLimit = -1
    let upperLimit = -1

    const match = query.match(/(min-width|max-width):(\d*)/)

    if (!match) {
        return { lowerLimit, upperLimit }
    }

    const [,condition, width] = match

    const widthNum = parseInt(width)

    if (condition === "min-width") {
        lowerLimit = widthNum
    } else {
        upperLimit = widthNum
    }

    return { lowerLimit, upperLimit }
}

const compare = ([first], [second]) => {
    //  Put "none" first
    if (first === "none") {
        return -1
    }

    if (second === "none") {
        return 1
    }
    
    //  Get context here
    //  TODO: Handle unit
    const { lowerLimit: firstLower, upperLimit: firstUpper, unit: firstUnit } = parseMediaQuery(first)
    const { lowerLimit: secondLower, upperLimit: secondUpper, unit: secondUnit } = parseMediaQuery(second)

    if (firstUpper === -1 && secondUpper === -1) {
        return firstLower > secondLower ? 1 : -1
    }
    
    return 1
}

export const sortCacheByKey = (cache) => {
  return Object.fromEntries(Object.entries(cache).sort(compare))
};
