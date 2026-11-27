<script setup>
import { site, pagePath } from '../site.js'
import { useSignup } from '../signup.js'
const props = defineProps({ lang: { type: String, required: true }, t: { type: Object, required: true } })
const { ready, busy, failed, sent, demo, challenge, submit } = useSignup(props.lang)
</script>

<template>
  <form method="post" :data-mode="site.form.endpoint ? 'live' : 'demo'" :aria-label="t.sFormAria" class="signup-form" @submit.prevent="submit">
    <div class="price-cards">
      <div class="form-field">
        <label for="beta-email" class="field-label">{{ t.sEmail }}</label>
        <input id="beta-email" name="email" type="email" required="required" autocomplete="email" :placeholder="t.emailExample" class="text-input">
      </div>
      <div class="form-field">
        <label for="beta-langs" class="field-label">{{ t.sLangs }}</label>
        <input id="beta-langs" name="languages" type="text" :placeholder="t.sLangsPh" class="text-input">
      </div>
    </div>
    <div class="price-cards">
      <div class="form-field">
        <label for="beta-role" class="field-label">{{ t.sRole }}</label>
        <select id="beta-role" name="role" class="select-input">
          <option v-for="option in t.roles" :key="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="beta-mac" class="field-label">{{ t.sMac }}</label>
        <select id="beta-mac" name="mac" class="select-input">
          <option v-for="option in t.macs" :key="option">{{ option }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="beta-macos" class="field-label">{{ t.sMacos }}</label>
        <select id="beta-macos" name="macos" class="select-input">
          <option v-for="option in t.macoses" :key="option">{{ option }}</option>
        </select>
      </div>
    </div>
    <fieldset class="app-fieldset">
      <legend class="app-legend">{{ t.sApps }}</legend>
      <div class="app-options">
        <label v-for="(app, index) in t.formApps" :key="app" :for="'beta-app-' + index" class="app-option"><input :id="'beta-app-' + index" type="checkbox" name="apps" :value="app" class="app-check">{{ app }}</label>
      </div>
    </fieldset>
    <label for="beta-consent" class="consent-field"><input id="beta-consent" type="checkbox" name="consent" required="required" class="consent-check">{{ t.sConsent }}</label>
    <button type="submit" :disabled="!ready || busy" class="signup-submit">{{ t.sSubmit }}</button>

    <p class="legal-copy">{{ t.legalPre }} <a :href="pagePath(site.defaultLang, 'privacy')">{{ t.legalLink }}</a>{{ t.legalPost }}</p>
    <label class="form-trap" aria-hidden="true"><input tabindex="-1" autocomplete="off" name="website"></label>
    <div ref="challenge" class="challenge"></div>
    <p v-if="failed" role="alert" class="form-feedback">{{ t.formError }}</p>
    <p v-if="demo" role="status" class="form-feedback form-demo">{{ t.formDemo }} <a :href="pagePath(lang, 'thanks')">{{ t.sentLink }}</a></p>
    <p v-if="sent" role="status" class="form-feedback">{{ t.sSent }} <a :href="pagePath(lang, 'thanks')">{{ t.sentLink }}</a></p>
  </form>
</template>
