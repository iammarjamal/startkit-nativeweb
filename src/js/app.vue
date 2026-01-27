<script setup>
import { onMounted } from 'vue';
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { OfflineBanner } from '@/components/ui/offline-banner';

const props = defineProps({
    showSplash: {
        type: Boolean,
        default: true
    }
});

onMounted(() => {
    // Strict Single Finger Policy
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            // @ts-ignore
            if (e.target && e.target.closest('.allow-multi-touch')) return;
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    window.addEventListener('gesturestart', (e) => e.preventDefault());
});
</script>

<template>
    <main>
        <SplashScreen v-if="showSplash" />
        <OfflineBanner />
        <div class="h-full overflow-y-scroll phone select-none touch-pan-y" translate="no">
            <router-view />
        </div>
        <Toaster />
    </main>
</template>
