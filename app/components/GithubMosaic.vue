<script setup lang="ts">
interface Day {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface Payload {
  total: number
  active: number
  current: number
  longest: number
  days: Day[]
}

const { locale } = useI18n()

const { data } = await useFetch<Payload>('/api/github-contributions', {
  key: 'gh-contributions',
})

const cells = computed<(Day | null)[]>(() => {
  if (!data.value) return []
  const days = data.value.days
  if (!days.length) return []
  const first = new Date(`${days[0]!.date}T00:00:00Z`)
  const pad = first.getUTCDay()
  return [...Array<null>(pad).fill(null), ...days]
})

const cols = computed(() => Math.ceil(cells.value.length / 7))

const monthLabels = computed(() => {
  if (!data.value?.days.length) return []
  const days = data.value.days
  const first = new Date(`${days[0]!.date}T00:00:00Z`)
  const pad = first.getUTCDay()
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'short' })
  const labels: { col: number, label: string }[] = []
  let lastMonth = -1
  for (let i = 0; i < days.length; i++) {
    const idx = i + pad
    if (idx % 7 !== 0) continue
    const d = new Date(`${days[i]!.date}T00:00:00Z`)
    const m = d.getUTCMonth()
    if (m !== lastMonth) {
      labels.push({ col: Math.floor(idx / 7), label: formatter.format(d) })
      lastMonth = m
    }
  }
  return labels
})

function levelClass(level: number | undefined) {
  switch (level) {
    case 0: return 'bg-ink-800/70 ring-1 ring-inset ring-ink-800/40'
    case 1: return 'bg-main-500/25'
    case 2: return 'bg-main-500/50'
    case 3: return 'bg-main-500/75'
    case 4: return 'bg-main-500'
    default: return 'opacity-0'
  }
}
</script>

<template>
  <div
    v-if="data"
    class="overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-950/70 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
  >
    <div class="flex items-center justify-between gap-3 border-b border-ink-800/80 bg-ink-900/60 px-4 py-2 font-mono text-[10px] text-ink-500">
      <div class="flex min-w-0 items-center gap-1.5">
        <span class="size-2 shrink-0 rounded-full bg-ink-700" />
        <span class="size-2 shrink-0 rounded-full bg-ink-700" />
        <span class="size-2 shrink-0 rounded-full bg-ink-700" />
        <span class="ml-2 truncate">{{ $t('github.terminal.path') }}</span>
      </div>
      <span class="hidden truncate sm:inline">{{ $t('github.terminal.command') }}</span>
      <span class="truncate sm:hidden">{{ $t('github.terminal.command_short') }}</span>
    </div>

    <div class="p-5 sm:p-6">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            {{ $t('github.stats.total') }}
          </p>
          <p class="mt-1 text-2xl font-semibold text-ink-50">
            {{ data.total.toLocaleString(locale) }}
          </p>
        </div>
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            {{ $t('github.stats.active') }}
          </p>
          <p class="mt-1 text-2xl font-semibold text-ink-50">
            {{ data.active }}<span class="ml-1 font-mono text-xs text-ink-500">/ 365</span>
          </p>
        </div>
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            {{ $t('github.stats.current') }}
          </p>
          <p class="mt-1 text-2xl font-semibold text-main-300">
            {{ data.current }}<span class="ml-1 font-mono text-xs text-ink-500">d</span>
          </p>
        </div>
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            {{ $t('github.stats.longest') }}
          </p>
          <p class="mt-1 text-2xl font-semibold text-ink-50">
            {{ data.longest }}<span class="ml-1 font-mono text-xs text-ink-500">d</span>
          </p>
        </div>
      </div>

      <div class="mt-6">
        <div
          class="grid h-4 font-mono text-[8px] text-ink-500 sm:text-[9px]"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
          <span
            v-for="m in monthLabels"
            :key="`${m.col}-${m.label}`"
            class="truncate"
            :style="{ gridColumnStart: m.col + 1 }"
          >
            {{ m.label }}
          </span>
        </div>

        <div
          class="mt-1 grid grid-flow-col grid-rows-7 gap-px sm:gap-[3px]"
          :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
          <div
            v-for="(c, i) in cells"
            :key="i"
            :class="['aspect-square rounded-[1px] sm:rounded-[2px]', levelClass(c?.level)]"
            :title="c ? `${c.date} · ${c.count}` : ''"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3 font-mono text-[10px] text-ink-500">
        <a
          href="https://github.com/axel-eck"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-main-400 transition hover:text-main-300"
        >
          <Icon name="simple-icons:github" class="size-3" />
          github.com/axel-eck
        </a>
        <div class="flex items-center gap-1.5">
          <span>{{ $t('github.legend.less') }}</span>
          <span
            v-for="lvl in [0, 1, 2, 3, 4]"
            :key="lvl"
            :class="['size-2.5 rounded-[2px]', levelClass(lvl)]"
          />
          <span>{{ $t('github.legend.more') }}</span>
        </div>
      </div>
    </div>

    <div class="border-t border-ink-800/80 bg-ink-900/40 px-4 py-2 font-mono text-[10px] text-ink-500">
      <span class="text-main-400">{{ $t('github.terminal.last_year') }}</span>
      · {{ $t('github.terminal.cache') }}
    </div>
  </div>
</template>
