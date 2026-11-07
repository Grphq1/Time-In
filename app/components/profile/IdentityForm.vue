<script setup lang="ts">
defineProps<{
  email: string
}>()

const name = defineModel<string>({ required: true })
</script>

<template>
  <section class="space-y-4">
    <div>
      <h3 class="text-base font-semibold tracking-tight">
        Identity
      </h3>
      <p class="mt-1 text-sm text-muted">
        The name and email other people see.
      </p>
    </div>

    <UFormField
      label="Display name"
      name="name"
      required
      help="This is the name other people see in sessions and invitations."
    >
      <UInput
        v-model="name"
        class="w-full"
        size="lg"
        maxlength="100"
        placeholder="Your name"
        icon="i-lucide-user-round"
        autocomplete="name"
      />
    </UFormField>

    <UFormField
      label="Email"
      name="email"
      help="Your email comes from the account you used to sign in and cannot be changed here."
    >
      <UInput
        :model-value="email"
        class="w-full"
        size="lg"
        icon="i-lucide-mail"
        disabled
      />
    </UFormField>
  </section>
</template>
