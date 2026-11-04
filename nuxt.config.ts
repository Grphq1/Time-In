export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxthub/core',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    session: {
      password: '',
      maxAge: 60 * 60 * 24 * 30,
    },
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  hub: {
    db: 'sqlite',
  },

  vite: {
    optimizeDeps: {
      include: [
        '@inspira-ui/plugins',
        '@vue/devtools-core',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  fonts: {
    families: [
      { name: 'Inter', fallbacks: [] },
      { name: 'Vazirmatn' },
    ],
  },
})
