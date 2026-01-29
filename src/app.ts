import '@fontsource/ibm-plex-sans-arabic/100.css';
import '@fontsource/ibm-plex-sans-arabic/200.css';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';

import '@ionic/vue/css/core.css';
import './css/app.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n';
import { IonicVue, isPlatform } from '@ionic/vue';
import { initializeAppLifeCycle } from '@/composables/useLifeCycle';
import router from '@/@enpo/router/router';
import App from '@/app.vue';

// Flutter Native Animation
import { flutterNativeAnimation } from '@/@enpo/router/transition';

// Initialize theme and language BEFORE Vue app is created
const { language } = initializeAppLifeCycle();

// Create i18n
const i18n = createI18n({
  legacy: false,
  locale: language,
  fallbackLocale: 'ar',
});

// Platform-specific settings
const isIOS = isPlatform('ios');
const isAndroid = isPlatform('android');

// // Initialize Power Mode Detection
// async function initPowerMode() {
//   try {
//     const { lowPowerModeEnabled } = await PowerMode.lowPowerModeEnabled();
//     setLowPowerMode(lowPowerModeEnabled);
//     console.log('[PowerMode] Low Power Mode:', lowPowerModeEnabled);
//   } catch (error) {
//     // Plugin not available (web/desktop)
//     setLowPowerMode(false);
//   }
// }

// // Check power mode on app start
// initPowerMode();

// Create Vue app with Ionic configuration
const app = createApp(App)
  .use(IonicVue, {
    // Flutter-style native animation (auto-detects iOS/Android + Power Mode)
    navAnimation: flutterNativeAnimation,
    // Ripple effect (Android only)
    rippleEffect: isAndroid,
    // Smoother transitions
    animated: true,
    // Hardware back button (Android only)
    hardwareBackButton: isAndroid,
    // Swipe to go back (iOS only)
    swipeBackEnabled: isIOS,
  })
  .use(router)
  .use(i18n);

// Mount app after router is ready
router.isReady().then(() => {
  app.mount('#app');
});
