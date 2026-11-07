<script setup lang="ts">
import type { ProfileVisibility } from '#shared/schemas/profile'
import { avatarFileSchema, updateProfileSchema } from '#shared/schemas/profile'
import { notifyError } from '~/utils/api'
import { logger } from '~/utils/logger'

definePageMeta({
  layout: 'landing', // TODO: change it to default when the default layout is ready
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Profile',
  description: 'Manage your Time In profile.',
  robots: 'noindex, nofollow',
})

const toast = useToast()

const {
  data: profile,
  pending,
  error,
  refresh,
} = useGetProfile()

const {
  pending: saving,
  update,
} = useUpdateProfile()

const {
  pending: uploading,
  upload,
} = useUploadAvatar()

const avatarFile = ref<File | null>(null)

const form = reactive({
  name: '',
  visibility: 'public' as ProfileVisibility,
})

const syncingAvatar = ref(false)

watch(profile, (value) => {
  if (!value) return

  if (syncingAvatar.value) {
    syncingAvatar.value = false
    return
  }

  form.name = value.name
  form.visibility = value.visibility
}, { immediate: true })

async function handleAvatarFile(file: File | null) {
  if (!file) return

  const result = avatarFileSchema.safeParse(file)

  if (!result.success) {
    logger.warn('Avatar validation failed', result.error.issues)
    toast.add({
      title: 'Check your image',
      description: result.error.issues[0]?.message ?? 'Choose a valid image.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }

  try {
    const updated = await upload(file)

    if (profile.value) {
      syncingAvatar.value = true
      profile.value = {
        ...profile.value,
        avatarUrl: updated.avatarUrl,
      }
    }

    toast.add({
      title: 'Avatar updated',
      description: 'Your new photo has been uploaded.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }
  catch (cause) {
    notifyError(toast, 'Could not upload avatar', cause)
  }
}

whenever(avatarFile, async (file) => {
  await handleAvatarFile(file)
  avatarFile.value = null
})

const hasChanges = computed(() => {
  if (!profile.value) return false

  return form.name.trim() !== profile.value.name
    || form.visibility !== profile.value.visibility
})

function resetForm() {
  if (!profile.value) return

  form.name = profile.value.name
  form.visibility = profile.value.visibility
}

async function saveProfile() {
  if (saving.value) return

  const result = updateProfileSchema.safeParse({
    name: form.name,
    visibility: form.visibility,
  })

  if (!result.success) {
    logger.warn('Profile validation failed', result.error.issues)
    toast.add({
      title: 'Check your details',
      description: result.error.issues[0]?.message ?? 'Some fields are not valid.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }

  try {
    const updated = await update(result.data)

    form.name = updated.name
    form.visibility = updated.visibility
    await refresh()

    toast.add({
      title: 'Profile updated',
      description: 'Your changes have been saved.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }
  catch (cause) {
    notifyError(toast, 'Could not update profile', cause)
  }
}
</script>

<template>
  <UContainer class="py-8 sm:py-12 lg:py-16">
    <main class="mx-auto max-w-5xl">
      <UPageHeader
        headline="Account"
        title="Profile"
        description="Manage how you appear to other people in your sessions."
        :ui="{
          root: 'relative border-b-0 py-0 mb-8 sm:mb-10',
          title: 'text-3xl font-semibold tracking-tight sm:text-4xl',
          description: 'mt-2 text-base text-muted',
        }"
      />

      <div
        v-if="pending || (!profile && !error)"
        class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        aria-busy="true"
      >
        <UCard
          variant="subtle"
          class="order-first lg:order-none lg:col-start-2 lg:row-start-1"
        >
          <div class="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
            <USkeleton class="size-20 shrink-0 rounded-full" />
            <div class="flex w-full flex-col items-center gap-2 sm:items-start lg:items-center">
              <USkeleton class="h-5 w-36" />
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-6 w-20" />
            </div>
          </div>
        </UCard>

        <UCard class="lg:col-start-1 lg:row-start-1">
          <div class="space-y-6">
            <div
              v-for="index in 3"
              :key="index"
              class="space-y-2"
            >
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-11 w-full" />
            </div>
          </div>
        </UCard>
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="We could not load your profile."
        :actions="[{
          label: 'Try again',
          icon: 'i-lucide-refresh-cw',
          color: 'error',
          variant: 'soft',
          onClick: () => refresh(),
        }]"
      />

      <div
        v-else-if="profile"
        class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <ProfileSidebar
          :profile="profile"
          :display-name="form.name.trim() || profile.name"
          :visibility="form.visibility"
        />

        <UCard class="lg:col-start-1 lg:row-start-1">
          <UForm
            :state="form"
            class="space-y-8"
            @submit="saveProfile"
          >
            <ProfileIdentityForm
              v-model="form.name"
              :email="profile.email"
            />

            <USeparator />

            <ProfileAvatarCard
              v-model="avatarFile"
              :name="profile.name"
              :avatar-url="profile.avatarUrl"
              :uploading="uploading"
            />

            <USeparator />

            <ProfilePrivacyField v-model="form.visibility" />

            <USeparator />

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                class="w-full sm:w-auto"
                :disabled="!hasChanges || saving"
                @click="resetForm"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                icon="i-lucide-save"
                class="w-full sm:w-auto"
                :loading="saving"
                :disabled="!hasChanges"
              >
                Save changes
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>
    </main>
  </UContainer>
</template>
