<script setup lang="ts">
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
    setTimeout(() => {
        router.push("/auth");
    }, 2000);
});
</script>

<template>
    <div class="flex items-center justify-center h-screen">
        <Spinner class="size-12" />
    </div>
</template>