import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

export { default as LanguageSwitcher } from './LanguageSwitcher.vue'

export const languageSwitcherVariants = cva(
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

export type LanguageSwitcherVariants = VariantProps<typeof languageSwitcherVariants>
