<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  { id: 'about', label: t('nav.about') },
  { id: 'projects', label: t('nav.projects') },
  { id: 'stack', label: t('nav.stack') },
  { id: 'path', label: t('nav.path') },
  { id: 'hobbies', label: t('nav.hobbies') },
  { id: 'writings', label: t('nav.writings') },
  { id: 'contact', label: t('nav.contact') },
])
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 pointer-events-none">
    <nav
      class="pointer-events-auto flex items-center gap-1 rounded-full border border-ink-700/60 bg-ink-900/70 px-2 py-1.5 text-sm backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
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
        class="flex items-center rounded-full px-3 py-1.5 text-ink-300 transition hover:bg-ink-800/80 hover:text-ink-50 data-[magnetic-active=true]:bg-ink-800/80 data-[magnetic-active=true]:text-ink-50"
      >
        {{ l.label }}
      </a>
      <div class="h-5 w-px bg-ink-700/70 mx-1" />
      <LangSwitch />
    </nav>
  </header>
</template>
