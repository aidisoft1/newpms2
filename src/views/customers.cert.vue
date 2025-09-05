<template>
  <div class="building-page">
    <div class="building-layout">
      <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
        <div style="padding:6px 8px; display:flex; gap:8px; align-items:center;">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 / 房间（按 Enter 或点击 查询）" allow-clear @input="onTreeSearchInput" @keyup.enter="onTreeSearchEnter" style="flex:1" />
          <a-button type="primary" @click="onTreeSearchEnter">查询</a-button>
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

      <div class="data-panel">
        <div class="toolbar" style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:8px">
          <a-space>
            <a-button type="text" @click="openFilter">高级筛选</a-button>
            <a-button type="text" @click="toggleInlineFilter_cert_1">行内筛选</a-button>
            <a-button type="text" @click="onImport">导入</a-button>
            <a-button type="text" @click="onExport">导出</a-button>
            <a-button type="text" @click="doRequestFullscreen" style="padding:4px 8px; display:flex; align-items:center"><component :is="FullscreenOutlined" /></a-button>
          </a-space>
        </div>

  <div v-show="inlineFilterVisible_cert_1" class="inline-filter compact-inline" style="margin-bottom:8px; display:flex; gap:8px; align-items:center;">
          <a-select
            v-model:value="filterForm.buildingId"
            :options="buildingOptions"
            placeholder="楼宇"
            style="min-width:180px"
            allow-clear
            show-search
            option-filter-prop="label"
          />
          <a-input v-model:value="filterForm.roomId" placeholder="房间" style="min-width:120px" allow-clear />
          <a-input v-model:value="filterForm.name" placeholder="姓名" style="min-width:160px" allow-clear />
          <a-input v-model:value="filterForm.phone" placeholder="手机号" style="min-width:140px" allow-clear />
          <a-space>
            <a-button @click="resetInlineFilter">重置</a-button>
          </a-space>
        </div>

        <a-config-provider :locale="zhCN">
          <div style="max-width:980px; margin:0 auto">
            <a-row :gutter="12" style="margin-bottom:12px">
              <a-col :span="8">
                <a-card size="small">
                  <div style="font-size:14px;color:#666">所选管理区</div>
                  <div style="font-size:18px;font-weight:600;margin-top:6px">{{ selectedLabel || '未选择' }}</div>
                </a-card>
              </a-col>

              <a-col :span="8">
                <a-card size="small">
                  <div style="font-size:12px;color:#666">楼宇数</div>
                  <div style="font-size:18px;font-weight:600;margin-top:6px">{{ stats.buildings }}</div>
                </a-card>
              </a-col>

              <a-col :span="8">
                <a-card size="small">
                  <div style="font-size:12px;color:#666">已绑定用户数</div>
                  <div style="font-size:18px;font-weight:600;margin-top:6px">{{ stats.customers }}</div>
                </a-card>
              </a-col>
            </a-row>

            <a-card size="small">
              <a-table
                :data-source="filteredCustomers"
                :pagination="{ pageSize: 8 }"
                row-key="_key"
                size="small"
              >
                <a-table-column title="楼宇" dataIndex="buildingId" key="buildingId" />
                <a-table-column title="房间" dataIndex="roomId" key="roomId" />
                <a-table-column title="姓名" dataIndex="name" key="name" />
                <a-table-column title="手机号" dataIndex="phone" key="phone" />
                <a-table-column title="绑定类型" dataIndex="bindType" key="bindType" />
                <a-table-column title="操作" key="actions" :customRender="renderActions" />
              </a-table>
            </a-card>
          </div>

          <!-- 编辑由 customers.info.vue 提供；此处触发全局事件打开该页面的编辑模态 -->

          <!-- 高级筛选抽屉（与行内筛选共享同一 filterForm，实现联动） -->
          <a-drawer v-model:visible="filterModalVisible" title="高级筛选" width="360">
            <div class="drawer-body scrollable-form">
              <div class="drawer-inner">
                <a-form-item label="管理区">
                  <a-input v-model:value="filterForm.area" placeholder="管理区" />
                </a-form-item>

                <a-form-item label="楼宇">
                  <a-select v-model:value="filterForm.buildingId" :options="buildingOptions" allow-clear show-search option-filter-prop="label" />
                </a-form-item>

                <a-form-item label="房间">
                  <a-input v-model:value="filterForm.roomId" placeholder="房间号" />
                </a-form-item>

                <a-form-item label="姓名">
                  <a-input v-model:value="filterForm.name" placeholder="姓名" />
                </a-form-item>

                <a-form-item label="手机号">
                  <a-input v-model:value="filterForm.phone" placeholder="手机号" />
                </a-form-item>

                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
                  <a-button @click="resetFilter">重置</a-button>
                  <a-button type="primary" @click="applyFilter">应用筛选</a-button>
                </div>
              </div>
            </div>
          </a-drawer>
        </a-config-provider>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted, nextTick, inject, computed, watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { FullscreenOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// set dayjs locale
dayjs.locale('zh-cn')

const zhCNLocale = zhCN
const toggleFullscreen = inject('toggleFullscreen') as (() => void) | undefined
const requestTabFullscreen = inject('requestTabFullscreen') as ((component?: any) => void) | undefined

// sample data
const areaBuildings = {
  '管理区A': ['楼宇A1', '楼宇A2'],
  '管理区B': ['楼宇B1']
}
const roomList = [
  { buildingId: '楼宇A1', roomId: '101', name: '张三', phone: '13800000001', bindType: '业主', idType: '身份证', idNumber: '110101199001010011', bindTime: '2025-08-01', remark: '', auditor: '管理员' },
  { buildingId: '楼宇A2', roomId: '201', name: '李四', phone: '13800000002', bindType: '租户', idType: '身份证', idNumber: '110101199002020022', bindTime: '2025-08-02', remark: '', auditor: '管理员' }
]

const treeData = ref<any[]>([])
const expandedKeys = ref<any[]>([])
const selectedKeys = ref<any[]>([])
const treeSearch = ref('')
const treePanelRef = ref<any>(null)
const sidebarWidth = ref<number>(260)
const dragging = ref(false)

function buildTree() {
  const nodes: any[] = []
  let areaIdx = 1
  for (const [areaName, buildings] of Object.entries(areaBuildings)) {
    const buildingNodes = buildings.map((bName, idx) => {
      const roomNodes = roomList.filter(r => r.buildingId === bName).map(r => ({
        title: h('span', { class: 'tree-node-title' }, `${r.roomId} ${r.name}`),
        key: `${areaIdx}-${idx + 1}-${r.roomId}`,
        isLeaf: true,
        meta: r
      }))
      return { title: h('span', { class: 'tree-node-title' }, [bName]), key: `${areaIdx}-${idx + 1}`, children: roomNodes, meta: { buildingId: bName } }
    })
    nodes.push({ title: h('span', { class: 'tree-node-title' }, [areaName]), key: `${areaIdx}`, children: buildingNodes, meta: { areaName } })
    areaIdx++
  }
  treeData.value = nodes
}
buildTree()

function onTreeExpand(keys: any[]) { expandedKeys.value = keys }
function onSelect(keys: any[], info: any) {
  selectedKeys.value = keys
  if (info.node && info.node.isLeaf && info.node.meta) {
    const meta = { ...info.node.meta }
    if (meta.bindTime) meta.bindTime = dayjs(meta.bindTime)
    Object.assign(form.value, meta)
  }
}

function onSplitterDown(e: MouseEvent) { dragging.value = true; e.preventDefault() }
function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect()
  const left = parentRect ? parentRect.left : 0
  const newWidth = Math.min(560, Math.max(180, e.clientX - left))
  sidebarWidth.value = newWidth
}
function onMouseUp() { dragging.value = false }

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  selectFirstRoom()
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

