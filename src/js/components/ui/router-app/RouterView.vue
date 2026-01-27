<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, nextTick, ref } from 'vue';
import { Capacitor } from '@capacitor/core'; // 1. استيراد كابستور

// 2. التحقق الجذري: هل نحن في تطبيق نيتف أم متصفح؟
// true = iOS/Android App (IPA/APK)
// false = Mobile Web / Desktop Web / PWA
const isNativeApp = Capacitor.isNativePlatform();

const router = useRouter();

let removeGuard: (() => void) | undefined;

onMounted(() => {
    // إعداد Guard للتعامل مع الويب فقط
    removeGuard = router.beforeResolve(async (to, from, next) => {

        // --- NATIVE GUARD ---
        // إذا كان تطبيق نيتف، لا تتدخل، اترك IonRouterOutlet يقوم بعمله
        if (isNativeApp) {
            next();
            return;
        }

        // --- WEB GUARD (Mobile & Desktop) ---
        // إذا المتصفح لا يدعم الحركات الحديثة، مرر التنقل فوراً
        if (!document.startViewTransition) {
            next();
            return;
        }

        // 3. منطق الاتجاه (للويب فقط)
        // هذا يعطي حركة "سلايد" لطيفة حتى في متصفح الجوال
        const previousPath = router.options.history.state.back;
        const isBack = previousPath === to.fullPath;
        const dir = isBack ? -1 : 1;

        document.documentElement.style.setProperty('--transition-direction', dir.toString());

        // بدء الترانزيشن الخاص بالمتصفح
        const transition = document.startViewTransition(async () => {
            next();
            await nextTick();
        });

        await transition.finished;
    });
});

onUnmounted(() => {
    if (removeGuard) removeGuard();
});
</script>

<template>
    <ion-app>
        <ion-router-outlet v-if="isNativeApp" :animated="true" />

        <div v-else class="web-router-view">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </div>
    </ion-app>
</template>

<style>
/* ============================================================================
   WEB VIEW TRANSITIONS (Mobile Web + Desktop)
   ============================================================================
   تم إزالة الميديا كويري (min-width) ليعمل الانيميشن اللطيف
   على متصفح الجوال أيضاً (مثل السفاري والكروم)
*/

/* تعريف المتغيرات الافتراضية */
:root {
    --transition-offset: 20px;
    /* مسافة حركة قصيرة وناعمة */
    --transition-ease: cubic-bezier(0.2, 0.0, 0.0, 1.0);
    /* حركة فخمة */
}

/* تطبيق الانيميشن فقط إذا لم يكن تطبيق نيتف 
   (رغم أن v-if يمنع ذلك، لكن لزيادة الأمان في الـ CSS)
*/
.web-router-view {
    view-transition-name: page-content;
    width: 100%;
    height: 100%;
}

::view-transition-group(page-content) {
    animation-duration: 0.3s;
    animation-timing-function: var(--transition-ease);
}

::view-transition-old(page-content) {
    animation: 0.3s var(--transition-ease) both fade-out-slide;
    mix-blend-mode: plus-lighter;
}

::view-transition-new(page-content) {
    animation: 0.3s var(--transition-ease) both fade-in-slide;
    mix-blend-mode: plus-lighter;
}

@keyframes fade-out-slide {
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(calc(var(--transition-offset) * -1 * var(--transition-direction)));
        filter: blur(4px);
    }
}

@keyframes fade-in-slide {
    from {
        opacity: 0;
        transform: translateY(calc(var(--transition-offset) * var(--transition-direction)));
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>