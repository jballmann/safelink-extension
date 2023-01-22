<template>
  <div v-if="loading">
    {{ getMessage('loading') }}
  </div>
  <div v-else class="space-y-8 mb-16">
    <div class="space-x-2">
      <button
        class="option-btn bg-blue-500 hover:bg-blue-600"
        :disabled="loadingLists.length > 0"
        @click="updateAll()"
      >
        <i class="im im-sync mr-1 transform translate-y-2px"></i>
        {{ getMessage('update') }}
      </button>
      <button
        @click="openAddList()"
        class="option-btn bg-blue-500 hover:bg-blue-600"
        :disabled="showAddList"
      >
        <i class="im im-plus mr-1 transform translate-y-2px"></i>
        {{ getMessage('addList') }}
      </button>
      <button
        @click="apply()"
        class="text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-200 disabled:pointer-events-none rounded"
        :disabled="!changeMade || isBuilding"
      >
        <i class="im im-save mr-1 transform translate-y-2px"></i>
        {{ getMessage('applyChanges') }}
      </button>
    </div>
    <form
      @submit.prevent="addList()"
      v-if="showAddList"
      class="shadow rounded p-4 space-y-2"
    >
      <div>
        <input
          ref="urlInput"
          class="text-sm px-2 py-1 w-full border"
          type="text"
          :placeholder="getMessage('insertListUrl')"
          v-model="listUrl"
        />
      </div>
      <div class="text-right space-x-2">
        <button
          @click="showAddList = false"
          class="option-btn bg-gray-400 hover:bg-gray-500"
        >
          {{ getMessage('hide') }}
        </button>
        <button
          type="submit"
          class="option-btn bg-blue-500 hover:bg-blue-600"
        >
          {{ getMessage('addList') }}
        </button>
      </div>
    </form>
    <div>
      <h2 class="text-lg text-trusted mb-3">
        <i class="im im-check-mark-circle mr-2 transform translate-y-2px"></i>
        {{ getMessage('type_trusted') }}
      </h2>
      <SettingsListsCard
        @toggle="toggleList"
        @update="updateList"
        @remove="removeList"
        :categorized="categorizedLists.trusted"
        :loadingLists="loadingLists"
      />
    </div>
    
    <div>
      <h2 class="text-lg text-redirect mb-3">
        <i class="im im-flash mr-2 transform translate-y-2px"></i>
        {{ getMessage('type_redirect') }}
      </h2>
      <SettingsListsCard
        @toggle="toggleList"
        @update="updateList"
        @remove="removeList"
        :categorized="categorizedLists.redirect"
        :loadingLists="loadingLists"
      />
    </div>
      
    <div>
      <h2 class="text-lg text-suspicious mb-3">
        <i class="im im-warning-circle mr-2 transform translate-y-2px"></i>
        {{ getMessage('type_suspicious') }}
      </h2>
      <SettingsListsCard
        @toggle="toggleList"
        @update="updateList"
        @remove="removeList"
        :categorized="categorizedLists.suspicious"
        :loadingLists="loadingLists"
      />
    </div>
  </div>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  import { storage } from '../utilities/connector.js';
  
  import SettingsListsCard from './SettingsListsCard.vue';
  
  export default {
    components: {
      SettingsListsCard
    },
    data() {
      return {
        myLists: {},
        loadingLists: [],
        showAddList: false,
        loading: true,
        changeMade: false,
        isBuilding: false,
        listUrl: null
      }
    },
    async mounted() {
      this.myLists = await storage.get('settings/lists');
      this.loading = false;
      messenger.storage.local.onChanged.addListener(async (type) => {
        if (type['settings/lists']) {
          this.myLists = await storage.get('settings/lists');
          this.changeMade = true;
        }
      });
    },
    computed: {
      categorizedLists() {
        const groups = {
          default: [],
          regions: [],
          custom: []
        };
        const categorized = {
          trusted: JSON.parse(JSON.stringify(groups)),
          redirect: JSON.parse(JSON.stringify(groups)),
          suspicious: JSON.parse(JSON.stringify(groups))
        };
        for (const listId in this.myLists) {
          const list = this.myLists[listId];
          categorized[list.type][list.group].push({
            ...list,
            id: listId
          });
        }
        return categorized;
      }
    },
    methods: {
      getMessage,
      openAddList() {
        this.showAddList = true;
        this.$nextTick(() => {
          this.$refs.urlInput.focus();
        });
      },
      toggleList({ id, on }) {
        this.myLists[id].off = !on;
        storage.set('settings/lists', this.myLists);
        this.changeMade = true;
      },
      removeList(id) {
        delete this.myLists[id];
        storage.set('settings/lists', this.myLists);
        this.changeMade = true;
      },
      async updateList(id) {
        this.loadingLists.push(id);
        await messenger.runtime.sendMessage({
          command: 'update',
          payload: id
        });
        this.loadingLists.splice(this.loadingLists.indexOf(id), 1);
        this.changeMade = true;
      },
      updateAll() {
        this.loadingLists = [];
        for (const listId in this.myLists) {
          if (!this.myLists[listId].off) { 
            this.loadingLists.push(listId);
            (async () => {
              await messenger.runtime.sendMessage({
                command: 'update',
                payload: listId
              });
              this.loadingLists.splice(this.loadingLists.indexOf(listId), 1);
            })();
          }
        }
        this.changeMade = true;
      },
      async apply() {
        this.isBuilding = true;
        await messenger.runtime.sendMessage({
          command: 'build'
        });
        this.isBuilding = false;
        this.changeMade = false;
      },
      async addList() {
        await messenger.runtime.sendMessage({
          command: 'addList',
          payload: this.listUrl
        });
        this.showAddList = false;
        this.listUrl = null;
        this.changeMade = true;
      }
    }
  }
</script>