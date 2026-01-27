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
import { initializeAppLifeCycle } from './js/composables/useLifeCycle';
import router from './js/router';
import App from '@/app.vue';

// Flutter Native Animation - Auto detects iOS/Android and applies appropriate transition
import { flutterNativeAnimation } from '@/plugins/transition';

// Initialize theme and language BEFORE Vue app is created
// This prevents FOUC (Flash of Unstyled Content)
const { language } = initializeAppLifeCycle();

// Create i18n with the detected/stored language
const i18n = createI18n({
  legacy: false,
  locale: language,
  fallbackLocale: 'ar',
});

// Platform-specific settings
const isIOS = isPlatform('ios');
const isAndroid = isPlatform('android');

// Create Vue app with Ionic configuration
const app = createApp(App)
  .use(IonicVue, {
    // Flutter-style native animation (auto-detects iOS/Android)
    navAnimation: flutterNativeAnimation,
    // Disable ripple for cleaner transitions (or enable on Android only)
    rippleEffect: isAndroid,
    // Smoother transitions
    animated: true,
    // Hardware back button (Android only)
    hardwareBackButton: isAndroid,
    // Swipe to go back (iOS only - like native iOS behavior)
    swipeBackEnabled: isIOS,
  })
  .use(router)
  .use(i18n);

// Mount app after router is ready
router.isReady().then(() => {
  app.mount('#app');
});
