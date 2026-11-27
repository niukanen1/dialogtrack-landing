<script setup>
import { computed } from 'vue'
import LanguageMenu from './LanguageMenu.vue'
import { pagePath } from '../site.js'
const props = defineProps({ lang: { type: String, required: true }, page: { type: String, required: true }, t: { type: Object, required: true } })
const home = computed(() => props.page === 'home')
</script>

<template>
  <header :class="home ? 'dt-header sticky-header' : 'thanks-header'">
    <div class="header-inner">
      <a :href="home ? '#top' : pagePath(lang)" :class="home ? 'brand' : 'thanks-brand'">
        <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true"><rect x="1" y="1" width="32" height="18" rx="9" fill="#11141A"></rect><circle cx="10" cy="10" r="3" fill="#F2555A"></circle><rect x="17" y="8" width="2" height="5" rx="1" fill="#F5F1E6"></rect><rect x="21" y="6" width="2" height="8" rx="1" fill="#F5F1E6"></rect><rect x="25" y="8.5" width="2" height="4" rx="1" fill="#F5F1E6"></rect></svg>
        <span class="wordmark">DialogTrack</span>
      </a>
      <nav v-if="home" class="dt-nav anchor-nav" :aria-label="t.navAria">
        <a href="#how" class="nav-link">{{ t.navHow }}</a>
        <a href="#languages" class="nav-link">{{ t.navLang }}</a>
        <a href="#privacy" class="nav-link">{{ t.navPrivacy }}</a>
        <a href="#pricing" class="nav-link">{{ t.navBeta }}</a>
        <a href="#faq" class="nav-link">{{ t.navFaq }}</a>
      </nav>
      <a v-else :href="pagePath(lang)" class="home-link">{{ t.home }}</a>
      <LanguageMenu :lang="lang" :page="page" :label="t.langAria" />
      <a v-if="home" href="#beta" class="header-cta">{{ t.cta }}</a>
    </div>
  </header>
</template>
