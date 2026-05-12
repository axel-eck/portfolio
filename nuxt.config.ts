import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    'motion-v/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr', class: 'dark' },
      title: 'Axel Eckenberg — Fullstack & SRE',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Axel Eckenberg, ingénieur fullstack et SRE. Co-fondateur & CTO d\'EventDeer.' },
        { name: 'apple-mobile-web-app-title', content: 'Axel E' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  i18n: {
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    bundle: { optimizeTranslationDirective: false },
  },

  fonts: {
    families: [
      { name: 'Inter Tight', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  icon: {
    serverBundle: { collections: ['lucide', 'simple-icons'] },
  },
})
