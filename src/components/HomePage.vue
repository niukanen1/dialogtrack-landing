<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { site } from '../site.js'
import speech from '../speech-languages.json'
import HeroForm from './HeroForm.vue'
import SignupForm from './SignupForm.vue'
const props = defineProps({ lang: { type: String, required: true }, t: { type: Object, required: true } })
const sample = code => speech.find(item => item.code === code)
const demo = ref(sample(props.lang))
const pageSample = demo.value.sample
const sampleEn = sample('en').sample
const sampleRu = sample('ru').sample
const visibleFaq = props.t.faq.filter(item => site.features.pricing || !item.price)

// Blocks below the first screen fade in as they are reached. Only what is below the fold at load is hidden,
// and only after scripts run, so the page reads the same without JavaScript.
/** @type {IntersectionObserver | undefined} */
let observer
onMounted(() => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('reveal-in')
      entry.target.classList.remove('reveal-pending')
      observer?.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  for (const section of document.querySelectorAll('main > section:not(.hero)')) {
    const blocks = section.firstElementChild?.children || []
    Array.from(blocks).forEach((block, index) => {
      if (block.getBoundingClientRect().top < window.innerHeight) return
      /** @type {HTMLElement} */ (block).style.setProperty('--reveal-delay', Math.min(index, 3) * 70 + 'ms')
      block.classList.add('reveal-pending')
      observer?.observe(block)
    })
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <main>
    <section id="top" class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <h1 class="hero-title">{{ t.h1a }} <mark class="headline-mark">{{ t.h1mark }}</mark> {{ t.h1b }}</h1>
          <p class="hero-lead">{{ t.heroSub }}</p>
          <HeroForm :lang="lang" :t="t" />

          <ul class="hero-facts">
            <li class="fact-item"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#11141A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>{{ t.fact1 }}</li>
            <li class="fact-item"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#11141A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>{{ t.fact2 }}</li>
            <li class="fact-item"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#11141A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>{{ t.fact3 }}</li>
          </ul>
        </div>

        <figure class="device">
          <figcaption class="sr-only">{{ t.mockCaption }}</figcaption>
          <div class="device-screen">
            <div class="menu-bar">
              <span class="menu-items"><span class="menu-app">Zoom</span><span>{{ t.mockMenu1 }}</span><span>{{ t.mockMenu2 }}</span></span>
              <span>{{ t.mockClock }}</span>
              <div class="notch">
                <span class="recording"><span class="dt-rec recording-dot"></span>{{ t.timecodes[0] }}</span>
                <span aria-hidden="true" class="audio-bars">
                  <span class="dt-bar bar-first"></span>
                  <span class="dt-bar bar-second"></span>
                  <span class="dt-bar bar-third"></span>
                  <span class="dt-bar bar-fourth"></span>
                  <span class="dt-bar bar-fifth"></span>
                </span>
              </div>
            </div>
            <div class="device-windows">
              <div class="conversation">
                <div class="window-toolbar">
                  <span aria-hidden="true" class="window-controls"><span class="close-dot"></span><span class="minimize-dot"></span><span class="expand-dot"></span></span>
                  <span class="window-tabs"><span class="active-tab">{{ t.tabTalk }}</span><span class="inactive-tab">{{ t.tabHigh }}</span></span>
                </div>
                <div class="transcript">
                  <div class="spoken spoken-1">
                    <div class="speaker-line"><span class="speaker-primary">{{ t.speakerA }}</span><span class="timecode">{{ t.timecodes[1] }}</span></div>
                    <p class="transcript-line">{{ t.mockL1 }}</p>
                  </div>
                  <div class="spoken spoken-2">
                    <div class="speaker-line"><span class="speaker-secondary">{{ t.speakerB }}</span><span class="timecode">{{ t.timecodes[2] }}</span></div>
                    <p class="transcript-line">{{ t.mockL2 }}</p>
                  </div>
                  <div class="spoken spoken-3">
                    <div class="speaker-line"><span class="speaker-primary">{{ t.speakerA }}</span><span class="timecode">{{ t.timecodes[0] }}</span></div>
                    <p class="transcript-line">{{ t.mockL3 }}<span class="dt-caret"></span></p>
                  </div>
                </div>
              </div>
              <div class="highlights">
                <div class="highlights-heading"><span class="panel-title">{{ t.tabHigh }}</span><span class="update-time">{{ t.highUpdated }}</span></div>
                <div class="noted noted-1">
                  <div class="highlight-type">{{ t.labelDecision }}</div>
                  <p class="highlight-text">{{ t.highDecisionText }}</p>
                  <span class="line-reference">{{ t.ref1 }}</span>
                </div>
                <div class="noted noted-2">
                  <div class="highlight-type">{{ t.labelTask }}</div>
                  <p class="highlight-text">{{ t.highTaskText }}</p>
                  <span class="line-reference">{{ t.ref2 }}</span>
                </div>
                <div class="noted noted-3">
                  <div class="highlight-type">{{ t.labelNext }}</div>
                  <p class="highlight-text">{{ t.highNextText }}</p>
                  <span class="line-reference">{{ t.ref3 }}</span>
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>

    <section :aria-label="t.appsLead" class="apps-strip">
      <div class="apps-inner">
        <p class="apps-lead">{{ t.appsLead }}</p>
        <ul class="app-names">
          <li v-for="app in t.apps" :key="app">{{ app }}</li>
        </ul>
      </div>
    </section>

    <section id="how" class="section-bottom">
      <div class="features-inner">
        <div class="section-intro">
          <h2 class="section-title">{{ t.howH2 }}</h2>
        </div>
        <div class="card-row">
          <article class="feature-card">
            <div class="caption-card">
              <div class="speaker-line"><span class="speaker-primary">{{ t.speakerA }}</span><span class="timecode">{{ t.timecodes[3] }}</span></div>
              <p class="caption-line">{{ pageSample }}</p>
            </div>
            <h3 class="card-title">{{ t.f1Title }}</h3>
            <p class="body-copy">{{ t.f1Text }}</p>
          </article>
          <article class="feature-card">
            <div class="speakers-card">
              <div class="dialogue-row"><span class="speaker-dark">{{ t.speakerA }}</span><span class="dialogue-text">{{ t.f2L1 }}</span></div>
              <div class="dialogue-row"><span class="speaker-light">{{ t.speakerB }}</span><span class="dialogue-text">{{ t.f2L2 }}</span></div>
              <div class="dialogue-row"><span class="speaker-dark">{{ t.speakerA }}</span><span class="dialogue-text">{{ t.f2L3 }}</span></div>
            </div>
            <h3 class="card-title">{{ t.f2Title }}</h3>
            <p class="body-copy">{{ t.f2Text }}</p>
          </article>
          <article class="feature-card">
            <div class="notes-card">
              <div class="note-row"><span class="note-text"><span class="note-type">{{ t.labelDecision }} · </span>{{ t.f3DecisionText }}</span><span class="note-time">{{ t.timecodes[4] }}</span></div>
              <div class="note-row"><span class="note-text"><span class="note-type">{{ t.labelTask }} · </span>{{ t.f3TaskText }}</span><span class="note-time">{{ t.timecodes[5] }}</span></div>
              <div class="note-row"><span class="note-text"><span class="note-type">{{ t.labelQuestion }} · </span>{{ t.f3QuestionText }}</span><span class="note-time">{{ t.timecodes[6] }}</span></div>
            </div>
            <h3 class="card-title">{{ t.f3Title }}</h3>
            <p class="body-copy">{{ t.f3Text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="languages" class="light-section">
      <div class="languages-inner">
        <div class="section-intro">
          <h2 class="section-title">{{ t.langH2 }}</h2>
          <p class="section-lead">{{ t.langSub }}</p>
        </div>
        <div class="demo-layout">
          <ul :aria-label="t.langPickAria" class="chip-list">
            <li v-for="c in speech" :key="c.code"><button type="button" :aria-pressed="c.code === demo.code" :lang="c.code" class="speech-chip" @click="demo = c">{{ c.name }}</button></li>
          </ul>
          <div aria-live="polite" class="caption-demo">
            <div class="demo-meta"><span class="speaker-primary">{{ t.speakerA }}</span><span class="demo-tag" :lang="demo.code">{{ demo.code.toUpperCase() }} · {{ demo.name }}</span></div>
            <Transition name="caption" mode="out-in"><p :key="demo.code" :lang="demo.code" class="demo-copy">{{ demo.sample }}<span class="dt-caret"></span></p></Transition>
          </div>
        </div>
        <div class="translation-row">
          <div class="translation-intro">
            <h3 class="card-title">{{ t.trTitle }}</h3>
            <p class="translation-copy">{{ t.trText }}</p>
          </div>
          <div class="translation-example">
            <span class="translation-badge">{{ t.translationPair }}</span>
            <p lang="en" class="original-caption">{{ sampleEn }}</p>
            <p lang="ru" class="caption-line">{{ sampleRu }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="after" class="after-section">
      <div class="after-inner">
        <h2 class="section-title">{{ t.afterTitle }}</h2>
        <div class="card-row">
          <div class="after-card">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" class="feature-icon"><rect x="4" y="6" width="20" height="16" rx="3" fill="none" stroke="#11141A" stroke-width="1.6"></rect><path d="M4 11h20M10 6v-2h8v2" fill="none" stroke="#11141A" stroke-width="1.6" stroke-linecap="round"></path></svg>
            <div><h3 class="after-title">{{ t.a1Title }}</h3><p class="after-copy">{{ t.a1Text }}</p></div>
          </div>
          <div class="after-card">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" class="feature-icon"><rect x="8" y="4" width="14" height="17" rx="2.5" fill="none" stroke="#11141A" stroke-width="1.6"></rect><path d="M6 8v14a2 2 0 0 0 2 2h10" fill="none" stroke="#11141A" stroke-width="1.6" stroke-linecap="round"></path><path d="M12 10h6M12 14h6" stroke="#11141A" stroke-width="1.6" stroke-linecap="round"></path></svg>
            <div><h3 class="after-title">{{ t.a2Title }}</h3><p class="after-copy">{{ t.a2Text }}</p></div>
          </div>
          <div class="after-card">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" class="feature-icon"><path d="M14 4v13M9 12l5 5 5-5" fill="none" stroke="#11141A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 19v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" fill="none" stroke="#11141A" stroke-width="1.6" stroke-linecap="round"></path></svg>
            <div><h3 class="after-title">{{ t.a3Title }}</h3><p class="after-copy">{{ t.a3Text }}</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="privacy" class="privacy-section">
      <div class="privacy-inner">
        <div class="privacy-intro">
          <h2 class="section-title">{{ t.prH2 }}</h2>
          <p class="pale-lead">{{ t.prSub }}</p>
        </div>
        <div class="processing-flow">
          <div class="input-sources">
            <div class="source-box">{{ t.prMic }}</div>
            <div class="source-box">{{ t.prAudio }}</div>
          </div>
          <div aria-hidden="true" class="flow-arrow"><svg width="28" height="16" viewBox="0 0 28 16"><path d="M2 8h22M18 2l6 6-6 6" fill="none" stroke="#9AA3B5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
          <div class="mac-box">
            <div class="mac-heading"><span class="mac-title">{{ t.prMac }}</span><span class="offline-label">{{ t.prOffline }}</span></div>
            <ul class="processing-list">
              <li class="processing-chip">{{ t.prChip1 }}</li>
              <li class="processing-chip">{{ t.prChip2 }}</li>
              <li class="processing-chip">{{ t.prChip3 }}</li>
              <li class="processing-chip">{{ t.prChip4 }}</li>
            </ul>
          </div>
          <div aria-hidden="true" class="flow-arrow"><svg width="28" height="16" viewBox="0 0 28 16"><path d="M2 8h22M18 2l6 6-6 6" fill="none" stroke="#9AA3B5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
          <div class="archive-box">{{ t.prArchive }}</div>
        </div>
        <ul class="privacy-facts">
          <li class="privacy-fact">{{ t.prFact1 }}</li>
          <li class="privacy-fact">{{ t.prFact2 }}</li>
          <li class="privacy-fact">{{ t.prFact3 }}</li>
        </ul>
        <p class="consent-note">{{ t.prConsent }}</p>
      </div>
    </section>

    <section id="compare" class="padded-section">
      <div class="comparison-inner">
        <div class="section-intro">
          <h2 class="section-title">{{ t.cmpH2 }}</h2>
        </div>
        <div class="table-scroll">
          <table class="compare-table">
            <thead>
              <tr class="column-headings">
                <th scope="col" class="row-label-heading"></th>
                <th scope="col" class="service-heading">{{ t.cmpColBot }}<div class="service-subtitle">{{ t.cmpColBotSub }}</div></th>
                <th scope="col" class="service-heading">{{ t.cmpColCloud }}<div class="service-subtitle">{{ t.cmpColCloudSub }}</div></th>
                <th scope="col" class="product-heading">DialogTrack<div class="product-subtitle">{{ t.cmpColUsSub }}</div></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in t.cmpRows" :key="row.label" class="comparison-row">
                <th scope="row" class="row-heading">{{ row.label }}</th>
                <td class="service-cell">{{ row.a }}</td>
                <td class="service-cell">{{ row.b }}</td>
                <td class="product-cell">{{ row.c }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="table-note">{{ t.cmpNote }}</p>
      </div>
    </section>

    <section id="who" class="section-bottom">
      <div class="comparison-inner">
        <div class="section-intro">
          <h2 class="section-title">{{ t.whoH2 }}</h2>
        </div>
        <div class="audiences">
          <div v-for="w in t.who" :key="w.title" class="audience-card">
            <h3 class="audience-title">{{ w.title }}</h3>
            <p class="body-copy">{{ w.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="light-section">
      <div class="beta-columns">
        <div class="steps-column">
          <div class="steps-heading">
            <h2 class="section-title">{{ t.betaH2 }}</h2>
          </div>
          <ol class="beta-steps">
            <li v-for="s in t.steps" :key="s.n" class="beta-step"><span class="step-marker">{{ s.n }}</span><div><h3 class="step-title">{{ s.title }}</h3><p class="body-copy">{{ s.text }}</p></div></li>
          </ol>
        </div>
        <div v-if="site.features.pricing" class="pricing-column">
          <h3 class="card-title">{{ t.priceTitle }}</h3>
          <div class="price-cards">
            <div class="free-card">
              <div><h3 class="plan-name">{{ t.freeName }}</h3><p class="plan-note">{{ t.freeNote }}</p></div>
              <ul class="plan-features"><li v-for="i in t.freeItems" :key="i">{{ i }}</li></ul>
            </div>
            <div class="pro-card">
              <div><h3 class="plan-name">{{ t.proName }}</h3><p class="plan-note">{{ t.proNote }}</p></div>
              <ul class="plan-features"><li v-for="i in t.proItems" :key="i">{{ i }}</li></ul>
            </div>
          </div>
          <div class="founder-box">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" class="feature-icon"><path d="M11 2l2.6 5.6 6.1.7-4.5 4.2 1.2 6L11 15.6 5.6 18.5l1.2-6L2.3 8.3l6.1-.7z" fill="none" stroke="#11141A" stroke-width="1.5" stroke-linejoin="round"></path></svg>
            <p class="founder-copy">{{ t.founder }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="faq" class="padded-section">
      <div class="faq-inner">
        <div class="steps-heading">
          <h2 class="faq-title">{{ t.faqH2 }}</h2>
        </div>
        <div class="faq-list">
          <details v-for="q in visibleFaq" :key="q.q" class="faq-item">
            <summary class="faq-question">{{ q.q }}<span class="faq-plus plus-sign" aria-hidden="true">+</span></summary>
            <p class="faq-answer">{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <section id="beta" class="signup-section">
      <div class="signup-inner">
        <div class="signup-intro">
          <h2 class="signup-title">{{ t.sH2 }}</h2>
          <p class="pale-lead">{{ t.sSub }}</p>
        </div>
        <SignupForm :lang="lang" :t="t" />
      </div>
    </section>

  </main>
</template>
