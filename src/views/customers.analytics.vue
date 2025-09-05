<template>
  <div class="analytics-page">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="margin:0">客户数据分析（MVP）</h2>
      <div style="display:flex;gap:8px;align-items:center">
        <a-range-picker v-model:value="range" />
        <a-button @click="refresh">刷新</a-button>
        <a-button type="primary" @click="exportCSV">导出 CSV</a-button>
      </div>
    </div>

  <a-row :gutter="16" style="margin-bottom:16px">
      <a-col :span="6">
        <a-card size="small">
          <div style="color:#666">客户总数</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px">{{ overview.totalCustomers }}</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card size="small">
          <div style="color:#666">当期缴费率</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px">{{ (overview.paidRate * 100).toFixed(1) }}%</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card size="small">
          <div style="color:#666">本月投诉数</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px">{{ overview.complaints }}</div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card size="small">
          <div style="color:#666">活跃用户率</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px">{{ (overview.activeRate * 100).toFixed(1) }}%</div>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16">
      <a-col :span="16">
        <a-card size="small">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-weight:600">缴费行为趋势</div>
            <div style="display:flex;align-items:center;gap:12px">
              <a-radio-group v-model:value="granularity">
                <a-radio-button value="day">按天</a-radio-button>
                <a-radio-button value="week">按周</a-radio-button>
                <a-radio-button value="month">按月</a-radio-button>
              </a-radio-group>
              <div style="color:#888;font-size:12px">粒度：{{ granularity }}</div>
            </div>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card size="small" style="margin-bottom:12px">
          <div style="font-weight:600;margin-bottom:8px">投诉/服务请求类型占比</div>
          <div ref="complaintsPieRef" style="height:220px"></div>
        </a-card>

        <a-card size="small">
          <div style="font-weight:600;margin-bottom:8px">按楼栋投诉排行</div>
          <div ref="complaintsBarRef" style="height:220px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-drawer v-model:visible="drillDrawerVisible" title="投诉明细" width="640" :destroyOnClose="true">
      <a-table :data-source="drillList" :columns="drillColumns" row-key="id" size="small" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

// 日期范围，默认近 30 天（使用 dayjs，兼容 AntD v3）
const end = dayjs()
const start = end.subtract(29, 'day')
const range = ref<any>([start, end])

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

// mock data generator using dayjs
function genTimeSeries(from: dayjs.Dayjs, to: dayjs.Dayjs) {
  const list: { date: string; amount: number }[] = []
  let d = from.clone()
  while (d.isBefore(to) || d.isSame(to, 'day')) {
    list.push({ date: d.format('YYYY-MM-DD'), amount: Math.round(5000 + Math.random() * 5000) })
    d = d.add(1, 'day')
  }
  return list
}

const seriesData = ref(genTimeSeries(start, end))

const overview = ref({ totalCustomers: 1200, paidRate: 0.92, complaints: 18, activeRate: 0.68 })

// granularity state: day|week|month
const granularity = ref<'day'|'week'|'month'>('day')

// complaints charts refs
const complaintsPieRef = ref<HTMLDivElement | null>(null)
const complaintsBarRef = ref<HTMLDivElement | null>(null)
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

// drill drawer and data
const drillDrawerVisible = ref(false)
const drillList = ref<any[]>([])
const drillColumns = [
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '楼栋', dataIndex: 'building', key: 'building' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '详情', dataIndex: 'detail', key: 'detail' }
]

// mock complaints data
const complaintsData = ref([
  { type: '卫生', count: 12 },
  { type: '安保', count: 6 },
  { type: '维修', count: 8 },
])

const complaintsByBuilding = ref([
  { building: '楼宇A1', count: 8 },
  { building: '楼宇A2', count: 6 },
  { building: '楼宇B1', count: 4 }
])

