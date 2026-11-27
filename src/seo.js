import { site, pagePath, withBase } from './site.js'
import { texts } from './translations.js'
import privacy from './locales/privacy/en.json' with { type: 'json' }

/** @param {string} text */
export function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

/** @param {string} lang */
export function faqItems(lang, pricing = site.features.pricing) {
  return texts[lang].main.faq.filter(item => pricing || !('price' in item && item.price))
}

/** @param {string} lang @param {string} page */
export function head(lang, page = 'home') {
  const seo = texts[lang].seo
  const url = site.url + pagePath(lang, page)
  const title = page === 'privacy' ? privacy.title + ' | ' + site.name : page === 'thanks' ? seo.thanksTitle : seo.title
  const tags = [`<title>${escapeHtml(title)}</title>`, `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#0D1220">',
    `<link rel="apple-touch-icon" href="${withBase('/apple-touch-icon.png')}">`]
  if (page !== 'home') return [...tags, '<meta name="robots" content="noindex,follow">'].join('\n')
  tags.push(`<meta name="robots" content="${site.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">`)

  const image = site.url + withBase('/og-' + lang + '.png')
  const imageAlt = `${site.name}: ${seo.ogTitle}. ${seo.ogLine}`
  const alternate = (/** @type {string} */ code, /** @type {string} */ target) =>
    `<link rel="alternate" hreflang="${code}" href="${site.url}${pagePath(target)}">`
  const meta = (/** @type {string} */ key, /** @type {string} */ value) =>
    `<meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}">`
  tags.push(...site.languages.map(code => alternate(code, code)), alternate('x-default', site.defaultLang),
    meta('description', seo.description), meta('og:title', seo.ogTitle), meta('og:description', seo.description),
    meta('og:site_name', site.name), meta('og:type', 'website'), meta('og:url', url),
    meta('og:image', image), meta('og:image:width', '1200'), meta('og:image:height', '630'),
    meta('og:image:alt', imageAlt),
    meta('og:locale', site.ogLocale[lang]),
    ...site.languages.filter(code => code !== lang).map(code => meta('og:locale:alternate', site.ogLocale[code])),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', seo.ogTitle),
    meta('twitter:description', seo.description), meta('twitter:image', image), meta('twitter:image:alt', imageAlt))

  const website = site.url + site.base + '#website'
  const app = url + '#app-info'
  const graph = [
    { '@type': 'WebSite', '@id': website, name: site.name, url: site.url + site.base, inLanguage: site.languages },
    { '@type': 'WebPage', '@id': url, url, name: title, description: seo.description, inLanguage: lang,
      isPartOf: { '@id': website }, about: { '@id': app } },
    { '@type': 'SoftwareApplication', '@id': app, name: site.name, description: seo.description,
      applicationCategory: 'BusinessApplication', operatingSystem: 'macOS 26 or later, Apple Silicon',
      inLanguage: lang, url, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', '@id': url + '#faq', inLanguage: lang,
      mainEntity: faqItems(lang).map((/** @type {{q: string, a: string}} */ item) => ({
        '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a },
      })) },
  ]
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')
  return [...tags, `<script type="application/ld+json">${json}</script>`].join('\n')
}

// No <lastmod>: a rebuild date says nothing about when the text changed, and a wrong date is worse than none.
export function sitemap() {
  const codes = [...site.languages, 'x-default']
  const alternates = codes.map(code => {
    const path = pagePath(code === 'x-default' ? site.defaultLang : code)
    return `<xhtml:link rel="alternate" hreflang="${code}" href="${site.url}${path}"/>`
  }).join('')
  const urls = site.languages.map(code => `<url><loc>${site.url}${pagePath(code)}</loc>${alternates}</url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}
