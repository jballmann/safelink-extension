const DEFAULT_URL = 'https://raw.githubusercontent.com/jballmann/safelink-lists/main/lists/default_lists.json';

export async function updateMyLists() {
  const myLists = (await messenger.storage.local.get('settings/lists'))['settings/lists'] || {};
  const defaultVersion = (await messenger.storage.local.get('timestamp/default'))['timestamp/default'];
  
  let body;
  try {
    const response = await window.fetch(DEFAULT_URL);
    body = await response.json();
  }
  catch {
    // assets fetching failed
    return;
  }
  
  // check version
  if (!body || (defaultVersion && new Date(body.version) <= new Date(defaultVersion))) {
    return;
  }
  
  messenger.storage.local.set({ 'timestamp/default': body.version });
  
  for (const deleteId of body.data.delete) {
    delete myLists[deleteId];
    messenger.storage.local.remove('cached/' + deleteId);
  }
  
  for (const listId in body.data.list) {
    const listDetails = body.data.list[listId];
    
    let off;
    if (myLists[listId]) {
      off = myLists[listId].off;
    }
    else {
      off = listDetails.off || false;
    }
    
    myLists[listId] = {
      ...myLists[listId],
      ...listDetails,
      off
    };
  }
  await messenger.storage.local.set({ 'settings/lists': myLists });
}

export async function updateLists(singleList) {
  const myLists = (await messenger.storage.local.get('settings/lists'))['settings/lists'];
  
  const update = async (listId, { url, type }) => {
    const cached = (await messenger.storage.local.get('cached/' + listId))['cached/' + listId];
    let body;
    try {
      const response = await window.fetch(url);
      // if json format
      if (type === 'trusted' || type === 'redirect') {
        body = await response.json();
        if (cached && new Date(cached.version) >= new Date(body.version)) {
          return;
        } 
        if (body.title) {
          myLists[listId].title = body.title;
        }
        if (body.website) {
          myLists[listId].web = body.website;
        }
        await messenger.storage.local.set({ ['cached/' + listId]: body });
      }
      else if (type === 'suspicious') {
        body = await response.text();
        const matchTitle = body.match(/^[!#]\sTitle:\s(.*)$/m);
        if (matchTitle) {
          myLists[listId].title = matchTitle[1];
        }
        const matchWeb = body.match(/^[!#]\s(Homepage|Website):\s(.*)$/m);
        if (matchWeb) {
          myLists[listId].web = matchWeb[2];
        }
        await messenger.storage.local.set({ ['cached/' + listId]: body });
      }
    }
    catch (err) { console.log(err); }
  }
  
  if (singleList) {
    await update(singleList, myLists[singleList]);
  }
  else {
    const promises = [];
    for (const listId in myLists) {
      const { off, url, type } = myLists[listId];
      if (!off) {
        promises.push(update(listId, { url, type }));
      }
    }
    await Promise.all(promises);
  }
  messenger.storage.local.set({ ['settings/lists']: myLists });
}

export async function addCustomList(url) {
  const myLists = (await messenger.storage.local.get('settings/lists'))['settings/lists'];
  
  try {
    const response = await window.fetch(url);
    const body = await response.text();
    try {
      // is in json format (trusted, redirect)
      const json = JSON.parse(body);
      const id = json.id || url;
      myLists[id] = {
        url,
        type: json.type,
        group: 'custom',
        off: false
      }
      if (json.title) {
        myLists[id].title = body.title;
      }
      if (body.website) {
        myLists[id].web = body.website;
      }
      await messenger.storage.local.set({ ['cached/' + id]: json });
    }
    catch {
      // is in text format (suspicious)
      myLists[url] = {
        url,
        type: 'suspicious',
        group: 'custom',
        off: false
      }
      const matchTitle = body.match(/^[!#]\sTitle:\s(.*)$/m);
      if (matchTitle) {
        myLists[url].title = matchTitle[1];
      }
      const matchWeb = body.match(/^[!#]\s(Homepage|Website):\s(.*)$/m);
      if (matchWeb) {
        myLists[url].web = matchWeb[2];
      }
      await messenger.storage.local.set({ ['cached/' + url]: body });
    }
    messenger.storage.local.set({ ['settings/lists']: myLists });
  }
  catch (err) {
    console.log(err);
  }
}