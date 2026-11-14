import type { AppError } from '#shared/errors'
import { reportError, type ErrorReportOptions } from '~/utils/error-reporter'
import { messages } from '~/utils/messages'

export interface NotifyErrorOptions extends ErrorReportOptions {
  title?: string
}

/**
 * Central client error handler: report first, then give the user one friendly
 * message with optional recovery actions. Never surfaces a stack trace.
 */
export function useErrorHandler() {
  const toast = useToast()

  function report(cause: unknown, options: ErrorReportOptions = {}) {
    return reportError(cause, options)
  }

  function notify(cause: unknown, options: NotifyErrorOptions = {}): AppError {
    const { title, ...reportOptions } = options
    const error = report(cause, reportOptions)

    toast.add({
      title: title ?? messages.errors.title,
      description: error.message,
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })

    return error
  }

  return { notify }
}
