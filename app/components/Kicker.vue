<script setup lang="ts">
defineOptions({ name: 'SectionKicker' })
defineProps<{ id?: string, eyebrow: string, title: string, subtitle?: string }>()
</script>

<template>
  <div :id="id" class="mb-12 scroll-mt-32">
    <p class="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-main-400">
      <span class="text-ink-500">{ </span>{{ eyebrow }}<span class="text-ink-500"> }</span>
    </p>
    <h2 class="text-balance text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-3 max-w-xl text-ink-400">{{ subtitle }}</p>
  </div>
</template>
