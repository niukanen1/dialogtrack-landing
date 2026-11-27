import { build } from 'vite'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'
import { site, pageDir, withBase } from '../src/site.js'
import { texts } from '../src/translations.js'
import { escapeHtml, head, sitemap } from '../src/seo.js'
import privacy from '../src/locales/privacy/en.json' with { type: 'json' }

await build()
try {
  await build({ build: { ssr: 'src/entry-server.js', outDir: '.ssr', emptyOutDir: true }, publicDir: false })
  const { render } = await import('../.ssr/entry-server.js')
  const template = await readFile('dist/index.html', 'utf8')
  const assets = await readdir('dist/assets')

  for (const lang of site.languages) {
    const subsets = ['latin']
    if (lang === 'ru') subsets.push('cyrillic')
    if (lang === 'pl') subsets.push('latin-ext')
    const preloads = ['geologica', 'golos-text'].flatMap(family => subsets.map(subset => {
      const prefix = family + '-' + subset + '-wght-normal-'
      const name = assets.find(file => file.startsWith(prefix) && file.endsWith('.woff2'))
      if (!name) throw new Error('Missing font ' + prefix)
      return `<link rel="preload" as="font" type="font/woff2" crossorigin href="${withBase('/assets/' + name)}">`
    }))
    const pages = lang === 'en' ? ['home', 'thanks', 'privacy'] : ['home', 'thanks']
    for (const page of pages) {
      const body = await render(lang, page)
      const html = template.replace('<html lang="en">', `<html lang="${lang}">`)
        .replace('<!--page-head-->', () => [head(lang, page), ...preloads].join('\n'))
        .replace('data-lang="" data-page=""', `data-lang="${lang}" data-page="${page}"`)
        .replace('<!--page-body-->', () => body)
      const dir = 'dist' + pageDir(lang, page)
      await mkdir(dir, { recursive: true })
      await writeFile(dir + 'index.html', html)
    }
  }
} finally {
  await rm('.ssr', { recursive: true, force: true })
}

await writeFile('dist/sitemap.xml', sitemap())
// A preview copy stays crawlable so that robots can read its noindex tag; it just does not advertise a sitemap.
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\n'
  + (site.indexable ? `Sitemap: ${site.url}${withBase('/sitemap.xml')}\n` : ''))
await writeFile('dist/.nojekyll', '')
if (site.domain) await writeFile('dist/CNAME', site.domain + '\n')
await writeFile('dist/404.html', `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${privacy.notFound} | DialogTrack</title><link rel="icon" href="${withBase('/favicon.svg')}"></head>
<body><main><h1>${privacy.notFound}</h1><a href="${site.base}">${texts.en.thanks.home}</a></main></body></html>\n`)

const fontDir = 'assets/fonts/og/'
const fontFiles = ['Onest-ExtraBold.ttf', 'JetBrainsMono-SemiBold.ttf'].map(file => fontDir + file)
const logo = '<rect x="1" y="1" width="32" height="18" rx="9" fill="#11141A" stroke="#2C3550"/><circle cx="10" cy="10" r="3" fill="#F2555A"/>'
  + '<rect x="17" y="8" width="2" height="5" rx="1" fill="#F5F1E6"/><rect x="21" y="6" width="2" height="8" rx="1" fill="#F5F1E6"/>'
  + '<rect x="25" y="8.5" width="2" height="4" rx="1" fill="#F5F1E6"/>'
const touchIcon = new Resvg(await readFile('public/favicon.svg', 'utf8'), { fitTo: { mode: 'width', value: 180 } })
await writeFile('dist/apple-touch-icon.png', touchIcon.render().asPng())
for (const lang of site.languages) {
  const { ogTitle, ogLine } = texts[lang].seo
  const lines = []
  let line = ''
  for (const word of ogTitle.split(/\s+/u)) {
    if (line && (line + ' ' + word).length > 25) {
      lines.push(line)
      line = ''
    }
    line = [line, word].filter(Boolean).join(' ')
  }
  lines.push(line)
  const baseline = 225
  const lineHeight = 72
  const underline = baseline + (lines.length - 1) * lineHeight + 25
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#0D1220"/>
<g transform="translate(64 52) scale(2.5)">${logo}</g>
<g fill="#F5F1E6" font-family="Onest" font-weight="800"><text x="170" y="91" font-size="39">DialogTrack</text>
${lines.map((text, i) => `<text x="64" y="${baseline + i * lineHeight}" font-size="63">${escapeHtml(text)}</text>`).join('\n')}</g>
<path d="M64 ${underline}h470" stroke="#F2B53A" stroke-width="3"/>
<g font-family="JetBrains Mono" font-weight="600" font-size="24" fill="#F5F1E6">
<text x="64" y="${underline + 48}">${escapeHtml(ogLine)}</text>
<text x="1136" y="572" text-anchor="end" fill="#AAB3C5">${escapeHtml(new URL(site.url).host)}</text></g></svg>`
  const image = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false } })
  await writeFile(`dist/og-${lang}.png`, image.render().asPng())
}
console.log('Prerendered 8 home pages, 8 thanks pages and the English privacy page.')
