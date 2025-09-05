<template>
  <div class="building-page">
    <div class="building-layout">
      <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
        <div style="padding:6px 8px; display:flex; gap:8px; align-items:center;">
              <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 / 房间（按 Enter 或点击 查询）" allow-clear @input="onTreeSearchInput" @keyup.enter="onTreeSearchEnter" style="flex:1" />
              <a-button type="primary" @click="onTreeSearchEnter">查询</a-button>
            </div>
        
        <!-- 使用 Antd 的 a-tree 显示 3 级管理区->楼宇->房间，并在 expand 时按需加载 children -->
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
        <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
              <a-space>
              <a-button type="primary" @click="onAdd">新增房间</a-button>
              <a-button type="text" @click="openFilter">高级筛选</a-button>
              <a-button type="text" @click="toggleInlineFilter">行内筛选</a-button>
              <a-button type="text" @click="onImport">导入</a-button>
              <a-button type="text" @click="onExport">导出</a-button>
              <a-button type="text" @click="doRequestFullscreen" style="padding:4px 8px; display:flex; align-items:center">
                <component :is="FullscreenOutlined" />
                <span style="margin-left:6px">全屏</span>
              </a-button>
            </a-space>
          </div>
          
        </div>

        <div v-show="inlineFilterVisible" class="inline-filter compact-inline" style="margin-bottom:8px;">
          <a-form :model="filterForm" layout="inline">
            <a-form-item>
              <a-select v-model:value="filterForm.area" :options="areaOptions" show-search allow-clear placeholder="管理区" style="min-width:140px" @change="onAreaChange" />
            </a-form-item>
            <a-form-item>
              <a-select v-model:value="filterForm.buildingName" :options="buildingOptions" show-search allow-clear placeholder="楼宇" style="min-width:140px" @change="onBuildingChange" />
            </a-form-item>
            <a-form-item>
              <a-select v-model:value="filterForm.roomId" :options="roomOptions" show-search allow-clear placeholder="房间" style="min-width:180px" />
            </a-form-item>
            <a-form-item>
              <a-select v-model:value="filterForm.customerName" :options="customerNameOptions" show-search allow-clear placeholder="客户姓名" style="min-width:140px" />
            </a-form-item>
            <a-form-item class="inline-actions">
              <a-button style="margin:0 6px" @click="resetFilter">重置</a-button>
              <a-button type="primary" @click="applyFilter">查询</a-button>
            </a-form-item>
          </a-form>
        </div>

       <a-table
  :columns="tableColumns"
  :data-source="tableData"
  row-key="roomId"
  bordered
  :scroll="{ x: 1800, y: 420 }"
  size="small"
  :row-class-name="() => 'dense-row'"
  style="width:100%;"
