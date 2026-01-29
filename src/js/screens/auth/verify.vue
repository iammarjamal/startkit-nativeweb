<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Motion } from 'motion-v';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Screen } from '@/@enpo/components/screen';


interface Props {
    email?: string;
    errors?: Record<string, string>;
}
const props = withDefaults(defineProps<Props>(), { email: '', errors: () => ({}) });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Timer (10 min)
const timeLeft = ref(600);
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
    timer = setInterval(() => timeLeft.value > 0 && timeLeft.value--, 1000);
});
onUnmounted(() => timer && clearInterval(timer));
const formattedTime = computed(
    () => `${Math.floor(timeLeft.value / 60)}:${(timeLeft.value % 60).toString().padStart(2, '0')}`
);

// Forms
const getEmail = () => {
    const emailParam = route.query.email as string;
    return emailParam || props.email || '';
};

const form = ref({
    email: '',
    otp: [] as string[],
    processing: false,
    errors: { otp: '' }
});

const resendForm = ref({
    email: '',
    processing: false
});

onMounted(() => {
    form.value.email = resendForm.value.email = getEmail();
});

const otpStr = computed(() => form.value.otp.join(''));

// OTP input focus state
const focusedIndex = ref<number | null>(null);

const submitOtp = () => {
    form.value.processing = true;
    form.value.errors.otp = '';

    const go = () => {
        // Mock verify API
        setTimeout(() => {
            form.value.processing = false;
            // Navigate to home or dashboard
            router.push('/');
        }, 1500);
    };

    // Custom View Transition
    if (document.startViewTransition) {
        document.startViewTransition(go);
    } else {
        go();
    }
};

const resend = () => {
    timeLeft.value = 600;
    resendForm.value.processing = true;
    setTimeout(() => {
        resendForm.value.processing = false;
        // Mock resend success
    }, 1000);
};

// OTP input handlers
const handleOtpInput = (e: Event, index: number) => {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    form.value.otp[index] = val;
    if (val && index < 5) {
        const inputs = document.querySelectorAll('.otp-input');
        (inputs[index + 1] as HTMLInputElement)?.focus();
    }
};

const handleOtpBackspace = (index: number) => {
    if (!form.value.otp[index] && index > 0) {
        const inputs = document.querySelectorAll('.otp-input');
        (inputs[index - 1] as HTMLInputElement)?.focus();
    }
};

// Animations
const ease = [0.25, 0.1, 0.25, 1] as const;
const cardAnim = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};
const otpAnim = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.4, ease } },
};
const btnAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3, ease } },
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95, transition: { duration: 0.1 } },
};
const slotAnim = (index: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: {
        opacity: 1,
        y: 0,
        scale: focusedIndex.value === index ? 1.1 : 1,
        transition: { delay: 0.3 + index * 0.05, duration: 0.3, ease },
    },
    whileHover: { scale: 1.05, transition: { duration: 0.15 } },
    whileTap: { scale: 0.95 },
});
</script>

