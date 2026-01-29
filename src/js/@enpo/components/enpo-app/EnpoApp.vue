<script setup lang="ts" vapor>
import { onMounted, nextTick } from 'vue';
import { RouterView } from "vue-router";

onMounted(async () => {
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            // @ts-ignore
            if (e.target && e.target.closest('.allow-multi-touch')) return;
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    window.addEventListener('gesturestart', (e) => e.preventDefault());

    await nextTick();

    const signalReady = () => {
        setTimeout(() => {
            // @ts-ignore
            if (typeof window.appReady === 'function') {
                // @ts-ignore
                window.appReady();
                console.log('✅ UI Painted & Loader Removed');
            }
        }, 250);
    };

    if (document.readyState === 'complete') {
        signalReady();
    } else {
        window.addEventListener('load', signalReady, { once: true });
    }
});
</script>

<template>
    <RouterView />
</template>
