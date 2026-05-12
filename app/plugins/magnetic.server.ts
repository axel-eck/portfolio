export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', {
    getSSRProps() {
      return {}
    },
  })
})
