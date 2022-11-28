<template>
  <div class="fixed box-border text-left text-base font-sans w-screen h-screen bg-black/25 overflow-auto">
    <div
      @click="backdropClickHandler"
      @keydown.esc="closeEventHandler"
      class="flex w-full items-center justify-center p-8 min-h-screen"
    >
      <div class="bg-white max-w-550px rounded">
        <div
          v-if="mismatchedLink"
          class="pt-8"
        >
          <div class="alert alert-warning text-sm">
            {{ getMessage('mismatchedLink').replace('$text', mismatchedLink) }}
          </div>
        </div>
        <DomainInfo
          class="px-8 py-4"
          :url="url"
          :data="domainInfo"
        />
        <div
          v-if="domainInfo?.type === 'redirect'"
          class="elevated rounded-t px-8 pb-4 pt-1.5rem"
        >
          <div
            v-if="redirectLoading"
            class="flex w-full items-center justify-center"
          >
            <div class="loader animate-spin mr-2"></div>
            {{ getMessage('analyzeRedirect') }}
          </div>
          <template v-if="redirect">
            <div v-if="redirect.notFound">
              {{ getMessage('invalidRedirect') }}
            </div>
            <div v-if="redirect.invalid">
              {{ getMessage('noRedirect') }}
            </div>
            <DomainInfo
              v-if="redirect.url && redirect"
              :url="redirect.url"
              :data="redirect"
            />
          </template>
        </div>
        <div
          v-if="loading"
          class="flex w-full items-center justify-center px-8 pb-4"
        >
          <div class="loader animate-spin mr-2"></div>
          {{ getMessage('analyze') }}
        </div>
        <div
          v-if="
            domainInfo?.type === 'trusted' ||
            domainInfo?.type === 'unknown' ||
            domainInfo?.type === 'custom'
          "
          class="text-center px-8 pb-4"
        >
          <label class="inline-flex items-center justify-center cursor-pointer text-sm">
            <template
              v-if="domainInfo.type === 'trusted' || domainInfo.type === 'custom'"
            >
              <input
                type="checkbox"
                v-model="prevent"
                class="mr-2"
              />
              {{ getMessage('preventDomain') }}
            </template>
            <template v-if="domainInfo.type === 'unknown'">
              <input
                type="checkbox"
                v-model="trustUnknown"
                class="mr-2"
              />
              {{ getMessage('trustDomain') }}
            </template>
          </label>           
        </div>
        <div class="px-8 pb-1.5rem">
          <button
            ref="openLinkButton"
            class="w-full text-white p-3 text-center rounded no-underline focus:outline focus:outline-4 focus:outline-black/10 focus:outline-offset-4"
            :class="buttonClass"
            :href="url"
            @click.prevent="openURL()"
          >
            {{ getMessage('openURL') }}
            <i
              class="text-xs ml-2 im"
              :class="buttonIconClass"
            ></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getMessage } from '../utilities/i18n.js';
  import DomainInfo from './DomainInfo.vue';
  
  export default {
    components: {
      DomainInfo
    },
    props: ['url', 'mismatchedLink', 'closeInfo', 'storePrevention'],
    data() {
      return {
        loading: true,
        redirectLoading: true,
        domainInfo: null,
        redirect: null,
        buttonStatus: 'unknown',
        prevent: false,
        trustUnknown: false
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.$refs.openLinkButton.focus();
      });
      this.getDomainInfo();
    },
    computed: {
      buttonClass() {
        return this.buttonStatus === 'suspicious' ? 'btn-suspicious' : 'btn-primary';
      },
      buttonIconClass() {
        return this.buttonStatus === 'suspicious' ? 'im-warning' : 'im-external-link';
      }
    },
    methods: {
      getMessage,
      openURL() {
        messenger.runtime.sendMessage({
          command: 'openBrowser',
          payload: this.url
        });
        this.closeEventHandler();
      },
      backdropClickHandler(e) {
        if (e.target !== e.currentTarget) {
          return;
        }
        this.closeEventHandler();
      },
      async closeEventHandler() {
        if (this.prevent) {
          this.storePrevention(this.domainInfo.domain);
        }
        if (this.trustUnknown) {
          messenger.runtime.sendMessage({
            command: 'trustUnknown',
            payload: this.domainInfo.domain
          });
        }
        this.closeInfo();
      },
      async getDomainInfo() {
        this.domainInfo = await messenger.runtime.sendMessage({
          command: 'findDomain',
          payload: this.url
        });
        this.loading = false;
        this.buttonStatus = this.domainInfo.type || 'unknown';
        if (this.domainInfo?.type === 'redirect') {
          this.getRedirectInfo();
        }
      },
      async getRedirectInfo() {
        if (this.domainInfo.dereferrerTarget) {
          console.log('is dereferrer');
          this.redirect = await messenger.runtime.sendMessage({
            command: 'findDomain',
            payload: this.domainInfo.dereferrerTarget
          });
          this.redirect.url = this.domainInfo.dereferrerTarget;
        }
        else {
          this.redirect = await messenger.runtime.sendMessage({
            command: 'findRedirectDomain',
            payload: this.url
          });
        }
        this.redirectLoading = false;
        this.buttonStatus = this.redirect?.type || this.buttonStatus;
      }
    }
  }
</script>