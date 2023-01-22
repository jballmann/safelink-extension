const connector = {
  storage: {
    async get(key) {
      return (await messenger.storage.local.get(key))[key];
    },
    async set(key, value) {
      value = JSON.parse(JSON.stringify(value));
      await messenger.storage.local.set({ [key]: value }); 
    },
    async remove(key) {
      await messenger.storage.local.remove(key);
    }
  },
  async fetch(url) {
    return await window.fetch(url);
  }
};
const { storage, fetch } = connector;

export {
  connector as default,
  storage,
  fetch
};