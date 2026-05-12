// Magnetic directive marks elements that attract the custom cursor.
// Usage: <button v-magnetic>… or <button v-magnetic="{ strength: 0.45, radius: 120 }">…

interface MagOpts {
  strength?: number // 0..1, how strongly the cursor is pulled toward the element center
  radius?: number // px, attraction distance around the element
  shape?: 'box' | 'underline' // ring morph style; default 'box'
}

function bind(el: HTMLElement, opts: MagOpts = {}) {
  el.setAttribute('data-magnetic', '')
  el.dataset.magneticStrength = String(opts.strength ?? 0.45)
  el.dataset.magneticRadius = String(opts.radius ?? 110)
  if (opts.shape && opts.shape !== 'box') el.dataset.magneticShape = opts.shape
  else delete el.dataset.magneticShape
}

function unbind(el: HTMLElement) {
  el.removeAttribute('data-magnetic')
  delete el.dataset.magneticStrength
  delete el.dataset.magneticRadius
  delete el.dataset.magneticShape
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', {
    mounted(el: HTMLElement, binding) {
      bind(el, (binding.value as MagOpts) ?? {})
    },
    updated(el: HTMLElement, binding) {
      bind(el, (binding.value as MagOpts) ?? {})
    },
    beforeUnmount(el: HTMLElement) {
      unbind(el)
    },
  })
})
