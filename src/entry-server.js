import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { texts } from './translations.js'

export function render(lang, page) {
  return renderToString(createSSRApp(App, { lang, page, copy: texts[lang] }))
}
