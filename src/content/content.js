import { createApp } from 'vue';
import Modal from './Modal.vue';

import { Request } from '@cliqz/adblocker';

let cachedPrevention = {};

async function initPrevention() {
  cachedPrevention = await messenger.runtime.sendMessage({
    command: 'getPrevention'
  });
}

function storePrevention(domain) {
  cachedPrevention[domain] = true;
  messenger.runtime.sendMessage({
    command: 'setPrevention',
    payload: cachedPrevention
  });
}

function getAncestor(el, tagName) {
  tagName = tagName.toUpperCase();
  while (el) {
    if (el.nodeType === Node.ELEMENT_NODE && el.tagName == tagName) {
        return el;
    }
    el = el.parentNode;
  }
  return null;
}

function isValidUrl(str) {
  return /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)$/i.test(str);
}

function getHostname(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }
  return (new URL(url)).hostname;
}

let shadow;
let el;
let vueInstance;

async function openInfo(e) {
  const target = getAncestor(e.target, 'a');
  const url = target.href;
  
  let request;
  try {
    request = Request.fromRawDetails({ url });
  }
  catch (err) {
    console.log(err);
    return;
  }
  
  if (cachedPrevention[request.domain]) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  
  let mismatchedLink;
  try {
    if (target.innerText && isValidUrl(target.innerText) && getHostname(target.innerText) !== request.hostname) {
      mismatchedLink = target.innerText;
    }
  }
  catch (err) {
    console.log(err);
  }
  
  el = document.createElement('div');
  el.style = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;'
  
  vueInstance = createApp(Modal, { url, mismatchedLink, closeInfo, storePrevention });
  vueInstance.mount(el);
  
  shadow.appendChild(el);
}

function createShadowDom() {
  const shadowHost = document.createElement('div');
  document.body.appendChild(shadowHost);
  
  shadow = shadowHost.attachShadow({ mode: 'open' });
  
  const styleLink = document.createElement("link");
  styleLink.setAttribute("rel", "stylesheet");
  styleLink.setAttribute("href", messenger.runtime.getURL('style.css'));
  shadow.appendChild(styleLink);
}

async function closeInfo() {
  vueInstance.unmount();
  shadow.removeChild(el);
}

function handleLinkClicks() {
  document.querySelectorAll('a').forEach((link) => {
    if (link.href.startsWith('http://') || link.href.startsWith('https://')) {
      link.addEventListener('click', openInfo);
    }
  });
}

initPrevention();
createShadowDom();
handleLinkClicks();