<script setup lang="ts">
import { cn } from '@inspira-ui/plugins'
import { computed } from 'vue'

interface AuroraBackgroundProps {
  radialGradient?: boolean
  class?: string
}

const props = withDefaults(defineProps<AuroraBackgroundProps>(), {
  radialGradient: true,
})

const styles = computed(() => ({
  '--warm-base': '#171513',
  '--warm-amber': '#F59E0B',
  '--warm-copper': '#EA580C',
  '--warm-terracotta': '#C2410C',
  '--warm-gold': '#FBBF24',
  '--warm-peach': '#FDBA74',
  '--warm-cream': '#FFEDD5',
  '--warm-rose': '#FB923C',

  '--aurora-light':
    'repeating-linear-gradient(100deg, #EA580C 0%, #F59E0B 10%, #FBBF24 20%, #FDBA74 30%, #C2410C 40%, #FB923C 50%)',

  '--mask-light':
    'repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%)',

  '--aurora-dark':
    'repeating-linear-gradient(100deg, #9A3412 0%, #EA580C 12%, #F59E0B 22%, #FDBA74 32%, #C2410C 42%, #FBBF24 52%)',

  '--mask-dark':
    'repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%)',

  '--aurora-opacity': '0.34',
  '--aurora-blur': '42px',
  '--animate-aurora': 'aurora 60s linear infinite',
}))
</script>

<template>
  <main>
    <div
      v-bind="props"
      :class="
        cn(
          'relative flex h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 text-slate-950 transition-colors dark:bg-[#171513] dark:text-[#F2E4D1]',
          props.class,
        )
      "
    >
      <div
        :style="styles"
        class="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          :class="
            cn(
              'after:animate-aurora absolute -inset-12 will-change-transform',
              'bg-size-[300%_200%] bg-position-[50%_50%]',
              'opacity-[var(--aurora-opacity)] blur-[var(--aurora-blur)]',
              'bg-[image:var(--mask-light),var(--aurora-light)]',
              'after:absolute after:inset-0 after:content-[\'\']',
              'after:bg-size-[200%_100%] after:bg-fixed',
              'after:mix-blend-multiply',
              'after:bg-[image:var(--mask-light),var(--aurora-light)]',
              'dark:bg-[image:var(--mask-dark),var(--aurora-dark)]',
              'dark:after:bg-[image:var(--mask-dark),var(--aurora-dark)]',
              'dark:after:mix-blend-screen',
              props.radialGradient
                && 'mask-[radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]',
            )
          "
        />
      </div>

      <slot />
    </div>
  </main>
</template>
