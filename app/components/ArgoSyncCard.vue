<script setup lang="ts">
const { t } = useI18n()

const sha = 'b2c6e1a'

const stages = computed(() => [
  { id: 'git',   icon: 'lucide:git-branch', name: t('hero.argo.stage_git'),   detail: t('hero.argo.stage_git_d') },
  { id: 'kargo', icon: 'lucide:package',    name: t('hero.argo.stage_kargo'), detail: t('hero.argo.stage_kargo_d') },
  { id: 'argo',  icon: 'lucide:refresh-cw', name: t('hero.argo.stage_argo'),  detail: t('hero.argo.stage_argo_d') },
  { id: 'talos', icon: 'lucide:server',     name: t('hero.argo.stage_talos'), detail: t('hero.argo.stage_talos_d') },
])

type StageState = 'pending' | 'active' | 'done'
type LineState  = 'pending' | 'filling' | 'done'

const stageStates = ref<StageState[]>(['pending', 'pending', 'pending', 'pending'])
const lineStates  = ref<LineState[]>(['pending', 'pending', 'pending'])

const ACTIVE_DUR = 1400
const FILL_DUR   = 1100
const ARGO_BONUS = 600

const timers: ReturnType<typeof setTimeout>[] = []
const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

onMounted(() => {
  let t = 500
  // stage 0
  at(t, () => { stageStates.value[0] = 'active' });                                           t += ACTIVE_DUR
  at(t, () => { stageStates.value[0] = 'done';   lineStates.value[0] = 'filling' });          t += FILL_DUR
  // stage 1
  at(t, () => { lineStates.value[0] = 'done';    stageStates.value[1] = 'active' });          t += ACTIVE_DUR
  at(t, () => { stageStates.value[1] = 'done';   lineStates.value[1] = 'filling' });          t += FILL_DUR
  // stage 2 (argocd — real work, give it more time)
  at(t, () => { lineStates.value[1] = 'done';    stageStates.value[2] = 'active' });          t += ACTIVE_DUR + ARGO_BONUS
  at(t, () => { stageStates.value[2] = 'done';   lineStates.value[2] = 'filling' });          t += FILL_DUR
  // stage 3
  at(t, () => { lineStates.value[2] = 'done';    stageStates.value[3] = 'active' });          t += ACTIVE_DUR
  at(t, () => { stageStates.value[3] = 'done' })
})

onBeforeUnmount(() => timers.forEach(clearTimeout))

const allDone = computed(() => stageStates.value.every(s => s === 'done'))
</script>

