<template>
  <form class="text-sm">
    <div class="py-1">
      <label>
        <input
          type="checkbox"
          value="automaticUpdates"
          class="mr-1"
          @change="handleChange"
          :checked="settings.automaticUpdates"
        />
        {{ getMessage('option_automaticUpdates') }}
      </label>
    </div>
    <div class="py-1">
      <label>
        <input
          type="checkbox"
          value="preventTrusted"
          class="mr-1"
          @change="handleChange"
          :checked="settings.preventTrusted"
        />
        {{ getMessage('option_preventTrusted') }}
      </label>
    </div>
  </form>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  import { storage } from '../utilities/connector.js';
  
  export default {
    data() {
      return {
        settings: {}
      }
    },
    async mounted() {
      this.settings = await storage.get('settings/general');
    },
    methods: {
      getMessage,
      handleChange(event) {
        const target = event.target;
        this.settings[target.value] = target.checked;
        storage.set('settings/general', this.settings);
      }
    }
  }
</script>