<script setup>
import { site } from '../site.js'
defineProps({ t: { type: Object, required: true } })
</script>

<template>
  <main class="thanks-main">
    <div class="thanks-inner">

      <div class="thanks-content">
        <div aria-hidden="true" class="confirmation-mark">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 9.5l3.2 3.2L14 5.8" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <h1 class="thanks-title">{{ t.h1 }}</h1>
        <p class="thanks-lead">{{ t.lead }}<template v-if="site.features.inviteTime"> {{ t.leadTime }}</template></p>

        <ol class="confirmation-steps">
          <li v-for="s in t.steps" :key="s.n" class="confirmation-step"><span class="confirmation-number">{{ s.n }}</span><div><h2 class="step-title">{{ s.title }}</h2><p class="body-copy">{{ s.text }}</p></div></li>
        </ol>
      </div>
    </div>
  </main>
</template>
