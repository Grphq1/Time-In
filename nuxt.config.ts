export default defineNuxtConfig({

  modules: [
    '@sentry/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxthub/core',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@nuxt/content',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Time In',
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    session: {
      password: '',
      maxAge: 60 * 60 * 24 * 30,
    },
    public: {
      sentry: {
        dsn: '',
        environment: process.env.NODE_ENV || 'development',
        release: '',
        tracesSampleRate: 0.1,
      },
    },
  },

  sourcemap: {
    client: 'hidden',
    server: true,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  hub: {
    blob: true,
    db: 'sqlite',
    dir: process.env.VITEST ? '.data-test' : '.data',
  },

  vite: {
    optimizeDeps: {
      include: [
        '@inspira-ui/plugins',
        '@vue/devtools-core',
        'zod',
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

  sentry: {
    configDir: '~~/monitoring',
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    sourcemaps: {
      // Without a token we still inject debug IDs, but never fail the build.
      disable: process.env.SENTRY_AUTH_TOKEN ? false : 'disable-upload',
      deleteSourcemapsAfterUpload: true,
    },
  },
})
