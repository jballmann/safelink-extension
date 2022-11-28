/*eslint-enable*/

import { Request } from '@cliqz/adblocker';
import { findBestMatch } from 'string-similarity';

import ListIndex from './register.js';
import { updateMyLists, updateLists, addCustomList } from './update.js';
import { getDerefUrl } from './dereferrer.js';
import { removeProtocol, splitupUrl } from '../utilities/url.js';

let register;

async function trustUnknown(domain) {
  const custom = (await messenger.storage.local.get('settings/custom'))['settings/custom'];
  try {
    await messenger.storage.local.set({
      'settings/custom': {
        ...custom,
        [domain]: true
      }
    });
  }
  catch (err) {
    console.log(err);
  }
}

async function getPrevention() {
  const prevention = (await messenger.storage.local.get('settings/prevention'))['settings/prevention'];
  return { ...prevention };
}

async function setPrevention(prevention) {
  await messenger.storage.local.set({ 'settings/prevention': prevention });
}

async function findRedirectDomain(url) {
  let response;
  try {
    response = await window.fetch(url);
  }
  catch (err) {
    return;
  }
  if (removeProtocol(response.url) === removeProtocol(url)) {
    if (response.status === 404) {
      return { notFound: true };
    }
    return { invalid: true };
  }
  if (!response.redirected) {
    return { invalid: true };
  }
  
  const responseUrl = response.url;
  return { url: responseUrl, ...(await findDomain(responseUrl)) };
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
  };
  
  // check for userdefined
  const custom = (await messenger.storage.local.get('settings/custom'))['settings/custom'];
  if (custom && custom[request.domain]) {
    return {
      type: 'custom',
      ...domainInfo
    };
  }
  
  const index = register.get();
  console.log(index);
  
  // look up in trusted hosts
  const trusted = index.trusted.domains;
  
  if (trusted[domainInfo.domain]) {
    const trustedOrgId = trusted[request.domain];
    
    const orgDetails = index.trusted.orgs[trustedOrgId] || {};
    console.log(orgDetails);
    return {
      type: 'trusted',
      ...domainInfo,
      ...orgDetails
    };
  }
  
  // look up domain in redirect hosts
  const isRedirect = index.redirect.redirects.indexOf(request.domain) > -1;
  
  if (isRedirect) {
    console.log('redirect');
    return {
      type: 'redirect',
      ...domainInfo
    };
  }
  
  const { path, query } = splitupUrl(urlString);
  // look up in dereferrers
  for (const dereferrer of index.redirect.dereferrers) {
    let derefUrl = getDerefUrl({ path, query }, dereferrer);
    if (derefUrl) {
      if (/^[a-zA-Z0-9+/]+(={,2})?$/.test(derefUrl) && dereferrer.format?.includes('base64')) {
        try {
          derefUrl = atob(derefUrl);
        }
        catch {
          continue;
        }
      }
      return {
        type: 'redirect',
        dereferrerTarget: derefUrl,
        ...domainInfo
      }
    }
  }
  
  // look up in filter for suspicious urls
  const { match } = index.suspicious.match(request);
  
  if (match) {
    console.log('suspicious');
    return {
      type: 'suspicious',
      ...domainInfo
    };
  }
  
  // calculate similarity with trusted domains
  const { bestMatch } = findBestMatch(domainInfo.domain, Object.keys(trusted));
  
  console.log('unknown');
  return {
    type: 'unknown',
    similar: bestMatch,
    ...domainInfo
  };
}

function openBrowser(url) {
  messenger.windows.openDefaultBrowser(url);
}

function openTab(url) {
  messenger.tabs.create({ url });
}

async function registerContentScripts() {
  console.log('register content scripts');
  await messenger.messageDisplayScripts.register({
    js: [
      { file: 'content.js' }
    ],
    css: [
      { file: 'inject-iconmonstr.css' }
    ]
  });
}

async function registerRuntimeMessageHandler() {
  console.log('register message handler');
  messenger.runtime.onMessage.addListener(async (message) => { 
    console.log('retrieved msg:', message);
    if (message && message['command']) {
      // Check for known commands.
      switch (message.command) {
        case 'log':
          console.log(message.payload);
          break;
        case 'findDomain':
          return await findDomain(message.payload);
        case 'findRedirectDomain':
          return await findRedirectDomain(message.payload);
        case 'trustUnknown':
          return await trustUnknown(message.payload);
        case 'getPrevention':
          return await getPrevention();
        case 'setPrevention':
          return await setPrevention(message.payload);
        case 'openBrowser':
          return openBrowser(message.payload);
        case 'openTab':
          return openTab(message.payload);
        case 'update':
          return await updateLists(message.payload);
        case 'build':
          return await register.rebuild();
        case 'addList':
          return await addCustomList(message.payload);
      }
    }
  });
}

messenger.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    messenger.runtime.openOptionsPage();
  }
});

async function run() {
  console.log('run...');
  
  (async () => {
    await updateMyLists();
    await updateLists();
    register = new ListIndex();
  })();
  
  registerContentScripts();
  registerRuntimeMessageHandler();
}

document.addEventListener('DOMContentLoaded', run);