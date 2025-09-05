<template>
  <div class="fee-status-main">
    <!-- 顶部筛选区 -->
    <div class="fee-status-header">
      <a-space>
        <a-select v-model:value="selectedArea" style="width: 120px" placeholder="管理区">
          <a-select-option value="">全部管理区</a-select-option>
          <a-select-option v-for="area in areas" :key="area" :value="area">{{ area }}</a-select-option>
        </a-select>
        <a-select v-model:value="selectedBuilding" style="width: 120px" placeholder="楼宇">
          <a-select-option value="">全部楼宇</a-select-option>
          <a-select-option v-for="building in buildings" :key="building" :value="building">{{ building }}</a-select-option>
        </a-select>
        <a-select v-model:value="selectedStatus" style="width: 120px" placeholder="缴费状态">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="paid">已缴费</a-select-option>
          <a-select-option value="unpaid">未缴费</a-select-option>
          <a-select-option value="reduced">减免</a-select-option>
          <a-select-option value="discount">优惠</a-select-option>
        </a-select>
        <a-button type="primary" @click="queryData">查询</a-button>
        <a-tooltip :title="canPushWeChat ? '' : '请先查询出未缴费的房间后再推送账单'">
          <a-button
            style="margin-left:8px; background:#1AAD19; border-color:#1AAD19; color:#fff;"
            :disabled="!canPushWeChat"
            @click="showWeChatConfirm = true"
          >
            <svg t="1692268888888" class="icon" viewBox="0 0 1024 1024" width="16" height="16" style="vertical-align:middle;margin-right:4px;"><path d="M512 64C264.6 64 64 234.7 64 448c0 99.2 51.2 188.2 135.2 250.2-7.2 25.2-23.2 81.2-25.2 88.2-4 12.2 4.2 12.2 8.2 11.2 3.2-0.8 80.2-26.2 110.2-36.2 38.2 10.2 79.2 16.6 123.6 16.6 247.4 0 448-170.7 448-384S759.4 64 512 64z m-128 384c-26.4 0-48-21.6-48-48s21.6-48 48-48 48 21.6 48 48-21.6 48-48 48z m256 0c-26.4 0-48-21.6-48-48s21.6-48 48-48 48 21.6 48 48-21.6 48-48 48z" fill="#fff"/></svg>
            一键微信推送账单
          </a-button>
        </a-tooltip>
  <a-modal v-model:open="showWeChatConfirm" title="微信推送确认" @ok="pushWeChat" @cancel="showWeChatConfirm = false" ok-text="确定" cancel-text="取消">
          是否推送未缴费账单到微信？
        </a-modal>
      </a-space>
    </div>

    <!-- 房屋缴费状态区 -->
    <div class="fee-status-houses">
      <div class="house-grid">
        <div v-for="house in houses" :key="house.number" class="house-block" :class="house.status">
          <span class="house-number">{{ house.number }}</span>
          <span class="house-status">{{ statusLabelMap[house.status] }}</span>
        </div>
      </div>
    </div>

    <!-- 数据卡片区 -->
    <div class="fee-status-cards">
      <div class="data-card" v-for="card in dataCards" :key="card.label" :style="{background: card.color}">
        <div class="card-value">{{ card.value }}</div>
        <div class="card-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="fee-status-charts">
      <div class="chart-block">
        <div class="chart-title">近六个月收支趋势</div>
        <v-chart :option="lineOption" autoresize style="height:260px;" />
      </div>
      <div class="chart-block">
        <div class="chart-title">本月费用项目分析</div>
        <v-chart :option="barOption" autoresize style="height:260px;" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { ref, computed, getCurrentInstance } from 'vue'
// 微信推送确认弹窗开关
const showWeChatConfirm = ref(false)
// 只有查询结果有未缴费房间时，推送按钮才可用
const canPushWeChat = computed(() => houses.value.some(h => h.status === 'unpaid'))
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

// 注册 VChart 组件（适配 <script setup> 场景）
const instance = getCurrentInstance()
if (instance) {
  instance.appContext.app.component('v-chart', VChart)
}

const areas = ref(['一区', '二区'])
const buildings = ref(['A栋', 'B栋'])
const selectedArea = ref('')
const selectedBuilding = ref('')
const selectedStatus = ref('')

// map internal status keys -> label
const statusLabelMap: Record<string, string> = {
  paid: '已缴费',
  unpaid: '未缴费',
  reduced: '减免',
  discount: '优惠'
}
const statusColorMap: Record<string, string> = {
  paid: '#52c41a',      // 绿色
  unpaid: '#faad14',   // 黄色
  reduced: '#1890ff',  // 蓝色
  discount: '#ff6f61'  // 红橙色
}

