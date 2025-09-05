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
              <a-button type="primary" @click="openAddPaymentModal">新增临时收款</a-button>
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
            <template v-else-if="['size','customerId','customerName','receiptNo','summary','createdBy','auditor'].includes(slotProps.column.key)">
                <div>{{ slotProps.record[slotProps.column.key] || '-' }}</div>
              </template>
              <template v-else-if="slotProps.column.key === 'feeItem'">
                <div>{{ getFeeItemLabel(slotProps.record.feeItem) || '-' }}</div>
              </template>
              <template v-else-if="slotProps.column.key === 'settlementMethod'">
                <div>{{ getSettlementMethodLabel(slotProps.record.settlementMethod) || '-' }}</div>
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
                <a-col :span="12"><a-form-item label="费项名称"><a-select v-model:value="editRecord.feeItem" size="small" placeholder="请选择费项">
                    <a-select-option v-for="it in feeItems" :key="it.value" :value="it.value">{{ it.label }}</a-select-option>
                  </a-select></a-form-item></a-col>
                <a-col :span="8"><a-form-item label="结算方式"><a-select v-model:value="editRecord.settlementMethod" size="small" placeholder="请选择结算方式">
                    <a-select-option v-for="m in settlementMethods" :key="m.value" :value="m.value">{{ m.label }}</a-select-option>
                  </a-select></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="收据号"><a-input v-model:value="editRecord.receiptNo" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="发票号码"><a-input v-model:value="editRecord.invoiceNo" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="支付订单编号"><a-input v-model:value="editRecord.paymentOrderNo" size="small" /></a-form-item></a-col>
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

  <a-modal v-model:visible="addModalVisible" title="新增临时收款" :footer="null">
    <a-form :model="addRecord" layout="vertical">
      <a-row :gutter="12">
        <a-col :span="6"><a-form-item label="日期"><a-date-picker v-model:value="addRecord.date" style="width:100%" size="small" /></a-form-item></a-col>
        <a-col :span="6">
          <a-form-item label="房间">
            <div style="display:flex; gap:8px; align-items:center">
              <a-input v-model:value="addRecord.roomId" size="small" placeholder="请选择房间" disabled />
              <a-button size="small" @click="openRoomPickerForAdd">选择房间</a-button>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="6"><a-form-item label="客户编号"><a-input v-model:value="addRecord.customerId" size="small" disabled/></a-form-item></a-col>
        <a-col :span="6"><a-form-item label="客户"><a-input v-model:value="addRecord.customerName" size="small" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="费用项目"><a-select v-model:value="addRecord.feeItem" size="small" placeholder="请选择费项">
              <a-select-option v-for="it in feeItems" :key="it.value" :value="it.value">{{ it.label }}</a-select-option>
            </a-select></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="结算方式"><a-select v-model:value="addRecord.settlementMethod" size="small" placeholder="请选择结算方式">
              <a-select-option v-for="m in settlementMethods" :key="m.value" :value="m.value">{{ m.label }}</a-select-option>
            </a-select></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="收据号"><a-input v-model:value="addRecord.receiptNo" size="small" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="发票号码"><a-input v-model:value="addRecord.invoiceNo" size="small" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="支付订单编号"><a-input v-model:value="addRecord.paymentOrderNo" size="small" /></a-form-item></a-col>
        <a-col :span="8"><a-form-item label="金额"><a-input-number v-model:value="addRecord.amount" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
        <a-col :span="16"><a-form-item label="摘要"><a-input v-model:value="addRecord.summary" /></a-form-item></a-col>
  </a-row>
    </a-form>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
      <a-button @click="addModalVisible = false">取消</a-button>
      <a-button type="primary" @click="saveAddPayment">提交</a-button>
    </div>
  </a-modal>

  <!-- Room picker modal: left tree, right list; double-click to select -->
  <a-modal v-model:visible="roomPickerVisible" title="选择房间" :footer="null" width="900">
    <div style="display:flex; gap:12px; height:400px">
      <div style="width:280px; border-right:1px solid #eee; padding:8px; overflow:auto">
        <a-input v-model:value="treeSearch" placeholder="搜索 管理区/楼宇/房间" @keyup.enter="onTreeSearchEnter" allow-clear />
  <a-tree :tree-data="treeData" :expanded-keys="expandedKeys" :selected-keys="selectedKeys" block-node show-icon="false" @expand="onTreeExpand" @select="onRoomPickerSelect" style="margin-top:8px" />
      </div>
      <div style="flex:1; padding:8px; overflow:auto">
  <a-table :data-source="roomPickerRows" :columns="[{ title: '房间号', dataIndex: 'roomId', key: 'roomId' }, { title: '房间名', dataIndex: 'roomName', key: 'roomName' }, { title: '楼宇', dataIndex: 'building', key: 'building' }, { title: '客户', dataIndex: 'customerName', key: 'customerName' }, { title: '操作', key: 'actions', width: 100 } ]" row-key="roomId" size="small" :pagination="{ pageSize: 10 }" @rowDblclick="onRoomDoubleClick" :onRow="createRowHandlers">
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'actions'">
              <a-button size="small" type="link" @click.stop="onRoomDoubleClick(slotProps.record)">选择</a-button>
            </template>
            <template v-else>
              <div>{{ slotProps.record[slotProps.column.dataIndex] }}</div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
      <a-button @click="roomPickerVisible = false">取消</a-button>
    </div>
  </a-modal>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

