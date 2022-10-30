import { FiltersEngine, Request } from '@cliqz/adblocker';
import Bucket from './bucket.js';

const TRUSTED_URL = 'https://api.jsonserve.com/tqk64R';
const REDIRECT_URL = 'https://api.jsonserve.com/K2ViLL';
const ORGS_URL = 'https://api.jsonserve.com/gtP0QG';
const BLOCKLISTS_URL = 'https://api.jsonserve.com/UKJ4U_';

let trustedBucket;
let redirectBucket;
let orgsBucket;
let blocklistsBucket;
let filterEngine;

function hasKey(obj, { domain, hostname }) {
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
}

async function getPrevention(url) {
  const request = Request.fromRawDetails({ url });
  const { prevention } = await messenger.storage.local.get('prevention');
  console.log('get', prevention);
  return prevention ? prevention.indexOf(request.domain) > -1 : false;
}

async function setPrevention(domain) {
  let { prevention } = await messenger.storage.local.get('prevention');
  prevention.push(domain);
  console.log('add', prevention);
  await messenger.storage.local.set({ prevention });
}

async function findRedirectDomain(url) {
  let response;
  try {
    response = await window.fetch(url);
  }
  catch (err) {
    return;
  }
  if (response.status === 404) {
    return { notFound: true }
  }
  if (!response.redirected) {
    return;
  }
  return { url: response.url, ...(await findDomain(response.url)) };
}

async function findDomain(urlString) {
  const request = Request.fromRawDetails({
    url: urlString,
  });
  
  const [sld, ...tld] = request.domain.split('.');
  const domainInfo = {
    domain: request.domain,
    secondLevelDomain: sld,
    topLevelDomain: tld.join('.')
  }
  
  // look up domain and subdomains in trusted hosts bucket
  const trusted = await trustedBucket.get();
  
  const trustedOrgId = hasKey(trusted, {
    hostname: request.hostname,
    domain: request.domain
  });
  
  if (trustedOrgId) {
    console.log('trusted');
    
    const orgDetails = (await orgsBucket.get())[trustedOrgId] || {};
    console.log(orgDetails);
    return {
      type: 'trusted',
      ...domainInfo,
      ...orgDetails
    };
  }
  
  // look up domain in redirect hosts bucket
  const isRedirect = (await redirectBucket.get()).indexOf(request.domain) > -1;
  
  if (isRedirect) {
    console.log('redirect');
    return {
      type: 'redirect',
      ...domainInfo
    }
  }
  
  const { match } = filterEngine.match(request);
  
  // look up in filter for suspicious urls
  if (match) {
    console.log('suspicious');
    return {
      type: 'suspicious',
      ...domainInfo
    }
  }
  
  console.log('unknown');
  return {
    type: 'unknown',
    ...domainInfo
  }
}

async function registerContentScripts() {
  console.log('register content scripts');
  await messenger.messageDisplayScripts.register({
    js: [
      { file: 'content/content.js' }
    ],
    css: [
      { file: 'content/style.css' }
    ]
  });
}

async function registerRuntimeMessageHandler() {
  console.log('register message handler');
  messenger.runtime.onMessage.addListener(async (message) => { 
    console.log('retrieved msg:', message);
    if (message && message.hasOwnProperty("command")) {
      // Check for known commands.
      switch (message.command) {
        case "log": console.log(message.payload); break;
        case "findDomain": return await findDomain(message.payload); break;
        case "findRedirectDomain": return await findRedirectDomain(message.payload); break;
        case "getPrevention": return await getPrevention(message.payload); break;
        case "setPrevention": return await setPrevention(message.payload);
      }
    }
  });
}

async function initFilter() {
  const engine = await FiltersEngine.fromLists(window.fetch, (await blocklistsBucket.get()));
  await messenger.storage.local.set({ filterEngine: engine.serialize() });
  let stored = await messenger.storage.local.get('filterEngine');
  filterEngine = FiltersEngine.deserialize(stored.filterEngine);
}

async function run() {
  console.log('run...');
  
  trustedBucket = new Bucket('trusted', 'json');
  trustedBucket.fetch(TRUSTED_URL);
  
  console.log('trusted ok');
  
  orgsBucket = new Bucket('orgs', 'json');
  orgsBucket.fetch(ORGS_URL);
  
  console.log('orgs ok');
  
  redirectBucket = new Bucket('redirect', 'json');
  redirectBucket.fetch(REDIRECT_URL);
  
  console.log('redirect ok');
  
  blocklistsBucket = new Bucket('blocklists', 'json');
  await blocklistsBucket.fetch(BLOCKLISTS_URL);
  
  console.log('blocklists ok');
  
  initFilter();
  
  registerContentScripts();
  registerRuntimeMessageHandler();
}

document.addEventListener("DOMContentLoaded", run);