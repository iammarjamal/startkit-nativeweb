<script setup lang="ts" vapor>
import { IonPage, IonContent } from '@ionic/vue';
import { ChevronLeft } from 'lucide-vue-next';
import { useMediaQuery } from '@vueuse/core';

defineProps<{
    canBack?: boolean;
}>();
const goBack = () => history.back();

const isDesktop = useMediaQuery('(min-width: 1024px)');
</script>

<template>
    <ion-page>
        <ion-content>

            <header v-if="canBack && !isDesktop"
                class="fixed top-0 ltr:left-0 rtl:right-0 z-50 px-5 pt-[max(env(safe-area-inset-top)+5px,12px)]">

                <button @click="goBack" class="
        /* --- الأساسيات --- */
        w-10 h-10 rounded-full
        flex items-center justify-center
        transition-all duration-300
        active:scale-95
        cursor-pointer
        group

        /* =========================================
           iOS Styles (The Real Apple Glass)
           ========================================= */
        
        /* 1. الخلفية: السر في Light Mode هو استخدام أبيض بنسبة 70% وليس 10% */
        ios:bg-[rgba(255,255,255,0.10)] 
        ios:dark:bg-[rgba(30,30,30,0.50)]
        
        /* 2. التغبيش: قوي جداً */
        ios:backdrop-blur-xl 
        ios:backdrop-saturate-150
        
        /* 3. الحدود: 
           في Light: حدود بيضاء صلبة لتعطي إيحاء 'الحافة الزجاجية' 
           في Dark: حدود بيضاء شفافة جداً
        */
        ios:border ios:border-white/40 
        ios:dark:border-white/10

        /* 4. الظل: ناعم جداً ومنتشر */
        ios:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)]
        ios:dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]
        
        /* 5. لون الأيقونة: 
           أسود (ليس رمادياً) في Light Mode للتباين العالي مثل النظام 
        */
        ios:text-black 
        ios:dark:text-white

        /* =========================================
           Android Styles (Material You)
           ========================================= */
        android:bg-white android:dark:bg-zinc-800
        android:text-slate-700 android:dark:text-gray-200
        android:shadow-md
        android:border android:border-zinc-200 android:dark:border-zinc-700
      ">
                    <ChevronLeft class="rtl:rotate-180 w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                </button>

            </header>
            <slot />
        </ion-content>
    </ion-page>
</template>