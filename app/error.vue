<script setup lang="ts">
import type { NuxtError } from '#app'
import { normalizeError } from '#shared/errors'
import { messages } from '~/utils/messages'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

const route = useRoute()
const appConfig = useAppConfig()

const normalized = computed(() => normalizeError(props.error))
const statusCode = computed(() => props.error?.status ?? 500)
const isNotFound = computed(() => statusCode.value === 404)
const isServerError = computed(() => statusCode.value >= 500)

const title = computed(() => {
  if (isNotFound.value) return messages.errors.notFoundTitle
  if (isServerError.value) return messages.errors.serverTitle
  return messages.errors.title
})

const message = computed(() =>
  isNotFound.value ? messages.errors.notFoundMessage : normalized.value.message,
)

function retry() {
  clearError({ redirect: route.fullPath || '/' })
}

function goHome() {
  clearError({ redirect: '/' })
}

useSeoMeta({
  title: () => title.value,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <UApp>
    <main class="relative min-h-dvh overflow-hidden bg-default">
      <AppAuroraBackground class="absolute inset-0 opacity-30" />

      <div class="relative z-10 mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <ULink
          to="/"
          aria-label="Time In home"
          class="inline-flex items-center gap-2"
        >
          <span class="rounded-xl bg-inverted px-2.5 py-1.5 text-lg leading-none text-inverted shadow-sm ring-1 ring-default">
            {{ appConfig.logoInText }}
          </span>
          <span class="text-sm font-medium tracking-tight">Time In</span>
        </ULink>

        <p
          class="mt-12 font-mono text-sm tracking-[0.3em] text-muted"
          aria-hidden="true"
        >
          {{ statusCode }}
        </p>

        <h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {{ title }}
        </h1>

        <p class="mt-4 max-w-md text-base leading-7 text-muted">
          {{ message }}
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <UButton
            v-if="!isNotFound"
            :label="messages.errors.retry"
            icon="i-lucide-refresh-cw"
            size="lg"
            @click="retry"
          />
          <UButton
            :label="messages.errors.home"
            icon="i-lucide-house"
            color="neutral"
            variant="outline"
            size="lg"
            @click="goHome"
          />
        </div>

        <p
          v-if="normalized.requestId"
          class="mt-8 font-mono text-xs text-muted"
        >
          {{ messages.errors.reference }}: {{ normalized.requestId }}
        </p>

        <p class="mt-10 text-xs leading-6 text-muted">
          {{ messages.errors.persist }}
        </p>
      </div>
    </main>
  </UApp>
</template>