>
        >
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'actions'">
              <div class="table-actions">
                <a-button type="link" size="small" @click="onEdit(slotProps.record)">编辑</a-button>
                <a-button type="link" size="small" danger @click="onDelete(slotProps.record)">删除</a-button>
              </div>
            </template>
              <template v-else-if="slotProps.column.key === 'isRented'">
                <a-tag :color="slotProps.record.isRented ? 'orange' : 'green'">{{ slotProps.record.isRented ? '是' : '否' }}</a-tag>
              </template>
          </template>
        </a-table>

  <a-modal v-model:visible="editModalVisible" title="编辑 / 新增 房间" :footer="null" @cancel="handleEditCancel" width="600px">
    <a-card size="small">
      <div class="modal-body-scroll">
        <a-form :model="editForm" layout="vertical">
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="房间编号">
                <a-input v-model:value="editForm.roomId" placeholder="房间编号" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="房间名称">
                <a-input v-model:value="editForm.roomName" placeholder="房间名称" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="客户编号">
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input v-model:value="editForm.customerId" placeholder="客户编号" style="flex:1" />
                  <a-button size="small" @click="openCustomerPicker">选择</a-button>
                </div>
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="客户名称">
                <a-input v-model:value="editForm.customerName" placeholder="客户名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="建筑面积">
                <a-input v-model:value="editForm.grossArea" placeholder="建筑面积" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="使用面积">
                <a-input v-model:value="editForm.netArea" placeholder="使用面积" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="分摊面积">
                <a-input v-model:value="editForm.sharedArea" placeholder="分摊面积" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="房间类型">
                <a-select v-model:value="editForm.roomType" placeholder="房间类型" allow-clear>
                  <a-select-option value="住宅">住宅</a-select-option>
                  <a-select-option value="商用">商用</a-select-option>
                  <a-select-option value="其它">其它</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="权属类型">
                <a-select v-model:value="editForm.ownershipType" placeholder="权属类型" allow-clear>
                  <a-select-option value="自有">自有</a-select-option>
                  <a-select-option value="租赁">租赁</a-select-option>
                  <a-select-option value="其他">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="房间地址">
                <a-input v-model:value="editForm.address" placeholder="房间地址" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="朝向">
                <a-input v-model:value="editForm.orientation" placeholder="朝向" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="是否出租">
                <a-switch v-model:checked="editForm.isRented" />
              </a-form-item>
            </a-col>

            <a-col :span="24">
              <a-form-item label="备注">
                <a-input v-model:value="editForm.remark" placeholder="备注" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <div class="modal-footer-fixed">
      <a-button @click="handleEditCancel" style="margin-right: 12px">取消</a-button>
      <a-button type="primary" @click="handleEditOk">确定</a-button>
    </div>
  </a-modal>

  <!-- 客户选择器弹窗（可搜索表格） -->
  <a-modal v-model:visible="customerPickerVisible" title="选择客户" :footer="null" width="720px" @cancel="() => (customerPickerVisible = false)">
    <a-card size="small">
      <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center">
        <a-input v-model:value="customerPickerQuery" placeholder="按 客户编号/姓名/联系人 搜索" allow-clear style="flex:1" @input="onCustomerPickerInput" />
        <a-button type="primary" @click="openCreateCustomer">新建客户</a-button>
        <a-button @click="clearCustomerPickerQuery">清除</a-button>
      </div>
      <div style="max-height:52vh; overflow:auto">
        <a-table :columns="customerTableColumns" :data-source="filteredCustomers" row-key="customerId" size="small"
                 :loading="remoteLoading"
                 :pagination="{ current: remotePage, pageSize: remotePageSize, total: remoteTotal }"
                 @change="onCustomerTableChange">
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.dataIndex === 'customerId'">
              <span><strong>{{ slotProps.record.customerId }}</strong></span>
            </template>
            <template v-else-if="slotProps.column.dataIndex === 'customerName'">
              <span>{{ slotProps.record.customerName }}</span>
            </template>
            <template v-else-if="slotProps.column.dataIndex === 'contact'">
              <span style="color:var(--muted-color)">{{ slotProps.record.contact || '' }}</span>
            </template>
            <template v-else-if="slotProps.column.dataIndex === 'phone'">
              <span>{{ slotProps.record.phone || '' }}</span>
            </template>
            <template v-else-if="slotProps.column.dataIndex === 'address'">
              <span>{{ slotProps.record.address || '' }}</span>
            </template>
            <template v-else-if="slotProps.column.dataIndex === 'actions'">
              <a-button size="small" type="primary" @click="() => selectCustomer(slotProps.record)">选择</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </a-modal>

  <!-- 快速新建客户弹窗（用于选择器内） -->
  <a-modal v-model:visible="createCustomerVisible" title="新建客户" :confirm-loading="createLoading" @cancel="() => (createCustomerVisible = false)" width="520px" :footer="null">
    <a-card size="small">
      <a-form :model="createForm" layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="客户编号">
              <a-input v-model:value="createForm.customerId" placeholder="客户编号（可选）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="客户姓名">
              <a-input v-model:value="createForm.customerName" placeholder="客户姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系人">
              <a-input v-model:value="createForm.contact" placeholder="联系人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="电话">
              <a-input v-model:value="createForm.phone" placeholder="联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="地址">
              <a-input v-model:value="createForm.address" placeholder="地址" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <div class="modal-footer-fixed">
      <a-button @click="() => (createCustomerVisible = false)" style="margin-right:12px">取消</a-button>
      <a-button type="primary" :loading="createLoading" @click="createCustomer">创建并选择</a-button>
    </div>
  </a-modal>

        <a-drawer v-model:visible="filterModalVisible" title="高级筛选" placement="right" :width="360" @close="cancelFilter">
          <a-form :model="filterForm" layout="vertical">
            <a-form-item label="房间编号">
              <a-select v-model:value="filterForm.roomId" :options="roomIdOptions" show-search :filter-option="false" allow-clear placeholder="可下拉选择或输入" style="width:100%" @search="onSearchRoomId" :loading="loadingRoomId" />
            </a-form-item>
            <a-form-item label="客户编号">
              <a-select v-model:value="filterForm.customerId" :options="customerIdOptions" show-search :filter-option="false" allow-clear placeholder="可下拉选择或输入" style="width:100%" @search="onSearchCustomerId" :loading="loadingCustomerId" />
            </a-form-item>
            <a-form-item label="客户名称">
              <a-select v-model:value="filterForm.customerName" :options="customerNameOptions" show-search :filter-option="false" allow-clear placeholder="可下拉选择或输入" style="width:100%" @search="onSearchCustomerName" :loading="loadingCustomerName" />
            </a-form-item>
            <a-form-item label="楼宇名称">
              <a-input v-model:value="filterForm.buildingName" placeholder="可部分匹配" />
            </a-form-item>
            <a-form-item label="是否出租">
              <a-select v-model:value="filterForm.isRented" :options="[{ label: '是', value: 'true' }, { label: '否', value: 'false' }]" allow-clear placeholder="是否出租" />
            </a-form-item>
            <a-form-item label="房间类型">
              <a-input v-model:value="filterForm.roomType" placeholder="可部分匹配" />
            </a-form-item>
            <a-form-item style="text-align:right; margin-top:12px">
              <a-button style="margin-right:8px" @click="resetFilter">重置</a-button>
              <a-button type="primary" @click="applyFilter">查询</a-button>
            </a-form-item>
          </a-form>
        </a-drawer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, h, computed, nextTick, watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import { FullscreenOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/antd.css'
import { Modal, message } from 'ant-design-vue'

// 注入主布局提供的全屏切换函数（可选）与标签页请求全屏
const toggleFullscreen = inject('toggleFullscreen') as (() => void) | undefined
const requestTabFullscreen = inject('requestTabFullscreen') as ((component?: any) => void) | undefined

// 树与表格数据
// 初始为简单的全部节点，后面基于房间数据构建管理区->楼宇->房间的三层树
const treeData = ref([{ title: '全部', key: 'all', level: 0 }])
// 扁平化节点（用于虚拟列表渲染）
const flatNodes = ref<any[]>([])
const treeContainerRef = ref<HTMLElement | null>(null)
const itemHeight = 32
const overscan = 6
const scrollTop = ref(0)
const startIndex = ref(0)

function flattenTree(nodes: any[], depth = 0, out: any[] = []) {
  for (const n of nodes) {
    out.push({ node: n, depth })
    if (n.expanded && n.children && n.children.length && !n.placeholder) {
      flattenTree(n.children, depth + 1, out)
    }
  }
  return out
}

function isVNodeTitle(t: any) {
  return t && (typeof t === 'object' || typeof t === 'function')
}

function extractVNodeText(t: any) {
  try {
    if (!t) return ''
    // if it's a VNode created via h(), children often in t.children or t.props.children
    if (typeof t === 'object') {
      if (t.children) {
        if (typeof t.children === 'string') return t.children
        if (Array.isArray(t.children)) {
          for (const c of t.children) {
            if (typeof c === 'string') return c
            if (c && c.children && typeof c.children === 'string') return c.children
            if (c && c.children && Array.isArray(c.children)) {
              const found = c.children.find((x: any) => typeof x === 'string')
              if (found) return found
            }
          }
        }
      }
      if (t.props && t.props.children) {
        if (typeof t.props.children === 'string') return t.props.children
      }
    }
  } catch (e) { }
  return ''
}

// 可视窗口的起始索引（用于计算每个可见项的绝对位置）
const visibleList = computed(() => {
  const total = flatNodes.value.length
  const container = treeContainerRef.value
  const containerHeight = container ? container.clientHeight : 600
  const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
  startIndex.value = start
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(total, start + visibleCount + overscan * 2)
  return flatNodes.value.slice(start, end)
})

function updateFlat() {
  flatNodes.value = flattenTree(treeData.value)
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  scrollTop.value = el.scrollTop
}

function toggleNode(n: any) {
  // if placeholder children present and not expanded, load
  if (!n) return
  if (!n.expanded) {
    // expand
    // case A: placeholder child exists (area placeholder) -> load
    if (n.children && n.children.length && n.children[0] && n.children[0].placeholder) {
      loadTreeData(n).then(() => {
        n.expanded = true
        updateFlat()
      })
    } else if ((!n.children || n.children.length === 0) && !n.isLeaf) {
      // case B: no children yet but node is not leaf (e.g. building created without placeholder) -> load
      loadTreeData(n).then(() => {
        n.expanded = true
        updateFlat()
      })
    } else {
      // otherwise just toggle expanded
      n.expanded = true
      updateFlat()
    }
  } else {
    // collapse
    n.expanded = false
    updateFlat()
  }
}

const treeSearch = ref('')
const expandedKeys = ref<string[]>([])

function collectMatchKeys(nodes: any[], q: string, matches: string[], parents: string[] = []) {
  for (const n of nodes) {
  // title may be a VNode; prefer meta fields, else try to extract text from VNode
  const rawTitle = n.meta?.areaName || n.meta?.buildingName || n.meta?.roomId || extractVNodeText(n.title) || String(n.title || '')
  const title = String(rawTitle)
    const key = String(n.key || '')
    const path = [...parents, key]
  if (title.toLowerCase().includes(q.toLowerCase())) {
      // push all path keys so the tree can expand to this node
      matches.push(...path)
    }
    if (n.children && n.children.length) collectMatchKeys(n.children, q, matches, path)
  }
}

const doTreeSearch = debounceFn((val: string) => {
  const q = String(val || '').trim()
  if (!q) {
    expandedKeys.value = []
    return
  }
  const matches: string[] = []
  collectMatchKeys(treeData.value, q, matches)
  // remove duplicates
  expandedKeys.value = Array.from(new Set(matches))
  // 如果有匹配，自动选中第一个匹配的房间或楼宇
  if (matches.length) {
    const first = matches[matches.length - 1]
    selectedKeys.value = [first]
    // 更新 selectedNode 为匹配节点（简单查找）
    function findNode(nodes: any[], k: string): any {
      for (const n of nodes) {
        if (String(n.key) === k) return n
        if (n.children) {
          const r = findNode(n.children, k)
          if (r) return r
        }
      }
      return null
    }
    const node = findNode(treeData.value, first)
    if (node) { selectedNode.value = node; filterTableData() }
  }
}, 300)

function onTreeSearchInput(e: any) {
  treeSearch.value = e?.target?.value ?? (e || '')
  doTreeSearch(treeSearch.value)
}

async function performTreeSearch(q: string) {
  const val = String(q || '').trim()
  if (!val) { expandedKeys.value = []; return }
  const matches: string[] = []
  collectMatchKeys(treeData.value, val, matches)
  const unique = Array.from(new Set(matches))
  // 如果在当前 treeData 中没有匹配（例如楼宇/房间尚未加载），尝试在 areaBuildings 与 allRooms 上查找并构造对应 key
  const targets: string[] = []
  if (unique.length === 0) {
    // 1) 查找匹配的管理区
    let areaIdx = 1
    for (const [aName, buildings] of Object.entries(areaBuildings)) {
      if (String(aName).toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(String(aName).toLowerCase())) {
        targets.push(`area-${areaIdx}`)
      }
      // 2) 查找匹配的楼宇
      let bIdx = 1
      for (const bName of buildings) {
        if (String(bName).toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(String(bName).toLowerCase())) {
          targets.push(`area-${areaIdx}`)
          targets.push(`building-${areaIdx}-${bIdx}`)
        }
        bIdx++
      }
      areaIdx++
    }
    // 3) 查找房间（按 roomId / buildingName / customerName）
    for (const r of allRooms.value) {
      if (String(r.roomId || '').toLowerCase().includes(val.toLowerCase()) || String(r.buildingName || '').toLowerCase().includes(val.toLowerCase()) || String(r.customerName || '').toLowerCase().includes(val.toLowerCase())) {
        // 找到该房间的所属楼宇与管理区索引
        let areaIdx2 = 1
        let found = false
        for (const [aName, buildings] of Object.entries(areaBuildings)) {
          let bIdx2 = 1
          for (const bName of buildings) {
            if (bName === r.buildingName) {
              targets.push(`area-${areaIdx2}`)
              targets.push(`building-${areaIdx2}-${bIdx2}`)
              targets.push(`room-${r.roomId}`)
              found = true
              break
            }
            bIdx2++
          }
          if (found) break
          areaIdx2++
        }
      }
    }
  }
  // 合并 unique 与 targets，保持父在前的顺序
  const combined = Array.from(new Set([...unique, ...targets]))
  // Load children for nodes that need loading, in order
  for (const k of combined) {
    const n = findNodeByKey(treeData.value, k)
    if (n && !n.isLeaf && (!n.children || n.children.length === 0 || (n.children.length === 1 && n.children[0].placeholder))) {
      try { await loadTreeData(n) } catch (e) { /* ignore */ }
    } else if (!n) {
      // 如果节点还不存在（例如 building key 在 area 尚未加载），尝试加载其父 area 再查找
      if (k.startsWith('building-')) {
        const parts = k.split('-')
        if (parts.length >= 3) {
          const areaK = `area-${parts[1]}`
          const areaNode = findNodeByKey(treeData.value, areaK)
          if (areaNode && (!areaNode.children || areaNode.children.length === 0 || (areaNode.children.length === 1 && areaNode.children[0].placeholder))) {
            try { await loadTreeData(areaNode) } catch (e) { }
          }
        }
      }
      if (k.startsWith('room-')) {
        const roomId = k.slice(5)
        // 找到房间对应的楼宇/管理区然后加载
        const room = allRooms.value.find(r => String(r.roomId) === String(roomId))
        if (room) {
          // find area/building indices
          let areaIdx3 = 1
          for (const [aName, buildings] of Object.entries(areaBuildings)) {
            let bIdx3 = 1
            for (const bName of buildings) {
              if (bName === room.buildingName) {
                const areaK = `area-${areaIdx3}`
                const areaNode2 = findNodeByKey(treeData.value, areaK)
                if (areaNode2 && (!areaNode2.children || areaNode2.children.length === 0 || (areaNode2.children.length === 1 && areaNode2.children[0].placeholder))) {
                  try { await loadTreeData(areaNode2) } catch (e) { }
                }
                const buildingK = `building-${areaIdx3}-${bIdx3}`
                const bNode = findNodeByKey(treeData.value, buildingK)
                if (bNode && (!bNode.children || bNode.children.length === 0)) {
                  try { await loadTreeData(bNode) } catch (e) { }
                }
                break
              }
              bIdx3++
            }
            areaIdx3++
          }
        }
      }
    }
  }
  expandedKeys.value = combined
  if (matches.length || combined.length) {
    const first = (matches.length ? matches[matches.length - 1] : combined[combined.length - 1])
    selectedKeys.value = [first]
    const node = findNodeByKey(treeData.value, first)
    if (node) { selectedNode.value = node; filterTableData() }
  }
}

function onTreeSearchEnter() {
  // 按 Enter 或点击 查询 按钮时立即执行搜索（不走防抖）并等待加载完成
  performTreeSearch(treeSearch.value)
}

const selectedKeys = ref(['all'] as string[])
const selectedNode = ref(treeData.value[0] as any)

function onSelect(keys: any, info: any) {
  selectedKeys.value = keys
  // info.node may be a raw object or VNode title; find actual node in treeData by key
  const k = Array.isArray(keys) ? keys[0] : keys
  const node = findNodeByKey(treeData.value, k)
  selectedNode.value = node || info.node
  filterTableData()
}

function findNodeByKey(nodes: any[], key: string): any {
  for (const n of nodes) {
    if (String(n.key) === String(key)) return n
    if (n.children && n.children.length) {
      const r = findNodeByKey(n.children, key)
      if (r) return r
    }
  }
  return null
}

async function onTreeExpand(keys: string[]) {
  expandedKeys.value = keys
  // 加载所有新展开但尚未加载 children 的节点
  for (const k of keys) {
    const n = findNodeByKey(treeData.value, k)
    if (n && !n.isLeaf && (!n.children || n.children.length === 0 || (n.children.length === 1 && n.children[0].placeholder))) {
      // load
      // eslint-disable-next-line no-await-in-loop
      await loadTreeData(n)
    }
  }
  // 刷新 flatNodes（如果仍使用虚拟化）和 treeData
  updateFlat()
}

const allRooms = ref([
  { roomId: 'R001', roomName: '101单元', customerId: 'C001', customerName: '张三', buildingName: '楼宇A1', grossArea: '120', netArea: '100', sharedArea: '10', roomType: '住宅', ownershipType: '自有', usage: '居住', decoration: '精装', address: '地址A1-101', orientation: '南', isRented: false, remark: '' },
  { roomId: 'R002', roomName: '201套间', customerId: 'C002', customerName: '李四', buildingName: '楼宇A2', grossArea: '80', netArea: '70', sharedArea: '8', roomType: '住宅', ownershipType: '自有', usage: '居住', decoration: '简装', address: '地址A2-201', orientation: '东', isRented: true, remark: '' }
])

// 为了展示管理区→楼宇→房间的三层结构，我们使用一个简单的管理区到楼宇映射（可按实际数据替换）
const areaBuildings: Record<string, string[]> = {
  '管理区A': ['楼宇A1', '楼宇A2'],
  '管理区B': ['楼宇B1']
}

function buildTreeFromRooms() {
  const nodes: any[] = [{ title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, '全部') ]), key: 'all', level: 0 }]
  let areaIdx = 1
  for (const [areaName, buildings] of Object.entries(areaBuildings)) {
    // 预先为每个 area 生成楼宇节点（楼宇内房间仍按需展开加载）
    const buildingNodes: any[] = buildings.map((bName: string, idx: number) => {
      const meta = { type: 'building', areaName, buildingName: bName }
      // 计算该楼宇的房间数量，用于显示在 tag 上
      const cnt = allRooms.value.filter(r => r.buildingName === bName).length
  // 每个楼宇初始包含一个占位子节点，实际房间在展开时加载
  const placeholderChild = { title: h('span', '展开以加载房间'), key: `room-placeholder-${areaIdx}-${idx+1}`, isLeaf: true, placeholder: true }
  const titleVNode = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${cnt}室`) ])
  return { title: titleVNode, key: `building-${areaIdx}-${idx+1}`, isLeaf: false, meta, children: [placeholderChild] }
    })
    const areaNode: any = { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, areaName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${buildings.length}栋`) ]), key: `area-${areaIdx}`, level: 1, meta: { type: 'area', areaName }, children: buildingNodes }
    nodes.push(areaNode)
    areaIdx++
  }
  treeData.value = nodes
  // 更新扁平节点
  flatNodes.value = flattenTree(treeData.value)
}

