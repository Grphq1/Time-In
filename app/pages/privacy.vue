<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const { data: page } = await useAsyncData('privacy', () =>
  queryCollection('content').path('/privacy').first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useSeoMeta({
  title: () => page.value?.title ?? 'Privacy Policy',
  description: () => page.value?.description ?? '',
})
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <article
      v-if="page"
      class="mx-auto max-w-3xl text-sm leading-7 text-muted
        [&_a]:text-primary [&_a]:underline
        [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-highlighted
        [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-highlighted
        [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-highlighted
        [&_li]:mt-1 [&_p]:mt-4 [&_strong]:text-highlighted
        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
    >
      <ContentRenderer :value="page" />
    </article>
  </UContainer>
</template>
