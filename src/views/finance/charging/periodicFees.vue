<template>
  <div class="periodic-fee-page">
    <div class="fee-layout">
      <!-- 左侧树状结构 -->
      <div class="tree-panel" :style="{ width: sidebarWidth + 'px' }" ref="treePanelRef">
        <div style="padding:8px; display:flex; gap:8px; align-items:center">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区/楼宇/房间（回车）" allow-clear @keyup.enter="onTreeSearchEnter" />
          <a-button size="small" @click="onTreeSearchEnter">查询</a-button>
        </div>
        <a-tree
          :tree-data="treeData"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          :block-node="true"
          :show-icon="false"
          @expand="onTreeExpand"
          @select="onSelect"
        />
      </div>
      <div class="splitter" @mousedown.prevent="onSplitterDown" title="拖动调整宽度"></div>
      <!-- 右侧数据表格 -->
      <div class="data-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div>
            <a-space>
              <a-button type="primary" @click="openBatchModal">批量设置</a-button>
              <a-button @click="onImport">导入</a-button>
              <a-button @click="onExport">导出</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/客户名称" @search="onTableSearch" style="width:320px" />
          </div>
        </div>
        <div class="table-wrapper">
          <a-table
            :columns="feeColumns"
            :data-source="displayFees"
            row-key="id"
            size="small"
            :pagination="{ pageSize: 20 }"
            :scroll="{ x: 1800 }"
          >
            <template #bodyCell="slotProps">
              <template v-if="slotProps.column.key === 'actions'">
                <a-space>
                  <a-button type="link" size="small" @click="editFee(slotProps.record)">编辑</a-button>
                  <a-button type="link" size="small" danger @click="deleteFee(slotProps.record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <!-- 批量设置模态 -->
    <a-modal v-model:visible="batchModalVisible" title="批量设置周期费用" width="1000" :footer="null">
      <div style="display:flex; gap:12px;">
        <div style="width:320px; border-right:1px solid #f0f0f0; padding:8px 4px; box-sizing:border-box">
          <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center">
            <a-input v-model:value="batchTreeSearch" placeholder="树搜索（回车展开匹配）" @keyup.enter="onBatchTreeSearchEnter" style="flex:1" />
            <a-button size="small" @click="selectAllVisibleBatch">全选</a-button>
            <a-button size="small" @click="clearBatchSelection">清除</a-button>
          </div>
          <a-tree
            :tree-data="treeData"
            :expanded-keys="expandedKeys"
            :checked-keys="batchCheckedKeys"
            checkable
            :block-node="true"
            :show-icon="false"
            @check="onBatchTreeCheck"
            @expand="onTreeExpand"
            style="max-height:64vh; overflow:auto"
          />
        </div>
        <div style="flex:1; padding:8px; box-sizing:border-box">
          <a-form :model="batchForm" layout="vertical" size="small">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-form-item label="费项名称">
                  <div style="display:flex; align-items:center; gap:8px">
                    <a-input v-model:value="batchForm.feeItem" size="small" placeholder="请选择费项或点击 选择" style="flex:1; min-width:120px; max-width:220px" />
                    <a-button size="small" @click="openFeePicker">选择</a-button>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="公式名称">
                  <div style="display:flex; align-items:center; gap:8px">
                    <a-input v-model:value="batchForm.formulaName" size="small" placeholder="请选择公式或点击 选择" style="flex:1; min-width:120px; max-width:220px" />
                    <a-button size="small" @click="openFormulaPicker">选择</a-button>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="8"><a-form-item label="单价"><a-input-number v-model:value="batchForm.unitPrice" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="金额"><a-input-number v-model:value="batchForm.amount" :min="0" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="开始日期"><a-date-picker v-model:value="batchForm.startDate" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="结束日期"><a-date-picker v-model:value="batchForm.endDate" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="计费周期"><a-input v-model:value="batchForm.cycle" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="期间"><a-input v-model:value="batchForm.period" size="small" placeholder="上期/本期/下期" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="违约金比率"><a-input-number v-model:value="batchForm.penaltyRate" :min="0" :max="100" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="违约金宽限天数"><a-input-number v-model:value="batchForm.penaltyDays" :min="0" :precision="0" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="16"><a-form-item label="备注"><a-input v-model:value="batchForm.remark" size="small" /></a-form-item></a-col>
            </a-row>
          </a-form>
          <div style="margin-top:8px; margin-bottom:8px; display:flex; gap:8px; align-items:center; justify-content:space-between">
            <div style="color:#666;font-size:13px">已选：<strong>{{ batchCheckedKeys.length }}</strong> 个</div>
            <div>
              <a-button size="small" @click="doBatchPreview">预览</a-button>
              <a-button type="primary" size="small" @click="doBatchCreate" :loading="batchLoading">生成</a-button>
            </div>
          </div>
          <div style="max-height:30vh; overflow:auto">
            <a-table :columns="batchPreviewColumns" :data-source="batchPreviewList" row-key="roomId" size="small" :pagination="false">
              <template #bodyCell="slotProps">
                <template v-if="slotProps.column.key === 'actions'">
                  <a-space>
                    <a-button type="link" size="small" @click.stop="removePreviewRow(slotProps.record)">删除</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </a-modal>
    <!-- 导入预览模态 -->
    <a-modal v-model:visible="importPreviewVisible" title="导入预览" width="820" :footer="null">
      <div style="max-height:60vh; overflow:auto">
        <a-table :columns="importPreviewColumns" :data-source="importPreviewRows" row-key="__row" size="small" :pagination="{ pageSize: 10 }"></a-table>
      </div>
      <div style="margin-top:8px; display:flex; justify-content:flex-end; gap:8px">
        <a-button size="small" @click="importPreviewVisible = false">取消</a-button>
        <a-button type="primary" size="small" @click="confirmImport">确认导入</a-button>
      </div>
    </a-modal>
    <!-- 费项选择模态 -->
    <a-modal v-model:visible="feePickerVisible" title="选择费项" :footer="null">
      <div>
        <div v-for="fi in feeItems" :key="fi.id" style="padding:6px 8px; cursor:pointer" @click="selectFeeItem(fi)">{{ fi.name }}</div>
      </div>
    </a-modal>
    <!-- 公式选择模态 -->
    <a-modal v-model:visible="formulaPickerVisible" title="选择公式" :footer="null">
      <div>
        <div v-for="fi in formulaItems" :key="fi.id" style="padding:6px 8px; cursor:pointer" @click="selectFormulaItem(fi)">{{ fi.name }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

// 示例数据
const allRooms = ref([
  { roomId: 'R001', roomName: '101室', area: '管理区A', building: '楼宇A1', size: 80, customerId: 'C001', customerName: '张三' },
  { roomId: 'R002', roomName: '201室', area: '管理区A', building: '楼宇A1', size: 100, customerId: 'C002', customerName: '李四' },
  { roomId: 'R101', roomName: '301室', area: '管理区B', building: '楼宇B1', size: 120, customerId: 'C003', customerName: '王五' }
])
const allFees = ref<any[]>([])

// 树相关
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
  const nodes:any[] = [{ title: h('span', '全部'), key: 'all', level: 0 }]
  let ai = 1
  for (const [area, builds] of Object.entries(areaBuildings)) {
    const bchildren = builds.map((b, idx) => ({ title: h('span', b), key: `building-${ai}-${idx}`, meta: { type: 'building', building: b, area }, children: [{ title: h('span', '(双击展开)'), placeholder: true }] }))
    nodes.push({ title: h('span', area), key: `area-${ai}`, meta: { type: 'area', area }, children: bchildren })
    ai++
  }
  treeData.value = nodes
}

