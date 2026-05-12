<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  { id: 'about', label: t('nav.about'), mobile: false },
  { id: 'projects', label: t('nav.projects'), mobile: true },
  { id: 'stack', label: t('nav.stack'), mobile: true },
  { id: 'path', label: t('nav.path'), mobile: false },
  { id: 'hobbies', label: t('nav.hobbies'), mobile: false },
  { id: 'writings', label: t('nav.writings'), mobile: false },
  { id: 'contact', label: t('nav.contact'), mobile: true },
])
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 pointer-events-none sm:px-4 sm:pt-5">
    <nav
      class="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border border-ink-700/60 bg-ink-900/70 px-1.5 py-1.5 text-xs backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:w-auto sm:gap-1 sm:px-2 sm:text-sm"
    >
      <a
        v-magnetic="{ strength: 0.48, radius: 86 }"
        href="#top"
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-ink-300 transition hover:text-ink-50 data-[magnetic-active=true]:text-ink-50"
      >
        <span class="size-1.5 rounded-full bg-accent-500 shadow-[0_0_10px_var(--color-accent-500)]" />
        axel
      </a>
      <div class="hidden sm:block h-5 w-px bg-ink-700/70" />
      <a
        v-for="l in links"
        :key="l.id"
        v-magnetic="{ strength: 0.46, radius: 82 }"
        :href="`#${l.id}`"
        class="shrink-0 items-center rounded-full px-2.5 py-1.5 text-ink-300 transition hover:bg-ink-800/80 hover:text-ink-50 data-[magnetic-active=true]:bg-ink-800/80 data-[magnetic-active=true]:text-ink-50 sm:flex sm:px-3"
        :class="l.mobile ? 'flex' : 'hidden'"
      >
        {{ l.label }}
      </a>
      <div class="mx-1 h-5 w-px shrink-0 bg-ink-700/70" />
      <LangSwitch />
    </nav>
  </header>
</template>
