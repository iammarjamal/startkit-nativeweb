<script setup lang="ts" vapor>
import { useNavigationLoader } from '@/@enpo/router/useNavigationLoader';

// نستدعي الحالة المشتركة
const { isMobileLoading } = useNavigationLoader();
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isMobileLoading" class="mobile-loading-overlay">
                <div class="glass-box">
                    <div class="spinner"></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.mobile-loading-overlay {
    position: fixed;
    inset: 0;
    /* رقم فلكي لضمان الظهور فوق IonModal و IonToast */
    z-index: 99999999 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    /* خلفية معتمة تمنع النقر على ما خلفها */
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: all;
    /* منع التفاعل مع التطبيق أثناء التحميل */
}

.glass-box {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    .glass-box {
        background: rgba(30, 30, 30, 0.85);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-left-color: #000000;
    /* لون التطبيق الرئيسي */
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@media (prefers-color-scheme: dark) {
    .spinner {
        border-color: rgba(255, 255, 255, 0.1);
        border-left-color: #ffffff;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Transition Effects */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>