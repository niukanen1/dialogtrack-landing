// Only these public settings are injected into the browser bundle by Vite.
const env = typeof __SITE_ENV__ !== 'undefined' ? __SITE_ENV__ : globalThis.process?.env || {}
const origin = new URL(env.SITE_URL || 'https://dialogtrack.example')
if (!['http:', 'https:'].includes(origin.protocol) || origin.href !== origin.origin + '/')
  throw new Error('SITE_URL must be an HTTP(S) origin without a path, query or credentials')
// GitHub Pages serves a project site under /<repo>/; a custom domain serves it from the root.
const base = env.SITE_BASE_PATH || '/'
if (!/^\/(?:[A-Za-z0-9_.-]+\/)*$/.test(base)) throw new Error('SITE_BASE_PATH must look like / or /name/')

/** @type {Record<string, string>} */
export const nativeNames = {
  en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français',
  it: 'Italiano', pl: 'Polski', pt: 'Português', ru: 'Русский',
}
export const site = {
  name: 'DialogTrack', languages: Object.keys(nativeNames), defaultLang: 'en',
  nativeNames,
  /** @type {Record<string, string>} */
  ogLocale: { en: 'en_US', de: 'de_DE', es: 'es_ES', fr: 'fr_FR', it: 'it_IT', pl: 'pl_PL', pt: 'pt_BR', ru: 'ru_RU' },
  url: origin.origin, base, domain: env.SITE_DOMAIN || '', email: 'hello@' + origin.hostname, port: 4182,
  // Search engines may index the site only on its own domain. Any other address is a preview copy.
  indexable: Boolean(env.SITE_DOMAIN),
  form: { id: 'dialogtrack', endpoint: env.VITE_FORM_ENDPOINT || '', turnstileSiteKey: env.VITE_TURNSTILE_SITEKEY || '' },
  privacyDraft: true, features: { pricing: env.SITE_PRICING !== '0', inviteTime: false },
}

/** Path of a page inside the site, without the deployment base: '/', '/de/', '/de/thanks/', '/privacy/'.
 * @param {string} lang @param {string} page */
export function pageDir(lang, page = 'home') {
  if (page === 'privacy') return '/privacy/'
  const root = lang === site.defaultLang ? '/' : '/' + lang + '/'
  return page === 'thanks' ? root + 'thanks/' : root
}

/** Root-relative path of a file or page with the deployment base. @param {string} path */
export const withBase = (path) => site.base.slice(0, -1) + path

/** Link target of a page. @param {string} lang @param {string} page */
export const pagePath = (lang, page = 'home') => withBase(pageDir(lang, page))
