import { describe, it } from 'mocha'
import { strict as assert } from 'node:assert'
import { site, pagePath, pageDir, withBase } from '../src/site.js'
import { texts } from '../src/translations.js'
import { head, faqItems, sitemap, escapeHtml } from '../src/seo.js'

/** @param {unknown} value @returns {unknown} */
function structure(value) {
  if (Array.isArray(value)) return value.map(structure)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, structure(item)]))
  return typeof value
}

describe('localized landing pages', () => {
  for (const lang of site.languages) {
    it(lang + ' matches the English keys, array lengths and item structures', () => {
      assert.deepEqual(structure(texts[lang]), structure(texts.en))
      assert.doesNotMatch(texts[lang].thanks.lead, /\[/)
      assert.match(texts[lang].thanks.leadTime, /\[.+\]/)
    })
  }

  it('keeps English at the root and serves privacy only in English', () => {
    assert.equal(pageDir('en'), '/')
    assert.equal(pageDir('ru'), '/ru/')
    assert.equal(pageDir('en', 'thanks'), '/thanks/')
    assert.equal(pageDir('pl', 'thanks'), '/pl/thanks/')
    for (const code of site.languages) assert.equal(pageDir(code, 'privacy'), '/privacy/')
    // Links carry the deployment base: '/' on a custom domain, '/<repo>/' on a GitHub Pages project site.
    assert.equal(pagePath('en'), site.base)
    assert.equal(pagePath('de', 'thanks'), site.base + 'de/thanks/')
  })

  for (const lang of ['en', 'ru']) {
    it(lang + ' has localized social cards, metadata, alternates and FAQ schema', () => {
      const html = head(lang)
      const seo = texts[lang].seo
      assert.ok(html.includes('<title>' + escapeHtml(seo.title) + '</title>'), 'title')
      assert.ok(html.includes('name="description" content="' + escapeHtml(seo.description) + '"'), 'description')
      assert.ok(html.includes('property="og:locale" content="' + site.ogLocale[lang] + '"'), 'og:locale')
      assert.ok(html.includes('name="twitter:image" content="' + site.url + withBase('/og-' + lang + '.png') + '"'), 'twitter:image')
      assert.ok(html.includes('hreflang="x-default" href="' + site.url + site.base + '"'), 'x-default')
      assert.equal(html.match(/rel="alternate"/g)?.length, 9)
      const robots = site.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'
      assert.ok(html.includes('name="robots" content="' + robots + '"'), 'only a launched build on its own domain is indexable')
      assert.ok(html.includes('property="og:image:alt"') && html.includes('name="twitter:image:alt"'), 'image alt')
      const json = html.split('<script type="application/ld+json">')[1].split('</script>')[0]
      const graph = JSON.parse(json)['@graph']
      assert.deepEqual(
        graph.map((/** @type {{'@type': string}} */ item) => item['@type']),
        ['WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']
      )
      assert.deepEqual(
        graph[3].mainEntity.map((/** @type {{name: string}} */ item) => item.name),
        faqItems(lang).map(q => q.q)
      )
      const thanks = head(lang, 'thanks')
      assert.ok(thanks.includes(escapeHtml(seo.thanksTitle)) && thanks.includes('noindex,follow'), 'thanks head')
      assert.ok(!thanks.includes('hreflang='), 'no hreflang on thanks')
    })
  }

  it('omits only the marked price question when pricing is hidden', () => {
    const all = faqItems('en', true)
    assert.deepEqual(faqItems('en', false), all.filter((_, index) => index !== 5))
    const previous = site.features.pricing
    try {
      site.features.pricing = false
      assert.ok(!head('en').includes(all[5].q), 'price question hidden')
    } finally {
      site.features.pricing = previous
    }
  })

  it('publishes only the eight home URLs in the sitemap', () => {
    const xml = sitemap()
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
    assert.deepEqual(urls, site.languages.map(lang => site.url + pagePath(lang)))
    assert.ok(!xml.includes('<lastmod>'), 'no rebuild dates in the sitemap')
    assert.equal(xml.match(/<xhtml:link /g)?.length, 8 * 9)
  })
})