// loadTreeData 用于按需加载区域下的楼宇，或楼宇下的房间
function loadTreeData(node: any) {
  return new Promise<void>((resolve) => {
    // node 包含属性：title, key, children
    const key = String(node.key || '')
    // 如果是 area 节点，加载该 area 下的楼宇占位
    if (key.startsWith('area-')) {
      const areaName = node.meta?.areaName || extractVNodeText(node.title) || node.title
      const buildings = areaBuildings[areaName] || []
      const children = buildings.map((bName: string, idx: number) => {
        // 楼宇初始为占位，房间在展开楼宇时再加载
        const meta = { type: 'building', areaName, buildingName: bName }
  return { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-badge', { count: 0, style: { marginLeft: '8px' } }), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `0室`) ]), key: `building-${key.split('-')[1]}-${idx+1}`, isLeaf: false, meta }
      })
  // replace placeholder children
  node.children = children
      // simulate async
  setTimeout(() => { flatNodes.value = flattenTree(treeData.value); resolve() }, 100)
      return
    }
    // 如果是楼宇节点，加载房间
    if (key.startsWith('building-')) {
      const buildingName = node.meta?.buildingName || extractVNodeText(node.title) || ''
      // 尝试精确匹配；若无结果，尝试包含匹配（对生成测试数据的楼宇名更宽容）
      let roomsForBuilding = allRooms.value.filter(r => r.buildingName === buildingName)
      if (!roomsForBuilding.length) {
        roomsForBuilding = allRooms.value.filter(r => (r.buildingName || '').includes(buildingName) || buildingName.includes(r.buildingName || ''))
      }
      let children: any[] = []
      if (roomsForBuilding.length) {
        children = roomsForBuilding.map((r: any) => {
          const roomMeta = { type: 'room', roomId: r.roomId, buildingName: r.buildingName }
          const titleVNode = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, `${r.roomId} ${r.roomName || ''}`), r.isRented ? h('a-badge', { dot: true, style: { marginLeft: '8px', background: '#fa8c16' } }) : null, h('span', { class: 'node-actions' }, [ h('a-button', { type: 'text', size: 'small', onClick: (e: Event) => { e.stopPropagation(); onNodeAdd(roomMeta) } }, { default: () => h('span', { class: 'action-icon' }, '+') }), h('a-button', { type: 'text', size: 'small', onClick: (e: Event) => { e.stopPropagation(); onNodeEdit(roomMeta) } }, { default: () => h('span', { class: 'action-icon' }, '✎') }) ]) ])
          return { title: titleVNode, key: `room-${r.roomId}`, isLeaf: true, meta: roomMeta }
        })
      } else {
        // 无房间时显示占位
        children = [{ title: h('span', { class: 'tree-node-title' }, '(无房间)'), key: `room-empty-${key}`, isLeaf: true, meta: { type: 'placeholder' } }]
      }
      node.children = children
      // 更新楼宇标题以显示房间数（如果存在 meta 则保留）
      const bName = node.meta?.buildingName || extractVNodeText(node.title) || ''
      node.title = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${children.length}室`) ])
      setTimeout(() => { flatNodes.value = flattenTree(treeData.value); resolve() }, 100)
      return
    }
    resolve()
  })
}

// 构建树（初始）
buildTreeFromRooms()

const tableColumns = [
  { title: '楼宇名称', dataIndex: 'buildingName', key: 'buildingName', width: 140 }, 
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 140 },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName', width: 140 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 140 },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180 },
  { title: '建筑面积', dataIndex: 'grossArea', key: 'grossArea', width: 100 },
  { title: '使用面积', dataIndex: 'netArea', key: 'netArea', width: 100 },
  { title: '分摊面积', dataIndex: 'sharedArea', key: 'sharedArea', width: 100 },
  { title: '房间类型', dataIndex: 'roomType', key: 'roomType', width: 120 },
  { title: '权属类型', dataIndex: 'ownershipType', key: 'ownershipType', width: 120 },
  { title: '用途', dataIndex: 'usage', key: 'usage', width: 120 },
  { title: '装修情况', dataIndex: 'decoration', key: 'decoration', width: 120 },
  { title: '房间地址', dataIndex: 'address', key: 'address', width: 320 },
  { title: '朝向', dataIndex: 'orientation', key: 'orientation', width: 90 },
  { title: '是否出租', dataIndex: 'isRented', key: 'isRented', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 200 },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' }
]

const tableData = ref([...allRooms.value])

// 筛选与表单
const filterModalVisible = ref(false)
const filterForm = ref({
  area: '', roomId: '', roomName: '', customerId: '', customerName: '', buildingName: '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: '', orientation: '', isRented: '', remark: ''
})
// 行内筛选默认隐藏（按用户要求）
const inlineFilterVisible = ref(false)

// 下拉选项：管理区 / 楼宇 / 房间（用于行内筛选）
const areaOptions = ref(Object.keys(areaBuildings).map(a => ({ label: a, value: a })))
// 计算所有楼宇列表（用于初始化与重置）
const allBuildingList = Object.values(areaBuildings).flat()
const buildingOptions = ref<any[]>(allBuildingList.map(b => ({ label: b, value: b })))
// roomOptions depends on roomIdOptions, initialize after it's declared

function onAreaChange(val: string) {
  if (!val) {
  // area 为空时恢复所有楼宇可选
  buildingOptions.value = allBuildingList.map(b => ({ label: b, value: b }))
  roomOptions.value = roomIdOptions.value
  filterForm.value.buildingName = ''
    return
  }
  const blds = areaBuildings[val] || []
  buildingOptions.value = blds.map(b => ({ label: b, value: b }))
  // reset building & room selection when area changes
  filterForm.value.buildingName = ''
  filterForm.value.roomId = ''
  roomOptions.value = roomIdOptions.value
}

function onBuildingChange(val: string) {
  if (!val) {
    roomOptions.value = roomIdOptions.value
    filterForm.value.roomId = ''
    return
  }
  const rooms = allRooms.value.filter(r => r.buildingName === val).map(r => ({ label: `${r.roomId} ${r.roomName || ''}`, value: r.roomId }))
  roomOptions.value = rooms
  filterForm.value.roomId = ''
}

const roomIdSet = Array.from(new Set(allRooms.value.map(b => b.roomId)))
const roomIdOptions = ref(roomIdSet.map(v => ({ label: v, value: v })))
const roomOptions = ref(roomIdOptions.value)
const customerIdSet = Array.from(new Set(allRooms.value.map(b => b.customerId)))
const customerIdOptions = ref(customerIdSet.map(v => ({ label: v, value: v })))
const customerNameSet = Array.from(new Set(allRooms.value.map(b => b.customerName)))
const customerNameOptions = ref(customerNameSet.map(v => ({ label: v, value: v })))

const loadingRoomId = ref(false)
const loadingCustomerId = ref(false)
const loadingCustomerName = ref(false)

// 简易防抖
function debounceFn(fn: (...args: any[]) => void, wait = 300) {
  let timer: any = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

let reqIdRoom = 0
let reqIdCustId = 0
let reqIdCustName = 0

function remoteSearchRoomIds(q: string, myId: number) {
  return new Promise<any>((resolve: any) => {
    const list = allRooms.value
      .map(b => b.roomId)
      .filter((v, i, a) => v && a.indexOf(v) === i && v.toLowerCase().includes((q || '').toLowerCase()))
      .map(v => ({ label: v, value: v }))
    setTimeout(() => resolve({ id: myId, res: list }), 200)
  })
}
function remoteSearchCustomerIds(q: string, myId: number) {
  return new Promise<any>((resolve: any) => {
    const list = allRooms.value
      .map(b => b.customerId)
      .filter((v, i, a) => v && a.indexOf(v) === i && v.toLowerCase().includes((q || '').toLowerCase()))
      .map(v => ({ label: v, value: v }))
    setTimeout(() => resolve({ id: myId, res: list }), 200)
  })
}
function remoteSearchCustomerNames(q: string, myId: number) {
  return new Promise<any>((resolve: any) => {
    const list = allRooms.value
      .map(b => b.customerName)
      .filter((v, i, a) => v && a.indexOf(v) === i && v.toLowerCase().includes((q || '').toLowerCase()))
      .map(v => ({ label: v, value: v }))
    setTimeout(() => resolve({ id: myId, res: list }), 200)
  })
}

const onSearchRoomId = debounceFn((val: string) => {
  reqIdRoom++
  const cur = reqIdRoom
  loadingRoomId.value = true
  remoteSearchRoomIds(val, cur).then(({ id, res }) => {
    if (id !== reqIdRoom) return
    roomIdOptions.value = res
  }).finally(() => { if (cur === reqIdRoom) loadingRoomId.value = false })
}, 300)

const onSearchCustomerId = debounceFn((val: string) => {
  reqIdCustId++
  const cur = reqIdCustId
  loadingCustomerId.value = true
  remoteSearchCustomerIds(val, cur).then(({ id, res }) => {
    if (id !== reqIdCustId) return
    customerIdOptions.value = res
  }).finally(() => { if (cur === reqIdCustId) loadingCustomerId.value = false })
}, 300)

const onSearchCustomerName = debounceFn((val: string) => {
  reqIdCustName++
  const cur = reqIdCustName
  loadingCustomerName.value = true
  remoteSearchCustomerNames(val, cur).then(({ id, res }) => {
    if (id !== reqIdCustName) return
    customerNameOptions.value = res
  }).finally(() => { if (cur === reqIdCustName) loadingCustomerName.value = false })
}, 300)

function toggleInlineFilter() { inlineFilterVisible.value = !inlineFilterVisible.value }
function openFilter() { filterModalVisible.value = true }
function cancelFilter() { filterModalVisible.value = false }
function resetFilter() { filterForm.value = { area: '', roomId: '', roomName: '', customerId: '', customerName: '', buildingName: '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: '', orientation: '', isRented: '', remark: '' }; buildingOptions.value = allBuildingList.map(b => ({ label: b, value: b })); roomOptions.value = roomIdOptions.value; filterTableData() }
function applyFilter() { filterModalVisible.value = false; filterTableData() }

function filterTableData() {
  let list = [...allRooms.value]
    if (selectedNode.value && selectedNode.value.key !== 'all') {
    const key = String(selectedNode.value.key || '')
    if (key.startsWith('area-')) {
      // area 节点，筛选出该管理区下所有楼宇的房间（通过 areaBuildings 映射）
      const areaName = selectedNode.value.meta?.areaName || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
      const buildings = areaBuildings[areaName] || []
      list = list.filter(b => buildings.includes(b.buildingName))
    } else if (key.startsWith('building-')) {
      // building 节点，按楼宇名称过滤
      const buildingName = selectedNode.value.meta?.buildingName || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
      list = list.filter(b => b.buildingName === buildingName)
    } else if (key.startsWith('room-')) {
      // room 节点，按房间号过滤
      const roomId = selectedNode.value.meta?.roomId || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
      list = list.filter(b => b.roomId === roomId)
    }
  }
  const f = filterForm.value || {}
  // area 行内筛选
  if (f.area) {
    const buildings = areaBuildings[f.area] || []
    list = list.filter(b => buildings.includes(b.buildingName))
  }
  // 直接选择的房间优先
  if (f.roomId) list = list.filter(b => String(b.roomId ?? '').includes(String(f.roomId)))
  if (f.roomName) list = list.filter(b => String(b.roomName ?? '').includes(String(f.roomName)))
  if (f.customerId) list = list.filter(b => String(b.customerId ?? '').includes(String(f.customerId)))
  if (f.customerName) list = list.filter(b => String(b.customerName ?? '').includes(String(f.customerName)))
  if (f.buildingName) list = list.filter(b => String(b.buildingName ?? '').includes(String(f.buildingName)))
  if (f.grossArea) list = list.filter(b => String(b.grossArea ?? '').includes(String(f.grossArea)))
  if (f.netArea) list = list.filter(b => String(b.netArea ?? '').includes(String(f.netArea)))
  if (f.sharedArea) list = list.filter(b => String(b.sharedArea ?? '').includes(String(f.sharedArea)))
  if (f.roomType) list = list.filter(b => String(b.roomType ?? '').includes(String(f.roomType)))
  if (f.ownershipType) list = list.filter(b => String(b.ownershipType ?? '').includes(String(f.ownershipType)))
  if (f.usage) list = list.filter(b => String(b.usage ?? '').includes(String(f.usage)))
  if (f.decoration) list = list.filter(b => String(b.decoration ?? '').includes(String(f.decoration)))
  if (f.address) list = list.filter(b => String(b.address ?? '').includes(String(f.address)))
  if (f.orientation) list = list.filter(b => String(b.orientation ?? '').includes(String(f.orientation)))
  if (f.isRented !== '') {
    const v = String(f.isRented).toLowerCase()
    if (v === 'true') list = list.filter(b => b.isRented === true)
    else if (v === 'false') list = list.filter(b => b.isRented === false)
  }
  if (f.remark) list = list.filter(b => String(b.remark ?? '').includes(String(f.remark)))
  tableData.value = list
}

// 编辑
const editModalVisible = ref(false)
const editForm = ref<any>({})
// modal 拖拽（room modal 专用）
const roomModalElRef = ref<HTMLElement | null>(null)
let roomHeaderMouseDown: ((e: MouseEvent) => void) | null = null
let roomDocMouseMove: ((e: MouseEvent) => void) | null = null
let roomDocMouseUp: ((e: MouseEvent) => void) | null = null
const roomModalDragging = ref(false)
let roomDragStartX = 0
let roomDragStartY = 0

function attachRoomModalDrag() {
  nextTick(() => {
    const modals = Array.from(document.querySelectorAll('.ant-modal')) as HTMLElement[]
    if (!modals.length) return
    const modalEl = modals[modals.length - 1]
    roomModalElRef.value = modalEl
    modalEl.style.margin = '0'
    modalEl.style.position = 'absolute'
    modalEl.style.zIndex = '1000'
    const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
    if (!header) return
    header.style.cursor = 'move'
    roomHeaderMouseDown = (e: MouseEvent) => {
      const rect = modalEl.getBoundingClientRect()
      roomDragStartX = e.clientX - rect.left
      roomDragStartY = e.clientY - rect.top
      roomModalDragging.value = true
      roomDocMouseMove = (ev: MouseEvent) => {
        if (!roomModalDragging.value || !roomModalElRef.value) return
        const left = Math.min(Math.max(ev.clientX - roomDragStartX, 0), window.innerWidth - roomModalElRef.value.offsetWidth)
        const top = Math.min(Math.max(ev.clientY - roomDragStartY, 0), window.innerHeight - roomModalElRef.value.offsetHeight)
        roomModalElRef.value.style.left = `${left}px`
        roomModalElRef.value.style.top = `${top}px`
      }
      roomDocMouseUp = () => {
        roomModalDragging.value = false
        if (roomDocMouseMove) document.removeEventListener('mousemove', roomDocMouseMove)
        if (roomDocMouseUp) document.removeEventListener('mouseup', roomDocMouseUp)
      }
      document.addEventListener('mousemove', roomDocMouseMove)
      document.addEventListener('mouseup', roomDocMouseUp)
    }
    header.addEventListener('mousedown', roomHeaderMouseDown)
  })
}

function detachRoomModalDrag() {
  try {
    const modalEl = roomModalElRef.value
    if (modalEl) {
      const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
      if (header && roomHeaderMouseDown) header.removeEventListener('mousedown', roomHeaderMouseDown)
      modalEl.style.position = ''
      modalEl.style.left = ''
      modalEl.style.top = ''
      modalEl.style.margin = ''
      modalEl.style.zIndex = ''
    }
  } catch (e) { }
  if (roomDocMouseMove) { document.removeEventListener('mousemove', roomDocMouseMove); roomDocMouseMove = null }
  if (roomDocMouseUp) { document.removeEventListener('mouseup', roomDocMouseUp); roomDocMouseUp = null }
  roomHeaderMouseDown = null
  roomModalElRef.value = null
  roomModalDragging.value = false
}

watch(editModalVisible, (v) => { if (v) attachRoomModalDrag(); else detachRoomModalDrag() })
function onAdd() {
  editForm.value = { roomId: '', roomName: '', customerId: '', customerName: '', buildingName: '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: '', orientation: '', isRented: false, remark: '' }
  editModalVisible.value = true
}
function onEdit(record: any) { editForm.value = { ...record }; editModalVisible.value = true }
function onDelete(record: any) {
  Modal.confirm({ title: '确认删除该房间吗？', okText: '确定', cancelText: '取消', onOk: () => { allRooms.value = allRooms.value.filter(b => b.roomId !== record.roomId); buildTreeFromRooms(); refreshOptions(); filterTableData(); message.success('删除成功') } })
}
function handleEditOk() {
  const idx = allRooms.value.findIndex(b => b.roomId === editForm.value.roomId)
  if (idx > -1) { allRooms.value[idx] = { ...editForm.value }; filterTableData(); message.success('编辑成功') }
  else { allRooms.value.push({ ...editForm.value }); filterTableData(); message.success('新增成功') }
  // Rebuild tree and options when data changed
  buildTreeFromRooms(); refreshOptions(); editModalVisible.value = false
}
function handleEditCancel() { editModalVisible.value = false }

// 导入导出
function onExport() {
  const headers = ['房间编号','房间名称','客户编号','客户名称','楼宇名称','建筑面积','使用面积','分摊面积','房间类型','权属类型','用途','装修情况','房间地址','朝向','是否出租','备注']
  const rows = tableData.value.map(row => [row.roomId, row.roomName, row.customerId, row.customerName, row.buildingName, row.grossArea, row.netArea, row.sharedArea, row.roomType, row.ownershipType, row.usage, row.decoration, row.address, row.orientation, row.isRented, row.remark])
  const csvContent = headers.join(',') + '\n' + rows.map(r => r.map(x => '"'+(x??'')+'"').join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '房间信息.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
function onImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
  input.onchange = () => { const file = input.files && input.files[0]; if (!file) return; alert('已选择文件：' + file.name) }
  input.click()
}

// 刷新下拉选项（用于新增/编辑/删除后）
function refreshOptions() {
  const roomIdSet = Array.from(new Set(allRooms.value.map(b => b.roomId)))
  roomIdOptions.value = roomIdSet.map(v => ({ label: v, value: v }))
  const customerIdSet = Array.from(new Set(allRooms.value.map(b => b.customerId)))
  customerIdOptions.value = customerIdSet.map(v => ({ label: v, value: v }))
  const customerNameSet = Array.from(new Set(allRooms.value.map(b => b.customerName)))
  customerNameOptions.value = customerNameSet.map(v => ({ label: v, value: v }))
}

// 异步加载房间数据的占位函数（可替换为真实 API）
async function loadRooms() {
  // 如果有真实后端，替换此处 fetch 调用
  // const res = await fetch('/api/rooms'); allRooms.value = await res.json()
  // 目前使用本地数据
  return Promise.resolve(allRooms.value)
}

// 节点操作：新增/编辑
function onNodeAdd(meta: any) {
  if (!meta) return
  if (meta.type === 'building') {
  editForm.value = { roomId: '', roomName: '', customerId: '', customerName: '', buildingName: meta.buildingName, grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: '', orientation: '', isRented: false, remark: '' }
    editModalVisible.value = true
  } else if (meta.type === 'room') {
    // 在房间节点上新增（行为上可以认为是在该楼宇下新增）
  editForm.value = { roomId: '', roomName: '', customerId: '', customerName: '', buildingName: meta.buildingName || '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: '', orientation: '', isRented: false, remark: '' }
    editModalVisible.value = true
  }
}

// 客户选择器
const customerPickerVisible = ref(false)
const customerPickerQuery = ref('')
const distinctCustomers = computed(() => Array.from(new Map(allRooms.value.map(r => [r.customerId, r])).values()).filter(Boolean))

// 远程搜索相关状态（支持分页）；若远程请求失败则回退到 local distinctCustomers
const remoteCustomers = ref<any[]>([])
const remoteTotal = ref(0)
const remotePage = ref(1)
const remotePageSize = ref(8)
const remoteLoading = ref(false)

async function fetchRemoteCustomers(query = '', page = 1, size = 8) {
  // 尝试调用后端 API，若失败则不抛出错误（上层会使用本地回退）
  try {
    remoteLoading.value = true
    const q = encodeURIComponent(String(query || ''))
    const res = await fetch(`/api/customers?query=${q}&page=${page}&size=${size}`)
    if (!res.ok) throw new Error('network')
    const data = await res.json()
    // 期待返回结构 { items: [], total: number }
    remoteCustomers.value = Array.isArray(data.items) ? data.items : []
    remoteTotal.value = typeof data.total === 'number' ? data.total : remoteCustomers.value.length
    return true
  } catch (e) {
    // 回退：清空 remoteCustomers（上层会使用 distinctCustomers）
    remoteCustomers.value = []
    remoteTotal.value = 0
    return false
  } finally {
    remoteLoading.value = false
  }
}

const filteredCustomers = computed(() => {
  // 优先使用远程数据（如果存在），否则使用本地去重数据并在前端过滤
  if (remoteCustomers.value && remoteCustomers.value.length) return remoteCustomers.value
  const q = String(customerPickerQuery.value || '').trim().toLowerCase()
  if (!q) return distinctCustomers.value
  return distinctCustomers.value.filter((c: any) => {
    return (String(c.customerId || '').toLowerCase().includes(q)
      || String(c.customerName || '').toLowerCase().includes(q)
      || String(c.contact || '').toLowerCase().includes(q))
  })
})

const customerTableColumns = [
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 160 },
  { title: '客户姓名', dataIndex: 'customerName', key: 'customerName', width: 220 },
  { title: '联系人', dataIndex: 'contact', key: 'contact', width: 140 },
  { title: '电话', dataIndex: 'phone', key: 'phone', width: 140 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 220 },
  { title: '操作', dataIndex: 'actions', key: 'actions', width: 120 }
]

function openCustomerPicker() { customerPickerVisible.value = true; remoteCustomers.value = []; remoteTotal.value = 0; remotePage.value = 1; }
function selectCustomer(c: any) { if (!c) return; editForm.value.customerId = c.customerId; editForm.value.customerName = c.customerName; customerPickerVisible.value = false }

// 防抖的远程搜索触发
const doRemoteFetch = debounceFn((q: string) => {
  // 重置到第一页
  remotePage.value = 1
  fetchRemoteCustomers(q, remotePage.value, remotePageSize.value)
}, 300)

function onCustomerPickerInput(e: any) {
  // v-model 已更新 customerPickerQuery，使用其值触发防抖远程搜索
  const q = String(customerPickerQuery.value || '')
  if (!q) {
    // 若 query 为空，尝试加载第一页的远程数据（或者回退为本地）
    fetchRemoteCustomers('', 1, remotePageSize.value)
    return
  }
  doRemoteFetch(q)
}

// 当打开 picker 时尝试加载第一页远程数据（若后端不可用，会回退到本地数据）
watch(customerPickerVisible, (v) => {
  if (v) {
    fetchRemoteCustomers(customerPickerQuery.value || '', remotePage.value, remotePageSize.value)
  }
})

function clearCustomerPickerQuery() {
  customerPickerQuery.value = ''
  remotePage.value = 1
  fetchRemoteCustomers('', remotePage.value, remotePageSize.value)
}

function onCustomerTableChange(p: any) {
  // Antd table change event provides pagination object
  const page = p && p.current ? Number(p.current) : 1
  remotePage.value = page
  fetchRemoteCustomers(customerPickerQuery.value || '', remotePage.value, remotePageSize.value)
}

// 创建客户（快速弹窗）
const createCustomerVisible = ref(false)
const createLoading = ref(false)
const createForm = ref<any>({ customerId: '', customerName: '', contact: '', phone: '', address: '' })

function openCreateCustomer() {
  createForm.value = { customerId: '', customerName: '', contact: '', phone: '', address: '' }
  createCustomerVisible.value = true
}

async function createCustomer() {
  // 简单校验
  if (!createForm.value.customerName || String(createForm.value.customerName).trim() === '') {
    message.error('请填写客户姓名')
    return
  }
  createLoading.value = true
  try {
    const res = await fetch('/api/customers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm.value)
    })
    let created: any = null
    if (res.ok) {
      created = await res.json()
    }
    // 若后端返回创建的数据，则优先使用；否则使用本地 createForm
    const toSelect = created || { ...createForm.value }
    // 把新客户追加到本地 allRooms 源（简易回退）: 使用 customerId/customerName
    // 注意：allRooms 存储 room 记录，但我们仅需要客户信息列表回退 -- 将其以最小字段推入
  allRooms.value.push({ roomId: '', roomName: '', customerId: toSelect.customerId || toSelect.customerName, customerName: toSelect.customerName, buildingName: '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: toSelect.address || '', orientation: '', isRented: false, remark: '' } as any)
  refreshOptions()
    // 关闭并回填到编辑表单
    selectCustomer(toSelect)
    message.success('客户创建并已选择')
    createCustomerVisible.value = false
  } catch (e) {
    // 回退：把 createForm 作为本地客户并选择
    const toSelect = { ...createForm.value }
  allRooms.value.push({ roomId: '', roomName: '', customerId: toSelect.customerId || toSelect.customerName, customerName: toSelect.customerName, buildingName: '', grossArea: '', netArea: '', sharedArea: '', roomType: '', ownershipType: '', usage: '', decoration: '', address: toSelect.address || '', orientation: '', isRented: false, remark: '' } as any)
  refreshOptions()
    selectCustomer(toSelect)
    message.success('本地已创建客户并选择（后端不可用）')
    createCustomerVisible.value = false
  } finally {
    createLoading.value = false
  }
}

function onNodeEdit(meta: any) {
  if (!meta) return
  if (meta.type === 'room') {
    const rec = allRooms.value.find(r => r.roomId === meta.roomId)
    if (rec) onEdit(rec)
  } else if (meta.type === 'building') {
    // 编辑楼宇：目前打开筛选/弹窗以管理楼宇（占位）
    // 这里简单弹出高级筛选并填入楼宇名
    filterForm.value.buildingName = meta.buildingName || ''
    filterModalVisible.value = true
  }
}

// 测试数据生成功能已移除

// 拖拽分割条
const treePanelRef = ref<any>(null)
const sidebarWidth = ref<number>(260)
const dragging = ref(false)
function onSplitterDown(e: MouseEvent) { dragging.value = true; e.preventDefault() }
function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect()
  const left = parentRect ? parentRect.left : 0
  const newWidth = Math.min(560, Math.max(180, e.clientX - left))
  sidebarWidth.value = newWidth
}
function onMouseUp() { dragging.value = false }
onMounted(() => { window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp) })
onUnmounted(() => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) })

function doRequestFullscreen() {
  if (requestTabFullscreen) requestTabFullscreen()
  else if (toggleFullscreen) toggleFullscreen()
}
</script>

<style scoped>
.building-page { padding: 0 }
.building-layout { display:flex; height:100vh; }
.tree-panel { width:260px; border-right:1px solid #eee; padding:16px 8px; background:#fff; height:100vh; box-sizing:border-box; overflow:auto }
.splitter { width:6px; cursor:col-resize; background:linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.data-panel { flex:1; padding:16px; height:100vh; overflow:auto }
.dense-row .ant-table-cell { padding:6px 8px; font-size:13px }
.dense-row .ant-table-cell { padding:2px 6px; font-size:11px; line-height:1.1 }
.ant-table-cell { white-space:nowrap }

/* 禁止表格单元格换行并显示省略号 */
.dense-row .ant-table-cell, .ant-table-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 取消严格的 max-width，使列宽能按 content 与列配置自然伸缩 */
}

.dense-row .ant-table-cell { padding: 10px 12px; font-size: 13px }

/* 更宽松的行高，使表格更舒适 */
.ant-table-tbody > tr > td { padding-top: 10px; padding-bottom: 10px }

/* 操作按钮一行内排列，防止换行 */
.table-actions { display: inline-flex; gap: 8px; align-items: center; white-space: nowrap }
.table-actions .ant-btn { padding: 0 8px }
.table-actions .ant-btn-primary { background: #1890ff; border-color: #1890ff }
.table-actions .ant-btn-dangerous { color: #ff4d4f }

/* 主题美化：树节点卡片感、hover 与选中高亮 */
.tree-panel .ant-tree-node-content-wrapper { border-radius:6px; padding:6px 8px; transition: background .12s, box-shadow .12s; }
.tree-panel .ant-tree-node-content-wrapper:hover { background: #f5fbff; }
.tree-panel .ant-tree-treenode-selected > .ant-tree-node-content-wrapper { background: #e6f7ff; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.tree-panel .ant-tree-node { margin:4px 0 }
.tree-panel .ant-tree { padding: 6px }

/* 美化分割条 */
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0)); border-radius:4px }

/* 让搜索输入和树更紧凑 */
.tree-panel .ant-input { border-radius:6px }

/* 徽章与已租样式 */
.tree-node-title { display:inline-flex; align-items:center; gap:6px }
.tree-node-title .node-main { font-weight:500 }
.tree-node-title .node-badge { background:#f0f5ff; color:#2f54eb; padding:2px 6px; border-radius:10px; font-size:12px }
.tree-node-title .node-rented { color:#fa8c16; font-size:12px }

/* 紧凑的一行行内筛选样式 */
.compact-inline .ant-form-item { margin-right: 8px }
.compact-inline .ant-select-selector, .compact-inline .ant-input { padding:4px 8px; font-size:12px }
.compact-inline { white-space:nowrap; overflow:hidden }
.compact-inline .inline-actions { display:inline-flex; gap:6px; align-items:center }

/* Card inline form styles */
.card-inline .ant-form-item { margin-right:8px; margin-bottom:8px }
.card-inline .ant-input, .card-inline .ant-select-selector { height:30px; padding:4px 8px }
.card-inline .ant-form { display:flex; flex-wrap:wrap; align-items:center }
/* 固定弹窗底部操作按钮区域 */
.modal-footer-fixed {
  position: sticky;
  bottom: 0;
  right: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px 8px 24px;
  z-index: 10;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.03);
}
</style>

<style scoped>

/* 可滚动的 modal 表单体（房间弹窗），限制高度并显示纵向滚动 */
.modal-body-scroll { max-height: calc(60vh); overflow-y: auto; padding-right: 8px }
.modal-body-scroll .ant-row { padding-bottom: 8px }


</style>
