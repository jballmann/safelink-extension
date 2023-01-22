/*eslint-enable*/
import SafelinkCore from 'safelink-core';
import Connector from '../utilities/connector.js';
const { storage } = Connector;

let core;

async function registerRuntimeMessageHandler() {
  messenger.runtime.onMessage.addListener(async (message) => {
    if (message && message['command']) {
      // Check for known commands.
      switch (message.command) {
        case 'log':
          console.log(message.payload);
          break;
        case 'findDomain':
          return await core.findDomain(message.payload);
        case 'findRedirectDomain':
          return await core.findRedirectDomain(message.payload);
        case 'trustUnknown':
          return await core.prefer.trustUnknown(message.payload);
        case 'getPrevention':
          return await core.prefer.getPrevention();
        case 'setPrevention':
          return await core.prefer.setPrevention(message.payload);
        case 'openBrowser':
          return openBrowser(message.payload);
        case 'openTab':
          return openTab(message.payload);
        case 'update':
          return await core.updater.updateLists(message.payload);
        case 'build':
          return await core.register.rebuild();
        case 'addList':
          return await core.updater.addList(message.payload);
      }
    }
  });
}

function openBrowser(url) {
  messenger.windows.openDefaultBrowser(url);
}

function openTab(url) {
  messenger.tabs.create({ url });
}

async function registerContentScripts() {
  await messenger.messageDisplayScripts.register({
    js: [
      { file: 'content.js' }
    ],
    css: [
      { file: 'inject-iconmonstr.css' }
    ]
  });
}

messenger.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === 'install') {
    await storage.set({ 'settings/general': {
      automaticUpdates: true
    }});
    messenger.runtime.openOptionsPage();
  }
});

async function run() {
  core = new SafelinkCore(Connector);
  core.create();
  
  registerContentScripts();
  registerRuntimeMessageHandler();
}

document.addEventListener('DOMContentLoaded', run);