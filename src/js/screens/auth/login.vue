<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Motion } from 'motion-v';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Screen } from '@/components/ui/screen';


const { t } = useI18n();
const router = useRouter();

const form = ref({
    email: '',
    processing: false,
    errors: { email: '' }
});

const submit = () => {
    form.value.processing = true;
    form.value.errors.email = '';

    const go = () => {
        // Mock API call
        setTimeout(() => {
            form.value.processing = false;
            // Navigate to verify page with email param
            router.push({ path: '/auth/verify', query: { email: form.value.email } });
        }, 1500);
    };

    // Custom View Transition
    if (document.startViewTransition) {
        document.startViewTransition(go);
    } else {
        go();
    }
};

// Animation config
const ease = [0.25, 0.1, 0.25, 1] as const;
const cardAnim = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};
const inputAnim = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.3, ease } },
};
const btnAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3, ease } },
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95, transition: { duration: 0.1 } },
};
</script>

<template>
    <Screen :canBack="true">
        <Motion class="flex pb-24 h-full items-center justify-center px-4" :initial="cardAnim.initial"
            :animate="cardAnim.animate">
            <Card class="w-full max-w-md border-none bg-transparent shadow-none">
                <CardHeader class="flex flex-col items-center justify-center space-y-4 pb-2 text-center">
                    <!-- Auth Icon - View Transition Named -->
                    <div
                        class="auth-icon mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-black p-2 dark:bg-white">
                        <Icon icon="solar:letter-bold" class="size-7 text-white dark:text-black" />
                    </div>

                    <!-- Auth Title - View Transition Named -->
                    <CardTitle
                        class="auth-title bg-gradient-to-r from-primary to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl dark:to-zinc-400">
                        {{ t('title') }}
                    </CardTitle>
                    <CardDescription class="px-2 text-base leading-relaxed text-muted-foreground">
                        {{ t('subtitle') }}
                    </CardDescription>
                </CardHeader>

                <!-- Auth Content - View Transition Named -->
                <CardContent class="auth-content">
                    <form @submit.prevent="submit" class="space-y-6">
                        <!-- Error -->
                        <Motion v-if="form.errors.email" :initial="{ opacity: 0, height: 0 }"
                            :animate="{ opacity: 1, height: 'auto' }">
                            <Alert variant="destructive" class="border-destructive/20">
                                <Icon icon="solar:danger-bold" class="size-4" />
                                <AlertDescription>{{ form.errors.email }}</AlertDescription>
                            </Alert>
                        </Motion>

                        <!-- Email Input -->
                        <Motion :initial="inputAnim.initial" :animate="inputAnim.animate" class="space-y-2">
                            <Label for="email" class="flex items-center gap-1 text-sm font-semibold">
                                {{ t('email') }}<span class="text-destructive">*</span>
                            </Label>
                            <div class="relative">
                                <Input id="email" type="email" inputmode="email" autocomplete="email"
                                    v-model="form.email" :placeholder="t('placeholder')"
                                    class="h-12 border-2 ps-12 text-base transition-all focus:border-primary/50"
                                    :disabled="form.processing" required />
                                <Icon icon="solar:letter-line-duotone"
                                    class="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </Motion>

                        <!-- Submit -->
                        <Motion v-bind="btnAnim">
                            <Button type="submit" :disabled="form.processing" size="lg"
                                class="h-12 w-full bg-gradient-to-r from-primary to-primary/90 text-base font-semibold shadow-lg transition-all hover:from-primary/90 hover:to-primary hover:shadow-xl disabled:opacity-50">
                                <span class="flex-1 text-start">{{ form.processing ? t('sending') : t('send')
                                }}</span>
                                <Spinner v-if="form.processing" />
                                <Icon v-else icon="solar:plain-2-bold" class="size-5" />
                            </Button>
                        </Motion>
                    </form>

                    <!-- Info -->
                    <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ delay: 0.5 }"
                        class="mt-6 text-center">
                        <p class="text-sm leading-relaxed text-muted-foreground">{{ t('info') }}</p>
                    </Motion>

                    <!-- Security Tip -->
                    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.6 }"
                        class="mt-6 flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                        <Icon icon="solar:shield-warning-bold" class="size-4 text-amber-600 dark:text-amber-400" />
                        <span class="text-xs font-medium text-amber-700 dark:text-amber-300">{{ t('tip')
                        }}</span>
                    </Motion>
                </CardContent>
            </Card>
        </Motion>
    </Screen>
</template>

<i18n lang="json">{
    "ar": {
        "seo": {
            "title": "تسجيل الدخول بالبريد",
            "desc": "أدخل بريدك الإلكتروني لتلقي رمز التحقق الآمن"
        },
        "title": "تسجيل الدخول",
        "subtitle": "أدخل بريدك الإلكتروني للمتابعة",
        "email": "البريد الإلكتروني",
        "placeholder": "أدخل بريدك الإلكتروني",
        "send": "إرسال رمز التحقق",
        "sending": "جاري الإرسال...",
        "info": "سيتم إرسال رمز تحقق مكون من 6 أرقام إلى بريدك",
        "tip": "لا تشارك رمز التحقق مع أي شخص — رقيم لن تطلبه منك أبداً"
    },
    "en": {
        "seo": {
            "title": "Email Login",
            "desc": "Enter your email to receive a secure verification code"
        },
        "title": "Login",
        "subtitle": "Enter your email to continue",
        "email": "Email",
        "placeholder": "Enter your email",
        "send": "Send verification code",
        "sending": "Sending...",
        "info": "A 6-digit verification code will be sent to your email",
        "tip": "Never share your code with anyone — Rqeim will never ask for it"
    }
}</i18n>
