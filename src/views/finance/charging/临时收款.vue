<template>
  <div class="temporary-collection-page">
    <div class="layout">
      <div class="tree-panel">
        <div style="padding:8px; display:flex; gap:8px; align-items:center">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区/楼宇/房间" @keyup.enter="onTreeSearchEnter" allow-clear />
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
              <a-button @click="exportCsv">导出CSV</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/客户名称/收据号" @search="onTableSearch" style="width:360px" />
          </div>
        </div>

        <a-table :data-source="filteredRows" :columns="columns" row-key="_localId" :pagination="{ pageSize: 30 }" size="small" :scroll="{ x: 1600 }">
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'select'">
              <a-checkbox v-model:checked="slotProps.record._checked"></a-checkbox>
            </template>
            <template v-else-if="slotProps.column.key === 'roomId'">
              <div>{{ slotProps.record.roomId }}</div>
            </template>
            <template v-else-if="['size','customerId','customerName','feeItem','settlementMethod','receiptNo','summary','createdBy','auditor'].includes(slotProps.column.key)">
              <div>{{ slotProps.record[slotProps.column.key] || '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'date'">
              <div>{{ slotProps.record.date ? dayjs(slotProps.record.date).format('YYYY-MM-DD') : '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'amount'">
              <div>{{ slotProps.record.amount !== undefined && slotProps.record.amount !== null ? String(slotProps.record.amount) : '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'audited'">
              <a-switch v-model:checked="slotProps.record.audited" size="small" />
            </template>
            <template v-else-if="slotProps.column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="openEditModal(slotProps.record)">编辑</a-button>
                <a-button size="small" danger @click="deleteRow(slotProps.record)">删除</a-button>
              </a-space>
            </template>
            <template v-else>
              <div>{{ slotProps.record[slotProps.column.dataIndex] }}</div>
            </template>
          </template>
        </a-table>

  <a-modal v-model:visible="editModalVisible" title="编辑临时收款" :footer="null">
          <a-form :model="editRecord" layout="vertical">
            <a-row :gutter="12">
              <a-col :span="8"><a-form-item label="房间编号"><a-input v-model:value="editRecord.roomId" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="建筑面积"><a-input-number v-model:value="editRecord.size" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="客户编号"><a-input v-model:value="editRecord.customerId" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="客户名称"><a-input v-model:value="editRecord.customerName" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="费项名称"><a-input v-model:value="editRecord.feeItem" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="结算方式"><a-input v-model:value="editRecord.settlementMethod" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="收据号"><a-input v-model:value="editRecord.receiptNo" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="日期"><a-date-picker v-model:value="editRecord.date" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="金额"><a-input-number v-model:value="editRecord.amount" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="16"><a-form-item label="摘要"><a-input v-model:value="editRecord.summary" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="制单人"><a-input v-model:value="editRecord.createdBy" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="审核"><a-switch v-model:checked="editRecord.audited" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="审核人"><a-input v-model:value="editRecord.auditor" size="small" /></a-form-item></a-col>
            </a-row>
          </a-form>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
            <a-button @click="editModalVisible = false">取消</a-button>
            <a-button type="primary" @click="saveEdit">保存</a-button>
          </div>
        </a-modal>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { message } from 'ant-design-vue'
dayjs.locale('zh-cn')

const allRooms = ref([
  { roomId: 'R001', roomName: '101', area: '管理区A', building: '楼宇A1', size: 80, customerId: 'C001', customerName: '张三' },
  { roomId: 'R002', roomName: '201', area: '管理区A', building: '楼宇A1', size: 100, customerId: 'C002', customerName: '李四' },
  { roomId: 'R101', roomName: '301', area: '管理区B', building: '楼宇B1', size: 120, customerId: 'C003', customerName: '王五' }
])

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

const rows = ref<any[]>([])
const tableSearch = ref('')
const STORAGE_KEY = 'temporaryCollectionDrafts'

function initRowsFromRooms() {
  rows.value = allRooms.value.map(r => ({
    _localId: 'T' + r.roomId,
    _checked: false,
    roomId: r.roomId,
    size: r.size || 0,
    customerId: r.customerId || '',
    customerName: r.customerName || '',
    feeItem: '',
    settlementMethod: '',
    receiptNo: '',
    date: null,
    amount: 0,
    summary: '',
    createdBy: '',
    audited: false,
    auditor: ''
  }))
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) rows.value = JSON.parse(raw)
    else initRowsFromRooms()
  } catch (e) { initRowsFromRooms() }
}
function saveToLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.value)); message.success('已保存到本地') }

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
  return list.filter(r => String(r.roomId||'').toLowerCase().includes(s) || String(r.customerId||'').toLowerCase().includes(s) || String(r.customerName||'').toLowerCase().includes(s) || String(r.receiptNo||'').toLowerCase().includes(s))
})

