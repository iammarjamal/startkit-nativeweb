<!--
Usage:
<SplashScreen v-model:show="isLoading" :once="false" :time="1000" />
<SplashScreen :once="true" />
Props:
- time: مدة العرض بالمللي ثانية (افتراضي 2000)
- once: إذا true (افتراضي)، يظهر مرة واحدة فقط في الجلسة. إذا false يظهر كل مرة.
- modelValue: تحكم خارجي (boolean)، إذا true يظهر السبلاش (مطلوب مع once=false)
-->
<script setup lang="ts">
import { Logo } from '@/components/ui/logo'
import { Icon } from '@iconify/vue'
import { useSessionStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'

interface Props {
    time?: number
    once?: boolean
    modelValue?: boolean
}

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const props = withDefaults(defineProps<Props>(), {
    time: 2000,
    once: true,
    modelValue: undefined,
})

const visible = ref(false)
const isDark = ref(false)
const splashShown = useSessionStorage<boolean | null>('splashShown', null)

function detectTheme(): boolean {
    if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
    }
    return false
}

function showSplash() {
    visible.value = true
    setTimeout(() => {
        visible.value = false
        if (props.modelValue !== undefined) {
            emit('update:modelValue', false)
        } else if (props.once) {
            splashShown.value = true
        }
    }, props.time)
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        isDark.value = detectTheme()
        const observer = new MutationObserver(() => {
            isDark.value = detectTheme()
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
        if (props.modelValue !== undefined) {
            if (props.modelValue) showSplash()
        } else if (props.once) {
            if (!splashShown.value) showSplash()
        } else {
            showSplash()
        }
    }
})

watch(
    () => props.modelValue,
    (val) => {
        if (val) showSplash()
    },
)
</script>

<template>
    <Teleport to="body">
        <div v-if="props.modelValue !== undefined ? visible : visible"
            :class="['fixed inset-0 z-[999999] flex items-center justify-center', isDark ? 'bg-opacity-90 bg-black' : 'bg-opacity-90 bg-white']"
            data-slot="splash-screen">
            <div class="relative flex flex-col items-center justify-center">
                <div class="absolute inset-0 z-10 m-auto flex h-24 w-24 items-center justify-center rounded-full">
                    <Logo type="icon" :theme="isDark ? 'light' : 'dark'" as-child />
                </div>
                <Icon icon="svg-spinners:pulse-multiple" :class="[isDark ? 'text-white' : 'text-black', 'opacity-50']"
                    style="font-size: 24rem" />
            </div>
        </div>
    </Teleport>
</template>
