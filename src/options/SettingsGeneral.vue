<template>
  <form class="text-sm">
    <div class="py-1">
      <label>
        <input type="checkbox" class="mr-1" />
        {{ getMessage('option_automaticUpdates') }}
      </label>
    </div>
    <div class="py-1">
      <label>
        <input type="checkbox" class="mr-1" />
        {{ getMessage('option_preventTrusted') }}
      </label>
    </div>
  </form>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  
  export default {
    methods: {
      getMessage
    }
  }
</script>