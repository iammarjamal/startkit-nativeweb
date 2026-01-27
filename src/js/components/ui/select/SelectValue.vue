<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SelectValue, type SelectValueProps, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectValueProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectValue
    data-slot="select-value"
    v-bind="forwardedProps"
    :class="cn(
      'line-clamp-1 flex items-center gap-2 rtl:flex-row-reverse',
      props.class,
    )"
  >
    <slot />
  </SelectValue>
</template>