function createRowHandlers(record:any) {
  return { ondblclick: () => onRoomDoubleClick(record) }
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
  invoiceNo: '',
  paymentOrderNo: '',
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
  const headers = ['房间编号','建筑面积','客户编号','客户名称','费项名称','结算方式','收据号','发票号码','支付订单编号','日期','金额','摘要','制单人','审核','审核人']
  const rowsData = rows.value.map(r=>[
    r.roomId,
    r.size,
    r.customerId,
    r.customerName,
    // export internal values (english keys)
    r.feeItem,
    r.settlementMethod,
    r.receiptNo,
    r.invoiceNo||'',
    r.paymentOrderNo||'',
    r.date||'',
    r.amount,
    r.summary,
    r.createdBy,
    r.audited ? '是' : '否',
    r.auditor||''
  ])
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
  { title: '发票号码', dataIndex: 'invoiceNo', key: 'invoiceNo', width: 140 },
  { title: '支付订单编号', dataIndex: 'paymentOrderNo', key: 'paymentOrderNo', width: 160 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '摘要', dataIndex: 'summary', key: 'summary', width: 160 },
  { title: '制单人', dataIndex: 'createdBy', key: 'createdBy', width: 120 },
  { title: '审核', dataIndex: 'audited', key: 'audited', width: 80 },
  { title: '审核人', dataIndex: 'auditor', key: 'auditor', width: 120 },
  { title: '操作', dataIndex: 'actions', key: 'actions', width: 140 }
]

// Add payment modal state and handlers
const addModalVisible = ref(false)
const addRecord = ref<any>({ date: null, roomId: '', customerId: '', customerName: '', size: 0, feeItem: '', settlementMethod: '', receiptNo: '', invoiceNo: '', paymentOrderNo: '', amount: 0, summary: '' })
function openAddPaymentModal() { addRecord.value = { date: null, roomId: '', customerId: '', customerName: '', size: 0, feeItem: '', settlementMethod: '', receiptNo: '', invoiceNo: '', paymentOrderNo: '', amount: 0, summary: '' }; addModalVisible.value = true }
function onAddRoomChange(roomId: string) {
  const found = allRooms.value.find(r => r.roomId === roomId)
  if (found) {
    addRecord.value.customerId = found.customerId || ''
    addRecord.value.customerName = found.customerName || ''
    addRecord.value.size = found.size || 0
  } else {
    addRecord.value.customerId = ''
    addRecord.value.customerName = ''
    addRecord.value.size = 0
  }
}
function saveAddPayment() {
  const nid = 'T' + (Date.now().toString().slice(-6))
  const rec = { _localId: nid, _checked: false, roomId: addRecord.value.roomId || '', size: addRecord.value.size || 0, customerId: addRecord.value.customerId || '', customerName: addRecord.value.customerName || '', feeItem: addRecord.value.feeItem || '', settlementMethod: addRecord.value.settlementMethod || '', receiptNo: addRecord.value.receiptNo || '', invoiceNo: addRecord.value.invoiceNo || '', paymentOrderNo: addRecord.value.paymentOrderNo || '', date: addRecord.value.date || null, amount: addRecord.value.amount || 0, summary: addRecord.value.summary || '', createdBy: '', audited: false, auditor: '' }
  rows.value.unshift(rec)
  addModalVisible.value = false
  saveToLocal()
  message.success('已新增临时收款')
}

