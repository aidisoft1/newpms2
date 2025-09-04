<template>
  <div class="collect-fee-page">
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
              <a-button type="primary" @click="openBatchCollectModal">批量收款</a-button>
              <a-button @click="deleteSelected" danger>删除选中</a-button>
              <a-button @click="saveAll">保存（本地）</a-button>
              <a-button @click="exportCsv">导出CSV</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/客户名称" @search="onTableSearch" style="width:360px" />
          </div>
        </div>

        <a-table :data-source="filteredRows" :columns="columns" row-key="_localId" :pagination="{ pageSize: 30 }" size="small" :scroll="{ x: 2200 }">
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'select'">
              <a-checkbox v-model:checked="slotProps.record._checked"></a-checkbox>
            </template>
            <template v-else-if="slotProps.column.key === 'roomId'">
              <div>{{ slotProps.record.roomId }}</div>
            </template>
            <template v-else-if="['size','customerId','customerName','feeItem','contractId','bankAccount'].includes(slotProps.column.key)">
              <div>{{ slotProps.record[slotProps.column.key] || '-' }}</div>
            </template>
            <template v-else-if="['receivableDate','contractStart','contractEnd','periodStart','periodEnd','lastMeterDate','currentMeterDate'].includes(slotProps.column.key)">
              <div>{{ slotProps.record[slotProps.column.key] ? dayjs(slotProps.record[slotProps.column.key]).format('YYYY-MM-DD') : '-' }}</div>
            </template>
            <template v-else-if="['amount','receivedAmount','balance','penalty','lastReading','currentReading','usage'].includes(slotProps.column.key)">
              <div>{{ slotProps.record[slotProps.column.key] !== undefined && slotProps.record[slotProps.column.key] !== null ? String(slotProps.record[slotProps.column.key]) : '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'sysPeriod'">
              <div>{{ slotProps.record.sysPeriod || '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'remark'">
              <div>{{ slotProps.record.remark || '-' }}</div>
            </template>
            <template v-else-if="slotProps.column.key === 'actions'">
              <a-space>
                <a-button type="primary" size="small" @click="openCollectModal(slotProps.record)">收取</a-button>
                <a-button size="small" @click="openEditModal(slotProps.record)">编辑</a-button>
                <a-button size="small" danger @click="deleteRow(slotProps.record)">删除</a-button>
              </a-space>
            </template>
            <template v-else>
              <div>{{ slotProps.record[slotProps.column.dataIndex] }}</div>
            </template>
          </template>
        </a-table>

        <a-modal v-model:visible="editModalVisible" title="编辑收费记录" :footer="null">
          <a-form :model="editRecord" layout="vertical">
            <a-row :gutter="12">
              <a-col :span="12"><a-form-item label="房间编号"><a-input v-model:value="editRecord.roomId" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="建筑面积"><a-input-number v-model:value="editRecord.size" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="客户编号"><a-input v-model:value="editRecord.customerId" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="客户名称"><a-input v-model:value="editRecord.customerName" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="费项名称"><a-input v-model:value="editRecord.feeItem" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="应收日期"><a-date-picker v-model:value="editRecord.receivableDate" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="金额"><a-input-number v-model:value="editRecord.amount" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="收款金额"><a-input-number v-model:value="editRecord.receivedAmount" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="应收余额"><a-input-number v-model:value="editRecord.balance" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="违约金"><a-input-number v-model:value="editRecord.penalty" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="16"><a-form-item label="备注"><a-input v-model:value="editRecord.remark" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="系统年月"><a-input v-model:value="editRecord.sysPeriod" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="上次度数"><a-input-number v-model:value="editRecord.lastReading" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="本次度数"><a-input-number v-model:value="editRecord.currentReading" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="用量"><a-input-number v-model:value="editRecord.usage" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="合同编号"><a-input v-model:value="editRecord.contractId" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="合同开始日期"><a-date-picker v-model:value="editRecord.contractStart" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="合同结束日期"><a-date-picker v-model:value="editRecord.contractEnd" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="周期费用始日"><a-date-picker v-model:value="editRecord.periodStart" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="周期费用止日"><a-date-picker v-model:value="editRecord.periodEnd" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="上次抄表日期"><a-date-picker v-model:value="editRecord.lastMeterDate" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="本次抄表日期"><a-date-picker v-model:value="editRecord.currentMeterDate" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="银行账号"><a-input v-model:value="editRecord.bankAccount" size="small" /></a-form-item></a-col>
            </a-row>
          </a-form>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px">
            <a-button @click="editModalVisible = false">取消</a-button>
            <a-button type="primary" @click="saveEdit">保存</a-button>
          </div>
        </a-modal>

        <a-modal v-model:visible="collectModalVisible" title="收取款项" @ok="doCollect" @cancel="collectModalVisible = false">
          <a-form layout="vertical">
            <a-form-item label="房间编号"><div>{{ collectRecord?.roomId || '-' }}</div></a-form-item>
            <a-form-item label="应收金额"><div>{{ collectRecord?.amount ?? '-' }}</div></a-form-item>
            <a-form-item label="已收金额"><div>{{ collectRecord?.receivedAmount ?? 0 }}</div></a-form-item>
            <a-form-item label="本次收款金额">
              <a-input-number v-model:value="collectAmount" :min="0" :precision="2" style="width:100%" />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal v-model:visible="batchCollectVisible" title="批量收款" @ok="doBatchCollect" @cancel="batchCollectVisible = false">
          <a-form layout="vertical">
            <a-form-item label="选中行数"><div>{{ selectedRowsCount }}</div></a-form-item>
            <a-form-item label="待收总额"><div>{{ totalOutstanding }}</div></a-form-item>
            <a-form-item label="本次合计收款金额">
              <a-input-number v-model:value="batchCollectTotal" :min="0" :precision="2" style="width:100%" />
            </a-form-item>
            <a-form-item>
              <div style="color:#888; font-size:12px">收款金额将按每行的欠款比例分配；输入与待收总额相同则视为全额结清。</div>
            </a-form-item>
          </a-form>
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
const STORAGE_KEY = 'collectFeeDrafts'

function initRowsFromRooms() {
  rows.value = allRooms.value.map(r => ({
    _localId: 'L' + r.roomId,
    _checked: false,
    roomId: r.roomId,
    size: r.size || 0,
    customerId: r.customerId || '',
    customerName: r.customerName || '',
    feeItem: '',
    receivableDate: null,
    amount: 0,
    receivedAmount: 0,
    balance: 0,
    penalty: 0,
    remark: '',
    sysPeriod: '',
    lastReading: null,
    currentReading: null,
    usage: null,
    contractId: '',
    contractStart: null,
    contractEnd: null,
    periodStart: null,
    periodEnd: null,
    lastMeterDate: null,
    currentMeterDate: null,
    bankAccount: ''
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
  return list.filter(r => String(r.roomId||'').toLowerCase().includes(s) || String(r.customerId||'').toLowerCase().includes(s) || String(r.customerName||'').toLowerCase().includes(s))
})

function addRow() {
  const nid = 'L' + (Date.now().toString().slice(-6))
  rows.value.unshift({ _localId: nid, _checked: true, roomId: '', size: 0, customerId: '', customerName: '', feeItem: '', receivableDate: null, amount: 0, receivedAmount:0, balance:0, penalty:0, remark:'', sysPeriod:'', lastReading:null, currentReading:null, usage:null, contractId:'', contractStart:null, contractEnd:null, periodStart:null, periodEnd:null, lastMeterDate:null, currentMeterDate:null, bankAccount:'' })
}

function deleteSelected() { rows.value = rows.value.filter(r=>!r._checked) }

function saveAll() { saveToLocal(); const payload = rows.value.map(r=>({ ...r })); try { window.dispatchEvent(new CustomEvent('collectFee:save', { detail: payload })) } catch(e){} }

function onTableSearch() {
  // tableSearch 已被 v-model 绑定，filteredRows 会自动响应。
}

function exportCsv() {
  const headers = ['房间编号','建筑面积','客户编号','客户名称','费项名称','应收日期','金额','收款金额','应收余额','违约金','备注','系统年月','上次度数','本次度数','用量','合同编号','合同开始日期','合同结束日期','周期费用始日','周期费用止日','上次抄表日期','本次抄表日期','银行账号']
  const rowsData = rows.value.map(r=>[r.roomId, r.size, r.customerId, r.customerName, r.feeItem, r.receivableDate||'', r.amount, r.receivedAmount, r.balance, r.penalty, r.remark, r.sysPeriod, r.lastReading||'', r.currentReading||'', r.usage||'', r.contractId, r.contractStart||'', r.contractEnd||'', r.periodStart||'', r.periodEnd||'', r.lastMeterDate||'', r.currentMeterDate||'', r.bankAccount||''])
  const csv = headers.join(',') + '\n' + rowsData.map(row => row.map(c=>`"${c ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.setAttribute('download','费用收取导出.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
}

const columns = [
  { title: '', key: 'select', width: 48 },
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 120 },
  { title: '建筑面积', dataIndex: 'size', key: 'size', width: 100 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140 },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem', width: 140 },
  { title: '应收日期', dataIndex: 'receivableDate', key: 'receivableDate', width: 120 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '收款金额', dataIndex: 'receivedAmount', key: 'receivedAmount', width: 100 },
  { title: '应收余额', dataIndex: 'balance', key: 'balance', width: 100 },
  { title: '违约金', dataIndex: 'penalty', key: 'penalty', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 160 },
  { title: '系统年月', dataIndex: 'sysPeriod', key: 'sysPeriod', width: 100 },
  { title: '上次度数', dataIndex: 'lastReading', key: 'lastReading', width: 100 },
  { title: '本次度数', dataIndex: 'currentReading', key: 'currentReading', width: 100 },
  { title: '用量', dataIndex: 'usage', key: 'usage', width: 100 },
  { title: '合同编号', dataIndex: 'contractId', key: 'contractId', width: 140 },
  { title: '合同开始日期', dataIndex: 'contractStart', key: 'contractStart', width: 120 },
  { title: '合同结束日期', dataIndex: 'contractEnd', key: 'contractEnd', width: 120 },
  { title: '周期费用始日', dataIndex: 'periodStart', key: 'periodStart', width: 120 },
  { title: '周期费用止日', dataIndex: 'periodEnd', key: 'periodEnd', width: 120 },
  { title: '上次抄表日期', dataIndex: 'lastMeterDate', key: 'lastMeterDate', width: 120 },
  { title: '本次抄表日期', dataIndex: 'currentMeterDate', key: 'currentMeterDate', width: 120 },
  { title: '银行账号', dataIndex: 'bankAccount', key: 'bankAccount', width: 160 },
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

// 收取（收款）相关
const collectModalVisible = ref(false)
const collectRecord = ref<any>(null)
const collectAmount = ref<number | null>(null)

function openCollectModal(record:any) {
  collectRecord.value = { ...record }
  collectAmount.value = typeof record.receivedAmount === 'number' ? record.receivedAmount : 0
  collectModalVisible.value = true
}

// 批量收款相关
const batchCollectVisible = ref(false)
const batchCollectTotal = ref<number | null>(null)

const selectedRowsCount = computed(() => rows.value.filter(r => r._checked).length)
const totalOutstanding = computed(() => {
  return rows.value.filter(r => r._checked).reduce((sum, r) => sum + (Number(r.amount || 0) - Number(r.receivedAmount || 0)), 0)
})

function openBatchCollectModal() {
  const cnt = rows.value.filter(r => r._checked).length
  if (!cnt) { message.warn('请先勾选要收款的行'); return }
  batchCollectTotal.value = totalOutstanding.value
  batchCollectVisible.value = true
}

function doBatchCollect() {
  const total = Number(batchCollectTotal.value || 0)
  if (total <= 0) { message.warn('请输入大于0的收款金额'); return }
  const targets = rows.value.filter(r => r._checked)
  const outstandingList = targets.map(r => Math.max(0, Number(r.amount || 0) - Number(r.receivedAmount || 0)))
  const outstandingSum = outstandingList.reduce((s, v) => s + v, 0)
  if (outstandingSum <= 0) { message.info('所选行没有待收款项'); batchCollectVisible.value = false; return }
  // 按欠款比例分配（最后一项收剩余以避免四舍五入误差）
  let allocated = 0
  for (let i = 0; i < targets.length; i++) {
    const r = targets[i]
    const out = outstandingList[i]
    let pay = 0
    if (i < targets.length - 1) {
      pay = Math.round((out / outstandingSum) * total * 100) / 100
      allocated += pay
    } else {
      pay = Math.round((total - allocated) * 100) / 100
    }
    const newReceived = (Number(r.receivedAmount || 0) || 0) + pay
    const newBalance = (Number(r.amount || 0) || 0) - newReceived
    const idx = rows.value.findIndex(x => x._localId === r._localId)
    if (idx >= 0) rows.value.splice(idx, 1, { ...r, receivedAmount: newReceived, balance: newBalance })
  }
  saveToLocal()
  batchCollectVisible.value = false
  message.success('批量收款已完成')
}

function doCollect() {
  if (!collectRecord.value) return
  const idx = rows.value.findIndex(r => r._localId === collectRecord.value._localId)
  const amount = Number(collectAmount.value || 0)
  if (idx >= 0) {
    // 更新收款金额与应收余额
    const orig = rows.value[idx]
    const newReceived = (Number(orig.receivedAmount || 0) || 0) + amount
    const newBalance = (Number(orig.amount || 0) || 0) - newReceived
    rows.value.splice(idx, 1, { ...orig, receivedAmount: newReceived, balance: newBalance })
    saveToLocal()
    message.success('收款已记录')
  }
  collectModalVisible.value = false
}

</script>

<style scoped>
.collect-fee-page { height:100vh }
.layout { display:flex; height:100vh }
.tree-panel { width:300px; border-right:1px solid #eee; padding:8px; box-sizing:border-box; overflow:auto }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.content-panel { flex:1; padding:12px; box-sizing:border-box; overflow:auto }
</style>
