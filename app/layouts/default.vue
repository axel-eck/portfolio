<script setup lang="ts">
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden">
    <a
      href="#main-content"
      class="sr-only fixed left-4 top-4 z-100 rounded-md bg-main-500 px-4 py-2 text-sm font-medium text-ink-950 focus:not-sr-only"
    >
      {{ $t('a11y.skip_content') }}
    </a>
    <CursorFX />
    <SiteNav />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
