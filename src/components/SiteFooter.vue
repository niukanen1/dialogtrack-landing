<script setup>
import { site, pagePath } from '../site.js'
defineProps({ lang: { type: String, required: true }, page: { type: String, required: true }, t: { type: Object, required: true } })
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div role="group" :aria-label="t.langAria" class="footer-languages">
        <a v-for="code in site.languages" :key="code" :href="pagePath(code, page)" :lang="code" :hreflang="code" :aria-current="code === lang ? 'page' : undefined" class="footer-language">{{ site.nativeNames[code] }}</a>
      </div>
      <div class="footer-links">
        <span class="footer-brand">DialogTrack</span>
        <span>{{ t.copyright }}</span>
        <a :href="pagePath(site.defaultLang, 'privacy')" class="footer-link">{{ t.footPrivacy }}</a>
        <a class="footer-email footer-link" :href="'mailto:' + site.email">{{ site.email }}</a>
      </div>
    </div>
  </footer>
</template>
