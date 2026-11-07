<script setup lang="ts">
import type { ProfileVisibility } from '#shared/schemas/profile'
import { profileVisibilitySchema } from '#shared/schemas/profile'
import { visibilityDescription, visibilityLabel } from '~/utils/social'

const visibility = defineModel<ProfileVisibility>({ required: true })

const options = profileVisibilitySchema.options.map(value => ({
  value,
  label: visibilityLabel(value),
  description: visibilityDescription(value),
}))
</script>

<template>
  <section class="space-y-4">
    <div>
      <h3 class="text-base font-semibold tracking-tight">
        Privacy
      </h3>
      <p class="mt-1 text-sm text-muted">
        Choose who can see your profile, focus stats, and friends.
      </p>
    </div>

    <UFormField
      label="Visibility"
      name="visibility"
    >
      <USelect
        v-model="visibility"
        :items="options"
        class="w-full"
        size="lg"
      />
    </UFormField>
  </section>
</template>