<template>
    <Screen :canBack="true">
        <Motion class="flex h-full items-center justify-center px-4" :initial="cardAnim.initial"
            :animate="cardAnim.animate">
            <Card class="w-full max-w-md border-none bg-transparent shadow-none">
                <CardHeader class="flex flex-col items-center justify-center space-y-4 pb-2 text-center">
                    <!-- Auth Icon - View Transition Named -->
                    <Motion :initial="{ scale: 0.8, rotate: -10, opacity: 0 }"
                        :animate="{ scale: 1, rotate: 0, opacity: 1 }"
                        :transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }"
                        class="auth-icon mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-black p-2 dark:bg-white">
                        <Icon icon="solar:shield-keyhole-bold" class="size-7 text-white dark:text-black" />
                    </Motion>

                    <!-- Auth Title - View Transition Named -->
                    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.3, duration: 0.4 }">
                        <CardTitle
                            class="auth-title bg-gradient-to-r from-primary to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl dark:to-zinc-400">
                            {{ t('title') }}
                        </CardTitle>
                    </Motion>

                    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.4, duration: 0.4 }">
                        <CardDescription class="px-2 text-base leading-relaxed text-muted-foreground">
                            {{ t('subtitle') }}<br />
                            <span class="font-semibold text-foreground">{{ form.email || props.email }}</span>
                        </CardDescription>
                    </Motion>
                </CardHeader>

                <!-- Auth Content - View Transition Named -->
                <CardContent class="auth-content space-y-6">
                    <form class="space-y-6" @submit.prevent="submitOtp">
                        <!-- Error -->
                        <Motion v-if="form.errors.otp || props.errors?.otp"
                            :initial="{ opacity: 0, height: 0, scale: 0.95 }"
                            :animate="{ opacity: 1, height: 'auto', scale: 1 }" :transition="{ duration: 0.3 }">
                            <Alert variant="destructive" class="border-destructive/20">
                                <Icon icon="solar:danger-bold" class="size-4" />
                                <AlertDescription>{{ form.errors.otp || props.errors?.otp }}</AlertDescription>
                            </Alert>
                        </Motion>

                        <!-- OTP Input with Motion -->
                        <Motion :initial="otpAnim.initial" :animate="otpAnim.animate" dir="ltr"
                            class="flex justify-center">
                            <div class="flex gap-2">
                                <Motion v-for="i in 6" :key="i" :initial="slotAnim(i - 1).initial"
                                    :animate="slotAnim(i - 1).animate" :whileHover="slotAnim(i - 1).whileHover"
                                    :whileTap="slotAnim(i - 1).whileTap">
                                    <input type="text" inputmode="numeric" maxlength="1" :value="form.otp[i - 1] || ''"
                                        @input="handleOtpInput($event, i - 1)" @focus="focusedIndex = i - 1"
                                        @blur="focusedIndex = null" @keydown.backspace="handleOtpBackspace(i - 1)"
                                        class="otp-input h-14 w-12 rounded-xl border-2 bg-background text-center text-xl font-bold transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                        :class="[
                                            focusedIndex === i - 1
                                                ? 'border-primary shadow-lg shadow-primary/20'
                                                : 'border-muted-foreground/30',
                                            form.otp[i - 1] ? 'border-primary/50 bg-primary/5' : '',
                                        ]" />
                                </Motion>
                            </div>
                        </Motion>

                        <!-- Timer -->
                        <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                            :transition="{ delay: 0.5, duration: 0.3 }" class="text-center">
                            <div class="flex items-center justify-center gap-2">
                                <Motion :animate="{ rotate: timeLeft <= 60 ? [0, -10, 10, -10, 10, 0] : 0 }"
                                    :transition="{ duration: 0.5, repeat: timeLeft <= 60 ? Infinity : 0, repeatDelay: 2 }">
                                    <Icon icon="solar:clock-circle-bold"
                                        :class="['size-4', timeLeft <= 60 ? 'text-destructive' : 'text-muted-foreground']" />
                                </Motion>
                                <span
                                    :class="['text-sm font-medium', timeLeft <= 60 ? 'text-destructive' : 'text-muted-foreground']">
                                    {{ t('expires') }} {{ formattedTime }}
                                </span>
                            </div>
                        </Motion>

                        <!-- Verify -->
                        <Motion v-bind="btnAnim">
                            <Button type="submit" :disabled="otpStr.length !== 6 || form.processing || timeLeft === 0"
                                size="lg"
                                class="h-12 w-full bg-gradient-to-r from-primary to-primary/90 text-base font-semibold shadow-lg transition-all hover:from-primary/90 hover:to-primary hover:shadow-xl disabled:opacity-50">
                                <span class="flex-1 text-start">{{ form.processing ? t('verifying') :
                                    t('verify')
                                    }}</span>
                                <Spinner v-if="form.processing" />
                                <Icon v-else icon="solar:check-circle-bold" class="size-5" />
                            </Button>
                        </Motion>
                    </form>

                    <!-- Resend -->
                    <form @submit.prevent="resend">
                        <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                            :transition="{ delay: 0.6, duration: 0.3 }" class="text-center">
                            <p class="mb-3 text-sm text-muted-foreground">{{ t('didnt_receive') }}</p>
                            <Motion :whileHover="{ scale: 1.02 }" :whileTap="{ scale: 0.95 }">
                                <Button variant="outline" type="submit"
                                    :disabled="resendForm.processing || timeLeft > 540"
                                    class="h-10 border-2 px-6 transition-all hover:bg-secondary/50">
                                    <span class="flex-1 text-start">
                                        {{ resendForm.processing ? t('sending') : t('resend') }}
                                        <span v-if="timeLeft > 540" class="ms-1">
                                            ({{ Math.floor((timeLeft - 540) / 60) }}:{{
                                                ((timeLeft - 540) % 60).toString().padStart(2, '0')
                                            }})
                                        </span>
                                    </span>
                                    <Spinner v-if="resendForm.processing" class="size-4" />
                                    <Icon v-else icon="solar:refresh-broken" class="size-4" />
                                </Button>
                            </Motion>
                        </Motion>
                    </form>

                    <!-- Security Tip -->
                    <Motion :initial="{ opacity: 0, y: 20, scale: 0.95 }" :animate="{ opacity: 1, y: 0, scale: 1 }"
                        :transition="{ delay: 0.7, duration: 0.4 }" :whileHover="{ scale: 1.02 }"
                        class="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                        <Motion :animate="{ rotate: [0, -5, 5, -5, 5, 0] }"
                            :transition="{ duration: 0.5, delay: 1, repeat: Infinity, repeatDelay: 5 }">
                            <Icon icon="solar:shield-warning-bold" class="size-4 text-amber-600 dark:text-amber-400" />
                        </Motion>
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
            "title": "التحقق من البريد",
            "desc": "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني"
        },
        "title": "تحقق من بريدك",
        "subtitle": "أدخل رمز التحقق المرسل إلى:",
        "expires": "ينتهي الرمز خلال",
        "verify": "تحقق",
        "verifying": "جاري التحقق...",
        "didnt_receive": "لم تستلم الرمز؟",
        "resend": "إعادة الإرسال",
        "sending": "جاري الإرسال...",
        "tip": "لا تشارك هذا الرمز مع أي شخص — رقيم لن تطلبه منك أبداً"
    },
    "en": {
        "seo": {
            "title": "Verify Email",
            "desc": "Enter the verification code sent to your email"
        },
        "title": "Verify your email",
        "subtitle": "Enter the code sent to:",
        "expires": "Code expires in",
        "verify": "Verify",
        "verifying": "Verifying...",
        "didnt_receive": "Didn't receive it?",
        "resend": "Resend code",
        "sending": "Sending...",
        "tip": "Never share this code — Rqeim will never ask for it"
    }
}</i18n>

<style scoped>
.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
