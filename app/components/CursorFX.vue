<script setup lang="ts">
const enabled = ref(false)
const reduced = ref(false)

const dotEl = ref<HTMLElement | null>(null)
const ringEl = ref<HTMLElement | null>(null)
const glowEl = ref<HTMLElement | null>(null)

// instant cursor pos
const target = { x: 0, y: 0 }
// lagged cursor box
const ring = { x: 0, y: 0, width: 32, height: 32, radius: 999 }
const glow = { x: 0, y: 0 }

let rafId = 0
let hoverInteractive = false
let activeMagneticEl: HTMLElement | null = null

const DEFAULT_MAGNETIC_STRENGTH = 0.45
const DEFAULT_MAGNETIC_RADIUS = 110
const MAGNETIC_RING_PADDING = 16
const RING_POSITION_LERP = 0.28
const RING_SIZE_LERP = 0.44
const GLOW_LERP = 0.14

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function readMagneticNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function setHoverInteractive(value: boolean) {
  if (hoverInteractive === value) return

  hoverInteractive = value
  ringEl.value?.classList.toggle('cursor-ring--interactive', value)
}

function setActiveMagneticEl(el: HTMLElement | null) {
  if (activeMagneticEl === el) return

  activeMagneticEl?.removeAttribute('data-magnetic-active')
  activeMagneticEl = el
  activeMagneticEl?.setAttribute('data-magnetic-active', 'true')
}

function getCursorTarget(e: MouseEvent) {
  const el = e.target as HTMLElement | null
  let magneticEl: HTMLElement | null = null
  let magneticStrength = DEFAULT_MAGNETIC_STRENGTH
  let magneticPull = 0
  let magneticDx = 0
  let magneticDy = 0

  for (const candidate of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const rect = candidate.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = cx - e.clientX
    const dy = cy - e.clientY
    const distance = Math.hypot(dx, dy)
    const radius = readMagneticNumber(candidate.dataset.magneticRadius, DEFAULT_MAGNETIC_RADIUS)

    if (distance > radius) continue

    const pull = easeOutCubic(1 - distance / radius)
    if (pull <= magneticPull) continue

    magneticEl = candidate
    magneticPull = pull
    magneticDx = dx
    magneticDy = dy
    magneticStrength = readMagneticNumber(candidate.dataset.magneticStrength, DEFAULT_MAGNETIC_STRENGTH)
  }

  if (!magneticEl) {
    setActiveMagneticEl(null)
    return { x: e.clientX, y: e.clientY, interactive: !!el?.closest('a, button, [role="button"], input, textarea, select') }
  }

  setActiveMagneticEl(magneticEl)

  return {
    x: e.clientX + magneticDx * magneticStrength * magneticPull,
    y: e.clientY + magneticDy * magneticStrength * magneticPull,
    interactive: true,
  }
}

function getRingTarget() {
  if (!activeMagneticEl) {
    const size = hoverInteractive ? 52 : 32
    return {
      x: target.x,
      y: target.y,
      width: size,
      height: size,
      radius: 999,
    }
  }

  const rect = activeMagneticEl.getBoundingClientRect()
  const width = rect.width + MAGNETIC_RING_PADDING
  const height = rect.height + MAGNETIC_RING_PADDING

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width,
    height,
    radius: Math.min(width, height) / 2,
  }
}

function frame() {
  // dot follows target instantly
  if (dotEl.value) {
    dotEl.value.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
  }

  const ringTarget = getRingTarget()

  // ring lerps and morphs
  ring.x += (ringTarget.x - ring.x) * RING_POSITION_LERP
  ring.y += (ringTarget.y - ring.y) * RING_POSITION_LERP
  ring.width += (ringTarget.width - ring.width) * RING_SIZE_LERP
  ring.height += (ringTarget.height - ring.height) * RING_SIZE_LERP
  ring.radius += (ringTarget.radius - ring.radius) * RING_SIZE_LERP

  if (ringEl.value) {
    // Do not scale the ring here.
    // Scaling a thin border can make it blurry/pixelated.
    ringEl.value.style.width = `${ring.width}px`
    ringEl.value.style.height = `${ring.height}px`
    ringEl.value.style.borderRadius = `${ring.radius}px`
    ringEl.value.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`
  }

  // glow lerps slower for softer feel
  glow.x += (target.x - glow.x) * GLOW_LERP
  glow.y += (target.y - glow.y) * GLOW_LERP

  if (glowEl.value) {
    glowEl.value.style.transform = `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)`
  }

  document.documentElement.style.setProperty('--cursor-x', `${target.x}px`)
  document.documentElement.style.setProperty('--cursor-page-y', `${target.y + window.scrollY}px`)

  rafId = requestAnimationFrame(frame)
}

function onMove(e: MouseEvent) {
  const next = getCursorTarget(e)
  target.x = next.x
  target.y = next.y

  if (!enabled.value) {
    // first move — center ring/glow so they don't jump from 0,0
    ring.x = glow.x = target.x
    ring.y = glow.y = target.y
    enabled.value = true
    document.documentElement.classList.add('cursor-fx-on')
  }

  setHoverInteractive(next.interactive)
}

function onClick(e: MouseEvent) {
  if (!activeMagneticEl || !e.isTrusted || e.defaultPrevented) return
  if (activeMagneticEl.contains(e.target as Node | null)) return
  if ((e.target as HTMLElement | null)?.closest('a, button, [role="button"], input, textarea, select')) return

  e.preventDefault()
  e.stopPropagation()
  activeMagneticEl.click()
}

function onLeave() {
  enabled.value = false
  setActiveMagneticEl(null)
  setHoverInteractive(false)
  document.documentElement.classList.remove('cursor-fx-on')
}

onMounted(() => {
  if (typeof window === 'undefined') return

  // skip on touch / coarse pointers
  const coarse = window.matchMedia('(pointer: coarse)').matches
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (coarse || reduced.value) return

  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('click', onClick, { capture: true })
  window.addEventListener('mouseleave', onLeave)

  rafId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)

  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('click', onClick, { capture: true })
  window.removeEventListener('mouseleave', onLeave)

  setActiveMagneticEl(null)
  document.documentElement.classList.remove('cursor-fx-on')
  document.documentElement.style.removeProperty('--cursor-x')
  document.documentElement.style.removeProperty('--cursor-page-y')
})
</script>

<template>
  <ClientOnly>
    <div
        v-if="!reduced"
        class="pointer-events-none fixed inset-0 z-60"
        aria-hidden="true"
    >
      <!-- spotlight glow -->
      <div
          ref="glowEl"
          class="absolute left-0 top-0 size-40 rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
          :class="enabled ? 'opacity-70' : ''"
          style="background: radial-gradient(closest-side, rgba(34, 197, 94, 0.09), rgba(34, 197, 94, 0) 72%); filter: blur(10px);"
      />

      <!-- ring -->
      <div
          ref="ringEl"
          class="cursor-ring absolute left-0 top-0 rounded-full border border-accent-400/70 opacity-0 will-change-transform"
          :class="enabled ? 'opacity-100' : ''"
      />

      <!-- dot -->
      <div
          ref="dotEl"
          class="absolute left-0 top-0 size-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_var(--color-accent-400)] opacity-0 transition-opacity duration-200 will-change-transform"
          :class="enabled ? 'opacity-100' : ''"
      />
    </div>
  </ClientOnly>
</template>

<style scoped>
.cursor-ring {
  width: 32px;
  height: 32px;
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cursor-ring--interactive {
  width: 52px;
  height: 52px;
}
</style>
