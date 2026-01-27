import { ref, watch } from 'vue';

export type Language = 'ar' | 'en';

// Shared reactive state
const language = ref<Language>('ar');

/**
 * Apply language to document (dir & lang attributes)
 */
export function updateLanguage(value: Language) {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    html.lang = value;
    html.dir = value === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Set cookie for persistence
 */
const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

/**
 * Get stored language from localStorage
 */
const getStoredLanguage = (): Language | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('language');
    if (stored === 'ar' || stored === 'en') return stored;
    return null;
};

/**
 * Detect browser language
 */
const detectBrowserLanguage = (): Language => {
    if (typeof navigator === 'undefined') return 'ar';
    const browserLang = navigator.language || (navigator as any).userLanguage;
    return browserLang?.startsWith('ar') ? 'ar' : 'en';
};

/**
 * Initialize language - call on app startup
 */
export function initializeLanguage(): Language {
    if (typeof window === 'undefined') return 'ar';

    // Priority: localStorage > browser preference > default (ar)
    const savedLanguage = getStoredLanguage();
    const initialLang = savedLanguage || 'ar'; // Default to Arabic

    language.value = initialLang;
    updateLanguage(initialLang);

    return initialLang;
}

/**
 * Main composable for language management
 */
export function useLanguage() {
    /**
     * Update language - saves to localStorage, cookie, and applies to document
     */
    function setLanguage(value: Language) {
        language.value = value;

        // Store in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', value);
        }

        // Store in cookie for SSR
        setCookie('language', value);

        // Apply to document
        updateLanguage(value);
    }

    /**
     * Toggle between ar/en
     */
    function toggleLanguage() {
        setLanguage(language.value === 'ar' ? 'en' : 'ar');
    }

    // Watch for language changes
    watch(language, (newValue) => {
        updateLanguage(newValue);
    });

    return {
        language,
        setLanguage,
        toggleLanguage,
        isRTL: () => language.value === 'ar',
    };
}

export default useLanguage;
