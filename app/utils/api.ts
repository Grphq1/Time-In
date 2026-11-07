import type { Toast } from '@nuxt/ui/runtime/composables/useToast.js'
import { logger } from '~/utils/logger'

type ApiErrorLike = {
  data?: {
    statusMessage?: string
    message?: string
  }
  statusMessage?: string
  message?: string
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  const candidate = error as ApiErrorLike | null

  return (
    candidate?.data?.statusMessage
    ?? candidate?.data?.message
    ?? candidate?.statusMessage
    ?? candidate?.message
    ?? fallback
  )
}

export function notifyError(
  toast: {
    toasts: Ref<Toast[], Toast[]>
    add: (toast: Partial<Toast>) => Toast
    update: (id: string | number, toast: Omit<Partial<Toast>, 'id'>) => void
    remove: (id: string | number) => void
    clear: () => void
  },
  title: string,
  cause: unknown,
) {
  logger.warn(title, cause)

  toast.add({
    title,
    description: getApiErrorMessage(cause),
    color: 'error',
    icon: 'i-lucide-circle-alert',
  })
}