// fee items and settlement methods (internal value + label for UI)
type OptionItem = { value: string; label: string }
const feeItems = ref<OptionItem[]>([
  { value: 'property_fee', label: '物业费' },
  { value: 'water', label: '水费' },
  { value: 'electricity', label: '电费' },
  { value: 'gas', label: '燃气费' },
  { value: 'parking', label: '停车费' }
])
const settlementMethods = ref<OptionItem[]>([
  { value: 'cash', label: '现金' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信' }
])

function getFeeItemLabel(val?: string) {
  if (!val) return ''
  const it = feeItems.value.find(i => i.value === val)
  return it ? it.label : val
}
function getSettlementMethodLabel(val?: string) {
  if (!val) return ''
  const it = settlementMethods.value.find(i => i.value === val)
  return it ? it.label : val
}

// Room picker modal state
const roomPickerVisible = ref(false)
const roomPickerRows = ref<any[]>([])
const roomPickerSelected = ref<any>(null)

function openRoomPickerForAdd() {
  // build a simple list of rooms grouped by building for the right-side table
  roomPickerRows.value = allRooms.value.map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
  // apply any currently selected tree filter
  updateRoomPickerRows()
  roomPickerVisible.value = true
}

function onRoomDoubleClick(row:any) {
  // apply to addRecord by replacing object to ensure reactivity
  addRecord.value = {
    ...addRecord.value,
    roomId: row.roomId,
    roomName: row.roomName,
    customerId: row.customerId || '',
    customerName: row.customerName || '',
    size: row.size || 0
  }
  // also call onAddRoomChange to keep behavior consistent with the old select change handler
  try { onAddRoomChange(row.roomId) } catch (e) {}
  roomPickerVisible.value = false
}

function onRoomPickerSelect(keys:any, info:any) {
  // reuse onSelect logic to set selectedNode; then update right-side rows
  onSelect(keys, info)
  updateRoomPickerRows()
}

function updateRoomPickerRows() {
  const sel = selectedNode.value
  if (!sel || sel.key === 'all') {
    roomPickerRows.value = allRooms.value.map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
    return
  }
  const k = String(sel.key || '')
  if (k.startsWith('room-')) {
    const rid = sel.meta?.roomId || k.replace('room-','')
    roomPickerRows.value = allRooms.value.filter(r => r.roomId === rid).map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
    return
  }
  if (k.startsWith('building-')) {
    const building = sel.meta?.building
    roomPickerRows.value = allRooms.value.filter(r => r.building === building).map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
    return
  }
  if (k.startsWith('area-')) {
    const area = sel.meta?.area
    roomPickerRows.value = allRooms.value.filter(r => r.area === area).map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
    return
  }
  // fallback
  roomPickerRows.value = allRooms.value.map(r => ({ roomId: r.roomId, roomName: r.roomName, building: r.building, area: r.area, size: r.size, customerId: r.customerId, customerName: r.customerName }))
}

// when selectedNode changes and the picker is open, update the right-side room list
watch(() => selectedNode.value, () => {
  if (roomPickerVisible.value) updateRoomPickerRows()
})

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
