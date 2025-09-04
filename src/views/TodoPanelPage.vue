<template>
  <div style="max-width:600px;margin:40px auto;">
    <TodoPanel />
  </div>
</template>

<script lang="ts">
import TodoPanel from '../components/TodoPanel.vue'

export default {
  name: 'TodoPanelPage',
  components: { TodoPanel }
}
</script>

<style scoped>
body { background: #f5f6fa; }
</style>
