<template>
  <a-card class="quick-card" bordered :body-style="{ padding: '8px' }">
    <div class="quick-grid">
      <a-tooltip v-for="act in actions" :key="act.key" :title="act.label">
        <div class="quick-item" @click="onClick(act)">
          <component :is="act.icon" class="quick-icon" :style="{ color: act.color }" />
          <div class="quick-label">{{ act.short }}</div>
        </div>
      </a-tooltip>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import type { Component } from 'vue'

interface Action {
  key: string
  label: string
  short: string
  icon: Component | string
  color: string
  route?: string
}

const router = useRouter()

const actions: Action[] = [
  { key: 'users', label: '新增客户', short: '新增', icon: 'UserOutlined', color: '#722ed1', route: '/customers/info' },
  { key: 'readings', label: '抄表录入', short: '抄表', icon: 'ReadOutlined', color: '#ff7a00', route: '/finance/charging/readingsEntry' },
  { key: 'repairs', label: '报修受理', short: '报修', icon: 'ToolOutlined', color: '#fa8c16', route: '/service/repair' },
  { key: 'charging', label: '收费管理', short: '收费', icon: 'WalletOutlined', color: '#52c41a', route: '/finance/charging' },
  { key: 'contracts', label: '合同管理', short: '合同', icon: 'FileTextOutlined', color: '#2f54eb', route: '/leasing/contract' },
  { key: 'analytics', label: '数据分析', short: '分析', icon: 'BarChartOutlined', color: '#13c2c2', route: '/datahub/analytics' }
]

function onClick(a: Action) {
  if (a.route) router.push(a.route)
}
</script>

<style scoped>
.quick-card { border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.quick-grid { display:flex; gap:8px; align-items:center }
.quick-item { display:flex; flex-direction:column; align-items:center; justify-content:center; width:56px; cursor:pointer }
.quick-icon { font-size:20px; width:28px; height:28px }
.quick-label { font-size:11px; color:#555; margin-top:4px }

@media (max-width: 600px) {
  .quick-item { width:44px }
  .quick-icon { font-size:18px }
}
</style>
