<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { cn } from '@/lib/utils'
import { type LogoVariants, logoVariants } from '.'

// Import all logo and icon images from resources/assets
import iconDark from '@assets/images/icons/icon-dark.webp'
import iconLight from '@assets/images/icons/icon-light.webp'
import logoArDark from '@assets/images/logos/logo-ar-dark.webp'
import logoArLight from '@assets/images/logos/logo-ar-light.webp'
import logoEnDark from '@assets/images/logos/logo-en-dark.webp'
import logoEnLight from '@assets/images/logos/logo-en-light.webp'

interface Props {
  class?: HTMLAttributes['class']
  size?: LogoVariants['size']
  type?: 'logo' | 'icon'
  lang?: string
  theme?: 'dark' | 'light' | ''
  href?: string
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'logo',
  lang: '',
  theme: '',
  href: '/',
  asChild: false,
})

// reactive language (SSR/CSR safe)
const language = ref(props.lang || 'ar')
// reactive theme (SSR/CSR safe)
const isDark = ref(false)

function detectLanguage(): string {
  // 1. من props
  if (props.lang) return props.lang
  // 2. من مسار الرابط إذا كان url/{lang}/...
  if (typeof window !== 'undefined') {
    const match = window.location.pathname.match(/^\/?([a-zA-Z]{2})(\/|$)/)
    if (match && (match[1] === 'ar' || match[1] === 'en')) {
      return match[1]
    }
    // 3. من localStorage
    if (window.localStorage && localStorage.getItem('language')) {
      return localStorage.getItem('language') || 'ar'
    }
    // 4. من document.documentElement.lang
    if (window.document && document.documentElement.lang) {
      return document.documentElement.lang
    }
  }
  // 5. افتراضي
  return 'ar'
}

function detectTheme(): boolean {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
  }
  return false
}

// تحديث اللغة والثيم عند التركيب والتفاعل
onMounted(() => {
  language.value = detectLanguage()
  isDark.value = detectTheme()

  // تحديث عند تغيير اللغة في localStorage أو تغيير الثيم
  window.addEventListener('storage', (e) => {
    if (e.key === 'language') {
      language.value = detectLanguage()
    }
  })
  const observer = new MutationObserver(() => {
    isDark.value = detectTheme()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
})

const imagePath = computed(() => {
  // إذا كان هناك theme محدد، استخدمه
  const forcedTheme = props.theme === 'dark' || props.theme === 'light'
  const themeToUse = forcedTheme ? props.theme : isDark.value ? 'light' : 'dark'

  if (props.type === 'icon') {
    return themeToUse === 'dark' ? iconDark : iconLight
  }

  // Return imported logo based on language and theme
  if (language.value === 'ar') {
    return themeToUse === 'dark' ? logoArDark : logoArLight
  } else {
    return themeToUse === 'dark' ? logoEnDark : logoEnLight
  }
})

const altText = computed(() => `Logo ${language.value} ${isDark.value ? 'Light' : 'Dark'}`)
</script>

<template>
  <component :is="asChild ? 'div' : 'a'" :href="asChild ? undefined : href" data-slot="logo">
    <div :class="cn(logoVariants({ size }), props.class)">
      <Transition enter-active-class="transition-opacity duration-500 ease-in" enter-from-class="absolute opacity-0"
        enter-to-class="opacity-100">
        <img :key="imagePath" :src="imagePath" :alt="altText" class="h-full w-full object-contain" />
      </Transition>
    </div>
  </component>
</template>
