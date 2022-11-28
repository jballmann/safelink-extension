<template>
  <div class="flex w-full items-center justify-center p-4 pointer-events-none">
    <div class="flex-none mr-2"><img src="assets/logo/32x32.png" /></div>
    <div class="flex-auto text-gray-500">Safelink extension</div>
  </div>
  <TabBar
    :tabs="[getMessage('general'), getMessage('lists'), getMessage('custom'), getMessage('about')]"
    :tab="tab"
    @change="(e) => tab = e"
  />
  <div class="p-1.5rem max-w-800px">
    <SettingsGeneral v-if="tab === 0" />
    <SettingsLists v-if="tab === 1" />
    <SettingsCustom v-if="tab === 2" />
    <SettingsAbout v-if="tab === 3" />
  </div>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  import TabBar from './TabBar.vue';
  
  import SettingsGeneral from './SettingsGeneral.vue';
  import SettingsLists from './SettingsLists.vue';
  import SettingsCustom from './SettingsCustom.vue';
  import SettingsAbout from './SettingsAbout.vue';
  
  export default {
    components: {
      TabBar,
      SettingsGeneral,
      SettingsLists,
      SettingsCustom,
      SettingsAbout
    },
    data() {
      return {
        tab: 0
      }
    },
    methods: {
      getMessage
    }
  }
</script>