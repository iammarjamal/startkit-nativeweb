import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

export { default as ThemeSwitcher } from './ThemeSwitcher.vue'

export const themeSwitcherVariants = cva(
  '',
  {
    variants: {
      mode: {
        icon: 'inline-flex',
        inline: 'flex items-center justify-between',
        tabs: 'w-full',
      },
    },
    defaultVariants: {
      mode: 'icon',
    },
  },
)

export type ThemeSwitcherVariants = VariantProps<typeof themeSwitcherVariants>
