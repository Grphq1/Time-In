import type { ZodType } from 'zod'
import { createError } from 'h3'

/**
 * Validates untrusted input and turns Zod failures into a friendly 400 without
 * leaking schema details to the client.
 */
export function validateInput<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message ?? 'Some fields are not valid.',
      data: { code: 'validation-failed' },
    })
  }

  return result.data
}
