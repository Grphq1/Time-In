<script setup lang="ts">
import type { AppError } from '#shared/errors'
import { normalizeError } from '#shared/errors'
import { messages } from '~/utils/messages'

const props = withDefaults(defineProps<{
  emptyDescription?: string
  emptyIcon?: string
  emptyTitle?: string
  error?: unknown
  loadingLabel?: string
  retryLabel?: string
  status: 'empty' | 'error' | 'loading' | 'ready'
}>(), {
  emptyIcon: 'i-lucide-inbox',
  emptyTitle: 'Nothing here yet',
  loadingLabel: 'Loading…',
  retryLabel: 'Try again',
})

const emit = defineEmits<{
  retry: []
}>()

const normalizedError = computed<AppError | null>(() =>
  props.status === 'error' ? normalizeError(props.error) : null,
)
</script>

<template>
  <slot v-if="status === 'ready'" />

  <div
    v-else-if="status === 'loading'"
    class="flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted"
    role="status"
    aria-live="polite"
  >
    <slot name="loading">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-5 animate-spin text-primary"
      />
      <span>{{ loadingLabel }}</span>
    </slot>
  </div>

  <div
    v-else-if="status === 'empty'"
    class="flex flex-col items-center gap-3 px-6 py-16 text-center"
  >
    <slot name="empty">
      <UIcon
        :name="emptyIcon"
        class="size-8 text-muted"
      />
      <p class="text-base font-medium text-highlighted">
        {{ emptyTitle }}
      </p>
      <p
        v-if="emptyDescription"
        class="max-w-md text-sm text-muted"
      >
        {{ emptyDescription }}
      </p>
      <slot name="empty-action" />
    </slot>
  </div>

  <slot
    v-else-if="normalizedError"
    name="error"
    :error="normalizedError"
    :retry="() => emit('retry')"
  >
    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="messages.errors.loadFailed"
      :description="normalizedError.message"
      :actions="[{
        label: retryLabel,
        icon: 'i-lucide-refresh-cw',
        color: 'error',
        variant: 'soft',
        onClick: () => emit('retry'),
      }]"
    />
  </slot>
</template>
