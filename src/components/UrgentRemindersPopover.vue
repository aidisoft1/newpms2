<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
      <div style="width:340px; max-height:420px; overflow:auto">
        <UrgentReminders />
      </div>
    </template>

  <a-badge :count="count" :offset="[0,8]">
      <a-button type="text" style="padding:6px">
        <BellOutlined style="font-size:20px; color:#333" />
      </a-button>
    </a-badge>
  </a-popover>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import UrgentReminders from './UrgentReminders.vue'

export default defineComponent({
  name: 'UrgentRemindersPopover',
  components: { UrgentReminders },
  setup() {
    // For now static count; could be derived from props or a store
    const count = computed(() => 3)
    return { count }
  }
})
</script>

<style scoped>
/* small adjustments for the popover trigger */
.a-badge .ant-badge-count {
  background: #f56a79;
  box-shadow: 0 0 0 2px rgba(245,106,121,0.08);
}
</style>
