<script setup lang="ts">
const { locale, setLocale } = useI18n()

function toggle() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr')
}
</script>

<template>
  <button
    v-magnetic="{ strength: 0.46, radius: 80 }"
    type="button"
    class="group relative flex shrink-0 items-center rounded-full bg-ink-800/80 p-0.5 text-[11px] font-mono font-medium"
    :aria-label="$t('lang.label')"
    @click="toggle"
  >
    <span
      class="absolute inset-y-0.5 w-8 rounded-full bg-accent-500/90 transition-transform duration-300 sm:w-9"
      :class="locale === 'en' ? 'translate-x-8 sm:translate-x-9' : 'translate-x-0'"
    />
    <span
      class="relative z-10 w-8 py-1.5 text-center transition-colors sm:w-9"
      :class="locale === 'fr' ? 'text-ink-950' : 'text-ink-300'"
    >FR</span>
    <span
      class="relative z-10 w-8 py-1.5 text-center transition-colors sm:w-9"
      :class="locale === 'en' ? 'text-ink-950' : 'text-ink-300'"
    >EN</span>
  </button>
</template>
