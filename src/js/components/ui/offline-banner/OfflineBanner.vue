<!--
Usage:
<OfflineBanner />
Shows a fixed banner at top of screen when the device is offline.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { useNetwork } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

interface Props {
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
const { t } = useI18n();
const { isOnline } = useNetwork();
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-y-full"
      enter-to-class="translate-y-0" leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-y-0" leave-to-class="-translate-y-full">
      <div v-if="!isOnline" data-slot="offline-banner" :class="cn(
        'fixed top-0 right-0 left-0 z-[99999] flex w-full items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground shadow-lg',
        props.class,
      )
        ">
        <Icon icon="mdi:wifi-off" class="h-4 w-4" />
        <span>{{ t('body.offline') }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<i18n lang="json">{
  "ar": {
    "body": {
      "offline": "الجهاز غير متصل بالإنترنت"
    }
  },
  "en": {
    "body": {
      "offline": "No internet connection"
    }
  }
}</i18n>
