<template>
  <div class="periodic-entry-page">
    <div class="layout">
      <div class="tree-panel">
        <div style="padding:8px; display:flex; gap:8px; align-items:center">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区/楼宇/房间（回车）" @keyup.enter="onTreeSearchEnter" allow-clear />
          <a-button size="small" @click="onTreeSearchEnter">查询</a-button>
        </div>
        <a-tree :tree-data="treeData" :expanded-keys="expandedKeys" :selected-keys="selectedKeys" block-node show-icon="false" @expand="onTreeExpand" @select="onSelect" />
      </div>
      <div class="splitter"></div>
      <div class="content-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div>
            <a-space>
              <a-button type="primary" @click="addRow">新增行</a-button>
              <a-button @click="deleteSelected" danger>删除选中</a-button>
              <a-button @click="saveAll">保存（本地）</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/客户名称" @search="onTableSearch" style="width:360px" />
          </div>
        </div>
        <a-table
          :data-source="filteredRows"
          :columns="columns"
          row-key="_localId"
          :pagination="{ pageSize: 30 }"
          size="small"
          :scroll="{ x: 1500 }">
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'select'">
              <a-checkbox v-model:checked="slotProps.record._checked"></a-checkbox>
            </template>
            <template v-else-if="slotProps.column.key === 'roomId'">
              <div>{{ slotProps.record.roomId }}</div>
            </template>
            <template v-else-if="['customerId','customerName','size'].includes(slotProps.column.key)">
              <div>{{ slotProps.record[slotProps.column.key] }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'feeItem'">
              <a-input v-model:value="slotProps.record.feeItem" size="small" />
            </template>
            <template v-else-if="slotProps.column.key === 'period'">
              <a-input v-model:value="slotProps.record.period" size="small" placeholder="例如: 2025-08" />
            </template>
            <template v-else-if="slotProps.column.key === 'startDate' || slotProps.column.key === 'endDate'">
              <a-date-picker v-model:value="slotProps.record[slotProps.column.key]" size="small" format="YYYY-MM-DD" />
            </template>
            <template v-else-if="slotProps.column.key === 'unitPrice' || slotProps.column.key === 'amount' || slotProps.column.key === 'discount'">
              <a-input-number v-model:value="slotProps.record[slotProps.column.key]" :min="0" :precision="2" size="small" style="width:100%" />
            </template>
            <template v-else-if="slotProps.column.key === 'remark'">
              <a-input v-model:value="slotProps.record.remark" size="small" />
            </template>
            <template v-else-if="slotProps.column.key === 'creator'">
              <a-input v-model:value="slotProps.record.creator" size="small" />
            </template>
            <template v-else-if="slotProps.column.key === 'audit'">
              <a-space>
                <a-button size="small" @click="toggleAudit(slotProps.record)">{{ slotProps.record.audited ? '已审核' : '审核' }}</a-button>
                <div style="min-width:120px">{{ slotProps.record.auditor || '-' }}</div>
              </a-space>
            </template>
            <template v-else>
              <div>{{ slotProps.record[slotProps.column.dataIndex] }}</div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { message } from 'ant-design-vue'

dayjs.locale('zh-cn')

// 示例房间数据（可替换为接口拉取）
const allRooms = ref([
  { roomId: 'R001', roomName: '101', area: '管理区A', building: '楼宇A1', size: 80, customerId: 'C001', customerName: '张三' },
  { roomId: 'R002', roomName: '201', area: '管理区A', building: '楼宇A1', size: 100, customerId: 'C002', customerName: '李四' },
  { roomId: 'R101', roomName: '301', area: '管理区B', building: '楼宇B1', size: 120, customerId: 'C003', customerName: '王五' }
])

// 树数据
const areaBuildings = {
  '管理区A': ['楼宇A1'],
  '管理区B': ['楼宇B1']
}
const treeData = ref<any[]>([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<any[]>(['all'])
const selectedNode = ref<any>(null)
const treeSearch = ref('')

function buildTree() {
  const nodes:any[] = [{ title: '全部', key: 'all', level: 0, children: [] }]
  let ai = 1
  for (const [area, builds] of Object.entries(areaBuildings)) {
    const bchildren = builds.map((b, idx) => ({ title: b, key: `building-${ai}-${idx}`, meta: { type: 'building', building: b, area }, children: [{ title: '(双击展开)', placeholder: true }] }))
    nodes.push({ title: area, key: `area-${ai}`, meta: { type: 'area', area }, children: bchildren })
    ai++
  }
  treeData.value = nodes
}

async function loadTreeData(node:any) {
  if (!node) return
  const key = String(node.key || '')
  if (key.startsWith('building-')) {
    const building = node.meta?.building
    const roomsForBuilding = allRooms.value.filter((r:any) => r.building === building)
    if (roomsForBuilding.length) {
      node.children = roomsForBuilding.map((r:any) => ({ title: `${r.roomId} ${r.roomName||''}`, key: `room-${r.roomId}`, isLeaf: true, meta: { type: 'room', roomId: r.roomId, roomName: r.roomName } }))
    } else {
      node.children = [{ title: '(无房间)', key: `room-empty-${key}`, isLeaf: true, meta: { type: 'placeholder' } }]
    }
  }
}

function findNode(nodes:any[], key:string): any {
  for (const n of nodes) {
    if (String(n.key) === String(key)) return n
    if (n.children) {
      const r: any = findNode(n.children, key)
      if (r) return r
    }
  }
  return null
}

async function onTreeExpand(keys:any) {
  expandedKeys.value = keys
  for (const k of keys || []) {
    const node = findNode(treeData.value, k)
    if (node && node.children && node.children.length === 1 && node.children[0].placeholder) {
      await loadTreeData(node)
    }
  }
}
async function onSelect(keys:any, info:any) {
  const k = Array.isArray(keys) ? keys[0] : keys
  selectedKeys.value = keys
  let node = findNode(treeData.value, k)
  if (node && String(node.key || '').startsWith('building-') && node.children && node.children.length === 1 && node.children[0].placeholder) {
    await loadTreeData(node)
  }
  if (node) selectedNode.value = node
  else selectedNode.value = null
}

function onTreeSearchEnter() {
  const q = (treeSearch.value || '').trim().toLowerCase()
  if (!q) { expandedKeys.value = []; selectedKeys.value = ['all']; selectedNode.value = null; return }
  const toExpand:Set<string> = new Set()
  let firstMatchKey: string | null = null
  for (const node of treeData.value) {
    const areaKey = String(node.key)
    const areaName = String(node.meta?.area || node.title || '')
    if (areaName.toLowerCase().includes(q)) toExpand.add(areaKey)
    if (node.children) {
      for (const b of node.children) {
        const bkey = String(b.key)
        const bname = String(b.meta?.building || b.title || '')
        if (bname.toLowerCase().includes(q)) { toExpand.add(areaKey); toExpand.add(bkey) }
        if (b.children) {
          for (const r of b.children) {
            const rtitle = String(r.title || '')
            const roomMetaName = String(r.meta?.roomName || '')
            const roomId = String(r.meta?.roomId || (r.key || '')).toLowerCase()
            if (roomId.includes(q) || roomMetaName.toLowerCase().includes(q) || rtitle.toLowerCase().includes(q)) {
              toExpand.add(areaKey); toExpand.add(bkey)
              if (!firstMatchKey) firstMatchKey = String(r.key)
            }
          }
        }
      }
    }
  }
  expandedKeys.value = Array.from(toExpand)
  if (firstMatchKey) { selectedKeys.value = [firstMatchKey]; selectedNode.value = findNode(treeData.value, firstMatchKey) }
}

buildTree()

// 表格数据模型
const rows = ref<any[]>([])
const tableSearch = ref('')

// 初始化从本地恢复
const STORAGE_KEY = 'periodicFeeEntryDrafts'
function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) rows.value = JSON.parse(raw)
    else initRowsFromRooms()
  } catch (e) { initRowsFromRooms() }
}
function saveToLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.value)); message.success('已保存到本地') }

