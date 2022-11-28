<template>
  <ul class="tabs">
    <li v-for="(tabLabel, tabIndex) in tabs"
      @click="$emit('change', tabIndex)"
      class="tab"
      :class="{ 'active': tab === tabIndex }"
    >
      {{ tabLabel }}
    </li>
  </ul>
</template>

<script>
  export default {
    props: ['tabs', 'tab'],
    emits: ['change']
  }
</script>