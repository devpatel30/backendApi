const areAllValuesNull = (obj) => {
  for (const key in obj) {
    if (obj[key] !== null) {
      return false;
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      if (!areAllValuesNull(obj[key])) {
        return false;
      }
    } else if (Array.isArray(obj[key])) {
      for (const item of obj[key]) {
        if (typeof item === "object" && !Array.isArray(item)) {
          if (!areAllValuesNull(item)) {
            return false;
          }
        } else if (item !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

module.exports.removeNullProperties = (obj) => {
  for (const key in obj) {
    if (obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      removeNullProperties(obj[key]);
      if (areAllValuesNull(obj[key])) {
        delete obj[key];
      }
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].filter((item) => {
        if (typeof item === "object" && !Array.isArray(item)) {
          removeNullProperties(item);
          return !areAllValuesNull(item);
        }
        return item !== null;
      });
      if (obj[key].length === 0) {
        delete obj[key];
      }
    }
  }
};
