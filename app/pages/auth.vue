<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

definePageMeta({
  layout: false,
  middleware: [
    function () {
      const { loggedIn } = useUserSession()

      if (loggedIn.value) {
        return navigateTo('/')
      }
    },
  ],
})

useSeoMeta({
  title: 'Sign in',
  description: 'Sign in to Time In with Google or GitHub to focus together.',
  robots: 'noindex, nofollow',
})

const url = useRequestURL()
const route = useRoute()

const appConfig = useAppConfig()
const logo = appConfig.logoInText

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  'account-linked': 'This account is already linked to another user.',
  'email-in-use': 'An account with this email already exists. Sign in with your other provider.',
  'email-required': 'Your provider did not share an email address. Use another sign-in method.',
  'session-failed': 'We could not save your session. Please try again.',
  'session-missing': 'Your session is no longer valid. Please sign in again.',
  'github': 'GitHub sign in failed. Please try again.',
  'google': 'Google sign in failed. Please try again.',
}

const authError = computed(() => {
  const code = route.query.error

  if (typeof code !== 'string' || !code) return null

  return OAUTH_ERROR_MESSAGES[code] ?? 'We could not sign you in. Please try again.'
})

const providers = ref<ButtonProps[]>([
  {
    label: 'Continue with Google',
    icon: 'i-simple-icons-google',
    to: `${url.origin}/auth/google`,
    color: 'neutral',
    variant: 'outline',
    external: true,
    size: 'xl',
    block: true,
  },
  {
    label: 'Continue with GitHub',
    icon: 'i-simple-icons-github',
    to: `${url.origin}/auth/github`,
    external: true,
    color: 'neutral',
    variant: 'outline',
    size: 'xl',
    block: true,
  },
])
</script>

<template>
  <main class="min-h-screen grid lg:grid-cols-[1.2fr_0.8fr]">
    <section
      class="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-default p-10 xl:p-14"
    >
      <AppAuroraBackground class="absolute inset-0 pointer-events-none" />

      <div class="relative z-10 my-auto max-w-xl">
        <h1
          class="text-4xl xl:text-6xl font-semibold tracking-tight leading-tight"
        >
          Make time for
          <span class="text-primary">what matters.</span>
        </h1>

        <p class="mt-6 max-w-md text-base xl:text-lg leading-8 text-muted">
          A shared space to focus together, sync your time, and stay in the flow
          with the method that works for you.
        </p>
      </div>

      <p class="relative z-10 text-sm text-muted">
        Less distraction. More intention.
      </p>
    </section>

    <section
      class="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 lg:min-h-0"
    >
      <AppAuroraBackground
        class="absolute inset-0 pointer-events-none opacity-40 lg:hidden"
      />

      <div class="relative z-10 w-full max-w-sm">
        <ULink
          to="/"
          aria-label="Time In home"
          class="mb-10 flex w-fit items-center gap-2"
        >
          <span
            class="inline-flex items-center justify-center rounded-xl bg-inverted px-2.5 py-1.5 text-lg leading-none text-inverted shadow-sm ring-1 ring-default transition-transform hover:scale-105 sm:text-xl"
          >
            {{ logo }}
          </span>
        </ULink>

        <div class="mb-8">
          <h2 class="text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>

          <p class="mt-2 text-muted">
            Sign in to continue to your account
          </p>
        </div>

        <UAlert
          v-if="authError"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Could not sign in"
          :description="authError"
          class="mb-6"
        />

        <div class="space-y-3">
          <UButton
            v-for="provider in providers"
            :key="provider.label"
            v-bind="provider"
          />
        </div>

        <p class="mt-8 text-center text-xs leading-6 text-muted">
          By signing in, you agree to our
          <ULink
            to="/privacy"
            class="font-medium text-primary"
          >
            Privacy Policy
          </ULink>
        </p>
      </div>
    </section>
  </main>
</template>
