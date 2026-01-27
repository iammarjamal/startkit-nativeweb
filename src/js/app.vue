<script setup>
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { kProvider } from 'konsta/vue';

const props = defineProps({
    showSplash: {
        type: Boolean,
        default: true
    }
});
</script>

<template>
    <main>
        <SplashScreen v-if="showSplash" />
        <OfflineBanner />
        <div class="h-full overflow-y-scroll phone select-none touch-pan-y" translate="no">
            <k-provider>
                <router-view />
            </k-provider>
        </div>
        <Toaster />
    </main>
</template>
