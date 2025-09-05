<template>
  <div>
    <h2>快捷操作</h2>
    <a-row :gutter="16" align="middle">
      <a-col :xs="12" :sm="8" :md="6" :lg="4" v-for="item in items" :key="item.key">
        <a-card hoverable class="dash-action-card" @click="onClick(item)" :style="{ background: `linear-gradient(135deg, ${item.color}12, ${item.color}06)` }">
          <div class="dash-action-inner">
            <div class="icon-bg" :style="{ background: item.color }">
              <component :is="item.icon" class="dash-icon" />
            </div>
            <div class="dash-label">{{ item.label }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <!-- Todo panel: placed under quick actions -->
    <div style="margin-top:16px">
      <TodoPanel />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import TodoPanel from '../components/TodoPanel.vue'

export default defineComponent({
  name: 'DashboardView',
  components: { TodoPanel },
  setup() {
    const router = useRouter()
    const items = [
      { key: 'roomQuery', label: '房间查询', icon: 'ApartmentOutlined', color: '#1e9fff', route: '/resources/room' },
      { key: 'addCustomer', label: '添加客户', icon: 'UserAddOutlined', color: '#722ed1', route: '/customers/info' },
      { key: 'payment', label: '缴费登记', icon: 'PayCircleOutlined', color: '#52c41a', route: '/finance/charging' },
      { key: 'contract', label: '合同登记', icon: 'FileTextOutlined', color: '#2f54eb', route: '/leasing/contract' },
      { key: 'repair', label: '报修登记', icon: 'ToolOutlined', color: '#fa8c16', route: '/service/repair' },
      { key: 'inspection', label: '巡检任务', icon: 'CheckCircleOutlined', color: '#13c2c2', route: '/app.inspection' }
    ]

    function onClick(item: any) {
      if (item.route) router.push(item.route)
    }

    return { items, onClick }
  }
})
</script>

<style scoped>
.dash-card { border-radius: 12px }
.dash-action { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; cursor:pointer }
.dash-icon { font-size:28px }
.dash-label { margin-top:8px; font-size:13px }
.dash-action-card { border-radius:10px; text-align:center; padding:12px; transition: transform .12s, box-shadow .12s }
.dash-action-card:hover { transform: translateY(-6px); box-shadow: 0 10px 20px rgba(0,0,0,0.12) }
.dash-action-inner { display:flex; flex-direction:column; align-items:center }
.dash-action-card .dash-icon { font-size:26px }
.dash-action-card .dash-label { margin-top:8px; font-size:13px; color:#333 }
.icon-bg { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 18px rgba(16,24,40,0.06); }
.dash-action-card { background-clip: padding-box }
.dash-action-card .dash-icon { color: #fff }

@media (max-width: 600px) {
  .icon-bg { width:48px; height:48px }
  .dash-action-card .dash-icon { font-size:20px }
}
</style>
