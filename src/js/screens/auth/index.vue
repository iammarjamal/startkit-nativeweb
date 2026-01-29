<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Motion } from 'motion-v';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Preferences } from '@/components/ui/preferences';
import { useAppearance } from '@/composables/useTheme';
import { useRouter } from 'vue-router';
import { Screen } from '@/@enpo/components/screen';

const { t } = useI18n();
const { appearance } = useAppearance();
const router = useRouter();

type Provider = 'login' | 'google' | 'microsoft' | 'apple';
const loading = ref<Provider | null>(null);
const isLoading = computed(() => loading.value !== null);

// Theme detection with reactivity
const isDark = ref(false);
const updateTheme = () => {
    if (typeof document !== 'undefined') {
        isDark.value = document.documentElement.classList.contains('dark');
    }
};
watch(appearance, updateTheme, { immediate: true });
if (typeof window !== 'undefined') {
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

// Social providers config
const providers = [
    { id: 'google' as const, icon: 'flat-color-icons:google', url: '#' },
    { id: 'microsoft' as const, icon: 'logos:microsoft-icon', url: '#' },
    { id: 'apple' as const, icon: 'ic:baseline-apple', url: '#', disabled: true },
];

// Navigate with custom View Transitions
const navigate = (url: string, state: Provider) => {
    loading.value = state;

    const go = () => {
        if (state === 'login') {
            router.push('/auth/login');
        } else {
            console.log(`Mock navigation to ${state}`);
            // Mock external nav delay
            setTimeout(() => {
                loading.value = null;
            }, 1000);
        }
    };

    // Custom View Transition
    if (document.startViewTransition) {
        document.startViewTransition(go);
    } else {
        go();
    }
};

// Animation helpers
const ease = [0.25, 0.1, 0.25, 1] as const;
const cardAnim = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};
const btnAnim = (i: number) => ({
    initial: { opacity: 0, y: 10, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.2 + i * 0.08, duration: 0.3, ease } },
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95, transition: { duration: 0.1 } },
});
</script>

<template>
    <Screen>
        <Motion class="flex pb-24 h-full items-center justify-center px-4" :initial="cardAnim.initial"
            :animate="cardAnim.animate">
            <Card class="w-full max-w-md border-none bg-transparent shadow-none">
                <CardHeader class="flex flex-col items-center justify-center space-y-4 pb-2 text-center">
                    <!-- Auth Icon - View Transition Named -->
                    <div
                        class="auth-icon mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-black p-2 dark:bg-white">
                        <Logo type="icon" :theme="isDark ? 'dark' : 'light'" :key="String(isDark)" class="size-10" />
                    </div>

                    <!-- Auth Title - View Transition Named -->
                    <CardTitle
                        class="auth-title bg-gradient-to-r from-primary to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl dark:to-zinc-400">
                        {{ t('welcome') }}
                    </CardTitle>
                    <CardDescription class="px-2 text-base leading-relaxed text-muted-foreground">
                        {{ t('subtitle') }}
                    </CardDescription>
                </CardHeader>

                <!-- Auth Content - View Transition Named -->
                <CardContent class="auth-content space-y-5">
                    <!-- Primary Login -->
                    <Motion v-bind="btnAnim(0)">
                        <Button @click="router.push('/auth/login')" :disabled="isLoading" size="lg"
                            class="h-12 w-full bg-gradient-to-r from-primary to-primary/90 text-base font-semibold shadow-lg transition-all hover:from-primary/90 hover:to-primary hover:shadow-xl">
                            <span class="flex-1 text-start">{{ loading === 'login' ? t('loading') :
                                t('continue')
                                }}</span>
                            <Spinner v-if="loading === 'login'" />
                            <Icon v-else icon="solar:login-3-bold" class="size-7" />
                        </Button>
                    </Motion>

                    <!-- Divider -->
                    <Motion :initial="{ opacity: 0, scaleX: 0 }" :animate="{ opacity: 1, scaleX: 1 }"
                        :transition="{ delay: 0.4 }" class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <span class="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="bg-background px-3 font-medium tracking-wider text-muted-foreground">{{
                                t('or')
                                }}</span>
                        </div>
                    </Motion>

                    <!-- Social Providers Loop -->
                    <Motion v-for="(p, i) in providers" :key="p.id" v-bind="btnAnim(i + 1)">
                        <Button @click="navigate(p.url, p.id)" :disabled="isLoading || p.disabled" variant="outline"
                            size="lg"
                            class="h-12 w-full border-2 text-base font-semibold transition-all hover:bg-secondary/50">
                            <span class="flex-1 text-start">{{ loading === p.id ? t('loading') :
                                t(`provider.${p.id}`)
                                }}</span>
                            <Spinner v-if="loading === p.id" />
                            <Icon v-else :icon="p.icon" class="size-7" />
                        </Button>
                    </Motion>

                    <!-- Terms & Privacy -->
                    <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ delay: 0.6 }">
                        <div class="flex items-center justify-around text-sm">
                            <a href="https://rqeim.com/page/tos" target="_blank"
                                class="font-medium text-muted-foreground transition-colors hover:text-primary">
                                {{ t('terms') }}
                            </a>
                            <!-- Preferences -->
                            <Preferences>
                                <a class="cursor-pointer text-muted-foreground transition-colors hover:text-primary">
                                    {{ t('preferences') }}
                                </a>
                            </Preferences>
                            <a href="https://rqeim.com/page/privacy" target="_blank"
                                class="font-medium text-muted-foreground transition-colors hover:text-primary">
                                {{ t('privacy') }}
                            </a>
                        </div>
                    </Motion>
                </CardContent>
            </Card>
        </Motion>
    </Screen>
</template>

<i18n lang="json">{
    "ar": {
        "seo": {
            "title": "تسجيل الدخول",
            "desc": "سجّل دخولك إلى منصة رقيم الرقمية بأمان وسهولة"
        },
        "welcome": "مرحباً بك في رقيم",
        "subtitle": "اختر طريقة تسجيل الدخول",
        "continue": "المتابعة بالبريد الالكتروني",
        "or": "أو تابع باستخدام",
        "provider": {
            "google": "تسجيل الدخول بواسطة Google",
            "microsoft": "تسجيل الدخول بواسطة Microsoft",
            "apple": "تسجيل الدخول بواسطة Apple"
        },
        "terms": "شروط الاستخدام",
        "privacy": "سياسة الخصوصية",
        "loading": "جاري التحميل...",
        "preferences": "التفضيلات"
    },
    "en": {
        "seo": {
            "title": "Sign In",
            "desc": "Sign in to Rqeim platform securely and easily"
        },
        "welcome": "Welcome to Rqeim",
        "subtitle": "Choose your login method",
        "continue": "Continue with Email",
        "or": "Or continue with",
        "provider": {
            "google": "Sign in with Google",
            "microsoft": "Sign in with Microsoft",
            "apple": "Sign in with Apple"
        },
        "terms": "Terms of Use",
        "privacy": "Privacy Policy",
        "loading": "Loading...",
        "preferences": "Preferences"
    }
}</i18n>
