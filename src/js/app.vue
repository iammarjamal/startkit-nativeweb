<script setup>
import { EnpoApp } from './@enpo/components/enpo-app';
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { OverlayLoading } from './@enpo/components/enpo-loading';

const props = defineProps({
    showSplash: {
        type: Boolean,
        default: true
    }
});
</script>

<template>
    <main>
        <OverlayLoading />
        <SplashScreen v-if="showSplash" />
        <!-- <OfflineBanner /> -->
        <div class="h-full overflow-y-scroll phone select-none touch-pan-y" translate="no">
            <EnpoApp />
        </div>
        <Toaster theme="system" position="bottom-center" :richColors="true" />
    </main>
</template>
