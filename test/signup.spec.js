import { describe, it, afterEach } from 'mocha'
import { strict as assert } from 'node:assert'
import { site } from '../src/site.js'
import { sendSignup } from '../src/signup.js'

describe('beta signup transport', () => {
  const original = { ...site.form }
  const originalFetch = globalThis.fetch
  afterEach(() => {
    Object.assign(site.form, original)
    globalThis.fetch = originalFetch
  })

  it('sends nothing in demo mode, including when a site key is present', async () => {
    site.form.endpoint = ''
    site.form.turnstileSiteKey = 'test-key'
    globalThis.fetch = () => { throw new Error('unexpected network request') }
    await sendSignup(new FormData(), 'de', null)
  })

  it('posts the language, explicit consent and all selected apps as JSON', async () => {
    site.form.endpoint = '/signup'
    site.form.turnstileSiteKey = ''
    /** @type {Array<{url: string, method?: string, payload: Record<string, any>}>} */
    const calls = []
    globalThis.fetch = async (url, request) => {
      calls.push({ url: String(url), method: request?.method, payload: JSON.parse(String(request?.body)) })
      return new Response(null, { status: 204 })
    }
    const form = new FormData()
    form.set('email', 'tester@example.com')
    form.set('languages', 'Deutsch, Polski')
    form.set('role', 'Other')
    form.set('mac', 'Apple Silicon')
    form.set('macos', '26')
    form.set('consent', 'on')
    form.append('apps', 'Zoom')
    form.append('apps', 'Google Meet')
    await sendSignup(form, 'pl', null)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, '/signup')
    assert.equal(calls[0].method, 'POST')
    const { requestedAt, ...payload } = calls[0].payload
    assert.deepEqual(payload, {
      site: 'dialogtrack', email: 'tester@example.com', lang: 'pl', languages: 'Deutsch, Polski',
      role: 'Other', mac: 'Apple Silicon', macos: '26', apps: ['Zoom', 'Google Meet'],
      consent: true, website: '', token: '',
    })
    assert.ok(Number.isFinite(Date.parse(requestedAt)), 'requestedAt is a date')
  })

  it('drops a populated honeypot before requesting a challenge or sending', async () => {
    site.form.endpoint = '/signup'
    site.form.turnstileSiteKey = 'test-key'
    globalThis.fetch = () => { throw new Error('unexpected network request') }
    const form = new FormData()
    form.set('website', 'example.invalid')
    await sendSignup(form, 'ru', null)
  })
})
