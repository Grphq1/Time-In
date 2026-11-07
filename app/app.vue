<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()
const url = useRequestURL()

const canonicalUrl = computed(() => `${url.origin}${route.path}`)

useHead({
  titleTemplate: title => title ? `${title} - ${appConfig.title}` : appConfig.title,
  link: [{ rel: 'canonical', href: canonicalUrl }],
})

useSeoMeta({
  description: appConfig.description,
  ogSiteName: appConfig.title,
  ogType: 'website',
  twitterCard: 'summary',
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
