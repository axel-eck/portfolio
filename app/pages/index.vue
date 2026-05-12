<script setup lang="ts">
import { Motion, type Transition } from 'motion-v'
import { marked } from 'marked'

const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()
const siteUrl = computed(() => String(runtimeConfig.public.siteUrl || requestUrl.origin).replace(/\/$/, ''))
const withBase = (path: string) => `${runtimeConfig.app.baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
  link: [
    { rel: 'canonical', href: () => `${siteUrl.value}/` },
    { rel: 'alternate', hreflang: 'fr', href: () => `${siteUrl.value}/` },
    { rel: 'alternate', hreflang: 'en', href: () => `${siteUrl.value}/` },
  ],
})

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  author: 'Axel Eckenberg',
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'profile',
  ogUrl: () => `${siteUrl.value}/`,
  ogImage: () => `${siteUrl.value}/og.svg`,
  ogImageAlt: () => t('seo.image_alt'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.title'),
  twitterDescription: () => t('seo.description'),
  twitterImage: () => `${siteUrl.value}/og.svg`,
})

const cvHref = computed(() => withBase(`${locale.value}/cv.pdf`))
const hasCv = ref(false)

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  inViewOptions: { once: true, margin: '-80px'  },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } satisfies Transition,
}

const stack = {
  app: [
    { label: 'Vue 3 / Nuxt', icon: 'simple-icons:vuedotjs' },
    { label: 'NestJS', icon: 'simple-icons:nestjs' },
    { label: 'TypeScript', icon: 'simple-icons:typescript' },
    { label: 'PostgreSQL', icon: 'simple-icons:postgresql' },
    { label: 'Drizzle', icon: 'simple-icons:drizzle' },
    { label: 'Prisma', icon: 'simple-icons:prisma' },
    { label: 'Rust', icon: 'simple-icons:rust' },
    { label: 'Java / Spring', icon: 'simple-icons:spring' },
    { label: 'Figma', icon: 'simple-icons:figma' },
  ],
  platform: [
    { label: 'Talos', icon: 'simple-icons:linux' },
    { label: 'Kubernetes', icon: 'simple-icons:kubernetes' },
    { label: 'Proxmox', icon: 'simple-icons:proxmox' },
    { label: 'ArgoCD', icon: 'simple-icons:argo' },
    { label: 'Kargo', icon: 'simple-icons:argo' },
    { label: 'Kustomize', icon: 'simple-icons:kubernetes' },
  ],
  observability: [
    { label: 'Prometheus', icon: 'simple-icons:prometheus' },
    { label: 'Grafana', icon: 'simple-icons:grafana' },
    { label: 'Loki', icon: 'simple-icons:grafana' },
    { label: 'Tempo', icon: 'simple-icons:grafana' },
  ],
  edge: [
    { label: 'Traefik', icon: 'simple-icons:traefikproxy' },
    { label: 'nginx', icon: 'simple-icons:nginx' },
    { label: 'External DNS', icon: 'lucide:globe' },
    { label: 'cert-manager', icon: 'lucide:shield-check' },
    { label: 'WireGuard', icon: 'simple-icons:wireguard' },
    { label: 'OPNsense', icon: 'simple-icons:opnsense' },
    { label: 'OVHcloud', icon: 'simple-icons:ovh' },
    { label: 'Cloudflare', icon: 'simple-icons:cloudflare' },
  ],
} as const

interface Writing {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  html: string
}
type WritingLocale = 'fr' | 'en'

const writingSources = import.meta.glob('../../content/writings/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseHeader(raw: string): { meta: Record<string, string>, body: string } {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const sepIdx = lines.findIndex(line => /^-{3,}\s*$/.test(line))
  const headerLines = sepIdx === -1 ? [] : lines.slice(0, sepIdx)
  const bodyLines = sepIdx === -1 ? lines : lines.slice(sepIdx + 1)
  const meta: Record<string, string> = {}

  for (const line of headerLines) {
    const match = line.match(/^(\w+)\s*:\s*(.+)\s*$/)
    if (match) meta[match[1]!.toLowerCase()] = match[2]!.trim()
  }

  return { meta, body: bodyLines.join('\n').trim() }
}

function plainExcerpt(body: string, max = 220) {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function loadWritings(localeCode: string): Writing[] {
  const writingLocale: WritingLocale = localeCode === 'en' ? 'en' : 'fr'

  return Object.entries(writingSources)
    .filter(([path]) => path.includes(`/content/writings/${writingLocale}/`))
    .map(([path, raw]) => {
      const name = path.split('/').pop() ?? ''
      const { meta, body } = parseHeader(raw)

      return {
        slug: name.replace(/\.md$/, ''),
        title: meta.title ?? name.replace(/\.md$/, ''),
        date: meta.date ?? '',
        tags: (meta.tags ?? '').split(',').map(tag => tag.trim()).filter(Boolean),
        excerpt: plainExcerpt(body),
        html: marked.parse(body, { gfm: true, breaks: false, async: false }) as string,
      }
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

const writings = computed(() => loadWritings(locale.value))
const openWriting = ref<string | null>(null)

const projects = ['eventdeer', 'kent', 'lucca', 'freelance'] as const
const pathSchool = ['kent', 'epitech', 'cmi'] as const
const pathWork = ['next', 'eventdeer', 'lucca', 'freelance'] as const
const hobbies = [
  { id: 'sailing',  icon: 'lucide:sailboat' },
  { id: 'f1',       icon: 'checkered-flag' },
  { id: 'games',    icon: 'lucide:gamepad-2' },
  { id: 'learning', icon: 'lucide:atom' },
  { id: 'homelab',  icon: 'lucide:server-cog' },
  { id: 'diy',      icon: 'lucide:hammer' },
] as const
const openProject = ref<string | null>(null)

watch(locale, () => {
  openWriting.value = null
})

watch(cvHref, async (href) => {
  if (import.meta.server) return

  try {
    const response = await fetch(href, { method: 'HEAD' })
    hasCv.value = response.ok
  } catch {
    hasCv.value = false
  }
}, { immediate: true })
</script>

<template>
  <div id="top" class="relative">
    <!-- HERO -->
    <section class="relative isolate px-4 pt-32 pb-24 sm:px-6 sm:pt-36 sm:pb-32">
      <!-- grid bg, extends well below hero and fades out -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 grid-bg opacity-70"
        style="height: 175%;
               mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
               -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);"
      />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 cursor-grid-glow"
        style="height: 175%;"
      />
      <div class="absolute inset-x-0 top-0 -z-10 h-160 bg-[radial-gradient(60rem_30rem_at_50%_-20%,rgba(34,197,94,0.10),transparent_60%)]" />

      <div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Motion
            :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5 }"
            class="inline-flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/60 px-3 py-1 font-mono text-xs text-ink-300 backdrop-blur"
          >
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span class="relative inline-flex size-1.5 rounded-full bg-accent-500" />
            </span>
            {{ $t('hero.status') }}
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.05 }"
            as="h1"
            class="mt-6 text-balance text-5xl font-semibold tracking-tight text-ink-50 sm:text-6xl lg:text-7xl"
          >
            {{ $t('hero.name') }}
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.15 }"
            class="mt-3 flex items-center gap-3 font-mono text-sm text-ink-300"
          >
            <Icon name="lucide:terminal" class="size-3.5 text-accent-400" />
            <span>{{ $t('hero.roles') }}</span>
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.22 }"
            class="mt-8 max-w-xl text-lg leading-relaxed text-ink-200"
          >
            {{ $t('hero.lede') }}
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.3 }"
            class="mt-4 max-w-xl text-ink-400"
          >
            {{ $t('hero.blurb') }}
          </Motion>

          <Motion
            :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.38 }"
            class="mt-8 grid w-full max-w-sm grid-cols-2 gap-2.5 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:gap-3"
          >
            <a
              v-magnetic="{ strength: 0.54, radius: 110 }"
              href="#contact"
              class="group col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-accent-400 data-[magnetic-active=true]:bg-accent-400 sm:col-span-1 sm:px-5"
            >
              {{ $t('hero.cta_contact') }}
              <Icon name="lucide:arrow-right" class="size-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              v-magnetic="{ strength: 0.5, radius: 104 }"
              href="#projects"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/40 px-4 py-2.5 text-sm text-ink-200 transition hover:border-ink-600 hover:bg-ink-800 data-[magnetic-active=true]:border-ink-600 data-[magnetic-active=true]:bg-ink-800 sm:px-5"
            >
              <Icon name="lucide:folder-open" class="size-4" />
              {{ $t('nav.projects') }}
            </a>
            <a
              v-if="hasCv"
              v-magnetic="{ strength: 0.5, radius: 104 }"
              :href="cvHref"
              download
              :aria-label="$t('contact.cv_aria')"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/40 px-4 py-2.5 text-sm text-ink-200 transition hover:border-ink-600 hover:bg-ink-800 data-[magnetic-active=true]:border-ink-600 data-[magnetic-active=true]:bg-ink-800 sm:px-5"
            >
              <Icon name="lucide:file-down" class="size-4" />
              {{ $t('hero.cta_cv') }}
            </a>
          </Motion>
        </div>

        <div class="lg:justify-self-end">
          <ArgoSyncCard />
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section class="relative px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-6xl">
        <Kicker id="about" :eyebrow="$t('about.kicker')" :title="$t('about.title')" />
        <div class="grid gap-5 lg:grid-cols-3">

          <!-- panel 1 — EventDeer prod board -->
          <Motion
            v-bind="fadeUp"
            class="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900/60 p-5"
          >
            <div class="flex items-center justify-between border-b border-ink-800/80 pb-3 font-mono text-[10px] text-ink-400">
              <span class="flex items-center gap-1.5">
                <Icon name="lucide:activity" class="size-3 text-accent-400" />
                {{ $t('about.panels.prod.title') }}
              </span>
              <span class="text-ink-500">{{ $t('about.panels.prod.range') }}</span>
            </div>
            <ul class="mt-4 space-y-2.5 font-mono text-[11px]">
              <li v-for="svc in ['api', 'web', 'postgres', 'ingress']" :key="svc" class="flex items-center justify-between">
                <span class="flex items-center gap-2 text-ink-200">
                  <span class="relative flex size-1.5">
                    <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-60" />
                    <span class="relative inline-flex size-1.5 rounded-full bg-accent-500" />
                  </span>
                  {{ svc }}
                </span>
                <span class="text-accent-400">{{ $t('about.panels.prod.healthy') }}</span>
              </li>
            </ul>
            <!-- mini sparkline -->
            <div class="mt-4 border-t border-ink-800/80 pt-4">
              <div class="flex items-end justify-between gap-1 h-10">
                <span
                  v-for="(h, idx) in [40, 55, 48, 70, 62, 75, 80, 72, 88, 84, 92, 90, 95, 98, 96, 99]"
                  :key="idx"
                  class="flex-1 rounded-sm bg-accent-500/40"
                  :style="{ height: `${h}%` }"
                />
              </div>
              <div class="mt-2 flex items-center justify-between font-mono text-[10px] text-ink-500">
                <span>{{ $t('about.panels.prod.uptime') }}</span>
                <span class="text-accent-400">99.98%</span>
              </div>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-ink-300">{{ $t('about.p1') }}</p>
          </Motion>

          <!-- panel 2 — Kent research code -->
          <Motion
            v-bind="fadeUp"
            :transition="{ duration: 0.6, delay: 0.1, ease: [0.22,1,0.36,1] }"
            class="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900/60 p-5"
          >
            <div class="flex items-center justify-between border-b border-ink-800/80 pb-3 font-mono text-[10px] text-ink-400">
              <span class="flex items-center gap-1.5">
                <Icon name="lucide:flask-conical" class="size-3 text-accent-400" />
                {{ $t('about.panels.research.title') }}
              </span>
              <span class="text-ink-500">dispatch.rs</span>
            </div>
            <pre class="mt-4 overflow-x-auto rounded-lg bg-ink-950/80 p-3 font-mono text-[10.5px] leading-relaxed ring-1 ring-inset ring-ink-800/80"><code><span class="text-pink-400">loop</span> {
  <span class="text-pink-400">let</span> op = unsafe { *ip };
  ip = ip.add(<span class="text-amber-300">1</span>);
  <span class="text-pink-400">match</span> op {
    <span class="text-sky-300">Op::Add</span> =&gt; { push(pop() + pop()); }
    <span class="text-sky-300">Op::Jmp</span> =&gt; { ip = jump_table[*ip]; }
    <span class="text-sky-300">Op::Halt</span> =&gt; <span class="text-pink-400">break</span>,
    _ =&gt; <span class="text-pink-400">unreachable!</span>(),
  }
}</code></pre>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span class="rounded-md bg-ink-800 px-2 py-0.5 font-mono text-[9.5px] text-ink-300 ring-1 ring-inset ring-ink-700">indirect threaded code</span>
              <span class="rounded-md bg-ink-800 px-2 py-0.5 font-mono text-[9.5px] text-ink-300 ring-1 ring-inset ring-ink-700">opcode dispatch</span>
            </div>
            <p class="mt-5 text-sm leading-relaxed text-ink-300">{{ $t('about.p2') }}</p>
          </Motion>

          <!-- panel 3 — availability -->
          <Motion
            v-bind="fadeUp"
            :transition="{ duration: 0.6, delay: 0.2, ease: [0.22,1,0.36,1] }"
            class="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900/60 p-5"
          >
            <div class="flex items-center justify-between border-b border-ink-800/80 pb-3 font-mono text-[10px] text-ink-400">
              <span class="flex items-center gap-1.5">
                <Icon name="lucide:calendar-check" class="size-3 text-accent-400" />
                {{ $t('about.avail.label') }}
              </span>
              <span class="text-accent-400">{{ $t('about.avail.open') }}</span>
            </div>

            <!-- big date chip -->
            <div class="mt-4 rounded-xl bg-ink-950/80 p-4 ring-1 ring-inset ring-ink-800/80">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">{{ $t('about.avail.starting') }}</p>
              <p class="mt-1 font-semibold text-2xl text-ink-50">{{ $t('about.avail.date') }}</p>
              <p class="mt-1 font-mono text-[11px] text-accent-400">{{ $t('about.avail.subtitle') }}</p>
            </div>

            <!-- week grid -->
            <div class="mt-4">
              <p class="font-mono text-[10px] text-ink-500 mb-2">{{ $t('about.avail.week') }}</p>
              <div class="grid grid-cols-7 gap-1">
                <div
                  v-for="(d, idx) in [
                    { l: $t('about.avail.days.mon'), k: 'co' },
                    { l: $t('about.avail.days.tue'), k: 'co' },
                    { l: $t('about.avail.days.wed'), k: 'co' },
                    { l: $t('about.avail.days.thu'), k: 'ed' },
                    { l: $t('about.avail.days.fri'), k: 'ed' },
                    { l: $t('about.avail.days.sat'), k: 'off' },
                    { l: $t('about.avail.days.sun'), k: 'off' },
                  ]"
                  :key="idx"
                  :class="[
                    'flex aspect-square items-center justify-center rounded-md font-mono text-[10px] ring-1 ring-inset',
                    d.k === 'co'  && 'bg-accent-500/15 text-accent-300 ring-accent-500/30',
                    d.k === 'ed'  && 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
                    d.k === 'off' && 'bg-ink-800/60 text-ink-500 ring-ink-700/60',
                  ]"
                >{{ d.l }}</div>
              </div>
              <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-ink-500">
                <span class="flex items-center gap-1"><span class="size-2 rounded-sm bg-accent-500/60" /> {{ $t('about.avail.company') }}</span>
                <span class="flex items-center gap-1"><span class="size-2 rounded-sm bg-amber-500/60" /> {{ $t('about.avail.eventdeer') }}</span>
                <span class="flex items-center gap-1"><span class="size-2 rounded-sm bg-ink-700" /> {{ $t('about.avail.off') }}</span>
              </p>
            </div>

            <!-- location chips -->
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span class="inline-flex items-center gap-1 rounded-md bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-200 ring-1 ring-inset ring-ink-700">
                <Icon name="lucide:map-pin" class="size-2.5" />
                {{ $t('about.avail.location_nantes') }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-md bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-200 ring-1 ring-inset ring-ink-700">
                <Icon name="lucide:globe" class="size-2.5" />
                {{ $t('about.avail.location_remote') }}
              </span>
            </div>

            <p class="mt-5 text-sm leading-relaxed text-ink-300">{{ $t('about.p3') }}</p>
          </Motion>
        </div>
      </div>
    </section>

    <!-- PROJECTS -->
    <section class="relative border-t border-ink-800/60 bg-ink-950/40 px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-6xl">
        <Kicker
          id="projects"
          :eyebrow="$t('projects.kicker')"
          :title="$t('projects.title')"
          :subtitle="$t('projects.subtitle')"
        />
        <div class="grid gap-6 sm:grid-cols-2">
          <Motion
            v-for="(p, i) in projects"
            :key="p"
            :initial="{ opacity: 0, y: 24 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :in-view-options="{ once: true, margin: '-60px' }"
            :transition="{ duration: 0.5, delay: i * 0.06, ease: [0.22,1,0.36,1] }"
            class="group relative overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900/60 p-6 transition hover:border-ink-700 hover:bg-ink-900"
          >
            <div class="flex items-center justify-between gap-3 font-mono text-xs text-ink-400">
              <span>{{ $t(`projects.items.${p}.role`) }}</span>
              <span>{{ $t(`projects.items.${p}.period`) }}</span>
            </div>
            <h3 class="mt-4 text-2xl font-semibold tracking-tight text-ink-50">
              {{ $t(`projects.items.${p}.title`) }}
            </h3>
            <p class="mt-3 text-ink-300">{{ $t(`projects.items.${p}.summary`) }}</p>

            <button
              v-magnetic="{ strength: 0.5, radius: 80 }"
              type="button"
              class="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-accent-400 hover:text-accent-300 data-[magnetic-active=true]:text-accent-300"
              @click="openProject = openProject === p ? null : p"
            >
              <Icon
                name="lucide:chevron-right"
                class="size-3.5 transition"
                :class="openProject === p ? 'rotate-90' : ''"
              />
              {{ $t('projects.more') }}
            </button>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <p
                v-if="openProject === p"
                class="mt-4 border-t border-ink-800/80 pt-4 text-sm leading-relaxed text-ink-300"
              >
                {{ $t(`projects.items.${p}.detail`) }}
              </p>
            </Transition>

            <span
              class="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-accent-500/0 blur-3xl transition-colors duration-500 group-hover:bg-accent-500/10"
            />
          </Motion>
        </div>
      </div>
    </section>

    <!-- STACK -->
    <section class="relative px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-6xl">
        <Kicker id="stack" :eyebrow="$t('stack.kicker')" :title="$t('stack.title')" />
        <div class="grid gap-px overflow-hidden rounded-2xl border border-ink-800/70 bg-ink-800/70 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(layer, key) in stack"
            :key="key"
            class="flex flex-col gap-4 bg-ink-950/80 p-6"
          >
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-400">
                {{ $t(`stack.groups.${key}`) }}
              </p>
              <p class="mt-2 text-sm text-ink-400">{{ $t(`stack.labels.${key}`) }}</p>
            </div>
            <ul class="mt-2 flex flex-col gap-2">
              <li
                v-for="item in layer"
                :key="item.label"
                class="flex items-center gap-2.5 font-mono text-xs text-ink-200"
              >
                <Icon :name="item.icon" class="size-3.5 text-ink-400" />
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- PATH -->
    <section class="relative border-t border-ink-800/60 bg-ink-950/40 px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-5xl">
        <Kicker id="path" :eyebrow="$t('path.kicker')" :title="$t('path.title')" />

        <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
          <!-- school -->
          <div>
            <div class="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-400">
              <Icon name="lucide:graduation-cap" class="size-3.5" />
              {{ $t('path.track_school') }}
            </div>
            <ol class="relative space-y-10 border-l border-ink-800 pl-8">
              <Motion
                v-for="(item, i) in pathSchool"
                :key="item"
                :initial="{ opacity: 0, x: -10 }"
                :while-in-view="{ opacity: 1, x: 0 }"
                :in-view-options="{ once: true, margin: '-40px' }"
                :transition="{ duration: 0.5, delay: i * 0.08, ease: [0.22,1,0.36,1] }"
                as="li"
                class="relative"
              >
                <span class="absolute -left-9.25 top-1.5 size-3 rounded-full bg-ink-900 ring-2 ring-accent-500/70 shadow-[0_0_12px_var(--color-accent-500)]" />
                <p class="font-mono text-xs text-ink-400">{{ $t(`path.items.${item}.period`) }} · {{ $t(`path.items.${item}.place`) }}</p>
                <h3 class="mt-1 text-lg font-medium text-ink-50">{{ $t(`path.items.${item}.title`) }}</h3>
                <p class="mt-1 text-sm text-ink-400">{{ $t(`path.items.${item}.detail`) }}</p>
              </Motion>
            </ol>
          </div>

          <!-- work -->
          <div>
            <div class="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
              <Icon name="lucide:briefcase" class="size-3.5" />
              {{ $t('path.track_work') }}
            </div>
            <ol class="relative space-y-10 border-l border-ink-800 pl-8">
              <Motion
                v-for="(item, i) in pathWork"
                :key="item"
                :initial="{ opacity: 0, x: -10 }"
                :while-in-view="{ opacity: 1, x: 0 }"
                :in-view-options="{ once: true, margin: '-40px' }"
                :transition="{ duration: 0.5, delay: i * 0.08, ease: [0.22,1,0.36,1] }"
                as="li"
                class="relative"
              >
                <!-- pending dot for "next" slot, solid for others -->
                <span
                  v-if="item === 'next'"
                  class="absolute -left-9.75 top-1 flex size-4 items-center justify-center rounded-full bg-ink-900 ring-2 ring-dashed ring-amber-500/70"
                >
                  <Icon name="lucide:plus" class="size-2.5 text-amber-300" stroke-width="3" />
                </span>
                <span
                  v-else
                  class="absolute -left-9.25 top-1.5 size-3 rounded-full bg-ink-900 ring-2 ring-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                />

                <template v-if="item === 'next'">
                  <a
                    href="#contact"
                    class="group block rounded-xl border border-dashed border-amber-500/40 bg-amber-500/4 p-4 transition hover:border-amber-500/70 hover:bg-amber-500/8"
                  >
                    <p class="flex items-center gap-2 font-mono text-xs text-amber-300/80">
                      <Icon name="lucide:refresh-ccw" class="size-3 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
                      {{ $t(`path.items.${item}.period`) }} · {{ $t(`path.items.${item}.place`) }}
                    </p>
                    <h3 class="mt-1.5 flex items-center gap-2 text-lg font-medium text-amber-100">
                      {{ $t(`path.items.${item}.title`) }}
                      <Icon
                        name="lucide:arrow-right"
                        class="size-4 text-amber-300/70 transition group-hover:translate-x-0.5 group-hover:text-amber-200"
                      />
                    </h3>
                    <p class="mt-1 text-sm text-ink-400">{{ $t(`path.items.${item}.detail`) }}</p>
                  </a>
                </template>
                <template v-else>
                  <p class="font-mono text-xs text-ink-400">{{ $t(`path.items.${item}.period`) }} · {{ $t(`path.items.${item}.place`) }}</p>
                  <h3 class="mt-1 text-lg font-medium text-ink-50">{{ $t(`path.items.${item}.title`) }}</h3>
                  <p class="mt-1 text-sm text-ink-400">{{ $t(`path.items.${item}.detail`) }}</p>
                </template>
              </Motion>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- HOBBIES -->
    <section class="relative px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-6xl">
        <Kicker
          id="hobbies"
          :eyebrow="$t('hobbies.kicker')"
          :title="$t('hobbies.title')"
          :subtitle="$t('hobbies.subtitle')"
        />

        <!-- terminal-style ascii frame -->
        <div class="overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-950/70 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          <div class="flex items-center justify-between border-b border-ink-800/80 bg-ink-900/60 px-4 py-2 font-mono text-[10px] text-ink-500">
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-ink-700 transition-colors duration-200 hover:bg-[#ff5f56]" />
              <span class="size-2 rounded-full bg-ink-700 transition-colors duration-200 hover:bg-[#ffbd2e]" />
              <span class="size-2 rounded-full bg-ink-700 transition-colors duration-200 hover:bg-[#27c93f]" />
              <span class="ml-2">{{ $t('hobbies.terminal.path') }}</span>
            </div>
            <span>{{ $t('hobbies.terminal.command') }}</span>
          </div>

          <div class="grid divide-x divide-y divide-ink-800/70 sm:grid-cols-2 lg:grid-cols-3">
            <Motion
              v-for="(h, i) in hobbies"
              :key="h.id"
              :initial="{ opacity: 0, y: 8 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :in-view-options="{ once: true, margin: '-40px' }"
              :transition="{ duration: 0.4, delay: i * 0.05, ease: [0.22,1,0.36,1] }"
              class="group relative flex flex-col gap-3 bg-ink-950/40 p-5 transition hover:bg-ink-900/40"
            >
              <div class="flex items-start justify-between">
                <div class="flex size-10 items-center justify-center rounded-lg bg-ink-800/80 text-accent-300 ring-1 ring-inset ring-ink-700/60 transition group-hover:bg-accent-500/15 group-hover:ring-accent-500/30">
                  <svg
                    v-if="h.icon === 'checkered-flag'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="size-5"
                  >
                    <path d="M4 22V3" />
                    <path d="M4 4h15v10H4z" />
                    <rect x="4"  y="4"  width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="11.5" y="4"  width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="7.75" y="6.5" width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="15.25" y="6.5" width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="4"  y="9"  width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="11.5" y="9"  width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="7.75" y="11.5" width="3.75" height="2.5" fill="currentColor" stroke="none" />
                    <rect x="15.25" y="11.5" width="3.75" height="2.5" fill="currentColor" stroke="none" />
                  </svg>
                  <Icon v-else :name="h.icon" class="size-5" />
                </div>
                <span class="font-mono text-[10px] text-ink-600">{{ String(i + 1).padStart(2, '0') }}</span>
              </div>

              <div>
                <p class="flex items-baseline gap-1.5 font-mono text-[11px] text-ink-500">
                  <span class="text-accent-500">›</span>
                  <span class="truncate text-ink-100">{{ $t(`hobbies.items.${h.id}.label`) }}</span>
                </p>
                <p class="mt-1.5 font-mono text-[10.5px] leading-relaxed text-ink-400">
                  {{ $t(`hobbies.items.${h.id}.stat`) }}
                </p>
              </div>
            </Motion>

          </div>

          <div class="border-t border-ink-800/80 bg-ink-900/40 px-4 py-2 font-mono text-[10px] text-ink-500">
            <span class="text-accent-400">{{ $t('hobbies.terminal.count', { count: hobbies.length }) }}</span>
            · {{ $t('hobbies.terminal.last_touched') }}
            <span class="text-ink-400">{{ $t('hobbies.terminal.today') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- WRITINGS -->
    <section class="relative px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-3xl">
        <Kicker
          id="writings"
          :eyebrow="$t('writings.kicker')"
          :title="$t('writings.title')"
          :subtitle="$t('writings.subtitle')"
        />

        <p v-if="!writings?.length" class="font-mono text-sm text-ink-500">{{ $t('writings.empty') }}</p>

        <ul v-else class="divide-y divide-ink-800/60 border-y border-ink-800/60">
          <li v-for="w in writings" :key="w.slug" class="py-5">
            <button
              type="button"
              class="group w-full text-left"
              @click="openWriting = openWriting === w.slug ? null : w.slug"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 class="text-lg font-medium text-ink-50 group-hover:text-accent-300 transition-colors">
                  {{ w.title }}
                </h3>
                <span class="font-mono text-xs text-ink-500">{{ w.date }}</span>
              </div>
              <p class="mt-1.5 text-sm leading-relaxed text-ink-400">{{ w.excerpt }}</p>
              <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span
                  v-for="tag in w.tags"
                  :key="tag"
                  class="rounded-md bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-300 ring-1 ring-inset ring-ink-700"
                >#{{ tag }}</span>
                <span class="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-accent-400">
                  <Icon
                    :name="openWriting === w.slug ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                    class="size-3.5"
                  />
                  {{ openWriting === w.slug ? $t('writings.close') : $t('writings.read') }}
                </span>
              </div>
            </button>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200"
              leave-to-class="opacity-0"
            >
              <article
                v-if="openWriting === w.slug"
                class="prose-writing mt-5 rounded-xl border border-ink-800/80 bg-ink-900/40 p-5"
                v-html="w.html"
              />
            </Transition>
          </li>
        </ul>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="relative border-t border-ink-800/60 bg-ink-950/60 px-6 py-24 sm:py-32">
      <div class="mx-auto max-w-3xl">
        <Kicker id="contact" :eyebrow="$t('contact.kicker')" :title="$t('contact.title')" :subtitle="$t('contact.blurb')" />
        <div class="flex flex-wrap gap-3">
          <a
            v-magnetic="{ strength: 0.54, radius: 110 }"
            href="mailto:axel.eckenberg@yahoo.fr"
            class="group inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-accent-400 data-[magnetic-active=true]:bg-accent-400"
          >
            <Icon name="lucide:mail" class="size-4" />
            {{ $t('contact.email') }}
          </a>
          <a
            v-magnetic="{ strength: 0.5, radius: 104 }"
            href="https://www.linkedin.com/in/axel-eckenberg/"
            target="_blank"
            rel="noopener"
            :aria-label="$t('contact.linkedin_aria')"
            class="inline-flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/40 px-5 py-2.5 text-sm text-ink-200 transition hover:border-ink-600 hover:bg-ink-800 data-[magnetic-active=true]:border-ink-600 data-[magnetic-active=true]:bg-ink-800"
          >
            <Icon name="simple-icons:linkedin" class="size-4" />
            {{ $t('contact.linkedin') }}
          </a>
          <a
            v-magnetic="{ strength: 0.5, radius: 104 }"
            href="https://github.com/axel-eck"
            target="_blank"
            rel="noopener"
            :aria-label="$t('contact.github_aria')"
            class="inline-flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/40 px-5 py-2.5 text-sm text-ink-200 transition hover:border-ink-600 hover:bg-ink-800 data-[magnetic-active=true]:border-ink-600 data-[magnetic-active=true]:bg-ink-800"
          >
            <Icon name="simple-icons:github" class="size-4" />
            {{ $t('contact.github') }}
          </a>
          <a
            v-if="hasCv"
            v-magnetic="{ strength: 0.5, radius: 104 }"
            :href="cvHref"
            download
            :aria-label="$t('contact.cv_aria')"
            class="inline-flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/40 px-5 py-2.5 text-sm text-ink-200 transition hover:border-ink-600 hover:bg-ink-800 data-[magnetic-active=true]:border-ink-600 data-[magnetic-active=true]:bg-ink-800"
          >
            <Icon name="lucide:file-down" class="size-4" />
            {{ $t('hero.cta_cv') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
