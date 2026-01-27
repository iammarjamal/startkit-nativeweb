import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

export { default as Logo } from './Logo.vue'

export const logoVariants = cva(
  'object-contain transition-opacity duration-300',
  {
    variants: {
      size: {
        default: 'max-w-24',
        sm: 'max-w-16',
        lg: 'max-w-32',
        xl: 'max-w-48',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type LogoVariants = VariantProps<typeof logoVariants>
