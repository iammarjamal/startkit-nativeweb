<!--
Usage:
<ResponsiveModal v-model="showModal">
  <template #title>Title</template>
  <template #body>Body content</template>
</ResponsiveModal>
Props:
- v-model: show/hide modal
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'

interface Props {
    class?: HTMLAttributes['class']
    contentClass?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const isDesktop = useMediaQuery('(min-width: 1366px)')
const isOpen = ref(false)
</script>

<template>
    <Dialog v-if="isDesktop" v-model:open="isOpen" data-slot="responsive-modal">
        <DialogTrigger as-child>
            <slot name="button"></slot>
        </DialogTrigger>
        <DialogContent
            :class="cn('scrollbar-hide overflow-y-scroll bg-background sm:max-w-[720px]', props.contentClass)">
            <DialogHeader class="mb-1 border-b border-border pb-2">
                <DialogTitle class="text-foreground">
                    <slot name="title"></slot>
                </DialogTitle>
                <DialogDescription class="text-muted-foreground">
                    <slot name="desc"></slot>
                </DialogDescription>
            </DialogHeader>
            <div class="text-foreground">
                <slot name="body"> </slot>
            </div>
        </DialogContent>
    </Dialog>

    <Drawer v-else v-model:open="isOpen" data-slot="responsive-modal">
        <DrawerTrigger as-child>
            <slot name="button"> </slot>
        </DrawerTrigger>
        <DrawerContent :class="cn('bg-background sm:max-h-[78vh]', props.contentClass)">
            <DrawerHeader class="text-start">
                <DrawerTitle class="text-foreground">
                    <slot name="title"></slot>
                </DrawerTitle>
                <DrawerDescription class="text-muted-foreground">
                    <slot name="desc"></slot>
                </DrawerDescription>
            </DrawerHeader>
            <div class="scrollbar-hide overflow-y-scroll p-4 text-foreground">
                <slot name="body"> </slot>
            </div>
        </DrawerContent>
    </Drawer>
</template>
