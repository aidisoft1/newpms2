<template>
  <component :is="Inner" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const Inner = defineAsyncComponent(() => import('../public.consult.vue'))
</script>
