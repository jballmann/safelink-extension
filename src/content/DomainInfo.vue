<template>
  <div class="table table-fixed w-full box-border">
    <div class="table-row">
      <div class="table-cell py-1 pr-4 w-80px text-gray-500">
        URL
      </div>
      <div
        class="table-cell py-1 truncate text-gray-500"
        :title="url"
      >
        {{ url }}
      </div>
    </div>
    <div
      v-if="data"
      class="table-row"
    >
      <div class="table-cell py-1 pr-4 w-80px">
        Domain
      </div>
      <div class="table-cell py-1">
        <div class="flex w-full justify-between">
          <div class="flex-auto">
            <div :class="color">
              <div
                class="inline-block"
                :class="isSimilar ? 'underline decoration-red-500 decoration-wavy' : ''"
              >
                <b>{{ data.secondLevelDomain }}</b>.{{ data.topLevelDomain }}
              </div>
            </div>
            <div class="text-xs text-gray-500">
            {{ getMessage('type_' + data.type) }}
            <template v-if="getMessage('description_' + data.type)">
              - {{ getMessage('description_' + data.type) }}
            </template>
            </div>
          </div>
          <div class="flex-none">
            <i
              class="text-2xl"
              :class="['im', iconClass, color]"
            ></i>
          </div>
        </div>
        <div
          v-if="isSimilar"
          class="text-sm text-suspicious mt-2"
        >
          {{ getMessage('similarDomain').replace('$text', data.similar.target) }}
        </div>
      </div>
    </div>
    <div
      v-if="data?.nm"
      class="table-row"
    >
      <div class="table-cell py-1 pr-4 width-80px">
        {{ getMessage('by') }}
      </div>
      <div class="table-cell py-1">
        <div>
          {{ data.nm }}
        </div>
        <div class="text-xs text-gray-500">
          {{ getMessage('sector_' + data.se) }}, {{ data.co }}
        </div>
      </div>
    </div>
    <div
      v-if="data?.type === 'unknown'"
      class="table-row"
    >
      <div class="table-cell py-1 pr-4 width-80px"></div>
      <div class="table-cell py-1">
        <a
          class="text-primary underline cursor-pointer"
          @click="checkDomain()"
        >
          {{ getMessage('checkDomain') }}
          <i class="text-xs im im-angle-right"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  
  export default {
    props: ['url', 'data'],
    computed: {
      color() {
        return 'text-' + this.data.type;
      },
      iconClass() {
        switch(this.data.type) {
          case 'trusted':
            return 'im-check-mark-circle';
          case 'suspicious':
            return 'im-warning-circle';
          case 'redirect':
            return 'im-flash';
          case 'custom':
            return 'im-star';
          default:
            return 'im-question';
        }
      },
      lang() {
        return this.getMessage('@@ui_locale');
      },
      isSimilar() {
        return this.data.similar?.rating >= 0.7;
      }
    },
    methods: {
      getMessage,
      checkDomain() {
        messenger.runtime.sendMessage({
          command: 'openTab',
          payload: 'http://duckduckgo.com?q=' + this.url
        });
      }
    }
  }
</script>