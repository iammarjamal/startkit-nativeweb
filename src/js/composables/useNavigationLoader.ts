// src/composables/useNavigationLoader.ts
import { ref } from 'vue';
import NProgress from 'nprogress';
import { useMediaQuery } from '@vueuse/core';

// نجعل الحالة reactive لكي تستجيب الواجهة فوراً
const isMobileLoading = ref(false);

// نستخدم تعريف دقيق للديسك توب
const isDesktop = useMediaQuery('(min-width: 1024px)');

NProgress.configure({ showSpinner: false, speed: 500 });

let timer: any = null;
// تقليل الوقت لضمان الظهور في التنقلات المتوسطة
const DELAY_MS = 150; 

export function useNavigationLoader() {
  
  const startLoading = () => {
    // تنظيف أي مؤقت سابق فوراً لمنع التداخل
    if (timer) clearTimeout(timer);

    if (isDesktop.value) {
      NProgress.start();
    } else {
      // Mobile Logic
      timer = setTimeout(() => {
        isMobileLoading.value = true;
      }, DELAY_MS);
    }
  };

  const stopLoading = () => {
    if (isDesktop.value) {
      NProgress.done();
    }
    
    // Mobile Logic: التنظيف الحتمي
    if (timer) clearTimeout(timer);
    timer = null;
    
    // إذا كان ظاهراً، نخفيه
    if (isMobileLoading.value) {
      // تأخير بسيط جداً في الإخفاء (Optional) لمنع الوميض السريع جداً
      setTimeout(() => {
        isMobileLoading.value = false;
      }, 50); 
    }
  };

  return { isMobileLoading, startLoading, stopLoading };
}