async function loadTreeData(node: any) {
  if (!node) return
  const key = String(node.key || '')
  if (key.startsWith('building-')) {
    const building = node.meta?.building
    const roomsForBuilding = allRooms.value.filter((r:any) => r.building === building)
    if (roomsForBuilding.length) {
      node.children = roomsForBuilding.map((r:any) => ({ title: h('span', `${r.roomId} ${r.roomName||''}`), key: `room-${r.roomId}`, isLeaf: true, meta: { type: 'room', roomId: r.roomId, roomName: r.roomName } }))
    } else {
      node.children = [{ title: h('span', '(无房间)'), key: `room-empty-${key}`, isLeaf: true, meta: { type: 'placeholder' } }]
    }
  }
}

async function onTreeExpand(keys:any) {
  expandedKeys.value = keys
  for (const k of keys || []) {
    const node = findNode(treeData.value, k)
    if (node && node.children && node.children.length === 1 && node.children[0].placeholder) {
      try { await loadTreeData(node) } catch (e) { /* ignore */ }
    }
  }
}
function findNode(nodes: any[], key: string): any {
  for (const n of nodes) {
    if (String(n.key) === String(key)) return n
    if (n.children) {
      const r: any = findNode(n.children, key)
      if (r) return r
    }
  }
  return null
}
async function onSelect(keys:any, info:any) {
  const k = Array.isArray(keys) ? keys[0] : keys
  selectedKeys.value = keys
  let node = findNode(treeData.value, k)
  if (node && String(node.key || '').startsWith('building-') && node.children && node.children.length === 1 && node.children[0].placeholder) {
    await loadTreeData(node)
  }
  if (node) {
    selectedNode.value = node
  } else {
    selectedNode.value = null
  }
}
function onTreeSearchEnter() {
  // 简化：只展开包含关键字的 area/building/room
  const q = (treeSearch.value || '').trim().toLowerCase()
  if (!q) {
    expandedKeys.value = []
    selectedKeys.value = ['all']
    selectedNode.value = null
    return
  }
  const toExpand:Set<string> = new Set()
  let firstMatchKey: string | null = null
  for (const node of treeData.value) {
    const areaKey = String(node.key)
    const areaName = String(node.meta?.area || node.title?.children || '')
    if (areaName.toLowerCase().includes(q)) {
      toExpand.add(areaKey)
    }
    if (node.children) {
      for (const b of node.children) {
        const bkey = String(b.key)
        const bname = String(b.meta?.building || b.title?.children || '')
        if (bname.toLowerCase().includes(q)) {
          toExpand.add(areaKey)
          toExpand.add(bkey)
        }
        if (b.children) {
          for (const r of b.children) {
            const rtitle = String(r.title?.children || r.title || '')
            const roomMetaName = String(r.meta?.roomName || '')
            const roomId = String(r.meta?.roomId || (r.key || '')).toLowerCase()
            if (roomId.includes(q) || roomMetaName.toLowerCase().includes(q) || rtitle.toLowerCase().includes(q)) {
              toExpand.add(areaKey)
              toExpand.add(bkey)
              if (!firstMatchKey) firstMatchKey = String(r.key)
            }
          }
        }
      }
    }
  }
  expandedKeys.value = Array.from(toExpand)
  if (firstMatchKey) {
    selectedKeys.value = [firstMatchKey]
    const n = findNode(treeData.value, firstMatchKey)
    selectedNode.value = n
  }
}

