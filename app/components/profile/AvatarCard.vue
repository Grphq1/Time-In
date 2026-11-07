<script setup lang="ts">
defineProps<{
  name: string
  avatarUrl: string | null
  uploading: boolean
}>()

const file = defineModel<File | null>({ default: null })
</script>

<template>
  <section class="space-y-4">
    <div>
      <h3 class="text-base font-semibold tracking-tight">
        Profile picture
      </h3>
      <p class="mt-1 text-sm text-muted">
        Upload a photo up to 2 MB. Without one, we use your initial.
      </p>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row items-center">
      <UAvatar
        :src="avatarUrl || undefined"
        :alt="name"
        :text="name.charAt(0).toUpperCase()"
        size="3xl"
        class="shrink-0"
      />

      <UFileUpload
        v-model="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        variant="area"
        size="lg"
        icon="i-lucide-image-plus"
        label="Upload a new photo"
        description="PNG, JPEG, WebP or GIF · max 2 MB"
        :preview="false"
        :disabled="uploading"
        class="w-full flex-1"
      />
    </div>
  </section>
</template>
