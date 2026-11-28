import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'
import { parse, NodeTypes } from '@vue/compiler-dom'
import { site, pagePath, withBase } from '../src/site.js'
import { texts } from '../src/translations.js'
import { faqItems } from '../src/seo.js'
import speech from '../src/speech-languages.json' with { type: 'json' }
import privacy from '../src/locales/privacy/en.json' with { type: 'json' }

const release = process.argv.includes('--release')
const tokens = new Set()
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
let demoMode = false
let privacyDraft = false

function elements(root) {
  return (root.children || []).filter(node => node.type === NodeTypes.ELEMENT)
    .flatMap(node => [node, ...elements(node)])
}
function textContent(node) {
  if (node.type === NodeTypes.TEXT) return node.content
  if (node.tag === 'script' || node.tag === 'style' || node.type === NodeTypes.COMMENT) return ''
  return (node.children || []).map(textContent).join('')
}
function attr(node, key) {
  return node?.props.find(prop => prop.name === key)?.value?.content
}
function byAttr(nodes, key, value) {
  return nodes.filter(node => attr(node, key) === value)
}
async function localFile(path) {
  assert(path.startsWith(site.base), 'link leaves the site: ' + path)
  const rel = '/' + path.slice(site.base.length)
  const file = join('dist', rel.endsWith('/') ? rel + 'index.html' : rel)
  assert((await stat(file)).isFile(), file)
  return file
}
function checkSwitcher(root, lang, page) {
  assert(root, 'switcher present')
  const links = elements(root).filter(node => node.tag === 'a' && attr(node, 'hreflang'))
  assert.deepEqual(links.map(link => attr(link, 'hreflang')), site.languages)
  for (const link of links) {
    const code = attr(link, 'hreflang')
    assert.equal(attr(link, 'href'), pagePath(code, page))
    assert.equal(attr(link, 'lang'), code)
    assert.equal(attr(link, 'aria-current'), code === lang ? 'page' : undefined)
    assert(textContent(link).includes(site.nativeNames[code]))
  }
}

