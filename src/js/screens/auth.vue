<script setup>
import { IonRouterOutlet } from '@ionic/vue';
</script>

<template>
    <div
        class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div class="w-full max-w-sm">
            <ion-router-outlet />
        </div>
    </div>
</template>