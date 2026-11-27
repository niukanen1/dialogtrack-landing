import { onMounted, ref } from 'vue'
import { pagePath, site } from './site.js'

/** @type {Promise<DialogTrackTurnstile> | undefined} */
let scriptPromise
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      const timer = setTimeout(fail, 20000)
      function fail() {
        clearTimeout(timer)
        script.remove()
        scriptPromise = undefined
        reject(new Error('Turnstile unavailable'))
      }
      script.onload = () => {
        clearTimeout(timer)
        if (window.turnstile) resolve(window.turnstile)
        else fail()
      }
      script.onerror = fail
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      document.head.append(script)
    })
  }
  return scriptPromise
}

/** @param {HTMLElement | null} container @param {string} lang @param {(token: string) => Promise<void>} send */
async function withChallenge(container, lang, send) {
  if (!site.form.turnstileSiteKey) return send('')
  if (!container) throw new Error('Turnstile container missing')
  const api = await loadTurnstile()
  /** @type {string | undefined} */
  let widget
  try {
    /** @type {string} */
    const token = await new Promise((resolve, reject) => {
      const fail = () => reject(new Error('Turnstile challenge failed'))
      widget = api.render(container, {
        sitekey: site.form.turnstileSiteKey, language: lang, action: 'signup',
        appearance: 'interaction-only', callback: resolve,
        'expired-callback': fail, 'error-callback': fail, 'timeout-callback': fail,
      })
    })
    await send(token)
  } finally {
    if (widget != null) api.remove(widget)
  }
}

/** @param {FormData} data @param {string} lang @param {HTMLElement | null} container */
export async function sendSignup(data, lang, container) {
  if (data.get('website')) return 'dropped'
  if (!site.form.endpoint) return 'demo'
  const payload = {
    site: site.form.id, lang, requestedAt: new Date().toISOString(),
    email: data.get('email'), languages: data.get('languages') || '',
    role: data.get('role') || '', mac: data.get('mac') || '', macos: data.get('macos') || '',
    apps: data.getAll('apps'), consent: data.has('consent'), website: '',
  }
  await withChallenge(container, lang, async token => {
    const res = await fetch(site.form.endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, token }), signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error('Signup request failed')
  })
  return 'sent'
}

/** @param {string} lang */
export function useSignup(lang) {
  const ready = ref(false)
  const busy = ref(false)
  const failed = ref(false)
  const sent = ref(false)
  // No endpoint configured: say so instead of pretending the request was accepted.
  const demo = ref(false)
  /** @type {import('vue').Ref<HTMLElement | null>} */
  const challenge = ref(null)
  onMounted(() => { ready.value = true })
  /** @param {SubmitEvent} event */
  async function submit(event) {
    const form = event.currentTarget
    if (busy.value || !(form instanceof HTMLFormElement) || !form.reportValidity()) return
    busy.value = true
    failed.value = false
    try {
      const result = await sendSignup(new FormData(form), lang, challenge.value)
      if (result === 'demo') {
        demo.value = true
        busy.value = false
        return
      }
      sent.value = true
      window.location.assign(pagePath(lang, 'thanks'))
    } catch {
      failed.value = true
      busy.value = false
    }
  }
  return { ready, busy, failed, sent, demo, challenge, submit }
}
