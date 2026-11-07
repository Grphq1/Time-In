import { z } from 'zod'

export const profileNameSchema = z.string().trim().min(1).max(100)

export const profileVisibilitySchema = z.enum(['public', 'friends', 'private'])

const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export const avatarFileSchema = z.instanceof(File)
  .refine(file => file.size <= 2 * 1024 * 1024, {
    message: 'Choose an image smaller than 2 MB.',
  })
  .refine(file => AVATAR_TYPES.includes(file.type), {
    message: 'Choose a PNG, JPEG, WebP or GIF image.',
  })

export const updateProfileSchema = z
  .object({
    name: profileNameSchema.optional(),
    visibility: profileVisibilitySchema.optional(),
  })
  .strict()
  .refine(
    input => input.name !== undefined || input.visibility !== undefined,
    { message: 'Provide at least one profile field to update.' },
  )

export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
