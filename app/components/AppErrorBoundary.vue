<script setup lang="ts">
import type { AppError } from '#shared/errors'
import { reportError } from '~/utils/error-reporter'
import { messages } from '~/utils/messages'

const props = withDefaults(defineProps<{
  description?: string
  title?: string
}>(), {
  title: 'This section could not load',
})

const emit = defineEmits<{
  error: [error: AppError]
  retry: []
}>()

const error = shallowRef<AppError | null>(null)
const attempt = ref(0)

onErrorCaptured((cause, _instance, info) => {
  error.value = reportError(cause, {
    extra: { info },
    source: 'AppErrorBoundary',
  })

  emit('error', error.value)

  return false
})

function retry() {
  error.value = null
  attempt.value += 1
  emit('retry')
}
</script>

<template>
  <div
    v-if="!error"
    :key="attempt"
  >
    <slot :attempt="attempt" />
  </div>

  <slot
    v-else
    name="fallback"
    :error="error"
    :retry="retry"
  >
    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="props.title"
      :description="description ?? error.message"
      :actions="[{
        label: messages.errors.retry,
        icon: 'i-lucide-refresh-cw',
        color: 'error',
        variant: 'soft',
        onClick: retry,
      }]"
    />
  </slot>
</template>
