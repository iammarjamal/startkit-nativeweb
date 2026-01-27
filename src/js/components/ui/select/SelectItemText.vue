<script setup lang="ts">
import { SelectItemText, type SelectItemTextProps } from 'reka-ui'

const props = defineProps<SelectItemTextProps>()
</script>

<template>
  <SelectItemText
  class="w-full"
    data-slot="select-item-text"
    v-bind="props"
  >
    <slot />
  </SelectItemText>
</template>
