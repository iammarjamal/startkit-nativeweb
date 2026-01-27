<script setup>
import { onMounted, nextTick } from 'vue';
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { OverlayLoading } from '@/components/ui/overlay-loading';

const props = defineProps({
    showSplash: {
        type: Boolean,
        default: true
    }
});

onMounted(async () => {
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

    // Handle UI Readiness & Loader Removal
    await nextTick();

    const signalReady = () => {
        // 250ms buffer to ensure layout stability and paint completion on slower devices
        setTimeout(() => {
            // @ts-ignore
            if (typeof window.appReady === 'function') {
                // @ts-ignore
                window.appReady();
                console.log('✅ UI Painted & Loader Removed');
            }
        }, 250);
    };

    // Support for slow networks (3G): Wait for all assets if not already loaded
    if (document.readyState === 'complete') {
        signalReady();
    } else {
        window.addEventListener('load', signalReady, { once: true });
    }
});
</script>

<template>
    <main>
        <OverlayLoading />
        <SplashScreen v-if="showSplash" />
        <OfflineBanner />
        <div class="h-full overflow-y-scroll phone select-none touch-pan-y" translate="no">
            <router-view />
        </div>
        <Toaster />
    </main>
</template>