function addRow() {
  const nid = 'T' + (Date.now().toString().slice(-6))
  rows.value.unshift({ _localId: nid, _checked: true, roomId: '', size: 0, customerId: '', customerName: '', feeItem: '', settlementMethod: '', receiptNo: '', date: null, amount:0, summary:'', createdBy:'', audited:false, auditor:'' })
}

function deleteSelected() { rows.value = rows.value.filter(r=>!r._checked) }

function saveAll() { saveToLocal(); const payload = rows.value.map(r=>({ ...r })); try { window.dispatchEvent(new CustomEvent('temporaryCollection:save', { detail: payload })) } catch(e){} }

function onTableSearch() {
  // v-model already updates tableSearch
}

function exportCsv() {
  const headers = ['房间编号','建筑面积','客户编号','客户名称','费项名称','结算方式','收据号','日期','金额','摘要','制单人','审核','审核人']
  const rowsData = rows.value.map(r=>[r.roomId, r.size, r.customerId, r.customerName, r.feeItem, r.settlementMethod, r.receiptNo, r.date||'', r.amount, r.summary, r.createdBy, r.audited ? '是' : '否', r.auditor||''])
  const csv = headers.join(',') + '\n' + rowsData.map(row => row.map(c=>`"${c ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.setAttribute('download','临时收款导出.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
}

const columns = [
  { title: '', key: 'select', width: 48 },
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 120 },
  { title: '建筑面积', dataIndex: 'size', key: 'size', width: 100 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140 },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem', width: 140 },
  { title: '结算方式', dataIndex: 'settlementMethod', key: 'settlementMethod', width: 120 },
  { title: '收据号', dataIndex: 'receiptNo', key: 'receiptNo', width: 140 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '摘要', dataIndex: 'summary', key: 'summary', width: 160 },
  { title: '制单人', dataIndex: 'createdBy', key: 'createdBy', width: 120 },
  { title: '审核', dataIndex: 'audited', key: 'audited', width: 80 },
  { title: '审核人', dataIndex: 'auditor', key: 'auditor', width: 120 },
  { title: '操作', dataIndex: 'actions', key: 'actions', width: 140 }
]

const editModalVisible = ref(false)
const editRecord = ref<any>(null)
function openEditModal(record:any) { editRecord.value = { ...record }; editModalVisible.value = true }
function saveEdit() {
  if (!editRecord.value) return
  const idx = rows.value.findIndex(r => r._localId === editRecord.value._localId)
  if (idx >= 0) rows.value.splice(idx, 1, { ...editRecord.value })
  editModalVisible.value = false
  message.success('保存成功')
}
function deleteRow(record:any) { const idx = rows.value.findIndex(r => r._localId === record._localId); if (idx >= 0) rows.value.splice(idx, 1) }

</script>

<style scoped>
.temporary-collection-page { height:100vh }
.layout { display:flex; height:100vh }
.tree-panel { width:300px; border-right:1px solid #eee; padding:8px; box-sizing:border-box; overflow:auto }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.content-panel { flex:1; padding:12px; box-sizing:border-box; overflow:auto }
</style>