async function checkPage(lang, page) {
  const path = page === '404' ? withBase('/404.html') : pagePath(lang, page)
  const html = await readFile(await localFile(path), 'utf8')
  assert.doesNotMatch(html, /\{\{|\[\[MISSING|support\.js|x-dc/)
  const nodes = elements(parse(html))
  const one = tag => nodes.find(node => node.tag === tag)
  assert.equal(attr(one('html'), 'lang'), lang)
  assert.equal(nodes.filter(node => node.tag === 'h1').length, 1)
  const ids = nodes.map(node => attr(node, 'id')).filter(Boolean)
  assert.equal(ids.length, new Set(ids).size, 'unique ids')
  for (const node of nodes) {
    for (const key of ['src', 'href']) {
      const value = attr(node, key)
      if (!value || value.startsWith('mailto:')) continue
      const url = new URL(value, site.url + path)
      assert.equal(url.origin, site.url, 'third-party URL ' + value)
      const file = await localFile(url.pathname)
      if (url.hash) {
        const targets = url.pathname === path ? ids : elements(parse(await readFile(file, 'utf8'))).map(el => attr(el, 'id'))
        assert(targets.includes(decodeURIComponent(url.hash.slice(1))), 'anchor ' + value)
      }
    }
  }
  const visible = textContent(one('body'))
  for (const token of visible.match(/\[[^\]\n]+\]/gu) || []) tokens.add(token)
  if (page === '404') return
  const head = elements(one('head'))
  const meta = key => attr(head.find(n => attr(n, 'property') === key || attr(n, 'name') === key), 'content')
  assert.equal(attr(byAttr(head, 'rel', 'canonical')[0], 'href'), site.url + path)
  const alts = byAttr(head, 'rel', 'alternate')
  const seo = texts[lang].seo
  const preloads = byAttr(head, 'as', 'font').map(n => attr(n, 'href'))
  const subsets = lang === 'ru' ? ['latin', 'cyrillic'] : lang === 'pl' ? ['latin', 'latin-ext'] : ['latin']
  assert.equal(preloads.length, subsets.length * 2)
  for (const subset of subsets) for (const family of ['geologica', 'golos-text'])
    assert(preloads.some(url => url.includes('/' + family + '-' + subset + '-wght-normal-')))
  if (page !== 'privacy') {
    checkSwitcher(elements(one('header')).find(n => n.tag === 'details'), lang, page)
    checkSwitcher(one('footer'), lang, page)
  }
  if (page !== 'home') {
    assert.equal(alts.length, 0)
    assert.match(meta('robots'), /noindex/)
    if (page === 'privacy') privacyDraft = visible.includes(privacy.draft)
    else {
      assert.equal(textContent(one('title')), seo.thanksTitle)
      assert.equal(visible.includes(texts[lang].thanks.leadTime), site.features.inviteTime)
      assert(!ids.includes('ref-title') && !ids.includes('ch-title'))
    }
    return
  }
  assert.equal(textContent(one('title')), seo.title)
  assert.equal(meta('robots'), site.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow')
  assert(meta('og:image:alt') && meta('twitter:image:alt'), 'social image description')
  assert.equal(meta('description'), seo.description)
  assert(seo.description.length >= 110 && seo.description.length <= 165)
  assert.deepEqual(alts.map(n => attr(n, 'hreflang')), [...site.languages, 'x-default'])
  for (const n of alts) {
    const code = attr(n, 'hreflang')
    assert.equal(attr(n, 'href'), site.url + pagePath(code === 'x-default' ? 'en' : code))
  }
  assert.equal(meta('og:locale'), site.ogLocale[lang])
  assert.deepEqual(byAttr(head, 'property', 'og:locale:alternate').map(n => attr(n, 'content')),
    site.languages.filter(code => code !== lang).map(code => site.ogLocale[code]))
  for (const key of ['og:image', 'twitter:image']) assert.equal(meta(key), site.url + withBase('/og-' + lang + '.png'))
  const png = await readFile('dist/og-' + lang + '.png')
  assert(png.subarray(0, 8).equals(signature) && png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630)
  const schemas = byAttr(head, 'type', 'application/ld+json')
  assert.equal(schemas.length, 1)
  const graph = JSON.parse(schemas[0].children[0].content)['@graph']
  assert.deepEqual(graph.map(n => n['@type']), ['WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage'])
  const questions = elements(one('main')).filter(n => n.tag === 'details')
  assert.deepEqual(graph[3].mainEntity.map(q => [q.name, q.acceptedAnswer.text]),
    questions.map(q => [textContent(elements(q).find(n => n.tag === 'summary')).replace(/\+$/, ''),
      textContent(elements(q).find(n => n.tag === 'p'))]))
  assert.equal(questions.length, faqItems(lang).length)
  const chips = nodes.filter(n => attr(n, 'aria-pressed') !== undefined)
  assert.deepEqual(chips.map(n => attr(n, 'lang')), speech.map(s => s.code))
  assert.deepEqual(byAttr(chips, 'aria-pressed', 'true').map(n => attr(n, 'lang')), [lang])
  assert(textContent(byAttr(nodes, 'aria-live', 'polite')[0]).includes(speech.find(s => s.code === lang).sample))
  const forms = nodes.filter(n => n.tag === 'form')
  assert.equal(forms.length, 2)
  demoMode ||= forms.some(n => attr(n, 'data-mode') === 'demo')
}

for (const lang of site.languages) {
  for (const page of ['home', 'thanks']) await checkPage(lang, page)
}
await checkPage('en', 'privacy')
await checkPage('en', '404')
const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1])
assert.equal(entries.length, site.languages.length)
for (const lang of site.languages) {
  const entry = entries.find(text => text.includes(`<loc>${site.url}${pagePath(lang)}</loc>`))
  assert(entry, 'sitemap entry ' + lang)
  for (const code of site.languages)
    assert(entry.includes(`hreflang="${code}" href="${site.url}${pagePath(code)}"`))
}
assert.equal((await readFile('dist/robots.txt', 'utf8')).includes('Sitemap: ' + site.url + withBase('/sitemap.xml')), site.indexable)
for (const file of ['/favicon.svg', '/apple-touch-icon.png', '/.nojekyll']) await localFile(withBase(file))
assert.match(await readFile('dist/favicon.svg', 'utf8'), /viewBox="0 0 48 48"/, 'square favicon')
assert.equal((await readdir('dist')).includes('CNAME'), Boolean(site.domain))
if (site.domain) assert.equal((await readFile('dist/CNAME', 'utf8')).trim(), site.domain)
const assets = await readdir('dist/assets')
for (const family of ['geologica', 'golos-text', 'jetbrains-mono'])
  assert(assets.some(n => n.startsWith(family + '-latin-wght-normal-') && n.endsWith('.woff2')))
for (const name of assets.filter(n => n.endsWith('.css'))) {
  const css = await readFile('dist/assets/' + name, 'utf8')
  for (const [, value] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (value.startsWith('data:')) continue
    const url = new URL(value, site.url + withBase(posix.join('/assets', name)))
    assert.equal(url.origin, site.url)
    await localFile(url.pathname)
  }
}
console.log('PASS: 17 prerendered pages, 404, locale links, SEO, FAQ, images, fonts and static assets.')
if (release) {
  const issues = []
  if (new URL(site.url).hostname.endsWith('.example')) issues.push('Placeholder site URL: ' + site.url)
  if (!site.domain) issues.push('No custom domain (SITE_DOMAIN).')
  if (!site.indexable) issues.push('SITE_LIVE is not 1: this build is a noindex preview.')
  if (tokens.size) issues.push('Visible bracket placeholders: ' + [...tokens].sort().join(', '))
  if (demoMode || !site.form.endpoint) issues.push('Form endpoint is not configured (VITE_FORM_ENDPOINT).')
  if (privacyDraft || site.privacyDraft) issues.push('Privacy policy is still a draft.')
  if (issues.length) {
    console.error('Release blocked:\n' + issues.map(issue => '- ' + issue).join('\n'))
    process.exitCode = 1
  } else console.log('PASS: release checks.')
}
