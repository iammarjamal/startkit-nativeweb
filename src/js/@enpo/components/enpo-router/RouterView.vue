<script setup lang="ts">
// ==========================================
// 1. Imports
// ==========================================
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useI18n } from 'vue-i18n';
import { useBackOnApp } from '@/@enpo/router/useBackOnApp';
import { toast } from 'vue-sonner';

// ==========================================
// 2. Setup & Definitions
// ==========================================
const { locale, t } = useI18n();
const router = useRouter();
const route = useRoute();

const isNative = Capacitor.isNativePlatform();
const isIOS = isNative && Capacitor.getPlatform() === 'ios';
const isRTL = computed(() => ['ar', 'he', 'fa'].includes(locale.value));

const isLowPower = ref(!isNative);
const transitionName = ref('fade');
let lastHistoryPosition = history.state.position || 0;

let globalAnimId: number | null = null;

// ==========================================
// 3. Logic: Performance Check
// ==========================================
const checkPerformance = () => {
    if (!isNative) return;

    if (globalAnimId !== null) cancelAnimationFrame(globalAnimId);

    const alreadyShown = sessionStorage.getItem('low_power_toast_shown');

    let frameCount = 0;
    const startTime = performance.now();

    const loop = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;

        if (elapsed >= 150) {
            const fps = Math.round((frameCount * 1000) / elapsed);

            if (fps < 45) {
                if (!isLowPower.value) isLowPower.value = true;

                if (!alreadyShown || isIOS) {
                    sessionStorage.setItem('low_power_toast_shown', 'true');

                    toast.warning(t('low_power_title'), {
                        id: 'low-power-unique-id',
                        description: t('low_power_desc'),
                        duration: 4000,
                        style: {
                            background: '#FFEB3B',
                            color: 'black',
                            border: '1px solid #991b1b'
                        },
                        position: 'bottom-center'
                    });
                }
            }
            else if (fps >= 45 && isLowPower.value) {
                isLowPower.value = false;
            }

            globalAnimId = null;
            return;
        }

        globalAnimId = requestAnimationFrame(loop);
    };

    globalAnimId = requestAnimationFrame(loop);
};

// ==========================================
// 4. Lifecycle
// ==========================================
onMounted(() => {
    checkPerformance();

    if (isNative) {
        App.addListener('resume', () => setTimeout(checkPerformance, 300));
    }

    document.documentElement.style.setProperty('--dir', isRTL.value ? '-1' : '1');
});

onUnmounted(() => {
    if (isNative) App.removeAllListeners();
    if (globalAnimId !== null) cancelAnimationFrame(globalAnimId);
});

// ==========================================
// 5. Navigation
// ==========================================
router.afterEach(() => {
    document.documentElement.style.setProperty('--dir', isRTL.value ? '-1' : '1');
    if (!isLowPower.value && isIOS) return;

    const currentPos = history.state.position || 0;
    if (isIOS) {
        if (currentPos > lastHistoryPosition) transitionName.value = 'ios-forward';
        else if (currentPos < lastHistoryPosition) transitionName.value = 'ios-back';
        else transitionName.value = 'fade';
    } else {
        transitionName.value = 'fade';
    }
    lastHistoryPosition = currentPos;
});

useBackOnApp({
    enabled: computed(() => isLowPower.value || !isNative)
});
</script>

<template>
    <ion-app>
        <ion-router-outlet v-if="!isLowPower" :animated="true" />

        <div v-else class="router-animation-wrapper">
            <router-view v-slot="{ Component }">
                <Transition :name="transitionName">
                    <component :is="Component" :key="$route.fullPath" class="page-transition-item ion-page" />
                </Transition>
            </router-view>
        </div>
    </ion-app>
</template>

<style scoped>
/* ==========================================
   Styles (Unchanged)
   ========================================== */
.router-animation-wrapper,
.page-transition-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--ion-background-color, #000);
    overflow: hidden;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    will-change: transform, opacity;
}

.router-animation-wrapper {
    position: relative;
}

.ios-forward-enter-active,
.ios-forward-leave-active,
.ios-back-enter-active,
.ios-back-leave-active {
    transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
        opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.ios-forward-enter-active {
    z-index: 10;
    box-shadow: calc(-25px * var(--dir)) 0 40px rgba(0, 0, 0, 0.5);
}

.ios-forward-leave-active {
    z-index: 1;
}

.ios-forward-enter-from {
    transform: translate3d(calc(100% * var(--dir)), 0, 0);
}

.ios-forward-leave-to {
    transform: translate3d(calc(-30% * var(--dir)), 0, 0);
    opacity: 0.8;
}

.ios-back-enter-active {
    z-index: 1;
}

.ios-back-leave-active {
    z-index: 10;
    box-shadow: calc(-25px * var(--dir)) 0 40px rgba(0, 0, 0, 0.5);
}

.ios-back-enter-from {
    transform: translate3d(calc(-30% * var(--dir)), 0, 0);
    opacity: 0.8;
}

.ios-back-leave-to {
    transform: translate3d(calc(100% * var(--dir)), 0, 0);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
    z-index: 1;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<i18n lang="json">{
    "ar": {
        "low_power_title": "نمط توفير الطاقة",
        "low_power_desc": "تم اكتشاف وضع توفير الطاقة، سيتم خفض الاداء والانتقالات."
    },
    "en": {
        "low_power_title": "Low Power Mode",
        "low_power_desc": "Low Power Mode Active, Switched to Lite Mode."
    }
}</i18n>