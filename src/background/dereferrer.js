function compareRegexPath(derefPath, path, onlyBeginning) {
  if (onlyBeginning) {
    const match = (new RegExp('^' + derefPath)).exec(path);
    return match ? match[0].length : -1;
  }
  const match = (new RegExp('^' + derefPath + '$')).exec(path);
  return match ? match[0].length : -1;
}

function compareStringPath(derefPath, path, onlyBeginning) {
  if (onlyBeginning) {
    return path.startsWith(derefPath) ? derefPath.length : -1;
  }
  return derefPath === path ? derefPath.length : -1;
}

export function getDerefUrl({ path, query }, dereferrer) {
  let tailIndex;
  if (dereferrer.path.startsWith('/') && dereferrer.path.endsWith('/')) {
    tailIndex = compareRegexPath(dereferrer.path.slice(1,-1), path, !dereferrer.param);
  }
  else {
    tailIndex = compareStringPath(dereferrer.path, path, !dereferrer.param);
  }
  if (tailIndex > -1) {
    if (dereferrer.param) {
      if (dereferrer.param === true) {
        return query;
      }
      const params = new URLSearchParams(query);
      console.log(params);
      for (const paramName of dereferrer.param) {
        if (params.has(paramName)) {
          return params.get(paramName);
        }
      }
    }
    if (!dereferrer.param) {
      return path.substring(tailIndex + 1);
    }
  }
  return false;
}