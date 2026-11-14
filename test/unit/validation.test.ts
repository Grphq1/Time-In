import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validateInput } from '../../server/utils/validation'

const schema = z.object({
  name: z.string().min(1, 'Choose a name.'),
})

describe('validateInput', () => {
  it('returns parsed input', () => {
    expect(validateInput(schema, { name: 'Ada' })).toEqual({ name: 'Ada' })
  })

  it('throws a friendly 400 without schema internals', () => {
    try {
      validateInput(schema, { name: '' })
      expect.unreachable('Expected validation to fail')
    }
    catch (error) {
      const validationError = error as {
        data?: { code?: string }
        statusCode?: number
        statusMessage?: string
      }

      expect(validationError.statusCode).toBe(400)
      expect(validationError.statusMessage).toBe('Choose a name.')
      expect(validationError.data?.code).toBe('validation-failed')
    }
  })
})
