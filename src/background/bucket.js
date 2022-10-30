export default class Bucket {
  
  constructor(name, type) {
    this.name = name;
    this.type = type || 'text';
  }
  
  async fetch(url) {
    try {
      const response = await window.fetch(url);
      if (this.type === 'json') {
        this._store((await response.json()).data);
        return;
      }
      this._store(await response.text());
    }
    catch (error) {
      console.log(error);
      return;
    }
  }
  
  async _store(data) {
    const bucket = {};
    bucket[this.name] = data;
    await messenger.storage.local.set(bucket);
  }
  
  async get() {
    return (await messenger.storage.local.get(this.name))[this.name]; 
  }
}