import { createApp, createSSRApp } from 'vue'
import '@fontsource-variable/geologica/wght.css'
import '@fontsource-variable/golos-text/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles.css'
import App from './App.vue'
import { site } from './site.js'
import privacy from './locales/privacy/en.json'

// Each language is a separate chunk: a visitor downloads one of them, not all eight.
const locales = import.meta.glob('./locales/*.json')
const path = location.pathname.startsWith(site.base) ? location.pathname.slice(site.base.length) : location.pathname.slice(1)
const parts = path.split('/').filter(Boolean)
// A prerendered page says which language and page it is; the address is parsed only in development.
const root = /** @type {HTMLElement} */ (document.querySelector('#app'))
const lang = root.dataset.lang || (site.languages.includes(parts[0]) ? parts[0] : site.defaultLang)
const page = root.dataset.page || (parts.includes('thanks') ? 'thanks' : parts[0] === 'privacy' ? 'privacy' : 'home')

locales['./locales/' + lang + '.json']().then((module) => {
  const copy = /** @type {{ default: any }} */ (module).default
  const prerendered = root.firstElementChild !== null
  if (!prerendered) {
    document.documentElement.lang = lang
    document.title = page === 'privacy' ? privacy.title : copy.seo[page === 'thanks' ? 'thanksTitle' : 'title']
  }
  const mount = prerendered ? createSSRApp : createApp
  mount(App, { lang, page, copy }).mount('#app')
})
