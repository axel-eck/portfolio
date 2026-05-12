<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative border-t border-ink-800/60 bg-ink-950 px-6 py-10">
    <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 text-xs text-ink-400 sm:flex-row sm:items-center">
      <p class="font-mono">{{ $t('footer.rights', { year }) }}</p>
      <p class="font-mono">{{ $t('footer.built') }}</p>
    </div>
  </footer>
</template>
