<script setup>
import { site, pagePath } from '../site.js'
import { useSignup } from '../signup.js'
const props = defineProps({ lang: { type: String, required: true }, t: { type: Object, required: true } })
const { ready, busy, failed, sent, demo, challenge, submit } = useSignup(props.lang)
</script>

<template>
  <form method="post" :data-mode="site.form.endpoint ? 'live' : 'demo'" :aria-label="t.heroFormAria" class="hero-form" @submit.prevent="submit">
    <label for="hero-email" class="sr-only">{{ t.emailLabel }}</label>
    <input id="hero-email" name="email" type="email" required="required" autocomplete="email" :placeholder="t.emailExample" class="hero-email">
    <label v-if="site.form.endpoint" for="hero-consent" class="consent-field"><input id="hero-consent" name="consent" type="checkbox" required class="consent-check">{{ t.sConsent }} <a :href="pagePath(site.defaultLang, 'privacy')">{{ t.legalLink }}</a></label>
    <button type="submit" :disabled="!ready || busy" class="hero-submit">{{ t.heroBtn }}</button>
    <label class="form-trap" aria-hidden="true"><input tabindex="-1" autocomplete="off" name="website"></label>
    <div ref="challenge" class="challenge"></div>
    <p v-if="failed" role="alert" class="form-feedback">{{ t.formError }}</p>
    <p v-if="demo" role="status" class="form-feedback form-demo">{{ t.formDemo }} <a :href="pagePath(lang, 'thanks')">{{ t.sentLink }}</a></p>
    <p v-if="sent" role="status" class="form-feedback">{{ t.sentHero }} <a :href="pagePath(lang, 'thanks')">{{ t.sentLink }}</a></p>
  </form>
</template>
