<script setup lang="ts">
interface NoisyTextProps {
  text: string
  as?: string
}

const props = withDefaults(defineProps<NoisyTextProps>(), {
  as: 'span',
})

const characters = computed(() => [...props.text])
</script>

<template>
  <component
    :is="as"
    :aria-label="text"
    class="noisy-text"
  >
    <span
      v-for="(character, index) in characters"
      :key="`${character}-${index}`"
      aria-hidden="true"
      class="noisy-character"
      :style="{ animationDelay: `${index * -0.08}s` }"
      v-text="character"
    />
  </component>
</template>

<style scoped>
.noisy-text {
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
}

.noisy-character {
  display: inline-block;
  text-shadow:
    0.045em 0 0 color-mix(in oklab, currentColor 35%, transparent),
    -0.045em 0 0 color-mix(in oklab, currentColor 20%, transparent);
  animation: noisy-jitter 0.55s steps(2, end) infinite alternate;
  will-change: transform;
}

@keyframes noisy-jitter {
  0% {
    transform: translate(0, 0) skewX(0deg);
  }
  20% {
    transform: translate(-0.035em, -0.04em) skewX(-4deg);
  }
  40% {
    transform: translate(0.04em, 0.03em) skewX(3deg);
  }
  60% {
    transform: translate(-0.03em, 0.02em) skewX(2deg);
  }
  80% {
    transform: translate(0.035em, -0.025em) skewX(-2deg);
  }
  100% {
    transform: translate(0.02em, -0.035em) skewX(-3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .noisy-character {
    animation: none;
    text-shadow: none;
  }
}
</style>
