<template>
  <div>
    <h3>{{ title }}</h3>
    <p>页面占位符：{{ key }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PlaceholderView',
  props: {
    title: { type: String, default: '' },
    key: { type: String, default: '' }
  }
})
</script>
