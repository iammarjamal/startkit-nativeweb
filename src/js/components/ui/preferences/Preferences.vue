<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/components/ui/drawer';

import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

interface Props {
    class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
const { t } = useI18n();

// Reactive variable to control the open state of the dialog/drawer
const isOpen = ref(false);

// Determine if the screen is desktop size
const isDesktop = useMediaQuery('(min-width: 768px)');
</script>

<template>
    <Dialog v-if="isDesktop" v-model:open="isOpen" data-slot="preferences">
        <DialogTrigger as-child>
            <slot></slot>
        </DialogTrigger>

        <DialogContent class="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{{ t('body.title') }}</DialogTitle>
                <DialogDescription>
                    {{ t('body.desc') }}
                </DialogDescription>
            </DialogHeader>

            <div class="flex flex-col gap-y-3">
                <div class="border-b border-border py-2 pb-5">
                    <LanguageSwitcher inline />
                </div>
                <div class="py-2">
                    <ThemeSwitcher inline />
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <Drawer v-else v-model:open="isOpen" data-slot="preferences">
        <DrawerTrigger as-child>
            <slot></slot>
        </DrawerTrigger>

        <DrawerContent>
            <DrawerHeader class="mt-3 text-start">
                <DrawerTitle>{{ t('body.title') }}</DrawerTitle>
                <DrawerDescription>
                    {{ t('body.desc') }}
                </DrawerDescription>
            </DrawerHeader>

            <div class="mb-7 flex flex-col gap-y-3 px-4 pb-4">
                <div class="border-b border-border py-2 pb-5">
                    <LanguageSwitcher inline />
                </div>
                <div class="py-2">
                    <ThemeSwitcher inline />
                </div>
            </div>
        </DrawerContent>
    </Drawer>
</template>

<i18n lang="json">{
    "ar": {
        "body": {
            "title": "التفضيلات",
            "desc": "تفضيلات المستخدم لتخصيص التجربة داخل التطبيق."
        }
    },
    "en": {
        "body": {
            "title": "Preferences",
            "desc": "User preferences to customize the experience within the app."
        }
    }
}</i18n>
