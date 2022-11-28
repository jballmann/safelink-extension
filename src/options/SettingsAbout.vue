<template>
  <div class="space-y-3">
    <div>Version: 0.0.1 (beta)</div>
    <div>
      <a
        @click.prevent="openBrowser(repoUrl)"
        class="text-blue-600 hover:underline"
        :href="repoUrl"
      >
        {{ repoUrl }}
      </a>
    </div>
    <div>
      &copy; jballmann, 2022
    </div>
    <div>
      Licence: GPLv3
    </div>
    <div>
      External dependencies:
      <ul class="pl-1 text-sm">
        <li v-for="([name, by], url) in dependencies">
          <a
            class="text-blue-600 hover:underline"
            @click.prevent="openBrowser(url)"
            :href="url"
          >
            {{ name }} by {{ by }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        repoUrl: 'http://www.github.com/jballmann/safelink-extension',
        dependencies: {
          'https://github.com/ghostery/adblocker': ['Adblocker', 'Ghostery'],
          'https://vuejs.org': ['Vue.js', 'Yuxi (Evan) You'],
          'https://windicss.org': ['Windi CSS', 'Veritas Raven'],
          'https://github.com/aceakash/string-similarity': ['string-similarity', 'Akash Kurdekar'],
          'https://iconmonstr.com': ['iconmonstr font', 'Alexander Kahlkopf']
        }
      }
    },
    methods: {
      openBrowser(url) {
        messenger.runtime.sendMessage({
          command: 'openBrowser',
          payload: url
        });
      }
    }
  }
</script>