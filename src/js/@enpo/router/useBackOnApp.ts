import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useSwipe } from '@vueuse/core';
import { computed, onMounted, ref, unref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIonRouter } from '@ionic/vue'; 

// --- CONSTANTS ---
const DEFAULT_SWIPE_THRESHOLD = 50;
const DEFAULT_EDGE_ZONE_PERCENTAGE = 0.05;
const DEFAULT_MIN_SWIPE_DISTANCE = 30;

interface UseBackOnAppOptions {
    elementId?: string;
    enabled?: boolean | Ref<boolean>;
    handleAndroidBackButton?: boolean;
}

function getPlatform() {
    return Capacitor.getPlatform();
}

export function useBackOnApp(options: UseBackOnAppOptions = {}) {
    const { elementId, enabled = true, handleAndroidBackButton = true } = options;
    const targetRef = ref<HTMLElement | null>(null);
    const { locale } = useI18n();
    
    const ionRouter = useIonRouter();
    
    const isRTL = computed(() => ['ar', 'he', 'fa'].includes(locale.value));

    // --- NAVIGATION FUNCTION (Manual / iOS Swipe Only) ---
    const navigateBack = () => {
        if (ionRouter.canGoBack()) {
            ionRouter.back();
        } else {
            console.log('Root of navigation stack.');
        }
    };

    // --- IOS EDGE SWIPE ---
    let isNavigatingBack = false;
    function setupIOSBackSwipe(isEnabled: boolean) {
        if (getPlatform() !== 'ios' || !isEnabled) return;

        const { direction, lengthX, isSwiping, coordsStart } = useSwipe(targetRef, {
            threshold: DEFAULT_SWIPE_THRESHOLD,
            passive: true,
        });

        watch([isSwiping, direction, lengthX], () => {
            if (!isSwiping.value || isNavigatingBack) return;
            if (!ionRouter.canGoBack()) return;

            const dir = direction.value;
            const startX = coordsStart?.x ?? 0;
            const screenWidth = window.innerWidth;
            const edgeZone = screenWidth * DEFAULT_EDGE_ZONE_PERCENTAGE;
            const startedFromEdge = isRTL.value 
                ? startX > screenWidth - edgeZone 
                : startX < edgeZone;

            const isBackGesture = (isRTL.value && dir === 'left') || (!isRTL.value && dir === 'right');

            if (isBackGesture && startedFromEdge && Math.abs(lengthX.value) > DEFAULT_MIN_SWIPE_DISTANCE) {
                isNavigatingBack = true;
                navigateBack();
                setTimeout(() => (isNavigatingBack = false), 300);
            }
        });
    }

    // --- LIFECYCLE ---
    onMounted(() => {
        targetRef.value = document.getElementById(elementId ?? '') ?? document.body;
        const initialEnabled = unref(enabled);
        
        setupIOSBackSwipe(initialEnabled);
    });

    if (typeof enabled !== 'boolean') {
        watch(enabled, (val) => {
            setupIOSBackSwipe(val);
        });
    }

    return { targetRef, navigateBack };
}