// 房屋数据
const allHouses = [
  { number: 'A-1-101', status: 'paid' },
  { number: 'A-1-102', status: 'unpaid' },
  { number: 'A-1-103', status: 'discount' },
  { number: 'A-1-104', status: 'paid' },
  { number: 'A-1-105', status: 'reduced' },
  { number: 'A-2-201', status: 'paid' },
  { number: 'A-2-202', status: 'unpaid' },
  { number: 'A-2-203', status: 'discount' },
  { number: 'A-2-204', status: 'paid' },
  { number: 'A-2-205', status: 'reduced' },
  { number: 'B-1-101', status: 'paid' },
  { number: 'B-1-102', status: 'unpaid' },
  { number: 'B-1-103', status: 'discount' },
  { number: 'B-1-104', status: 'paid' },
  { number: 'B-1-105', status: 'reduced' },
  { number: 'B-2-201', status: 'paid' },
  { number: 'B-2-202', status: 'unpaid' },
  { number: 'B-2-203', status: 'discount' },
  { number: 'B-2-204', status: 'paid' },
  { number: 'B-2-205', status: 'reduced' }
]
const houses = ref([...allHouses])


// 数据卡片
const dataCards = [
  { label: '本月已收', value: '¥120,000', color: '#e6f7ff' },
  { label: '本月应收', value: '¥150,000', color: '#fffbe6' },
  { label: '本月未收', value: '¥30,000', color: '#fff0f6' },
  { label: '退租客户', value: '3', color: '#f0fffb' },
  { label: '收缴率', value: '80%', color: '#f6ffed' },
  { label: '入住率', value: '92%', color: '#f9f0ff' }
]

// 图表数据
const lineOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['3月','4月','5月','6月','7月','8月'] },
  yAxis: { type: 'value' },
  legend: { data: ['收入','支出'] },
  series: [
    { name: '收入', type: 'line', data: [120000, 130000, 125000, 140000, 135000, 150000], smooth: true },
    { name: '支出', type: 'line', data: [80000, 90000, 85000, 95000, 90000, 100000], smooth: true }
  ]
}
const barColors = ['#1890ff', '#52c41a', '#faad14', '#ff6f61', '#13c2c2', '#b37feb']
const barOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['水费','电费','物业费','维修费','保洁费','其他'] },
  yAxis: { type: 'value' },
  series: [
    { name: '金额', type: 'bar', data: [20000, 25000, 60000, 8000, 5000, 12000],
      itemStyle: {
        color: function(params: { dataIndex: number }) {
          return barColors[params.dataIndex % barColors.length]
        }
      },
      barWidth: 32 }
  ]
}

function queryData() {
  houses.value = allHouses.filter(h => {
    // 管理区筛选
    if (selectedArea.value && !h.number.startsWith(selectedArea.value[0])) return false;
    // 楼宇筛选
    if (selectedBuilding.value && !h.number.startsWith(selectedBuilding.value[0])) return false;
    // 状态筛选
    if (selectedStatus.value && h.status !== selectedStatus.value) return false;
    return true;
  });
}
function pushWeChat() {
  // 推送逻辑
}
</script>

<style scoped>
.fee-status-main { max-width: 1200px; margin: 0 auto; padding: 16px 8px; }
.fee-status-header { margin-bottom: 18px; }
.fee-status-houses { margin-bottom: 24px; }
.house-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 12px;
}
.house-block {
  flex: 1;
  min-width: 56px;
  max-width: 70px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.house-block.paid { background: #e6fffb; color: #52c41a; border: 1px solid #b7eb8f; }
.house-block.unpaid { background: #fffbe6; color: #faad14; border: 1px solid #ffe58f; }
.house-block.reduced { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.house-block.discount { background: #fff0f6; color: #ff6f61; border: 1px solid #ffadd2; }
.house-number {
  font-weight: 500;
  font-size: 13px;
  display: block;
  word-break: break-all;
}
.house-status {
  font-size: 12px;
  margin-top: 2px;
  display: block;
}
.fee-status-cards { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 28px; }
.data-card {
  flex: 1 1 140px;
  min-width: 140px;
  max-width: 180px;
  border-radius: 10px;
  padding: 18px 0 10px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.card-value { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
.card-label { font-size: 13px; color: #666; }
.fee-status-charts { display: flex; gap: 32px; }
.chart-block { flex: 1; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 12px 12px 0 12px; }
.chart-title { font-size: 15px; font-weight: 500; color: #333; margin-bottom: 8px; }
</style>
