<script setup>
import HomePage from './components/HomePage.vue'
import ThanksPage from './components/ThanksPage.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { site, pagePath } from './site.js'
import privacy from './locales/privacy/en.json'

defineProps({
  lang: { type: String, required: true },
  page: { type: String, required: true },
  copy: { type: Object, required: true },
})
</script>

<template>
  <div :class="page === 'thanks' ? 'thanks-shell' : 'site-shell'">
    <template v-if="page === 'privacy'">
      <main class="privacy-document">
        <a :href="pagePath(site.defaultLang)">{{ copy.thanks.home }}</a>
        <h1>{{ privacy.title }}</h1>
        <p v-if="site.privacyDraft"><strong>{{ privacy.draft }}</strong></p>
        <p v-for="paragraph in privacy.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </main>
    </template>
    <template v-else>
      <SiteHeader :lang="lang" :page="page" :t="copy[page === 'thanks' ? 'thanks' : 'main']" />
      <HomePage v-if="page === 'home'" :lang="lang" :t="copy.main" />
      <ThanksPage v-else :t="copy.thanks" />
      <SiteFooter :lang="lang" :page="page" :t="copy.main" />
    </template>
  </div>
</template>
