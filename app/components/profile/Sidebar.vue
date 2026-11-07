<script setup lang="ts">
import type { ProfileVisibility } from '#shared/schemas/profile'
import type { UserProfile } from '~/utils/profile'
import { notifyError } from '~/utils/api'
import { formatProfileJoinedAt } from '~/utils/profile'
import { visibilityLabel } from '~/utils/social'

const props = defineProps<{
  profile: UserProfile
  displayName: string
  visibility: ProfileVisibility
}>()

const toast = useToast()

const joinedAt = computed(() => formatProfileJoinedAt(props.profile.createdAt))

const {
  copy,
  copied,
  isSupported: clipboardSupported,
} = useClipboard({ copiedDuring: 2000, legacy: true })

async function copyUserId() {
  if (!clipboardSupported.value) {
    toast.add({
      title: 'Clipboard unavailable',
      description: 'Your browser does not allow clipboard access right now.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }

  try {
    await copy(props.profile.id)
  }
  catch (cause) {
    notifyError(toast, 'Could not copy user ID', cause)
  }
}
</script>

<template>
  <UCard
    variant="subtle"
    class="order-first lg:order-none lg:col-start-2 lg:row-start-1 lg:sticky lg:top-20"
  >
    <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left lg:flex-col lg:text-center">
      <UAvatar
        :src="profile.avatarUrl || undefined"
        :alt="profile.name"
        :text="profile.name.charAt(0).toUpperCase()"
        size="3xl"
        class="shrink-0"
      />

      <div class="w-full min-w-0">
        <h2 class="truncate text-lg font-semibold tracking-tight">
          {{ displayName }}
        </h2>
        <p class="mt-1 truncate text-sm text-muted">
          {{ profile.email || 'No email address on file' }}
        </p>
        <div class="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start lg:justify-center">
          <UBadge
            color="neutral"
            variant="subtle"
          >
            {{ visibilityLabel(visibility) }}
          </UBadge>
          <span
            v-if="joinedAt"
            class="text-xs text-muted"
          >
            Member since {{ joinedAt }}
          </span>
        </div>
      </div>
    </div>

    <USeparator class="my-6" />

    <div class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        User ID
      </p>
      <div class="flex items-center gap-2">
        <code class="min-w-0 flex-1 truncate rounded-md bg-elevated px-2 py-1.5 text-xs text-muted">
          {{ profile.id }}
        </code>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :disabled="!clipboardSupported"
          @click="copyUserId"
        >
          {{ copied ? 'Copied' : 'Copy' }}
        </UButton>
      </div>
      <p class="text-xs text-muted">
        Share this ID so friends can send you an invite.
      </p>
      <!-- TODO: Add friends page and link to it when it's ready -->
    </div>
  </UCard>
</template>