function initRowsFromRooms() {
  rows.value = allRooms.value.map(r => ({
    _localId: 'L' + r.roomId,
    _checked: false,
    roomId: r.roomId,
    customerId: r.customerId || '',
    customerName: r.customerName || '',
    size: r.size || 0,
    feeItem: '',
    period: '',
    startDate: null,
    endDate: null,
    unitPrice: 0,
    amount: 0,
    discount: 0,
    remark: '',
    creator: '',
    audited: false,
    auditor: ''
  }))
}

onMounted(()=>{ loadFromLocal() })

const filteredRows = computed(()=>{
  const s = (tableSearch.value||'').toLowerCase()
  let list = rows.value
  if (selectedNode.value && selectedNode.value.key !== 'all') {
    const k = String(selectedNode.value.key)
    if (k.startsWith('room-')) {
      const rid = selectedNode.value.meta?.roomId || k.replace('room-','')
      list = list.filter(r=>r.roomId === rid)
    } else if (k.startsWith('building-')) {
      const building = selectedNode.value.meta?.building
      list = list.filter(r=> allRooms.value.find(a=>a.roomId === r.roomId)?.building === building)
    } else if (k.startsWith('area-')) {
      const area = selectedNode.value.meta?.area
      list = list.filter(r=> allRooms.value.find(a=>a.roomId === r.roomId)?.area === area)
    }
  }
  if (!s) return list
  return list.filter(r => String(r.roomId||'').toLowerCase().includes(s) || String(r.customerId||'').toLowerCase().includes(s) || String(r.customerName||'').toLowerCase().includes(s))
})

