<script setup lang="ts">
import { IonRouterOutlet } from '@ionic/vue';
import { useMediaQuery } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, onUnmounted, nextTick, ref } from 'vue';

// Media Query: Desktop Detection
const isDesktop = useMediaQuery('(min-width: 1024px)');
const router = useRouter();

// State to track navigation direction
const transitionDirection = ref<'forward' | 'back'>('forward');

let removeGuard: (() => void) | undefined;

onMounted(() => {
    // Intercept Navigation
    removeGuard = router.afterEach(async (to, from) => {
        // 1. Skip if not desktop or API not supported
        if (!isDesktop.value || !document.startViewTransition) {
            return;
        }

        // 2. Determine Direction
        // Simple logic: Compare path depth or use history state if available
        // For accurate detection, you might need a custom history tracker
        const toDepth = to.path.split('/').length;
        const fromDepth = from.path.split('/').length;
        transitionDirection.value = toDepth < fromDepth ? 'back' : 'forward';

        // Update CSS Variable for direction BEFORE transition starts
        document.documentElement.style.setProperty(
            '--transition-direction',
            transitionDirection.value === 'back' ? '-1' : '1'
        );

        // 3. Trigger Transition
        // We wrap the DOM update manually. Since we are in 'afterEach', 
        // the router has already updated the state, but Vue hasn't flushed DOM yet.
        await nextTick();

        // Note: In 'afterEach', the DOM might already be patching. 
        // For ViewTransitions, typically 'beforeResolve' allows capturing 'old' state better.
        // However, forcing a transition on the *rendering* phase is key.
    });

    // Better approach for View Transitions + Router:
    // We override the resolve mechanism to capture state BEFORE the switch.
    const originalResolve = router.beforeResolve;
    removeGuard = router.beforeResolve(async (to, from, next) => {
        if (!isDesktop.value || !document.startViewTransition) {
            next();
            return;
        }

        // Detect Direction (Basic logic, enhance as needed)
        // Assuming you have navigation history logic, otherwise default to forward
        const isBack = router.options.history.state.back === to.fullPath;
        const dir = isBack ? -1 : 1;
        document.documentElement.style.setProperty('--transition-direction', dir.toString());

        // Start Transition
        const transition = document.startViewTransition(async () => {
            // This callback is where the DOM changes happen
            next();
            await nextTick(); // Wait for Vue to render the new route
        });

        await transition.finished;
    });
});

onUnmounted(() => {
    if (removeGuard) removeGuard();
});
</script>

<template>
    <ion-router-outlet v-if="!isDesktop" />

    <div v-else class="desktop-router-view">
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </div>
</template>

<style>
/* ============================================================================
   DESKTOP VIEW TRANSITIONS
   ============================================================================
*/

@media (min-width: 1024px) {
    /* Control the Animation Group */
    ::view-transition-group(page-content) {
        animation-duration: 0.3s;
        animation-timing-function: var(--transition-ease);
    }

    /* OLD Page (Leaving) */
    ::view-transition-old(page-content) {
        animation: 0.3s var(--transition-ease) both fade-out-slide;
        /* Avoid grey overlap background issues */
        mix-blend-mode: plus-lighter;
    }

    /* NEW Page (Entering) */
    ::view-transition-new(page-content) {
        animation: 0.3s var(--transition-ease) both fade-in-slide;
        mix-blend-mode: plus-lighter;
    }

    /* DYNAMIC KEYFRAMES 
       We use calc() with the CSS variable to flip direction automatically
    */
    @keyframes fade-out-slide {
        from {
            opacity: 1;
            transform: translateX(0);
        }

        to {
            opacity: 0;
            /* If direction is 1 (Forward), Old page moves Left (-30px) */
            /* If direction is -1 (Back), Old page moves Right (+30px) */
            transform: translateX(calc(var(--transition-offset) * -1 * var(--transition-direction)));
            filter: blur(5px);
            /* Add subtle blur for depth */
        }
    }

    @keyframes fade-in-slide {
        from {
            opacity: 0;
            /* If direction is 1 (Forward), New page comes from Right (+30px) */
            /* If direction is -1 (Back), New page comes from Left (-30px) */
            transform: translateX(calc(var(--transition-offset) * var(--transition-direction)));
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
}
</style>