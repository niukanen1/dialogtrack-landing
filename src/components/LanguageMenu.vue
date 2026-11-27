<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { site, pagePath } from '../site.js'
defineProps({ label: { type: String, required: true }, lang: { type: String, required: true }, page: { type: String, required: true } })

/** @type {import('vue').Ref<HTMLDetailsElement | null>} */
const menu = ref(null)
const closing = ref(false)

// <details> closes instantly, so the closing animation plays first and only then the attribute is removed.
function close(refocus = false) {
  const el = menu.value
  if (!el || !el.open || closing.value) return
  const finish = () => {
    closing.value = false
    el.open = false
    if (refocus) el.querySelector('summary')?.focus()
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()
  closing.value = true
  setTimeout(finish, 140)
}
/** @param {MouseEvent} event */
function toggle(event) {
  if (!menu.value?.open) return
  event.preventDefault()
  close()
}
/** @param {MouseEvent} event */
const outside = (event) => { if (menu.value && !menu.value.contains(/** @type {Node} */ (event.target))) close() }
/** @param {KeyboardEvent} event */
const escape = (event) => { if (event.key === 'Escape') close(true) }
onMounted(() => {
  document.addEventListener('click', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <details ref="menu" class="dt-lang language-menu" :class="{ 'is-closing': closing }">
    <summary class="menu-summary" @click="toggle">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="7" fill="none" stroke="#11141A" stroke-width="1.4"></circle><path d="M2 9h14M9 2c2.2 2 3.2 4.3 3.2 7s-1 5-3.2 7M9 2C6.8 4 5.8 6.3 5.8 9s1 5 3.2 7" fill="none" stroke="#11141A" stroke-width="1.4" stroke-linecap="round"></path></svg>
      <span class="sr-only">{{ label }}:</span>
      <span class="menu-current">{{ site.nativeNames[lang] }}</span>
      <svg class="menu-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="#11141A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </summary>

    <ul class="menu-options">
      <li v-for="(code, index) in site.languages" :key="code" :style="{ '--i': index }" class="menu-item"><a :href="pagePath(code, page)" :lang="code" :hreflang="code" :aria-current="code === lang ? 'page' : undefined" class="menu-link"><span>{{ site.nativeNames[code] }}</span><span aria-hidden="true" class="language-code">{{ code.toUpperCase() }}</span></a></li>
    </ul>
  </details>
</template>