<template>
  <div
    class="relative w-full max-w-155 rounded-2xl border border-ink-700/70 bg-ink-900/80 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-5"
  >
    <!-- header -->
    <div class="flex items-center justify-between gap-2 border-b border-ink-800/80 pb-3 sm:gap-3 sm:pb-4">
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ink-800 ring-1 ring-inset ring-ink-700/60 sm:size-8">
          <Icon name="lucide:infinity" class="size-3.5 text-accent-400 sm:size-4" />
        </div>
        <div class="min-w-0">
          <p class="truncate font-mono text-[13px] text-ink-100">{{ $t('hero.argo.title') }}</p>
          <p class="truncate font-mono text-[10px] text-ink-400">{{ $t('hero.argo.subtitle') }}</p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 -translate-y-1"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <span
            v-if="allDone"
            key="synced"
            class="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-1.5 py-1 font-mono text-[9px] font-medium text-accent-300 ring-1 ring-inset ring-accent-500/30 sm:px-2 sm:text-[10px]"
          >
            <span class="size-1.5 rounded-full bg-accent-500" />
            {{ $t('hero.argo.synced') }}
          </span>
          <span
            v-else
            key="outofsync"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-1.5 py-1 font-mono text-[9px] font-medium text-amber-300 ring-1 ring-inset ring-amber-500/30 sm:px-2 sm:text-[10px]"
          >
            <Icon name="lucide:refresh-ccw" class="size-3 animate-spin [animation-duration:3s] [animation-direction:reverse]" />
            {{ $t('hero.argo.out_of_sync') }}
          </span>
        </Transition>
        <span
          class="hidden sm:inline-flex items-center rounded-full px-2 py-1 font-mono text-[10px] ring-1 ring-inset transition-colors duration-500"
          :class="allDone ? 'bg-accent-500/10 text-accent-300 ring-accent-500/30' : 'bg-ink-800 text-ink-400 ring-ink-700'"
        >
          {{ $t('hero.argo.healthy') }}
        </span>
      </div>
    </div>

    <!-- graph -->
    <div class="relative mt-6 sm:mt-7">
      <div class="grid min-w-0 grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-y-3">
        <template v-for="(s, i) in stages" :key="s.id">
          <!-- stage node -->
          <div class="flex flex-col items-center text-center">
            <div
              :class="[
                'relative flex size-10 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-500 sm:size-12',
                stageStates[i] === 'pending' && 'bg-ink-900/60 text-amber-400/50 ring-amber-500/20',
                stageStates[i] === 'active'  && 'bg-accent-500/15 text-accent-200 ring-accent-500/60 shadow-[0_0_30px_-5px_var(--color-accent-500)] scale-[1.06]',
                stageStates[i] === 'done'    && 'bg-accent-500/10 text-accent-300 ring-accent-500/40',
              ]"
            >
              <Icon
                :name="s.icon"
                :class="[
                  'size-4 transition-transform duration-500 sm:size-5',
                  stageStates[i] === 'active' && s.id === 'argo' ? 'animate-spin [animation-duration:2.5s]' : '',
                ]"
              />
              <!-- active ping -->
              <span
                v-if="stageStates[i] === 'active'"
                class="absolute -right-1 -top-1 flex size-2.5"
              >
                <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span class="relative inline-flex size-2.5 rounded-full bg-accent-500" />
              </span>
              <!-- done indicator: tiny matching square chip at bottom-right -->
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
              >
                <span
                  v-if="stageStates[i] === 'done'"
                  class="absolute -bottom-1 -right-1 flex size-4.5 items-center justify-center rounded-md bg-accent-500/90 p-0.5 text-ink-950 ring-1 ring-inset ring-accent-400 shadow-[0_2px_8px_rgba(34,197,94,0.4)]"
                >
                  <Icon name="lucide:check" class="size-2" stroke-width="3.5" />
                </span>
              </Transition>
              <!-- pending indicator: same square chip, amber, refresh -->
              <span
                v-if="stageStates[i] === 'pending'"
                class="absolute -bottom-1 -right-1 flex size-4.5 items-center justify-center rounded-md bg-ink-900 p-0.5 text-amber-400/80 ring-1 ring-inset ring-amber-500/30"
              >
                <span class="flex size-2.5 items-center justify-center animate-spin [animation-duration:4s] [animation-direction:reverse]">
                  <Icon name="lucide:refresh-ccw" size="9px" class="block" />
                </span>
              </span>
            </div>
            <p
              :class="[
                'mt-3 font-mono text-[10px] font-semibold tracking-wide transition-colors duration-500 sm:text-[11px]',
                stageStates[i] === 'pending' ? 'text-ink-500' : 'text-ink-100',
              ]"
            >
              {{ s.name }}
            </p>
            <p class="mt-1 max-w-17 font-mono text-[8px] leading-tight text-ink-500 min-[380px]:max-w-22 sm:max-w-30 sm:text-[9.5px]">{{ s.detail }}</p>
          </div>

          <!-- connector -->
          <div
            v-if="i < stages.length - 1"
            class="relative mt-5 h-0.5 w-5 min-[380px]:w-7 sm:mt-6 sm:w-20"
          >
            <span class="absolute inset-0 rounded-full bg-ink-700/70" />
            <div
              :class="[
                'absolute inset-0 origin-left rounded-full bg-linear-to-r from-accent-500 via-accent-400 to-accent-500 shadow-[0_0_10px_var(--color-accent-500)]',
                lineStates[i] === 'pending' && 'scale-x-0 transition-transform duration-300',
                lineStates[i] === 'filling' && 'scale-x-100 transition-transform duration-1100 ease-linear',
                lineStates[i] === 'done'    && 'scale-x-100',
              ]"
            />
            <span
              :class="[
                'absolute -right-1.25 top-1/2 -translate-y-1/2 border-y-4 border-l-[6px] border-y-transparent transition-colors duration-300',
                lineStates[i] === 'done' ? 'border-l-accent-500' : 'border-l-ink-700',
              ]"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- footer -->
    <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-ink-800/80 pt-3 font-mono text-[9px] text-ink-400 sm:mt-7 sm:text-[10px]">
      <span class="flex items-center gap-2">
        <Icon name="lucide:git-commit-vertical" class="size-3" />
        {{ $t('hero.argo.sha', { sha }) }}
      </span>
      <span class="flex items-center gap-1.5">
        <Icon name="lucide:clock" class="size-3" />
        <span v-if="allDone">{{ $t('hero.argo.synced_now') }}</span>
        <span v-else>{{ $t('hero.argo.syncing') }}</span>
      </span>
    </div>
  </div>
</template>