buildTree()

// 表格与批量相关
const tableSearch = ref('')
const feeColumns = [
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 120 },
  { title: '建筑面积', dataIndex: 'size', key: 'size', width: 100 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 120 },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem', width: 120 },
  { title: '公式名称', dataIndex: 'formulaName', key: 'formulaName', width: 120 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '计费周期', dataIndex: 'cycle', key: 'cycle', width: 100 },
  { title: '期间', dataIndex: 'period', key: 'period', width: 100 },
  { title: '违约金比率', dataIndex: 'penaltyRate', key: 'penaltyRate', width: 100 },
  { title: '违约金宽限天数', dataIndex: 'penaltyDays', key: 'penaltyDays', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 160 },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' }
]
const displayFees = computed(() => {
  // 按树节点过滤
  if (!selectedNode.value || selectedNode.value.key === 'all') return allFees.value.filter(f=>filterBySearch(f))
  const k = String(selectedNode.value.key)
  if (k.startsWith('area-')) {
    const area = selectedNode.value.meta?.area
    const roomIds = allRooms.value.filter((r:any)=>r.area === area).map((r:any)=>r.roomId)
    return allFees.value.filter((f:any)=>roomIds.includes(f.roomId) && filterBySearch(f))
  }
  if (k.startsWith('building-')) {
    const building = selectedNode.value.meta?.building
    const roomIds = allRooms.value.filter((r:any)=>r.building === building).map((r:any)=>r.roomId)
    return allFees.value.filter((f:any)=>roomIds.includes(f.roomId) && filterBySearch(f))
  }
  if (k.startsWith('room-')) {
    const rid = selectedNode.value.meta?.roomId || k.replace('room-','')
    return allFees.value.filter((f:any)=>f.roomId === rid && filterBySearch(f))
  }
  return allFees.value.filter(f=>filterBySearch(f))
})
function filterBySearch(f:any) {
  const s = (tableSearch.value || '').toLowerCase()
  if (!s) return true
  return String(f.roomId || '').toLowerCase().includes(s)
    || String(f.customerId || '').toLowerCase().includes(s)
    || String(f.customerName || '').toLowerCase().includes(s)
}
function onTableSearch() {}
function editFee(r:any) { /* 可扩展为弹窗编辑 */ }
function deleteFee(r:any) { Modal.confirm({ title: '确认删除该费用吗？', onOk() { allFees.value = allFees.value.filter((x:any)=>x.id !== r.id); message.success('已删除') } }) }