function addRow() {
  const nid = 'L' + (Date.now().toString().slice(-6))
  rows.value.unshift({ _localId: nid, _checked: true, roomId: '', customerId: '', customerName: '', size: 0, feeItem: '', period: '', startDate: null, endDate: null, unitPrice: 0, amount: 0, discount: 0, remark: '', creator: '', audited: false, auditor: '' })
}

function deleteSelected() {
  const remain = rows.value.filter(r=>!r._checked)
  rows.value = remain
}

function saveAll() {
  // 简单校验
  const invalid = rows.value.find(r => !r.roomId || !r.feeItem || !r.startDate || !r.endDate)
  if (invalid) { message.error('存在未填写的必填项（房间/费项/开始/结束日期）'); return }
  saveToLocal()
  // 发出事件，供外部接收（在组件外部监听）
  const payload = rows.value.map(r=>({ ...r }))
  // @ts-ignore
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try { window.dispatchEvent(new CustomEvent('periodicFeeEntry:save', { detail: payload })) } catch(e){}
  }
}

function toggleAudit(record:any) {
  record.audited = !record.audited
  if (record.audited) {
    record.auditor = record.auditor || '审核人' // 可替换为当前用户
    message.success('已审核')
  } else {
    record.auditor = ''
    message.info('取消审核')
  }
}

function onTableSearch() {}

const columns = [
  { title: '', key: 'select', width: 48 },
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 120 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 120 },
  { title: '建筑面积', dataIndex: 'size', key: 'size', width: 100 },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem', width: 140 },
  { title: '费用期间', dataIndex: 'period', key: 'period', width: 120 },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '减免金额', dataIndex: 'discount', key: 'discount', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 160 },
  { title: '制单人', dataIndex: 'creator', key: 'creator', width: 120 },
  { title: '审核', dataIndex: 'audit', key: 'audit', width: 160 }
]

</script>

<style scoped>
.periodic-entry-page { height:100vh }
.layout { display:flex; height:100vh }
.tree-panel { width:300px; border-right:1px solid #eee; padding:8px; box-sizing:border-box; overflow:auto }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.content-panel { flex:1; padding:12px; box-sizing:border-box; overflow:auto }
</style>