function buildComplaintsCharts() {
  try {
    if (complaintsPieRef.value) {
      pieChart = echarts.init(complaintsPieRef.value)
      pieChart.setOption({
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', radius: '60%', data: complaintsData.value.map(i => ({ name: i.type, value: i.count })) }]
      })
      pieChart.off('click')
      pieChart.on('click', (params: any) => {
        openDrillByType(params.name)
      })
    }

    if (complaintsBarRef.value) {
      barChart = echarts.init(complaintsBarRef.value)
      barChart.setOption({
        xAxis: { type: 'category', data: complaintsByBuilding.value.map(i => i.building) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: complaintsByBuilding.value.map(i => i.count) }]
      })
      barChart.off('click')
      barChart.on('click', (params: any) => {
        openDrillByBuilding(params.name)
      })
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('complaints chart error', err)
  }
}

function openDrillByType(type: string) {
  // mock drill list
  drillList.value = [
    { id: 1, time: dayjs().format('YYYY-MM-DD HH:mm'), building: '楼宇A1', type, detail: '示例投诉内容 A' },
    { id: 2, time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'), building: '楼宇A2', type, detail: '示例投诉内容 B' }
  ]
  drillDrawerVisible.value = true
}

function openDrillByBuilding(building: string) {
  drillList.value = [
    { id: 11, time: dayjs().format('YYYY-MM-DD HH:mm'), building, type: '维修', detail: '楼栋维修示例' },
    { id: 12, time: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'), building, type: '卫生', detail: '楼栋卫生示例' }
  ]
  drillDrawerVisible.value = true
}

function buildChart() {
  if (!chartRef.value) return
  try {
    chart = echarts.init(chartRef.value)
    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: seriesData.value.map(s => s.date) },
      yAxis: { type: 'value', name: '缴费金额 (¥)' },
      series: [{ name: '缴费金额', type: 'line', data: seriesData.value.map(s => s.amount), smooth: true, areaStyle: {} }]
    }
    chart.setOption(option)
  } catch (err) {
    // don't throw to avoid blank page; show in console
    // eslint-disable-next-line no-console
    console.error('ECharts init error', err)
  }
}

onMounted(() => {
  nextTick(() => buildChart())
  nextTick(() => buildComplaintsCharts())
})

watch(seriesData, () => {
  if (!chart) buildChart()
  else chart.setOption({ xAxis: { data: seriesData.value.map(s => s.date) }, series: [{ data: seriesData.value.map(s => s.amount) }] })
})

watch(range, (val) => {
  if (!val || !val.length) return
  const [from, to] = val
  seriesData.value = genTimeSeries(dayjs(from), dayjs(to))
})

watch(granularity, () => {
  // re-aggregate seriesData according to granularity
  const [from, to] = range.value
  const raw = genTimeSeries(dayjs(from), dayjs(to))
  if (granularity.value === 'day') { seriesData.value = raw; return }
  if (granularity.value === 'week') {
    // aggregate by ISO week (YYYY-W)
    const map = new Map<string, number>()
    for (const r of raw) {
      const w = dayjs(r.date).format('GGGG-wo')
      map.set(w, (map.get(w) || 0) + r.amount)
    }
    seriesData.value = Array.from(map.entries()).map(([k,v]) => ({ date: k, amount: v }))
    return
  }
  if (granularity.value === 'month') {
    const map = new Map<string, number>()
    for (const r of raw) {
      const m = dayjs(r.date).format('YYYY-MM')
      map.set(m, (map.get(m) || 0) + r.amount)
    }
    seriesData.value = Array.from(map.entries()).map(([k,v]) => ({ date: k, amount: v }))
    return
  }
})

function refresh() {
  const [from, to] = range.value
  seriesData.value = genTimeSeries(dayjs(from), dayjs(to))
}

function exportCSV() {
  const rows = [['date', 'amount']].concat(seriesData.value.map(s => [s.date, String(s.amount)]))
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'payments_timeseries.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.analytics-page { padding: 16px }
.chart-container { height: 360px; width: 100% }
</style>
