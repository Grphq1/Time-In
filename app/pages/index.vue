<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

interface LandingFeature {
  face: string
  title: string
  description: string
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Time In — Focus together',
  description:
    'A simple, open-source space to focus together with synced timers, signals, friends, and focus analytics.',
})

const appConfig = useAppConfig()

const { user } = useUserSession()

const heroLinks = computed<ButtonProps[]>(() => [
  {
    label: user.value ? 'Open your sessions' : 'Get started',
    to: user.value ? '/sessions' : '/auth',
    trailingIcon: 'i-lucide-arrow-right',
  },
  {
    label: 'View on GitHub',
    to: appConfig.githubUrl,
    icon: 'i-simple-icons-github',
    color: 'neutral',
    variant: 'outline',
    target: '_blank',
    rel: 'noreferrer',
  },
])

const features: LandingFeature[] = [
  {
    face: 'ヽ(∀° )人( °∀)ノ',
    title: 'Focus together',
    description:
      'Share a room, sync your timer, and stay accountable with others.',
  },
  {
    face: '(⌐■_■)',
    title: 'Your method',
    description: 'Choose Pomodoro, fixed intervals, or open-ended flowtime.',
  },
  {
    face: '(*・ω・)ﾉ',
    title: 'Quiet signals',
    description: 'Send quick signals during focus and chat freely on breaks.',
  },
  {
    face: '(⌒▽⌒)☆',
    title: 'See your progress',
    description: 'Track focus time, breaks, and daily streaks over time.',
  },
]
</script>

<template>
  <div>
    <UContainer>
      <UPageHero
        headline="Focus better, together"
        :links="heroLinks"
      >
        <template #title>
          Make
          <AppUnderlineText
            variant="goes-out-comes-in"
            direction="left"
          >
            time
          </AppUnderlineText>
          for what
          <AppUnderlineText
            variant="goes-out-comes-in"
            direction="left"
          >
            matters
          </AppUnderlineText>
        </template>
        <template #description>
          Time In is a shared space to focus together. Sync your timer, take
          focused breaks, and stay connected without the
          <AppNoisyText
            text="noise"
            class="text-primary font-semibold"
          />
        </template>
      </UPageHero>
    </UContainer>

    <div class="bg-elevated/20">
      <UPageSection
        title="Simple tools for focused work"
        description="Everything you need to start a session and protect your attention."
        :ui="{ features: 'sm:grid-cols-2 lg:grid-cols-4' }"
      >
        <template #features>
          <UPageFeature
            v-for="feature in features"
            :key="feature.title"
            as="li"
            :title="feature.title"
            :description="feature.description"
            orientation="vertical"
          >
            <template #leading>
              <span
                class="whitespace-nowrap text-2xl leading-none text-primary"
                aria-hidden="true"
              >
                {{ feature.face }}
              </span>
            </template>
          </UPageFeature>
        </template>
      </UPageSection>
    </div>
  </div>
</template>
