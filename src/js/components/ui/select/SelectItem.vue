<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Check } from 'lucide-vue-next'
import {
  SelectItem,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
  useForwardProps,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'ltr:ps-2 ltr:pe-8 rtl:ps-8 rtl:pe-2',
        props.class,
      )
    "
  >
    <!-- Check Icon Container -->
    <div class="absolute flex items-center justify-center right-2 rtl:right-auto rtl:left-2">
      <SelectItemIndicator>
        <Check class="size-4" />
      </SelectItemIndicator>
    </div>

    <!-- Text Content -->
    <SelectItemText class="flex-1">
      <slot />
    </SelectItemText>
  </SelectItem>
</template>