function onTreeSearchInput(e: any) { treeSearch.value = e?.target?.value ?? (e || '') }
function onTreeSearchEnter() { /* optional search */ }

// toolbar & filter
const filterModalVisible = ref(false)
const inlineFilterVisible_cert_1 = ref(false)
const filterForm = ref({ area: '', buildingName: '', roomId: '', name: '', buildingId: '', phone: '' })
function toggleInlineFilter_cert_1() { inlineFilterVisible_cert_1.value = !inlineFilterVisible_cert_1.value }
function openFilter() { 
  // Ensure drawer shows current inline filter values (they share filterForm)
  filterModalVisible.value = true 
}
function cancelFilter() { filterModalVisible.value = false }
function resetFilter() { filterForm.value = { area: '', buildingName: '', roomId: '', name: '', buildingId: '', phone: '' } }
function resetInlineFilter() { filterForm.value.buildingId = ''; filterForm.value.roomId = ''; filterForm.value.name = ''; filterForm.value.phone = '' }
function debounceFnLocal(fn: (...args: any[]) => void, wait = 250) {
  let t: any = null
  return (...args: any[]) => { if (t) clearTimeout(t); t = setTimeout(() => fn(...args), wait) }
}
const applyInlineDebounced = debounceFnLocal(() => { /* computed filteredCustomers will react to filterForm */ }, 250)
watch(filterForm, () => { if (inlineFilterVisible_cert_1.value) applyInlineDebounced() }, { deep: true })
// compute building options from areaBuildings for select
const buildingOptions = computed(() => {
  const opts: any[] = []
  for (const [, buildings] of Object.entries(areaBuildings)) {
    for (const b of (buildings as string[])) {
      opts.push({ label: b, value: b })
    }
  }
  return opts
})

