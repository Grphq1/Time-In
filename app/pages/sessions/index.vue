<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  middleware: ['auth'],
})

interface SessionsResponse {
  sessions: unknown[]
}

useSeoMeta({
  title: 'Sessions',
  description: 'Your focus sessions.',
  robots: 'noindex, nofollow',
})

const api = useApi()
const { data, pending, error, refresh } = useLazyAsyncData(
  'sessions',
  () => api<SessionsResponse>('/api/sessions'),
)

const state = computed(() => {
  if (error.value) return 'error'
  if (pending.value || !data.value) return 'loading'
  return data.value.sessions.length > 0 ? 'ready' : 'empty'
})
</script>

<template>
  <UContainer class="py-8 sm:py-12 lg:py-16">
    <UPageHeader
      headline="Focus"
      title="Sessions"
      description="Join a room, sync a timer, and focus together."
      :ui="{
        root: 'relative border-b-0 py-0 mb-8 sm:mb-10',
        title: 'text-3xl font-semibold tracking-tight sm:text-4xl',
        description: 'mt-2 text-base text-muted',
      }"
    />

    <AppDataState
      :status="state"
      :error="error"
      empty-title="No sessions yet"
      empty-description="Session rooms are coming in the next release. Your profile is ready in the meantime."
      @retry="refresh()"
    >
      <div class="grid gap-4 sm:grid-cols-2" />
    </AppDataState>
  </UContainer>
</template>
