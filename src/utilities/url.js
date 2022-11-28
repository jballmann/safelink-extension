export function removeProtocol(url) {
  return url.replace(/^http(s)?:\/\/(www[0-9]?\.)?/, '');
}

export function splitupUrl(url) {
  let [withQuery, hash] = removeProtocol(url).split('#');
  let [path, query] = withQuery.split('?');
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return {
    path,
    hash,
    query
  }
}

/* function hasKey(obj, { domain, hostname }) {
  const subdomains = hostname.substring(0, -1 * domain.length - 1).split('.');
  if (obj[domain]) {
    return obj[domain];
  }
  let searchString = domain;
  for (let i = subdomains.length - 1; i >= 0; i--) {
    if (subdomains[i] !== '') {
      searchString = subdomains[i] + '.' + searchString;
      if (obj[searchString]) {
        return obj[searchString];
      } 
    }
  }
  return null;
} */