// 分割条逻辑
const treePanelRef = ref<any>(null)
const sidebarWidth = ref(300)
let dragging = false
function onSplitterDown(e:MouseEvent) { dragging = true; e.preventDefault() }
function onMouseMove(e:MouseEvent) { if (!dragging) return; const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect(); const left = parentRect ? parentRect.left : 0; const newWidth = Math.min(640, Math.max(180, e.clientX - left)); sidebarWidth.value = newWidth }
function onMouseUp() { dragging = false }
onMounted(()=>{ window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp) })
onUnmounted(()=>{ window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) })

// 批量设置相关
const batchModalVisible = ref(false)
const batchTreeSearch = ref('')
const batchCheckedKeys = ref<string[]>([])
const batchForm = ref<any>({ feeItem: '', formulaName: '', unitPrice: 0, amount: 0, startDate: '', endDate: '', cycle: '', period: '', penaltyRate: 0, penaltyDays: 0, remark: '' })
const batchPreviewList = ref<any[]>([])
const batchLoading = ref(false)
const batchPreviewColumns = [
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId' },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId' },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem' },
  { title: '公式名称', dataIndex: 'formulaName', key: 'formulaName' },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
  { title: '计费周期', dataIndex: 'cycle', key: 'cycle' },
  { title: '期间', dataIndex: 'period', key: 'period' },
  { title: '违约金比率', dataIndex: 'penaltyRate', key: 'penaltyRate' },
  { title: '违约金宽限天数', dataIndex: 'penaltyDays', key: 'penaltyDays' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'actions', width: 100 }
]
function openBatchModal() {
  batchModalVisible.value = true
  batchCheckedKeys.value = []
  batchPreviewList.value = []
}
function onBatchTreeCheck(checked:any) {
  const keys = Array.isArray(checked) ? checked : (checked?.checked || [])
  // 如果包含根节点 'all'，则展开并勾选所有可见子节点
  if (keys.includes('all')) {
    selectAllVisibleBatch()
    return
  }
  batchCheckedKeys.value = keys
}
function selectAllVisibleBatch() {
  const keys: string[] = []
  function walk(nodes:any[]) { for (const n of nodes) { if (n && n.key != null) keys.push(String(n.key)); if (n.children) walk(n.children) } }
  walk(treeData.value)
  batchCheckedKeys.value = Array.from(new Set(keys))
}
function clearBatchSelection() { batchCheckedKeys.value = []; batchPreviewList.value = [] }
function onBatchTreeSearchEnter() {
  const q = (batchTreeSearch.value||'').trim().toLowerCase()
  if (!q) { expandedKeys.value = []; return }
  const matched: string[] = []
  function collect(nodes:any[], parents:string[] = []) {
    for (const n of nodes) {
      const title = String(n.meta?.area || n.meta?.building || n.meta?.roomId || (n.title && n.title.children) || n.title || '')
      const key = String(n.key || '')
      const path = [...parents, key]
      if (title.toLowerCase().includes(q)) matched.push(...path)
      if (n.children) collect(n.children, path)
    }
  }
  collect(treeData.value)
  expandedKeys.value = Array.from(new Set(matched))
}
function doBatchPreview() {
  const roomIds = collectRoomIdsFromCheckedKeys()
  const list = allRooms.value.filter((r:any)=>roomIds.includes(String(r.roomId)))
  batchPreviewList.value = list.map(r=>({
    ...r,
    ...batchForm.value,
    id: 'F' + Date.now() + Math.random().toString().slice(-4)
  }))
}
function collectRoomIdsFromCheckedKeys(): string[] {
  const keys = Array.from(new Set(batchCheckedKeys.value || []))
  const roomIds:Set<string> = new Set()
  function walk(nodes:any[]) {
    for (const n of nodes) {
      const k = String(n.key)
      if (keys.includes(k)) {
        if (k.startsWith('room-')) {
          roomIds.add(String(n.meta?.roomId || k.replace('room-','')))
        } else if (k.startsWith('building-')) {
          if (n.children) {
            for (const c of n.children) {
              if (String(c.key).startsWith('room-')) roomIds.add(String(c.meta?.roomId || String(c.key).replace('room-','')))
            }
          }
        } else if (k.startsWith('area-')) {
          if (n.children) {
            for (const b of n.children) {
              if (b.children) {
                for (const c of b.children) {
                  if (String(c.key).startsWith('room-')) roomIds.add(String(c.meta?.roomId || String(c.key).replace('room-','')))
                }
              }
            }
          }
        } else if (k === 'all') {
          if (n.children) {
            for (const a of n.children) {
              if (a.children) {
                for (const b of a.children) {
                  if (b.children) {
                    for (const c of b.children) {
                      if (String(c.key).startsWith('room-')) roomIds.add(String(c.meta?.roomId || String(c.key).replace('room-','')))
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        if (n.children) walk(n.children)
      }
    }
  }
  walk(treeData.value)
  return Array.from(roomIds)
}
function doBatchCreate() {
  batchLoading.value = true
  setTimeout(() => {
    for (const item of batchPreviewList.value) {
      allFees.value.push({ ...item, id: 'F' + Date.now() + Math.random().toString().slice(-4) })
    }
    batchLoading.value = false
    message.success('批量生成完成')
    batchModalVisible.value = false
  }, 800)
}
function removePreviewRow(record:any) {
  const idx = batchPreviewList.value.findIndex((r:any)=>r.roomId === record.roomId)
  if (idx >= 0) batchPreviewList.value.splice(idx, 1)
}
// 导入/导出
const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
const importPreviewColumns = ref<any[]>([
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId' },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId' },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
  { title: '费项名称', dataIndex: 'feeItem', key: 'feeItem' },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
])
const pendingImportRows = ref<any[]>([])
// 费项/公式选择模态
const feePickerVisible = ref(false)
const formulaPickerVisible = ref(false)
const feeItems = ref([ { id: 'fee-1', name: '物业费' }, { id: 'fee-2', name: '水费' }, { id: 'fee-3', name: '电费' } ])
const formulaItems = ref([ { id: 'f-1', name: '按面积*单价' }, { id: 'f-2', name: '固定金额' } ])
function openFeePicker() { feePickerVisible.value = true }
function openFormulaPicker() { formulaPickerVisible.value = true }
function selectFeeItem(item:any) { batchForm.value.feeItem = item.name; feePickerVisible.value = false }
function selectFormulaItem(item:any) { batchForm.value.formulaName = item.name; formulaPickerVisible.value = false }
function onImport() {
  const input = document.createElement('input')
  input.type='file'
  input.accept='.csv'
  input.onchange = ()=>{ const f = input.files && input.files[0]; if (f) handleImportFile(f) }
  input.click()
}
function handleImportFile(file: File) {
  parseCSV(file)
}
function parseCSV(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = String(e.target?.result || '')
    const lines = text.split(/\r?\n/).filter(l=>l.trim())
    if (!lines.length) { message.error('CSV 内容为空'); return }
    const headers = splitCsvLine(lines[0])
    const rows = lines.slice(1).map(l=>{
      const cols = splitCsvLine(l)
      const obj:any = {}
      for (let i=0;i<headers.length;i++) obj[headers[i]] = cols[i]
      return obj
    })
    const bad = rows.filter(r=>!(r['房间编号']||r['roomId']||r['room']||r['room_id']))
    if (bad.length) { message.error('部分行缺少 房间编号，导入取消'); return }
    pendingImportRows.value = rows.map((r, idx)=>{
      const roomId = r['房间编号']||r['roomId']||r['room']||r['room_id']
      const room = allRooms.value.find((x:any)=>String(x.roomId) === String(roomId))
      return { __row: idx, roomId, customerId: room?.customerId||'', customerName: room?.customerName||'', feeItem: r['费项名称']||'', unitPrice: Number(r['单价']||0), amount: Number(r['金额']||0), startDate: r['开始日期']||'', endDate: r['结束日期']||'', remark: r['备注']||'' }
    })
    importPreviewRows.value = pendingImportRows.value
    importPreviewVisible.value = true
  }
  reader.readAsText(file, 'utf-8')
}
function splitCsvLine(line: string): string[] {
  const res: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { res.push(cur); cur = ''; continue }
    cur += ch
  }
  res.push(cur)
  return res.map(s => s.trim())
}
function confirmImport() {
  for (const r of pendingImportRows.value) {
    allFees.value.push({ ...r, id: 'F' + Date.now() + Math.random().toString().slice(-4) })
  }
  message.success('导入完成: ' + pendingImportRows.value.length + ' 行')
  pendingImportRows.value = []
  importPreviewVisible.value = false
}
function onExport() {
  const headers = feeColumns.map(c=>c.title)
  const rows = displayFees.value.map((f:any)=>headers.map(h=>f[feeColumns.find(c=>c.title===h)?.dataIndex||'']??''))
  const csv = headers.join(',') + '\n' + rows.map(r=>r.map((c:any)=>`"${c??''}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.setAttribute('download','周期费用列表.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
}
</script>

<style scoped>
.fee-layout { display:flex; height:100vh }
.tree-panel { width:300px; border-right:1px solid #eee; padding:12px; background:#fff; box-sizing:border-box; overflow:auto }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0)); border-radius:4px }
.data-panel { flex:1; padding:12px; height:100vh; overflow:auto }
.table-wrapper { height: calc(100vh - 120px); overflow-y: auto; }
</style>
