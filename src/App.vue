<template>
  <a-config-provider :locale="zhCN">
    <div id="app" style="height:100vh; display:flex">
      <Layout />
    </div>
  </a-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Layout from './components/MainLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

export default defineComponent({
  components: { Layout },
  setup() {
    return { zhCN }
  }
})
</script>
