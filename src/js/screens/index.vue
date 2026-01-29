<script setup lang="ts">
import EnpoLoading from "@/@enpo/components/enpo-loading/EnpoLoading.vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
    setTimeout(() => {
        router.replace("/auth");
    }, 2000);
});
</script>

<template>
    <div class="flex items-center justify-center h-screen">
        <EnpoLoading />
    </div>
</template>