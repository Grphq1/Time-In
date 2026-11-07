import type { ProfileVisibility } from '#shared/schemas/profile'

export function formatSocialDate(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatFocusDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)

  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

export function visibilityLabel(visibility: ProfileVisibility): string {
  switch (visibility) {
    case 'public':
      return 'Public'
    case 'friends':
      return 'Friends only'
    case 'private':
      return 'Private'
  }
}

export function visibilityDescription(visibility: ProfileVisibility): string {
  switch (visibility) {
    case 'public':
      return 'Anyone signed in can see your profile, focus stats, and friends.'
    case 'friends':
      return 'Only your friends can see your focus stats, friends, and member since date.'
    case 'private':
      return 'Other people only see your name and avatar. Everything else stays private.'
  }
}
