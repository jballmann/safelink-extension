import { FiltersEngine } from '@cliqz/adblocker';
import { updateLists } from './update.js';

export default class Register {
  constructor() {
    this.index = {};
    this.rebuild();
  }
  
  get() {
    return this.index;
  }
  
  async rebuild() {
    const myLists = (await messenger.storage.local.get('settings/lists'))['settings/lists'];
    this.index = JSON.parse(JSON.stringify({
      trusted: {
        orgs: {},
        domains: {}
      },
      redirect: {
        dereferrers: [],
        redirects: []
      },
      suspicious: null
    }));
    
    let listsByCategory = {
      trusted: [],
      redirect: [],
      suspicious: []
    };
    const missingUpdates = [];
    for (const listId in myLists) {
      const { off, type } = myLists[listId];
      if (!off) {
        const cached = (await messenger.storage.local.get('cached/' + listId))['cached/' + listId];
        if (!cached) {
          missingUpdates.push(updateLists(listId))
        }
        listsByCategory[type].push(listId);
      }
    }
    if (missingUpdates.length > 0) {
      await Promise.all(missingUpdates);
    }
    this._buildTrusted(listsByCategory.trusted);
    this._buildRedirect(listsByCategory.redirect);
    this._buildSuspicious(listsByCategory.suspicious);
  }
  
  async _buildTrusted(lists) {
    let external = {};
    for (const listId of lists) {
      const cached = (await messenger.storage.local.get('cached/' + listId))['cached/' + listId];
      if (cached?.data) {
        const data = cached.data;
        this.index.trusted.orgs = {
          ...this.index.trusted.orgs,
          ...(data.orgs || {})
        };
        this.index.trusted.domains = {
          ...this.index.trusted.domains,
          ...(data.domains || {})
        };
        if (data.external) {
          for (const externalId in data.external) {
            if (!external[externalId]) {
              const { url, ids } = data.external[externalId];
              external[externalId] = {url, ids};
            }
            else {
              external[externalId].ids.concat(data.external[externalId].ids);
            }
          }
        }
      }
    }
    this._addExternals(external, Object.keys(lists));
  }

  async _buildRedirect(lists) {
    for (const listId of lists) {
      const cached = (await messenger.storage.local.get('cached/' + listId))['cached/' + listId];
      if (cached?.data) {
        const data = cached.data;
        this.index.redirect.redirects = [
          ...this.index.redirect.redirects,
          ...(data.redirects || {})
        ];
        this.index.redirect.dereferrers = [
          ...this.index.redirect.dereferrers,
          ...(data.dereferrers || {})
        ];
      }
    }
  }

  async _buildSuspicious(lists) {
    let filters = [];
    for (const listId of lists) {
      const cached = (await messenger.storage.local.get('cached/' + listId))['cached/' + listId];
      filters.push(cached);
    }
    this.index.suspicious = await FiltersEngine.parse(filters.join('\n'));
  }

  async _addExternals(external, existingIds) {
    for (const externalId in external) {
      if (existingIds.indexOf(externalId) > -1) {
        continue;
      }
      let { url, ids } = external[externalId];
      ids = [...new Set(ids)];
      
      const cached = (await messenger.storage.local.get('cached/' + externalId))['cached/' + externalId]
     
      let orgs;
      try {
        const response = await window.fetch(url);
        const body = await response.json();
        if (!cached && new Date(cached.version) < new Date(body.version)) {   
          orgs = body.data.orgs;
          await messenger.storage.local.set({
            ['cached/' + externalId]: { version: body.version, data: { orgs } }
          })
        }
      }
      catch (err) { console.log(err); }
      
      if (!orgs) {
        orgs = cached.data.orgs;
      }
      
      const specificOrgs = {};
      for (const orgId of ids) {
        specificOrgs[orgId] = orgs[orgId];
      }
      
      this.index.trusted.orgs = {
        ...this.index.trusted.orgs,
        ...specificOrgs
      };
    }
  }
}