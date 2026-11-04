<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { randomKaomoji } from '~/utils/kaomoji'

const { user, loggedIn } = useUserSession()

const appConfig = useAppConfig()
const logo = appConfig.logoInText

const randomFace = ref('')

onMounted(() => {
  randomFace.value = randomKaomoji(24)
})

const githubLink: NavigationMenuItem = {
  label: 'View on GitHub',
  to: appConfig.githubUrl,
  icon: 'i-simple-icons-github',
  color: 'neutral',
  variant: 'outline',
  target: '_blank',
  rel: 'noreferrer',
}

const loggedInItems: NavigationMenuItem[] = [
  {
    label: 'Sessions',
    to: '/sessions',
  },
  githubLink,
]

const loggedOutItems: NavigationMenuItem[] = [
  {
    label: 'Sign in',
    to: '/auth',
  },
  githubLink,
]
</script>

<template>
  <div class="min-h-dvh bg-default">
    <UHeader>
      <template #title>
        <div class="flex items-center gap-2">
          <span class="px-1 py-1 rounded-lg">
            {{ logo }}
          </span>
          <AppUnderlineText>Time In</AppUnderlineText>
        </div>
      </template>

      <template #right>
        <UColorModeButton
          color="neutral"
          variant="ghost"
        />
        <UButton
          :to="user ? '/sessions' : '/auth'"
          :label="user ? 'Open sessions' : 'Sign in'"
          size="sm"
        />
      </template>
    </UHeader>
    <slot />

    <USeparator
      class="h-px"
      :label="logo"
    />
    <UFooter>
      <template #left>
        <p class="flex flex-wrap items-center gap-1.5 text-muted text-sm">
          © {{ new Date().getFullYear() }} Time In
        </p>
      </template>
      <template #right>
        <UNavigationMenu
          :items="loggedIn ? loggedInItems : loggedOutItems"
          variant="link"
        />
      </template>
    </UFooter>
  </div>
</template>
