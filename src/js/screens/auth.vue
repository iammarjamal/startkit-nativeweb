<script setup lang="ts">
import { RouterView } from "@/components/ui/router-app";
</script>

<template>
    <div
        class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div class="w-full max-w-sm">
            <RouterView />
        </div>
    </div>
</template>