import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

export type Appearance = 'light' | 'dark' | 'system';

// Shared reactive state
const appearance = ref<Appearance>('system');
let mediaQueryCleanup: (() => void) | null = null;

/**
 * Apply theme class to document
 */
export function updateTheme(value: Appearance) {
    if (typeof window === 'undefined') {
        return;
    }

    if (value === 'system') {
        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQueryList.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else if (value === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (value === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Set cookie for SSR theme persistence
 */
const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

/**
 * Get media query for system theme
 */
const getMediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.matchMedia('(prefers-color-scheme: dark)');
};

/**
 * Get stored appearance from localStorage
 */
const getStoredAppearance = (): Appearance | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('appearance') as Appearance | null;
};

/**
 * Handle system theme change event - updates theme when system preference changes
 * Only applies when appearance is set to 'system'
 */
const handleSystemThemeChange = () => {
    const currentAppearance = getStoredAppearance() || appearance.value;
    if (currentAppearance === 'system') {
        updateTheme('system');
    }
};

/**
 * Setup system theme observer - watches for OS theme changes
 */
function setupSystemThemeObserver() {
    if (typeof window === 'undefined') {
        return;
    }

    // Cleanup any existing listener
    cleanupSystemThemeObserver();

    // Setup new listener
    const mediaQuery = getMediaQuery();
    if (mediaQuery) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        mediaQueryCleanup = () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }
}

/**
 * Cleanup system theme observer
 */
function cleanupSystemThemeObserver() {
    if (mediaQueryCleanup) {
        mediaQueryCleanup();
        mediaQueryCleanup = null;
    }
}

/**
 * Initialize theme - call on app startup
 * Reads from localStorage/cookie and applies theme
 */
export function initializeTheme() {
    if (typeof window === 'undefined') {
        return;
    }

    // Get saved preference
    const savedAppearance = getStoredAppearance();

    if (savedAppearance) {
        appearance.value = savedAppearance;
        updateTheme(savedAppearance);
    } else {
        appearance.value = 'system';
        updateTheme('system');
    }

    // Setup observer for system theme changes
    setupSystemThemeObserver();
}

/**
 * Main composable for appearance/theme management
 * Provides reactive appearance state and update function
 */
export function useAppearance() {
    // Initialize from localStorage on mount
    onMounted(() => {
        const savedAppearance = getStoredAppearance();
        if (savedAppearance) {
            appearance.value = savedAppearance;
        }
        // Ensure observer is setup
        setupSystemThemeObserver();
    });

    // Cleanup on unmount
    onBeforeUnmount(() => {
        // Note: We don't cleanup observer here as other components may need it
        // It will be cleaned up when a new observer is setup
    });

    /**
     * Update appearance - saves to localStorage, cookie, and applies theme
     */
    function updateAppearance(value: Appearance) {
        appearance.value = value;

        // Store in localStorage for client-side persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance', value);
        }

        // Store in cookie for SSR
        setCookie('appearance', value);

        // Apply theme
        updateTheme(value);
    }

    // Watch for appearance changes and re-apply theme
    watch(appearance, (newValue) => {
        updateTheme(newValue);
    });

    return {
        appearance,
        updateAppearance,
    };
}

export default useAppearance;