function applyFilter() {
  // filterForm is already updated; closing drawer will let computed filteredCustomers react
  filterModalVisible.value = false
  message.success('已应用筛选')
}
function onImport() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv'; input.onchange = () => { const f = input.files && input.files[0]; if (f) message.info('已选择文件：' + f.name) }; input.click() }
function onExport() { message.info('导出功能（示例）') }
function doRequestFullscreen() { if (requestTabFullscreen) requestTabFullscreen(); else if (toggleFullscreen) toggleFullscreen() }


const form = ref({ buildingId: '', roomId: '', bindType: '', name: '', phone: '', idType: '', idNumber: '', bindTime: null as any, remark: '', auditor: '' })

function onApprove() { message.success('已通过认证'); form.value.auditor = '管理员' }
function onReject() { message.error('已拒绝认证'); form.value.auditor = '管理员' }

// overview / edit modal state
const editModalVisible = ref(false)

// prepare customers data derived from roomList for demo
const customersData = ref<any[]>(roomList.map((r, idx) => ({ ...r, _key: idx + '' })))

// ...computed/watch imported above

const selectedLabel = computed(() => {
  if (!selectedKeys.value || !selectedKeys.value.length) return ''
  // if a building or area selected show its title
  const sel = selectedKeys.value[0]
  // simple heuristic: key like "1-1" is building, "1-1-101" is room
  const parts = String(sel).split('-')
  if (parts.length === 1) return treeData.value.find(n => n.key === sel)?.meta?.areaName || ''
  if (parts.length === 2) {
    const areaNode = treeData.value.find(n => n.key === parts[0])
    const buildingNode = areaNode?.children?.find((c: any) => c.key === sel)
    return buildingNode?.meta?.buildingId || ''
  }
  return ''
})

const filteredCustomers = computed(() => {
  // base by tree selection
  let base = customersData.value.slice()
  if (selectedKeys.value && selectedKeys.value.length) {
    const sel = selectedKeys.value[0]
    const parts = String(sel).split('-')
    if (parts.length === 1) {
      const areaNode = treeData.value.find(n => n.key === sel)
      const buildingNames = (areaNode?.children || []).map((b: any) => b.meta?.buildingId).filter(Boolean)
      base = customersData.value.filter(c => buildingNames.includes(c.buildingId))
    } else if (parts.length === 2) {
      const buildingNode = treeData.value.find(n => n.key === parts[0])?.children?.find((c: any) => c.key === sel)
      const bName = buildingNode?.meta?.buildingId
      base = customersData.value.filter(c => c.buildingId === bName)
    } else if (parts.length >= 3) {
      const roomId = parts[2]
      base = customersData.value.filter(c => c.roomId === roomId)
    }
  }

  // apply inline filters from filterForm
  const f: any = filterForm.value || {}
  if (f.buildingId) base = base.filter(b => String((b.buildingId || '')).includes(String(f.buildingId)))
  if (f.roomId) base = base.filter(b => String((b.roomId || '')).includes(String(f.roomId)))
  if (f.name) base = base.filter(b => String((b.name || b.customerName || '')).toLowerCase().includes(String(f.name).toLowerCase()))
  if (f.phone) base = base.filter(b => String((b.phone || '')).includes(String(f.phone)))

  return base
})

