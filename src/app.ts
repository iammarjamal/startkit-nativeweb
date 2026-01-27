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
import { IonicVue } from '@ionic/vue';
import { initializeAppLifeCycle } from './js/composables/useLifeCycle';
import router from './js/router';
import App from '@/app.vue';

// Initialize theme and language BEFORE Vue app is created
// This prevents FOUC (Flash of Unstyled Content)
const { language } = initializeAppLifeCycle();

// Create i18n with the detected/stored language
const i18n = createI18n({
  legacy: false,
  locale: language,
  fallbackLocale: 'ar',
});

// Create Vue app
const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(i18n);

// Mount app
router.isReady().then(() => {
  app.mount('#app');
});
