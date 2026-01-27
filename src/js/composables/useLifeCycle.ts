import { onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { initializeTheme } from './useTheme';
import { initializeLanguage, type Language } from './useLanguage';

export interface LifeCycleOptions {
    /** Called before component is mounted */
    onBeforeMount?: () => void | Promise<void>;
    /** Called when component is mounted */
    onMount?: () => void | Promise<void>;
    /** Called before component is unmounted */
    onBeforeUnmount?: () => void | Promise<void>;
}

export interface AppLifeCycleResult {
    language: Language;
}

/**
 * Composable for managing component lifecycle with theme/language initialization
 * Ensures theme and language are properly applied during SSR and CSR
 */
export function useLifeCycle(options: LifeCycleOptions = {}) {
    // Before mount - initialize theme and language early
    onBeforeMount(async () => {
        if (typeof window !== 'undefined') {
            initializeTheme();
            initializeLanguage();
        }
        await options.onBeforeMount?.();
    });

    // On mount - finalize initialization
    onMounted(async () => {
        if (typeof window !== 'undefined') {
            initializeTheme();
            initializeLanguage();
        }
        await options.onMount?.();
    });

    // Before unmount - cleanup
    onBeforeUnmount(async () => {
        await options.onBeforeUnmount?.();
    });
}

/**
 * Initialize app lifecycle (call once in app.ts before createApp)
 * Sets up theme and language before Vue app is created
 * Returns initial language for i18n setup
 */
export function initializeAppLifeCycle(): AppLifeCycleResult {
    let language: Language = 'ar';

    if (typeof window !== 'undefined') {
        // Initialize theme immediately
        initializeTheme();
        // Initialize language and get the value
        language = initializeLanguage();
    }

    return { language };
}

export default useLifeCycle;
