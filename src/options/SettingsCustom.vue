<template>
  <div class="space-y-8 mb-16">
    <div>
      <h2 class="text-lg text-custom mb-3">
        <i class="im im-star mr-2 transform translate-y-1px"></i>
        {{ getMessage('type_custom') }}
      </h2>
      <div class="shadow py-2 rounded space-y-2">
        <div
          v-for="(applies, domain) in domains.custom"
          class="flex w-full hover:bg-gray-100 items-center px-4 py-2"
        >
          <div class="flex-auto">{{ domain }}</div>
          <div class="flex-none">
            <button
              @click="deleteDomain('custom', domain)"
              class="flex items-center justify-center text-sm rounded-1/2 text-gray-600 w-30px h-30px hover:bg-black/10"
            >
              <i class="im im-x-mark" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h2 class="text-lg text-gray-500 mb-3">
        <i class="im im-eye-off mr-2 transform translate-y-2px"></i>
        Fenster nicht anzeigen für
      </h2>
      <div class="shadow py-2 rounded space-y-2">
        <div
          v-for="(applies, domain) in domains.prevention"
          class="flex w-full hover:bg-gray-100 items-center px-4 py-2"
        >
          <div class="flex-auto">{{ domain }}</div>
          <div class="flex-none">
            <button
              @click="deleteDomain('prevention', domain)"
              class="flex items-center justify-center text-sm rounded-1/2 text-gray-600 w-30px h-30px hover:bg-black/10"
            >
              <i class="im im-x-mark" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  
  export default {
    data() {
      return {
        domains: {
          custom: {},
          prevention: {}
        }
      }
    },
    async mounted() {
      this.domains.custom = (await messenger.storage.local.get('settings/custom'))['settings/custom'];
      this.domains.prevention = (await messenger.storage.local.get('settings/prevention'))['settings/prevention'];
      messenger.storage.local.onChanged.addListener(async (type) => {
        if (type['settings/custom']) {
          this.domains.custom = (await messenger.storage.local.get('settings/custom'))['settings/custom'];
        }
        if (type['settings/prevention']) {
          this.domains.prevention = (await messenger.storage.local.get('settings/prevention'))['settings/prevention'];
        }
      });
    },
    methods: {
      getMessage,
      deleteDomain(type, domain) {
        const domains = JSON.parse(JSON.stringify(this.domains[type]));
        delete domains[domain];
        messenger.storage.local.set({ ['settings/' + type]: domains });
      }
    }
  }
</script>