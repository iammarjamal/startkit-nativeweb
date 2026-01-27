<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner';
import { useAppearance } from '@/composables/useTheme';
import { computed } from 'vue';

const props = defineProps<ToasterProps>();
const { appearance } = useAppearance();

// Determine actual theme for toast (handle 'system' mode)
const toastTheme = computed(() => {
  if (appearance.value === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return appearance.value;
});
</script>

<template>
  <Sonner v-bind="props" class="toaster group font-sans" :theme="toastTheme" position="top-center" :toast-options="{
    classes: {
      toast: 'group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:font-sans',
      title: 'group-[.toast]:text-foreground group-[.toast]:font-medium',
      description: 'group-[.toast]:text-muted-foreground',
      actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
      cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      success: 'group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border',
      error: 'group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive',
      warning: 'group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-950 dark:group-[.toaster]:text-amber-100 dark:group-[.toaster]:border-amber-800',
      info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-800',
    },
  }" />
</template>

<style>
/* Ensure toast uses project font */
[data-sonner-toaster] {
  font-family: inherit !important;
}

[data-sonner-toast] {
  font-family: inherit !important;
}
</style>