const stats = computed(() => {
  const list = filteredCustomers.value
  const buildings = Array.from(new Set(list.map((r: any) => r.buildingId))).length
  const customers = list.length
  return { buildings, customers }
})

// inline filter state is defined earlier; resetInlineFilter handled via resetFilter

function renderActions(_: any, record: any) {
  return h('div', [
  h('a', { href: 'javascript:;', onClick: (e: any) => { e.preventDefault(); openEdit(record) } }, '查看')
  ])
}

function openEdit(record: any) {
  if (!record) return
  // dispatch a CustomEvent for other pages (customers.info.vue) to listen and open its modal
  try {
  const ev = new CustomEvent('open-customer-edit', { detail: { record, readOnly: true } })
    window.dispatchEvent(ev)
  } catch (e) {
    // fallback: open local modal (if still present)
    Object.assign(form.value, { ...record })
    if (form.value.bindTime) form.value.bindTime = dayjs(form.value.bindTime)
    editModalVisible.value = true
    nextTick(() => attachModalDrag())
  }
}

// draggable modal helpers
let dragState: any = null
function attachModalDrag() {
  try {
    const wrap = document.querySelector('.ant-modal') as HTMLElement | null
    const header = wrap?.querySelector('.ant-modal-header') as HTMLElement | null
    if (!wrap || !header) return
    header.style.cursor = 'move'
    dragState = { wrap, header, startX: 0, startY: 0, origLeft: 0, origTop: 0 }
    const onMouseDown = (e: MouseEvent) => {
      dragState.startX = e.clientX
      dragState.startY = e.clientY
      const rect = wrap.getBoundingClientRect()
      dragState.origLeft = rect.left
      dragState.origTop = rect.top
      document.addEventListener('mousemove', onMouseMoveModal)
      document.addEventListener('mouseup', onMouseUpModal)
    }
    const onMouseMoveModal = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX
      const dy = e.clientY - dragState.startY
      wrap.style.transform = 'none'
      wrap.style.left = dragState.origLeft + dx + 'px'
      wrap.style.top = dragState.origTop + dy + 'px'
      wrap.style.position = 'absolute'
    }
    const onMouseUpModal = () => {
      document.removeEventListener('mousemove', onMouseMoveModal)
      document.removeEventListener('mouseup', onMouseUpModal)
    }
    // store listeners so we can remove later
    ;(dragState as any).onMouseDown = onMouseDown
    header.addEventListener('mousedown', onMouseDown)
  } catch (e) { /* ignore */ }
}

function detachModalDrag() {
  try {
    if (!dragState) return
    const { header, onMouseDown } = dragState
    header?.removeEventListener('mousedown', onMouseDown)
    dragState = null
  } catch (e) { /* ignore */ }
}

async function selectFirstRoom() {
  await nextTick()
  for (const a of treeData.value) {
    if (a.children && a.children.length) {
      for (const b of a.children) {
        if (b.children && b.children.length) {
          const leaf = b.children.find((c: any) => c.isLeaf)
          if (leaf) {
            expandedKeys.value = [a.key, b.key]
            selectedKeys.value = [leaf.key]
            if (leaf.meta) {
              const meta = { ...leaf.meta }
              if (meta.bindTime) meta.bindTime = dayjs(meta.bindTime)
              Object.assign(form.value, meta)
            }
            return
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.building-page { padding: 0 }
.building-layout { display:flex; height:100vh }
.tree-panel { width:260px; border-right:1px solid #eee; padding:16px 8px; background:#fff; height:100vh; box-sizing:border-box; overflow:auto }
.splitter { width:6px; cursor:col-resize; background:linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.data-panel { flex:1; padding:16px; height:100vh; overflow:auto }
.tree-node-title { display:inline-flex; align-items:center; gap:6px }

/* drawer scrollable form */
.drawer-body { height: calc(100% - 56px); /* leave space for header */ padding: 12px 8px; box-sizing: border-box }
.drawer-inner { max-height: 100%; overflow: auto; white-space: nowrap }
.drawer-inner > * { display: block; white-space: normal }
</style>
