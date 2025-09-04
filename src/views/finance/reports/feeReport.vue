<template>
  <div class="repairs-page">
    <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px;">
      <a-button size="small" @click="fieldSettingsVisible = true">字段设置</a-button>
      <a-button size="small" @click="groupVisible = true">分组</a-button>
  <a-button v-if="groupField" size="small" @click="clearGroup">取消分组</a-button>
  <a-button size="small" @click="filterVisible = true">高级筛选</a-button>
  <a-button size="small" @click="columnFilterVisible = true">列筛选</a-button>
      <a-button size="small" @click="onSort">排序</a-button>
  <a-button size="small" type="primary" @click="exportXlsx">导出Excel</a-button>
  <a-button size="small" @click="printReport">打印</a-button>
  <a-button size="small" type="default" @click="exportCsv">导出CSV</a-button>
      <a-button size="small" @click="importCsv">导入CSV</a-button>
    </div>

    <div v-if="groupField">
      <div v-for="(group, g) in groupedData" :key="g" style="margin-bottom:12px">
        <a-card size="small">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <div style="font-weight:600">{{ groupFieldLabel }}: {{ g }} （{{ group.rows.length }}）</div>
            <div style="font-size:12px;color:#666">
              应收: {{ group.summary.totalReceivable }} 已收: {{ group.summary.totalReceived }} 未收: {{ group.summary.totalUnpaid }} 客户数: {{ group.summary.customerCount }} 用量: {{ group.summary.totalConsumption }}
            </div>
            <div><a-button size="small" @click="toggleGroupCollapse(g)">{{ collapsedGroups[g] ? '展开' : '收起' }}</a-button></div>
          </div>
      <div v-show="!collapsedGroups[g]">
              <a-table class="fee-report-table" row-key="id" :key="tableKey" :columns="antColumns" :data-source="rowsWithIndex(group.rows)" :pagination="false" size="small" :scroll="{ x: scrollX, y: tableScrollY }" @change="onTableChange">
                  <template #bodyCell="{ column, record, index }">
                <div v-if="column.dataIndex === 'rowIndex'">{{ record.rowIndex }}</div>
                <div v-else>
                  {{ record[column.dataIndex] }}
                </div>
              </template>
              </a-table>
              <!-- 分组表格底部合计 -->
              <div class="table-summary" style="margin-top:8px; font-size:13px; color:#333">
                <strong>本组合计：</strong>
                <template v-for="f in allFieldsVisible" :key="f.key">
                  <span v-if="group.summary && group.summary[f.key] !== undefined" style="margin-left:12px">
                    {{ f.title }}: {{ formatMoney(group.summary[f.key]) }}
                  </span>
                </template>
              </div>
          </div>
        </a-card>
      </div>
    </div>

    <div v-else>
  <a-table class="fee-report-table" row-key="id" :key="tableKey" :columns="antColumns" :data-source="tableDataWithTotal" :pagination="tablePagination" size="small" :scroll="{ x: scrollX, y: tableScrollY }" @change="onTableChange">
        <template #bodyCell="{ column, record, index }">
          <div v-if="column.dataIndex === 'rowIndex'">{{ record.rowIndex }}</div>
          <div v-else>
            {{ record[column.dataIndex] }}
          </div>
        </template>
  </a-table>
        <!-- 非分组表格底部汇总 -->
        <div class="table-summary" style="margin-top:8px; font-size:13px; color:#333">
          <strong>合计：</strong>
          <template v-for="f in allFieldsVisible" :key="f.key">
            <span v-if="nonGroupTotals[f.key] !== undefined" style="margin-left:12px">
              {{ f.title }}: {{ formatMoney(nonGroupTotals[f.key]) }}
            </span>
          </template>
        </div>
    </div>

    <!-- 字段设置 Drawer -->
    <a-drawer v-model:visible="fieldSettingsVisible" title="字段设置" placement="right" :width="360">
      <div style="display:flex; gap:8px; margin-bottom:8px">
        <a-input v-model:value="fieldSearch" placeholder="搜索字段" allow-clear />
        <a-button size="small" @click="showAllFields">显示全部</a-button>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; max-height:60vh; overflow:auto">
        <div v-for="f in filteredFields" :key="f.key" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0">
          <div>{{ f.title }}</div>
          <a-switch v-model:checked="f.visible" />
        </div>
      </div>
    </a-drawer>

  <!-- debug panel removed in production -->

    <!-- 分组 Modal -->
    <a-modal v-model:visible="groupVisible" title="分组设置" @ok="applyGroup" @cancel="groupVisible=false">
      <a-select v-model:value="groupField" style="width:100%" placeholder="选择分组字段">
        <a-select-option v-for="f in groupableFields" :key="f.key" :value="f.key">{{ f.title }}</a-select-option>
      </a-select>
      <div style="margin-top:8px;color:#888">选择字段后，界面按该字段分块展示</div>
    </a-modal>

    <!-- 筛选 Drawer (高级筛选：地点 / 时间 / 费用项目) -->
    <a-drawer v-model:visible="filterVisible" title="高级筛选" placement="right" :width="420">
      <div style="display:flex; flex-direction:column; gap:12px">
        <div>
          <div style="font-weight:600; margin-bottom:6px">地点维度（支持多选层级）</div>
          <div style="max-height:220px; overflow:auto; border:1px dashed #f0f0f0; padding:8px">
            <a-tree :tree-data="treeData" checkable :checked-keys="checkedKeys" @check="onCheck" />
          </div>
          <div style="font-size:12px;color:#888;margin-top:6px">勾选管理区/楼宇/房间以按层级过滤结果</div>
        </div>

        <div>
          <div style="font-weight:600; margin-bottom:6px">时间维度</div>
          <a-radio-group v-model:value="timeType">
            <a-radio value="month">按月</a-radio>
            <a-radio value="quarter">按季度</a-radio>
            <a-radio value="range">自定义区间</a-radio>
          </a-radio-group>
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
            <a-select v-if="timeType==='month'" v-model:value="timeYear" style="width:120px" placeholder="年">
              <a-select-option v-for="y in years" :key="y" :value="y">{{ y }}</a-select-option>
            </a-select>
            <a-select v-if="timeType==='month'" v-model:value="timeMonth" style="width:120px" placeholder="月">
              <a-select-option v-for="m in months" :key="m" :value="m">{{ m }} 月</a-select-option>
            </a-select>

            <a-select v-if="timeType==='quarter'" v-model:value="timeYear" style="width:120px" placeholder="年">
              <a-select-option v-for="y in years" :key="y" :value="y">{{ y }}</a-select-option>
            </a-select>
            <a-select v-if="timeType==='quarter'" v-model:value="timeQuarter" style="width:120px" placeholder="季度">
              <a-select-option v-for="q in [1,2,3,4]" :key="q" :value="q">Q{{ q }}</a-select-option>
            </a-select>

            <a-range-picker v-if="timeType==='range'" v-model:value="timeRange" style="flex:1" />
          </div>
        </div>

        <div>
          <div style="font-weight:600; margin-bottom:6px">费用项目</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
            <a-button size="small" @click="selectAllFeeProjects">全选</a-button>
            <a-button size="small" @click="clearFeeProjects">全清</a-button>
            <div style="color:#888;font-size:12px">(支持多选)</div>
          </div>
          <a-checkbox-group v-model:value="feeProjectSelected">
            <a-checkbox v-for="p in feeProjects" :key="p" :value="p">{{ p }}</a-checkbox>
          </a-checkbox-group>
        </div>

        <div style="display:flex; justify-content:space-between; padding-top:8px">
          <a-button @click="resetAdvancedFilter">重置</a-button>
          <a-button type="primary" @click="applyAdvancedFilter">应用</a-button>
        </div>
      </div>
    </a-drawer>

    <!-- 列筛选 Drawer（更可靠的替代方式） -->
    <a-drawer v-model:visible="columnFilterVisible" title="列筛选" placement="right" :width="420">
      <div style="display:flex; flex-direction:column; gap:12px">
        <div v-for="f in allFieldsVisible" :key="f.key" style="border-bottom:1px dashed #f0f0f0; padding-bottom:8px">
          <div style="display:flex; align-items:center">
            <div style="font-weight:600">{{ f.title }}</div>
          </div>
          <div style="margin-top:8px">
            <a-input :value="(colFilters[f.key] && colFilters[f.key].q) || ''" placeholder="包含" @input="onColInput($event, f.key)" @pressEnter="applyColumnFromDrawer(f.key)" />
          </div>
          <div v-if="f.key === 'status'" style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">
            <a-tag v-for="s in statusOptions" :key="s" :color="statusColor(s)" @click="() => (colFilters[f.key] = colFilters[f.key] || {}, colFilters[f.key].eq = s)">{{ s }}</a-tag>
          </div>
          <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
            <a-select v-if="uniqueValuesFor(f.key).length" :value="(colFilters[f.key] && colFilters[f.key].eq) || undefined" @change="onColSelectChange($event, f.key)" allow-clear placeholder="相等">
              <a-select-option v-for="v in uniqueValuesFor(f.key)" :key="v" :value="v">{{ v }}</a-select-option>
            </a-select>
            <a-button size="small" @click="() => onColSetPresent(f.key, true)">已填写</a-button>
            <a-button size="small" @click="() => onColSetPresent(f.key, false)">未填写</a-button>
          </div>
          <div v-if="f.key === 'appointmentTime'" style="margin-top:8px">
            <a-range-picker :value="colRange[f.key] || undefined" @change="onColRangeChange($event, f.key)" style="width:100%" />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px">
            <a-button size="small" @click="clearColumnFromDrawer(f.key)">清除</a-button>
            <a-button type="primary" size="small" @click="applyColumnFromDrawer(f.key)">应用</a-button>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; padding-top:8px">
          <a-button @click="clearAllColumnFilters">全部清除</a-button>
          <a-button type="primary" @click="applyAllColumnFilters">应用全部</a-button>
        </div>
      </div>
    </a-drawer>
  <!-- 编辑 Modal 已移除：该页面为只读报表 -->

  <!-- 图片预览 Modal -->
  <a-modal v-model:visible="previewVisible" title="图片预览" footer="" :width="600" @cancel="closePreview">
    <div style="text-align:center"><img :src="previewSrc" style="max-width:100%; max-height:70vh;" /></div>
  </a-modal>

    </div>
  </template>

  <script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { h } from 'vue'
import { Popover, Button, Input, Select, Checkbox } from 'ant-design-vue'

// 定义列元数据（按用户要求顺序）
const allFields = ref([
  { key: 'building', title: '楼宇名称', visible: true, groupable: true },
  { key: 'room', title: '房间编号', visible: true, groupable: true },
  { key: 'area', title: '建筑面积', visible: true, groupable: false },
  { key: 'customerId', title: '客户编号', visible: true, groupable: true },
  { key: 'customerName', title: '客户名称', visible: true, groupable: true },
  { key: 'feeName', title: '费用名称', visible: true, groupable: true },
  { key: 'dueDate', title: '应收日期', visible: true, groupable: false },
  { key: 'receivable', title: '应收', visible: true, groupable: false },
  { key: 'received', title: '已收', visible: true, groupable: false },
  { key: 'unpaid', title: '未收', visible: true, groupable: false },
  { key: 'penalty', title: '违约金', visible: true, groupable: false },
  { key: 'lastReading', title: '上次度数', visible: true, groupable: false },
  { key: 'thisReading', title: '本次度数', visible: true, groupable: false },
  { key: 'consumption', title: '用量', visible: true, groupable: false },
  { key: 'contractNo', title: '合同编号', visible: true, groupable: false },
  { key: 'contractStart', title: '合同费用始日', visible: true, groupable: false },
  { key: 'contractEnd', title: '合同费用止日', visible: true, groupable: false },
  { key: 'periodStart', title: '周期费用始日', visible: true, groupable: false },
  { key: 'periodEnd', title: '周期费用止日', visible: true, groupable: false },
  { key: 'lastReadingDate', title: '上次抄表日期', visible: true, groupable: false },
  { key: 'thisReadingDate', title: '本次抄表日期', visible: true, groupable: false },
  { key: 'writeOff', title: '核销', visible: true, groupable: false },
  { key: 'writeOffDate', title: '核销日期', visible: true, groupable: false }
])

// base sample tree (kept as fallback / starting point)
const baseTreeData = ref<any[]>([
  { title: '管理区 A', key: 'area-A', children: [
    { title: '楼宇 1', key: 'bldg-1', children: [ { title: '房间 R101', key: 'room-R101' }, { title: '房间 R102', key: 'room-R102' } ] },
    { title: '楼宇 2', key: 'bldg-2', children: [ { title: '房间 R103', key: 'room-R103' } ] }
  ] },
  { title: '管理区 B', key: 'area-B', children: [
    { title: '楼宇 3', key: 'bldg-3', children: [] },
    { title: '楼宇 4', key: 'bldg-4', children: [] },
    { title: '楼宇 5', key: 'bldg-5', children: [] },
    { title: '楼宇 6', key: 'bldg-6', children: [] }
  ] }
])

// build dynamic treeData from baseTreeData + actual repairsData so all buildings/rooms appear
const treeData = computed(() => {
  // clone base areas
  const areas: any[] = (baseTreeData.value || []).map(a => ({ title: a.title, key: a.key, children: (a.children || []).map((b:any) => ({ title: b.title, key: b.key, children: (b.children || []).map((r:any) => ({ title: r.title, key: r.key })) })) }))

  const areaMap = new Map<string, any>()
  const buildingMap = new Map<string, any>()
  for (const a of areas) {
    areaMap.set(String(a.title), a)
    a.children = a.children || []
    for (const b of a.children) {
      buildingMap.set(String(b.title), b)
      b.children = b.children || []
    }
  }

  // ensure all buildings and rooms from data are included
  for (const r of repairsData.value || []) {
    const bTitle = String(r.building || '未分配楼宇')
    const roomTitle = String(r.room || r.roomId || '未分配房间')
    let bNode = buildingMap.get(bTitle)
    if (!bNode) {
      // put into an '未分配管理区' area if no area contains this building
      let areaNode = areaMap.get('未分配管理区')
      if (!areaNode) {
        areaNode = { title: '未分配管理区', key: 'area-unassigned', children: [] }
        areas.push(areaNode)
        areaMap.set(areaNode.title, areaNode)
      }
      // create building node
      const bKey = 'bldg-' + encodeURIComponent(bTitle).replace(/%/g, '')
      bNode = { title: bTitle, key: bKey, children: [] }
      areaNode.children.push(bNode)
      buildingMap.set(bTitle, bNode)
    }
    // add room if missing
    bNode.children = bNode.children || []
    if (!bNode.children.find((x:any) => String(x.title) === roomTitle)) {
      const rKey = bNode.key + '-room-' + encodeURIComponent(roomTitle).replace(/%/g, '')
      bNode.children.push({ title: roomTitle, key: rKey })
    }
  }

  return areas
})

const checkedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
function onCheck(keys: string[]|{checked: string[]}) { if (Array.isArray(keys)) checkedKeys.value = keys; else checkedKeys.value = (keys as any).checked || [] }
function onSelect(keys: string[]|any) { if (Array.isArray(keys)) selectedKeys.value = keys; else selectedKeys.value = keys }

// compute set of all tree keys (used to detect full-check)
function collectTreeKeys(nodes: any[], out: Set<string>) {
  for (const n of nodes || []) {
    if (n && n.key) out.add(String(n.key))
    if (n && n.children) collectTreeKeys(n.children, out)
  }
}
const allTreeKeys = computed(() => {
  const s = new Set<string>()
  collectTreeKeys(treeData.value || [], s)
  return s
})
const isAllChecked = computed(() => {
  try {
    if (!allTreeKeys.value || allTreeKeys.value.size === 0) return false
    if (!checkedKeys.value || checkedKeys.value.length === 0) return false
    // if checked count >= all keys count, treat as all checked
    return checkedKeys.value.length >= allTreeKeys.value.size
  } catch (e) { return false }
})

// helper: given a checked key, collect the node title and all descendant titles
function collectTitlesFromNode(node: any, out: Set<string>) {
  if (!node) return
  if (node.title) out.add(String(node.title))
  if (node.children) {
    for (const c of node.children) collectTitlesFromNode(c, out)
  }
}

function findAndCollectTitles(nodes: any[], key: string, out: Set<string>): boolean {
  for (const n of nodes || []) {
    if (String(n.key) === String(key)) {
      collectTitlesFromNode(n, out)
      return true
    }
    if (n && n.children) {
      const found = findAndCollectTitles(n.children, key, out)
      if (found) return true
    }
  }
  return false
}

// per-column filter state
const filtersMap = reactive<Record<string, any>>({})
// popover visibility map so we can programmatically close popovers after apply/clear
const popVisible = reactive<Record<string, boolean>>({})

// load persisted filters will be handled after sortState is declared

function uniqueValuesFor(key: string) {
  const set = new Set<string>()
  for (const r of repairsData.value) set.add(String(r[key] ?? ''))
  return Array.from(set).filter(v => v !== '')
}

// date presets helper
function calcDatePreset(preset: string) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  switch (preset) {
    case 'today': break
    case 'yesterday': start.setDate(now.getDate()-1); end.setDate(now.getDate()-1); break
    case 'tomorrow': start.setDate(now.getDate()+1); end.setDate(now.getDate()+1); break
    case 'past7': start.setDate(now.getDate()-6); break
    case 'past30': start.setDate(now.getDate()-29); break
    case 'next7': end.setDate(now.getDate()+6); break
    case 'next30': end.setDate(now.getDate()+29); break
    case 'thisWeek': {
      // Monday as start
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1 - day)
      start.setDate(now.getDate() + diff)
      end.setDate(start.getDate() + 6)
      break
    }
    case 'lastWeek': {
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1 - day)
      start.setDate(now.getDate() + diff - 7)
      end.setDate(start.getDate() + 6)
      break
    }
    case 'nextWeek': {
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1 - day)
      start.setDate(now.getDate() + diff + 7)
      end.setDate(start.getDate() + 6)
      break
    }
    case 'thisMonth': {
      start.setDate(1)
      end.setMonth(start.getMonth() + 1)
      end.setDate(0)
      break
    }
    case 'lastMonth': {
      start.setMonth(start.getMonth() - 1); start.setDate(1)
      end.setDate(0)
      break
    }
    case 'nextMonth': {
      start.setMonth(start.getMonth() + 1); start.setDate(1)
      end.setMonth(start.getMonth() + 1); end.setDate(0)
      break
    }
    case 'thisYear': {
      start.setMonth(0); start.setDate(1)
      end.setMonth(11); end.setDate(31)
      break
    }
    case 'lastYear': {
      start.setFullYear(start.getFullYear() - 1); start.setMonth(0); start.setDate(1)
      end.setFullYear(end.getFullYear() - 1); end.setMonth(11); end.setDate(31)
      break
    }
    case 'nextYear': {
      start.setFullYear(start.getFullYear() + 1); start.setMonth(0); start.setDate(1)
      end.setFullYear(end.getFullYear() + 1); end.setMonth(11); end.setDate(31)
      break
    }
    default: break
  }
  return { start, end }
}

function applyColumnFilter(key: string, condition: any) {
  // consider empty object as no condition
  if (!condition) { delete filtersMap[key]; try { popVisible[key] = false } catch (e) {} ; return }
  // strip empty keys
  const hasAny = Object.keys(condition).some(k => {
    if (k === 'range') return condition.range && condition.range.start && condition.range.end
    return condition[k] !== null && condition[k] !== undefined && String(condition[k]) !== ''
  })
  if (!hasAny) { delete filtersMap[key]; try { popVisible[key] = false } catch (e) {} ; return }
  filtersMap[key] = condition
  // close popover after applying
  try { popVisible[key] = false } catch (e) {}
}

function clearColumnFilter(key: string) { delete filtersMap[key] }

// ensure clearing also closes popover
function clearColumnFilterVisible(key: string) { delete filtersMap[key]; try { popVisible[key] = false } catch (e) {} }

function formatFilterSummary(key: string) {
  const cond = filtersMap[key]
  if (!cond) return h('div', { style: 'color:#888; font-size:12px' }, '未设置筛选')
  const parts: any[] = []
  if (cond.q) parts.push(h('a-tag', { color: 'default' }, () => `包含: ${String(cond.q)}`))
  if (cond.eq) parts.push(h('a-tag', { color: 'blue' }, () => `等于: ${String(cond.eq)}`))
  if (cond.present === true) parts.push(h('a-tag', { color: 'green' }, () => `已填写`))
  if (cond.present === false) parts.push(h('a-tag', { color: 'red' }, () => `未填写`))
  if (cond.range) {
    const s = new Date(cond.range.start)
    const e = new Date(cond.range.end)
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    parts.push(h('a-tag', { color: 'purple' }, () => `范围: ${fmt(s)} ~ ${fmt(e)}`))
  }
  return h('div', { style: 'display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px' }, parts)
}

const fieldSettingsVisible = ref(false)
const fieldSearch = ref('')
const tableKey = ref(0)
// pagination state for controlled pagination
const tablePagination = reactive({ current: 1, pageSize: 20, total: 0 })
// sorting state for AntD table
const sortState = reactive({ columnKey: '', order: '' })

// now load persisted filters and sort state from localStorage if present
try {
  const savedFilters = localStorage.getItem('repairs_daily_filters')
  if (savedFilters) {
    const obj = JSON.parse(savedFilters)
    for (const k of Object.keys(obj)) filtersMap[k] = obj[k]
  }
} catch (e) { console.warn('load filters failed', e) }
try {
  const savedSort = localStorage.getItem('repairs_daily_sort')
  if (savedSort) {
    const so = JSON.parse(savedSort)
    sortState.columnKey = so.columnKey || ''
    sortState.order = so.order || ''
  }
} catch (e) { console.warn('load sort failed', e) }

// persist filtersMap and sortState to localStorage when changed
function buildPlainFilters() {
  const out: Record<string, any> = {}
  for (const k of Object.keys(filtersMap)) { out[k] = filtersMap[k] }
  return out
}

watch(() => JSON.stringify(buildPlainFilters()), (nv) => {
  try { localStorage.setItem('repairs_daily_filters', nv) } catch (e) { }
})
watch(() => JSON.stringify({ columnKey: sortState.columnKey, order: sortState.order }), (nv) => {
  try { localStorage.setItem('repairs_daily_sort', nv) } catch (e) { }
})

const filteredFields = computed(() => {
  const q = String(fieldSearch.value || '').trim().toLowerCase()
  return allFields.value.filter(f => f.title.toLowerCase().includes(q) || f.key.toLowerCase().includes(q))
})

function toggleField(key: string, visible: boolean) {
  const f = allFields.value.find(x => x.key === key)
  if (f) f.visible = !!visible
  // bump tableKey to force AntD table remount so column changes take effect immediately
  tableKey.value = (tableKey.value || 0) + 1
}
function showAllFields() { allFields.value.forEach(f => f.visible = true); message.success('已显示全部字段') }

function onFieldSwitchChange(key: string) {
  return (checked: boolean) => toggleField(key, checked)
}

// 示例数据
const repairsData = ref<any[]>([])
  const _statuses = ['新建','处理中','待确认','已解决','已关闭']
  // 本地示例费用项目，和下面的 feeProjects 保持一致
  const sampleFeeProjects = ['物业费','水费','电费','燃气费','停车费','本体维修基金','押金','租金']
  for (let i = 1; i <= 30; i++) {
  const last = 1000 + i * 10
  const thisR = last + (i % 8)
  const dueDay = String((i % 28) + 1).padStart(2, '0')
  const dueDate = `2025-08-${dueDay}`
  const receivable = 500 + i * 10
  const received = 300 + (i * 5)
  repairsData.value.push({
    id: i,
    // keep some legacy fields for compatibility
    status: _statuses[i % _statuses.length],
    roomId: 'R' + (100 + i),
    // new fields requested by user
    building: '楼宇 ' + Math.ceil(i / 5),
    room: 'R' + (100 + i),
    area: 50 + i,
    customerId: 'C' + (100 + i),
    customerName: '客户' + i,
  feeName: sampleFeeProjects[i % sampleFeeProjects.length],
    dueDate: dueDate,
    receivable: receivable,
    received: received,
    unpaid: Math.max(0, receivable - received),
    penalty: 0,
    lastReading: last,
    thisReading: thisR,
    consumption: thisR - last,
    contractNo: 'CON-' + String(i).padStart(3, '0'),
    contractStart: '2024-01-01',
    contractEnd: '2025-12-31',
    periodStart: dueDate,
    periodEnd: dueDate,
    lastReadingDate: `2025-07-${dueDay}`,
    thisReadingDate: `2025-08-${dueDay}`,
    writeOff: '否',
    writeOffDate: '',
    // legacy/demo fields
    phone: '1380000' + String(100 + i),
    priority: i % 3 === 0 ? '高' : (i % 3 === 1 ? '中' : '低'),
    serviceCategory: i % 2 === 0 ? '电路' : '给排水',
    appointmentTime: '',
    faultCategory: i % 2 === 0 ? '断电' : '漏水',
    visitStartTime: '',
    repairEndTime: '',
    completionImages: [],
    orderCloseTime: ''
  })
}

// 为测试专门增加更多属于“楼宇 1”的数据记录，方便验证地点筛选
const extraForBldg1 = 20
for (let j = 1; j <= extraForBldg1; j++) {
  const id = 1000 + j
  const last = 2000 + j * 3
  const thisR = last + (j % 5)
  const dueDay = String((j % 28) + 1).padStart(2, '0')
  const dueDate = `2025-08-${dueDay}`
  const receivable = 200 + j * 12
  const received = 50 + j * 6
  repairsData.value.push({
    id: id,
    status: _statuses[j % _statuses.length],
    roomId: 'R' + (200 + j),
    building: '楼宇 1',
    room: 'R' + (200 + j),
    area: 45 + j,
    customerId: 'C' + (200 + j),
    customerName: '客户1-' + j,
    feeName: sampleFeeProjects[j % sampleFeeProjects.length],
    dueDate: dueDate,
    receivable: receivable,
    received: received,
    unpaid: Math.max(0, receivable - received),
    penalty: 0,
    lastReading: last,
    thisReading: thisR,
    consumption: thisR - last,
    contractNo: 'CON-1-' + String(j).padStart(3, '0'),
    contractStart: '2024-01-01',
    contractEnd: '2025-12-31',
    periodStart: dueDate,
    periodEnd: dueDate,
    lastReadingDate: `2025-07-${dueDay}`,
    thisReadingDate: `2025-08-${dueDay}`,
    writeOff: '否',
    writeOffDate: '',
    phone: '1390000' + String(200 + j),
    priority: j % 3 === 0 ? '高' : (j % 3 === 1 ? '中' : '低'),
    serviceCategory: j % 2 === 0 ? '电路' : '给排水',
    appointmentTime: '',
    faultCategory: j % 2 === 0 ? '断电' : '漏水',
    visitStartTime: '',
    repairEndTime: '',
    completionImages: [],
    orderCloseTime: ''
  })
}

const filterVisible = ref(false)
const columnFilterVisible = ref(false)
const allFieldsVisible = computed(() => allFields.value.filter(f => f.visible))

// temporary column-drawer local edits
const colFilters = reactive<Record<string, any>>({})
const colRange = reactive<Record<string, any>>({})

// initialize local drawer state from filtersMap so UI reflects current filters
function ensureColState(key: string) {
  if (!colFilters[key]) colFilters[key] = { ...(filtersMap[key] || {}) }
  if (!colRange[key] && filtersMap[key] && filtersMap[key].range) colRange[key] = [new Date(filtersMap[key].range.start), new Date(filtersMap[key].range.end)]
}

function applyColumnFromDrawer(key: string) {
  ensureColState(key)
  const cond = { ...(colFilters[key] || {}) }
  if (colRange[key]) cond.range = { start: colRange[key][0], end: colRange[key][1] }
  applyColumnFilter(key, cond)
}

function clearColumnFromDrawer(key: string) { delete colFilters[key]; delete colRange[key]; clearColumnFilterVisible(key) }

function clearAllColumnFilters() { for (const k of Object.keys(filtersMap)) delete filtersMap[k]; }

function applyAllColumnFilters() { for (const f of allFieldsVisible.value) { ensureColState(f.key); applyColumnFilter(f.key, { ...(colFilters[f.key] || {}) }) } columnFilterVisible.value = false }

function onColInput(e: Event, key: string) {
  const target = e && (e as any).target
  const v = target ? target.value : ''
  colFilters[key] = colFilters[key] || {}
  colFilters[key].q = v
}

function onColSelectChange(v: any, key: string) {
  colFilters[key] = colFilters[key] || {}
  colFilters[key].eq = v
}

function onColSetPresent(key: string, val: boolean) {
  colFilters[key] = colFilters[key] || {}
  colFilters[key].present = val
}

function onColRangeChange(dates: any, key: string) {
  if (!dates) { delete colRange[key]; return }
  const s = dates[0] ? (dates[0].toDate ? dates[0].toDate() : new Date(dates[0])) : null
  const e = dates[1] ? (dates[1].toDate ? dates[1].toDate() : new Date(dates[1])) : null
  colRange[key] = s && e ? [s, e] : undefined
}

watch(() => columnFilterVisible.value, (v) => {
  if (v) {
    // initialize drawer state
    for (const f of allFieldsVisible.value) {
      ensureColState(f.key)
    }
  }
})
const filterForm = reactive({ status: '', roomId: '', customerId: '', customerName: '', priority: '' })
// debounced filter to avoid frequent re-filtering during typing
const debouncedFilter = reactive({ status: '', roomId: '', customerId: '', customerName: '', priority: '' })
let _filterTimer: any = null
watch(() => ({ ...filterForm }), (nv) => {
  if (_filterTimer) clearTimeout(_filterTimer)
  _filterTimer = setTimeout(() => {
    debouncedFilter.roomId = nv.roomId || ''
    debouncedFilter.customerId = nv.customerId || ''
    debouncedFilter.customerName = nv.customerName || ''
    debouncedFilter.priority = nv.priority || ''
  }, 300)
}, { deep: true })

function applyFilter() {
  filterVisible.value = false
  // filtered via computed tableData
}
function resetFilter() { filterForm.status=''; filterForm.roomId = ''; filterForm.customerId = ''; filterForm.customerName = ''; filterForm.priority = ''; debouncedFilter.status=''; debouncedFilter.roomId=''; debouncedFilter.customerId=''; debouncedFilter.customerName=''; debouncedFilter.priority=''; }

// grouping
const groupVisible = ref(false)
const groupField = ref('')
const collapsedGroups = reactive({} as Record<string, boolean>)

// extra virtual time-based grouping options
const extraGroupOptions = [
  { key: 'dueDate_month', title: '应收日期（按月）' },
  { key: 'dueDate_quarter', title: '应收日期（按季度）' },
  { key: 'thisReadingDate_month', title: '本次抄表日期（按月）' },
  { key: 'periodStart_quarter', title: '周期费用始日（按季度）' }
]

const groupableFields = computed(() => {
  return [ ...allFields.value.filter(f => f.groupable), ...extraGroupOptions ]
})

const groupFieldLabel = computed(() => {
  const f = allFields.value.find(x => x.key === groupField.value)
  if (f) return f.title
  const ef = extraGroupOptions.find(x => x.key === groupField.value)
  return ef ? ef.title : ''
})

function applyGroup() {
  groupVisible.value = false
}
function toggleGroupCollapse(g: string) {
  collapsedGroups[g] = !collapsedGroups[g]
}

function clearGroup() {
  groupField.value = ''
}

// watch for field visibility changes to force table remount
watch(allFields, (nv, ov) => {
  try {
    if (!ov) { tableKey.value = (tableKey.value || 0) + 1; return }
    // if any visibility changed, bump key
    const changed = nv.some((n: any, idx: number) => n.visible !== (ov[idx] && ov[idx].visible))
    if (changed) tableKey.value = (tableKey.value || 0) + 1
  } catch (e) { tableKey.value = (tableKey.value || 0) + 1 }
}, { deep: true })

const groupedData = computed(() => {
  if (!groupField.value) return {}
  const map: Record<string, { rows: any[], summary: any }> = {}
  const rows = tableData.value
  function groupKeyFor(r: any) {
    const k = groupField.value
    if (!k) return '未关联'
    // handle virtual time group keys
    if (k === 'dueDate_month') {
      const d = r.dueDate ? new Date(r.dueDate) : null
      return d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` : '未知'
    }
    if (k === 'dueDate_quarter') {
      const d = r.dueDate ? new Date(r.dueDate) : null
      if (!d || isNaN(d.getTime())) return '未知'
      const q = Math.floor(d.getMonth()/3) + 1
      return `${d.getFullYear()}Q${q}`
    }
    if (k === 'thisReadingDate_month') {
      const d = r.thisReadingDate ? new Date(r.thisReadingDate) : null
      return d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` : '未知'
    }
    if (k === 'periodStart_quarter') {
      const d = r.periodStart ? new Date(r.periodStart) : null
      if (!d || isNaN(d.getTime())) return '未知'
      const q = Math.floor(d.getMonth()/3) + 1
      return `${d.getFullYear()}Q${q}`
    }
    return String(r[k] ?? '未关联')
  }

  for (const r of rows) {
    const k = groupKeyFor(r)
    if (!map[k]) map[k] = { rows: [], summary: { totalReceivable: 0, totalReceived: 0, totalUnpaid: 0, customerSet: new Set<string>(), totalConsumption: 0 } }
    map[k].rows.push(r)
    const s = map[k].summary
    s.totalReceivable += Number(r.receivable || 0)
    s.totalReceived += Number(r.received || 0)
    s.totalUnpaid += Number(r.unpaid || 0)
    if (r.customerId) s.customerSet.add(String(r.customerId))
    s.totalConsumption += Number(r.consumption || 0)
  }

  // finalize customerCount and remove sets
  for (const k of Object.keys(map)) {
    const s = map[k].summary
    s.customerCount = s.customerSet.size
    delete s.customerSet
  }

  return map
})

// --- 高级筛选状态 ---
const timeType = ref<'month'|'quarter'|'range'>('month')
const timeYear = ref<number>(2025)
const timeMonth = ref<number>(8)
const timeQuarter = ref<number>(3)
const timeRange = ref<any>(undefined)
const years = Array.from({length:6}, (_,i) => 2020 + i)
const months = Array.from({length:12}, (_,i) => i+1)

const feeProjects = ['物业费','水费','电费','燃气费','停车费','本体维修基金','押金','租金']
const feeProjectSelected = ref<string[]>([...feeProjects])

function selectAllFeeProjects() {
  feeProjectSelected.value = [...feeProjects]
}

function clearFeeProjects() {
  feeProjectSelected.value = []
}

function resetAdvancedFilter() {
  checkedKeys.value = []
  timeType.value = 'month'
  timeYear.value = new Date().getFullYear()
  timeMonth.value = new Date().getMonth() + 1
  timeQuarter.value = Math.floor((new Date().getMonth())/3) + 1
  timeRange.value = undefined
  feeProjectSelected.value = [...feeProjects]
}

function applyAdvancedFilter() {
  filterVisible.value = false
  // bump table to re-evaluate
  tableKey.value = (tableKey.value || 0) + 1
}


// rooms list and roomMap removed (read-only report)

// status options and color mapping
const statusOptions = ['新建','处理中','待确认','已解决','已关闭']
function statusColor(s: string) {
  switch (s) {
    case '新建': return 'blue'
    case '处理中': return 'orange'
    case '待确认': return 'gold'
    case '已解决': return 'green'
    case '已关闭': return 'gray'
    default: return 'default'
  }
}

function rowsWithIndex(rows: any[]) { return rows.map((r, idx) => ({ ...r, rowIndex: idx + 1 })) }

// visible columns for AntD
const antColumns = computed(() => {
  const cols: any[] = []
  // add a serial number column
  cols.push({ title: '序号', dataIndex: 'rowIndex', key: '_serial', width: 70, align: 'center' })
  for (const f of allFields.value.filter(x => x.visible)) {
    // render title with a filter popover for every visible column (except serial)
    let titleVNode: any = f.title
    const key = f.key
    if (key !== 'rowIndex') {
      const active = !!filtersMap[key]
      const onInput = (e: any) => { filtersMap[key] = filtersMap[key] || {}; filtersMap[key].q = e.target.value }
      const onInputKey = () => { applyColumnFilter(key, filtersMap[key]) }

      // date preset buttons
      const presets = [
        { id: 'today', label: '今天' }, { id: 'yesterday', label: '昨天' }, { id: 'tomorrow', label: '明天' },
        { id: 'past7', label: '过去7天' }, { id: 'past30', label: '过去30天' }, { id: 'thisWeek', label: '本周' }, { id: 'thisMonth', label: '本月' }
      ]

      const presetButtons = key === 'appointmentTime' ? h('div', { style: 'display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px' }, presets.map(p => h('a-button', { size: 'small', onClick: () => { const r = calcDatePreset(p.id); filtersMap[key] = filtersMap[key] || {}; filtersMap[key].range = { start: r.start, end: r.end }; } }, p.label))) : null

      const categoryTags = key === 'priority' ? h('div', { style: 'display:flex; gap:6px; flex-wrap:wrap; marginBottom:6px' }, uniqueValuesFor(key).map((v: any) => h('a-tag', { onClick: () => { filtersMap[key] = filtersMap[key] || {}; filtersMap[key].eq = v } }, () => v))) : null

      const rangePicker = key === 'appointmentTime' ? h('a-range-picker', { style: 'width:100%; marginTop:6px', onChange: (dates: any[]) => {
        if (!dates) { (filtersMap[key] = filtersMap[key] || {}); filtersMap[key].range = null; return }
        const s = dates[0] ? (dates[0].toDate ? dates[0].toDate() : new Date(dates[0])) : null
        const e = dates[1] ? (dates[1].toDate ? dates[1].toDate() : new Date(dates[1])) : null
        filtersMap[key] = filtersMap[key] || {}; filtersMap[key].range = s && e ? { start: s, end: e } : null
      } }) : null

      const popContent = h('div', { style: 'width:320px; padding:8px' }, [
        formatFilterSummary(key),
        h('div', { style: 'margin-bottom:6px' }, [ h('a-input', { placeholder: '搜索', value: (filtersMap[key] && filtersMap[key].q) || '', onInput, onPressEnter: onInputKey }) ]),
        categoryTags,
        presetButtons,
        rangePicker,
        h('div', { style: 'display:flex; gap:8px; justify-content:flex-end; margin-top:8px' }, [
          h('a-button', { size: 'small', onClick: () => { clearColumnFilterVisible(key) } }, '清除'),
          h('a-button', { type: 'primary', size: 'small', onClick: () => { applyColumnFilter(key, filtersMap[key]) } }, '应用')
        ])
      ])

      if (popVisible[key] === undefined) popVisible[key] = false
      titleVNode = h('div', { style: 'display:flex; align-items:center; gap:6px; white-space:nowrap' }, [
        h('span', f.title),
        h('a-popover', { content: popContent, trigger: 'click', placement: 'bottom', visible: popVisible[key], 'onUpdate:visible': (v: boolean) => { popVisible[key] = v } }, { default: () => h('a', { style: `cursor:pointer; font-size:12px; color:${active ? '#1890ff' : '#666'}` }, '筛选') })
      ])
    }
  // provide custom renderers for special columns
  let renderFn: any = (text: any) => text
  if (f.key === 'completionImages') {
    renderFn = (_: any, record: any) => {
      const imgs = Array.isArray(record.completionImages) ? record.completionImages : []
      const nodes: any[] = imgs.slice(0, 3).map((u: string, i: number) => h('img', { src: u, style: 'width:40px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer;margin-right:6px', onClick: () => openPreview(u), key: `${record.id}-img-${i}` }))
      if (imgs.length > 3) nodes.push(h('span', { style: 'font-size:12px;color:#888' }, `+${imgs.length - 3}`))
      return h('div', { style: 'display:flex; align-items:center' }, nodes)
    }
  } else if (f.key === 'status') {
    renderFn = (_: any, record: any) => {
      const s = record.status || ''
      return h('a-tag', { color: statusColor(s) }, () => s)
    }
  }
  // wrap render to handle total-row marker
  const wrappedRender = (text: any, record: any) => {
    if (record && record.__isTotal) {
      const v = record[f.key]
      return h('div', { style: 'font-weight:700; background:#fafafa; padding:6px' }, formatMoney(v))
    }
    return renderFn(text, record)
  }
  const col: any = { title: titleVNode, dataIndex: f.key, key: f.key, sorter: true, render: wrappedRender }
  if (sortState.columnKey === f.key) col.sortOrder = sortState.order
  cols.push(col)
  }
  // no action column for read-only browsing view
  return cols
})

// compute horizontal scroll width based on visible columns (approx 160px per column)
const scrollX = computed(() => {
  try {
    const cols = antColumns.value ? antColumns.value.length : 8
    const w = Math.max(cols * 160, 800)
    return `${w}px`
  } catch (e) { return '1200px' }
})

const _rawTableData = computed(() => {
  let list = repairsData.value.filter(r => {
    if (debouncedFilter.roomId && !String(r.roomId).includes(debouncedFilter.roomId)) return false
    if (debouncedFilter.customerId && !String(r.customerId).includes(debouncedFilter.customerId)) return false
    if (debouncedFilter.customerName && !String(r.customerName).includes(debouncedFilter.customerName)) return false
    if (debouncedFilter.priority && String(r.priority) !== String(debouncedFilter.priority)) return false
    // apply per-column filtersMap
    for (const k of Object.keys(filtersMap)) {
      const cond = filtersMap[k]
      if (!cond) continue
      const val = r[k]
      if (cond.q && String(val ?? '').toLowerCase().indexOf(String(cond.q).toLowerCase()) === -1) return false
      if (cond.eq && String(val) !== String(cond.eq)) return false
      if (cond.present === true && (val === null || val === undefined || val === '')) return false
      if (cond.present === false && (val !== null && val !== undefined && val !== '')) return false
      if (k === 'appointmentTime' && cond.range) {
        const t = val ? new Date(val) : null
        if (!t) return false
        const s = new Date(cond.range.start)
        const e = new Date(cond.range.end)
        if (t < s || t > e) return false
      }
    }
    return true
  })

  // apply per-column filtersMap (duplicate block preserved from original logic)
  list = list.filter(r => {
    for (const k of Object.keys(filtersMap)) {
      const cond = filtersMap[k]
      if (!cond) continue
      const val = r[k]
      if (cond.q && String(val ?? '').toLowerCase().indexOf(String(cond.q).toLowerCase()) === -1) return false
      if (cond.eq && String(val) !== String(cond.eq)) return false
      if (cond.present === true && (val === null || val === undefined || val === '')) return false
      if (cond.present === false && (val !== null && val !== undefined && val !== '')) return false
      if (k === 'appointmentTime' && cond.range) {
        const t = val ? new Date(val) : null
        if (!t) return false
        const s = new Date(cond.range.start)
        const e = new Date(cond.range.end)
        if (t < s || t > e) return false
      }
    }
    return true
  })

  // apply advanced filters: location (checkedKeys), fee projects, time dimension
  if (checkedKeys.value && checkedKeys.value.length && !isAllChecked.value) {
    const titleSet = new Set<string>()
    for (const k of checkedKeys.value) {
      const found = findAndCollectTitles(treeData.value, String(k), titleSet)
      if (!found) titleSet.add(String(k))
    }
    list = list.filter(r => {
      const b = String(r.building || '')
      const rm = String(r.room || '')
      const rid = String(r.roomId || '')
      for (const t of Array.from(titleSet)) {
        if (!t) continue
        if (b.indexOf(t) !== -1) return true
        if (rm.indexOf(t) !== -1) return true
        if (rid.indexOf(t) !== -1) return true
        if (String(t) === String(r.building) || String(t) === String(r.room) || String(t) === String(r.roomId)) return true
        if (String(r.building).indexOf(String(t)) !== -1) return true
      }
      return false
    })
  }

  // fee project filter
  if (feeProjectSelected.value && feeProjectSelected.value.length) {
    list = list.filter(r => feeProjectSelected.value.includes(r.feeName || ''))
  }

  // time filter
  function inTimeRange(dstr: any) {
    if (!dstr) return false
    const d = new Date(dstr)
    if (isNaN(d.getTime())) return false
    if (timeType.value === 'month') {
      return d.getFullYear() === Number(timeYear.value) && (d.getMonth()+1) === Number(timeMonth.value)
    }
    if (timeType.value === 'quarter') {
      const q = Math.floor(d.getMonth()/3) + 1
      return d.getFullYear() === Number(timeYear.value) && q === Number(timeQuarter.value)
    }
    if (timeType.value === 'range' && timeRange.value && timeRange.value.length === 2) {
      const s = new Date(timeRange.value[0])
      const e = new Date(timeRange.value[1])
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return false
      return d >= s && d <= e
    }
    return true
  }

  if (timeType.value === 'month' || timeType.value === 'quarter' || timeType.value === 'range') {
    list = list.filter(r => inTimeRange(r.dueDate) || inTimeRange(r.periodStart) || inTimeRange(r.periodEnd))
  }

  // apply sort if present
  if (sortState.columnKey) {
    const key = sortState.columnKey
    const order = sortState.order
    list = list.slice().sort((a: any, b: any) => {
      const va = a[key]
      const vb = b[key]
      const na = parseFloat(va); const nb = parseFloat(vb)
      let cmp = 0
      if (!isNaN(na) && !isNaN(nb)) cmp = na - nb
      else {
        const da = va ? new Date(va) : null
        const db = vb ? new Date(vb) : null
        if (da && db && !isNaN(da.getTime()) && !isNaN(db.getTime())) cmp = da.getTime() - db.getTime()
        else cmp = String(va ?? '').localeCompare(String(vb ?? ''))
      }
      return order === 'descend' ? -cmp : cmp
    })
  }

  return list.map((r, idx) => ({ ...r, rowIndex: idx + 1 }))
})

// controlled paginated data presented to table
const tableData = computed(() => {
  const raw = _rawTableData.value || []
  tablePagination.total = raw.length
  // ensure current page is within bounds
  const totalPages = Math.max(1, Math.ceil(tablePagination.total / tablePagination.pageSize))
  if (tablePagination.current > totalPages) tablePagination.current = totalPages
  const start = (tablePagination.current - 1) * tablePagination.pageSize
  const end = start + tablePagination.pageSize
  return raw.slice(start, end).map((r, idx) => ({ ...r, rowIndex: start + idx + 1 }))
})

// compute totals for the current page only
const columnTotals = computed(() => {
  const vis = allFieldsVisible.value
  const page = tableData.value || []
  const totals: Record<string, any> = {}
  for (const f of vis) {
    if (['receivable','received','unpaid','penalty','consumption'].includes(f.key)) {
      totals[f.key] = (page.reduce((s: number, r: any) => s + (Number(r[f.key]) || 0), 0))
    } else {
      totals[f.key] = undefined
    }
  }
  return totals
})

// debug: log column totals when they change so we can verify consumption is included
try {
  watch(columnTotals, (nv) => {
    if (typeof console !== 'undefined' && console.debug) console.debug('columnTotals changed', nv)
  }, { deep: true })
} catch (e) {}

// present table data for the table component: current page + totals row appended (non-grouped)
const tableDataWithTotal = computed(() => {
  let page = tableData.value || []
  if (groupField.value) return page
  // only append totals when viewing the last page so totals don't become a separate empty page
  const rawLen = (_rawTableData.value || []).length
  const pageSize = Math.max(1, Number(tablePagination.pageSize) || 20)
  const totalPages = Math.max(1, Math.ceil(rawLen / pageSize))
  // determine the page index that actually contains the last data row(s)
  let lastDataPage = totalPages
  const lastPageRows = rawLen - (totalPages - 1) * pageSize
  if (rawLen === 0) {
    lastDataPage = 1
  } else if (lastPageRows === 0 && totalPages > 1) {
    // when data exactly fills pages, put totals on the previous page (so it won't occupy a separate empty page)
    lastDataPage = totalPages - 1
  }
  // if the current page has no data but there exists a previous page with data,
  // move the pager back one page so totals attach to that previous page instead of standing alone
  if ((page.length === 0) && rawLen > 0 && tablePagination.current > 1) {
    tablePagination.current = Math.max(1, tablePagination.current - 1)
    const newStart = (tablePagination.current - 1) * pageSize
    page = (_rawTableData.value || []).slice(newStart, newStart + pageSize).map((r:any, idx:number) => ({ ...r, rowIndex: newStart + idx + 1 }))
  }

  const isLastPage = tablePagination.current === lastDataPage
  const totals = columnTotals.value
  // build a synthetic total record; give it an id to avoid row-key conflict
  const totalRecord: any = { id: '__total', __isTotal: true }
  for (const f of allFieldsVisible.value) {
    totalRecord[f.key] = totals[f.key] !== undefined ? totals[f.key] : ''
  }
  // ensure serial column shows '合计'
  totalRecord.rowIndex = '合计'
  return isLastPage ? [...page, totalRecord] : page
})


// dynamic table scroll Y calculation to avoid page-level vertical scrollbar
import { onBeforeUnmount } from 'vue'
const tableScrollY = ref('60vh')
function computeTableHeight() {
  try {
    const vh = window.innerHeight
    // estimate toolbar + paddings + other offsets ~ 200px; keep some minimum height
    const offset = 220
    const h = Math.max(300, vh - offset)
    tableScrollY.value = `${h}px`
  } catch (e) {
    tableScrollY.value = '60vh'
  }
}
onMounted(() => { computeTableHeight(); window.addEventListener('resize', computeTableHeight) })
onBeforeUnmount(() => { try { window.removeEventListener('resize', computeTableHeight) } catch (e) {} })

// preview state for images
const previewVisible = ref(false)
const previewSrc = ref('')
function openPreview(src: string) { previewSrc.value = src; previewVisible.value = true }
function closePreview() { previewVisible.value = false; previewSrc.value = '' }

function onSort() { message.info('排序使用表头列的排序功能（点击列头）') }

// handle AntD table change (pagination, filters, sorter)
function onTableChange(pagination: any, filters: any, sorter: any) {
  try {
    // update pagination state if provided
    if (pagination && typeof pagination === 'object') {
      tablePagination.current = pagination.current || 1
      tablePagination.pageSize = pagination.pageSize || tablePagination.pageSize
    }
    if (!sorter) { sortState.columnKey = ''; sortState.order = ''; return }
    if (Array.isArray(sorter)) sorter = sorter[0]
    sortState.columnKey = sorter.columnKey || sorter.field || ''
    sortState.order = sorter.order || ''
    // bump key to ensure table re-renders with new column sortOrder
    tableKey.value = (tableKey.value || 0) + 1
  } catch (e) { console.warn('onTableChange error', e) }
}

// onEditRow and onDeleteRow removed — read-only report

// CSV export
function exportCsv() {
  const visibleFields = allFields.value.filter(f => f.visible)
  const headers = ['序号', ...visibleFields.map(f => f.title)]

  // helper: build rows for an array of records
  function buildRows(records: any[]) {
    return records.map((r: any, idx: number) => [String(idx + 1), ...visibleFields.map(f => r[f.key] ?? '')])
  }

  const rows = groupField.value ? (() => {
    const out: any[] = []
    for (const g of Object.keys(groupedData.value)) {
      const grp = groupedData.value[g]
      out.push([`${groupFieldLabel.value}: ${g} （${grp.rows.length}）`])
      out.push(headers)
      out.push(...buildRows(grp.rows))
      // group totals row (directly after group rows)
      const totals = computeTotalsForRows(grp.rows, visibleFields)
      out.push(['合计', ...visibleFields.map(f => totals[f.key] !== undefined ? totals[f.key] : '')])
    }
    // overall totals
    const overall = computeTotalsForRows(tableData.value, visibleFields)
    out.push(['总计', ...visibleFields.map(f => overall[f.key] !== undefined ? overall[f.key] : '')])
    return out
  })() : buildRows(tableData.value)

  // if non-grouped, append totals row
  if (!groupField.value) {
    const totals = computeTotalsForRows(tableData.value, visibleFields)
  // append totals as the last row
  rows.push(['合计', ...visibleFields.map(f => totals[f.key] !== undefined ? totals[f.key] : '')])
  }

  // serialize to CSV
  const csv = [headers.join(','), ...rows.map((r:any) => r.map((c:any)=>`"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', '费用报表导出.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// compute totals for visible numeric/monetary fields
function computeTotalsForRows(rows: any[], visibleFields: any[]) {
  const totals: Record<string, number|undefined> = {}
  const moneyKeyPattern = /(应收|已收|未收|违约|金额|收|用量|consumption|receivable|received|unpaid|penalty)/i
  for (const f of visibleFields) {
    // decide if this field should be totaled: either known keys or title matches money pattern
    if (['receivable','received','unpaid','penalty'].includes(f.key) || moneyKeyPattern.test(f.title)) {
      let s = 0
      for (const r of rows) {
        const v = Number(r[f.key])
        if (!isNaN(v)) s += v
      }
      totals[f.key] = Math.round((s + Number.EPSILON) * 100) / 100
    }
  }
  return totals
}

function formatMoney(v: any) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (isNaN(n)) return String(v)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const nonGroupTotals = computed(() => {
  const vis = allFieldsVisible.value
  return computeTotalsForRows(tableData.value, vis)
})

async function exportXlsx() {
  try {
    const XLSX = await import('xlsx')
    const visibleFields = allFields.value.filter(f => f.visible)
    const hdrs = ['序号', ...visibleFields.map(f => f.title)]
    const sheets: Record<string, any[][]> = {}

    if (groupField.value) {
      for (const g of Object.keys(groupedData.value)) {
        const grp = groupedData.value[g]
        const out: any[][] = []
        out.push([`${groupFieldLabel.value}: ${g} （${grp.rows.length}）`])
        out.push(hdrs)
        grp.rows.forEach((r:any, idx:number) => out.push([idx+1, ...visibleFields.map(f => r[f.key] ?? '')]))
        const totals = computeTotalsForRows(grp.rows, visibleFields)
        // totals directly as last row for this group's sheet
        out.push(['合计', ...visibleFields.map(f => totals[f.key] !== undefined ? totals[f.key] : '')])
        sheets[g] = out
      }
      // overall totals sheet
      const overallOut: any[][] = []
      overallOut.push(hdrs)
      tableData.value.forEach((r:any, idx:number) => overallOut.push([idx+1, ...visibleFields.map(f => r[f.key] ?? '')]))
      const overallTotals = computeTotalsForRows(tableData.value, visibleFields)
      overallOut.push(['总计', ...visibleFields.map(f => overallTotals[f.key] !== undefined ? overallTotals[f.key] : '')])
      sheets['汇总'] = overallOut
    } else {
      const out: any[][] = []
      out.push(hdrs)
      tableData.value.forEach((r:any, idx:number) => out.push([idx+1, ...visibleFields.map(f => r[f.key] ?? '')]))
      const totals = computeTotalsForRows(tableData.value, visibleFields)
      out.push(['合计', ...visibleFields.map(f => totals[f.key] !== undefined ? totals[f.key] : '')])
      sheets['费用报表'] = out
    }

    const wb = XLSX.utils.book_new()
    for (const name of Object.keys(sheets)) {
      const ws = XLSX.utils.aoa_to_sheet(sheets[name])
      XLSX.utils.book_append_sheet(wb, ws, name.substr(0, 31))
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '费用报表.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    console.warn('exportXlsx failed, fallback to CSV', e)
    exportCsv()
  }
}

function importCsv() { message.info('导入功能暂为占位，可上传并解析 CSV 后追加到数据列表') }

// 打印报表：在新窗口生成打印友好页面并触发打印
function buildHtmlTable(rows: any[], visibleFields: any[], title = '费用报表') {
  const thead = `<tr><th style="border:1px solid #ddd;padding:6px;background:#f5f5f5">序号</th>${visibleFields.map((f:any)=>`<th style="border:1px solid #ddd;padding:6px;background:#f5f5f5">${f.title}</th>`).join('')}</tr>`
  const tbody = rows.map((r:any, idx:number) => `<tr>${['<td style="border:1px solid #ddd;padding:6px">'+(idx+1)+'</td>', ...visibleFields.map((f:any)=>`<td style="border:1px solid #ddd;padding:6px">${String(r[f.key] ?? '')}</td>`)].join('')}</tr>`).join('')
  return `<div style="font-family:Arial,Helvetica,sans-serif;padding:16px"><h2>${title}</h2><table style="border-collapse:collapse;width:100%">${thead}${tbody}</table></div>`
}

function printReport() {
  const visibleFields = allFields.value.filter((f:any)=>f.visible)
  let html = ''
  if (groupField.value) {
    html += `<div>`
    for (const g of Object.keys(groupedData.value)) {
      const grp = groupedData.value[g]
      html += `<h3>${groupFieldLabel.value}: ${g} （${grp.rows.length}）</h3>`
      html += buildHtmlTable(grp.rows, visibleFields, '')
      const totals = computeTotalsForRows(grp.rows, visibleFields)
      html += `<div style="margin-top:8px;font-weight:600">合计：${visibleFields.map(f=> (totals[f.key]!==undefined? `${f.title}: ${formatMoney(totals[f.key])}` : '')).filter(Boolean).join('；')}</div>`
    }
    const overallTotals = computeTotalsForRows(tableData.value, visibleFields)
    html += `<h3>总计</h3><div style="font-weight:600">${visibleFields.map(f=> (overallTotals[f.key]!==undefined? `${f.title}: ${formatMoney(overallTotals[f.key])}` : '')).filter(Boolean).join('；')}</div>`
    html += `</div>`
  } else {
    // For print: build a hierarchical tree: 管理区 -> 楼宇 -> 房间
    const allRows = _rawTableData.value || []

    // build mapping from treeData
    const buildingToArea: Record<string,string> = {}
    for (const areaNode of (treeData.value || [])) {
      const areaTitle = areaNode.title || ''
      if (areaNode.children && Array.isArray(areaNode.children)) {
        for (const b of areaNode.children) {
          if (b && b.title) buildingToArea[String(b.title)] = areaTitle
        }
      }
    }

    // build nested map area -> building -> room -> rows
    const hierarchy: Record<string, Record<string, Record<string, any[]>>> = {}
    const unassigned: any[] = []
    for (const r of allRows) {
      const b = String(r.building || '未分配楼宇')
      const room = String(r.room || '未分配房间')
      let area = buildingToArea[b]
      if (!area) {
        // fuzzy match
        for (const bt of Object.keys(buildingToArea)) {
          if (bt && b.indexOf(bt) !== -1) { area = buildingToArea[bt]; break }
        }
      }
      if (area) {
        if (!hierarchy[area]) hierarchy[area] = {}
        if (!hierarchy[area][b]) hierarchy[area][b] = {}
        if (!hierarchy[area][b][room]) hierarchy[area][b][room] = []
        hierarchy[area][b][room].push(r)
      } else {
        unassigned.push(r)
      }
    }

  // prepare initial expanded state: inline toggles will default sections to visible

    // build HTML with collapsible sections
    html += `<div class="print-tree-report">`
    html += `<style> .print-tree-report .node{margin:6px 0} .lvl-area{font-size:16px;font-weight:700} .lvl-building{padding-left:16px;font-weight:600} .lvl-room{padding-left:32px;font-weight:500} .toggle-btn{display:inline-block;width:20px;text-align:center;margin-right:6px;cursor:pointer;border:1px solid #ccc;border-radius:2px} .totals{margin-left:12px;color:#333} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px;font-size:12px} </style>`

  // no external script: use inline onclick handlers for toggling to avoid SFC parsing issues

    let areaIndex = 0
    for (const area of Object.keys(hierarchy)) {
      const areaId = `area-${areaIndex}`
      const areaRows: any[] = []
      // compute area totals later
  // 管理区默认折叠，用户点击 '+' 展开下属楼宇
  html += `<div class="node lvl-area"><span class="toggle-btn" onclick="(function(btn){var el=document.getElementById('${areaId}'); if(!el)return; if(el.style.display==='none'){el.style.display='block'; btn.textContent='-'}else{el.style.display='none'; btn.textContent='+'}})(this)">+</span>管理区：${area}</div>`
      html += `<div id="${areaId}" style="display:none">`
      let buildingIndex = 0
      for (const building of Object.keys(hierarchy[area])) {
        const bId = `${areaId}-b-${buildingIndex}`
        const roomsMap = hierarchy[area][building]
        let buildingRows: any[] = []
  // 楼宇默认折叠，点击展开显示该楼宇下的房间列表表格
  html += `<div class="node lvl-building"><span class="toggle-btn" onclick="(function(btn){var el=document.getElementById('${bId}'); if(!el)return; if(el.style.display==='none'){el.style.display='block'; btn.textContent='-'}else{el.style.display='none'; btn.textContent='+'}})(this)">+</span>楼宇：${building} （${Object.values(roomsMap).reduce((s:any, arr:any)=>s+arr.length,0)}）</div>`
        html += `<div id="${bId}" style="display:none">`
        // 合并该楼宇下所有房间的行，整个楼宇使用一个表格展示（不再单独为每个房间渲染表格）
        for (const room of Object.keys(roomsMap)) {
          buildingRows = buildingRows.concat(roomsMap[room])
        }
        // 显示楼宇及其房间数量摘要
        const totalRooms = Object.keys(roomsMap).length
        html += `<div class="node lvl-building-summary" style="padding-left:16px;color:#666;margin-bottom:6px">房间数: ${totalRooms}，总记录: ${buildingRows.length}</div>`
        // 用一个表格展示该楼宇所有行（表中包含房间列）
        if (buildingRows.length) {
          html += buildHtmlTable(buildingRows, visibleFields, '')
        } else {
          html += `<div style="padding-left:16px;color:#999">（无数据）</div>`
        }
        const bt = computeTotalsForRows(buildingRows, visibleFields)
        html += `<div class="node lvl-building totals">本楼宇合计：${visibleFields.map(f=> (bt[f.key]!==undefined? `${f.title}: ${formatMoney(bt[f.key])}` : '')).filter(Boolean).join('；')}</div>`
        html += `</div>`
        areaRows.push(...buildingRows)
        buildingIndex++
      }
      const at = computeTotalsForRows(areaRows, visibleFields)
      html += `<div class="node lvl-area totals">管理区合计：${visibleFields.map(f=> (at[f.key]!==undefined? `${f.title}: ${formatMoney(at[f.key])}` : '')).filter(Boolean).join('；')}</div>`
      html += `</div>`
      areaIndex++
    }

    if (unassigned.length) {
      html += `<h2>未分配/其他</h2>`
      html += buildHtmlTable(unassigned, visibleFields, '')
      const ut = computeTotalsForRows(unassigned, visibleFields)
      html += `<div class="totals">未分配合计：${visibleFields.map(f=> (ut[f.key]!==undefined? `${f.title}: ${formatMoney(ut[f.key])}` : '')).filter(Boolean).join('；')}</div>`
    }

    const overallTotals = computeTotalsForRows(allRows, visibleFields)
    html += `<h2>总体合计</h2><div class="totals">${visibleFields.map(f=> (overallTotals[f.key]!==undefined? `${f.title}: ${formatMoney(overallTotals[f.key])}` : '')).filter(Boolean).join('；')}</div>`
    html += `</div>`
  }

  const win = window.open('', '_blank')
  if (!win) { message.error('无法打开打印窗口，请检查浏览器弹窗拦截设置') ; return }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>打印-费用报表</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#222} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px;font-size:12px}</style></head><body>${html}</body></html>`)
  win.document.close()
  // 延迟触发打印，确保资源加载完
  setTimeout(()=>{ try { win.focus(); win.print(); } catch(e) { console.warn('print failed', e) } }, 300)
}

// debug: show current filters and sort in a small panel to help manual verification
const showDebug = true
onMounted(() => {
  if (showDebug) {
    console.info('repairs.daily debug', { filters: buildPlainFilters(), sort: { columnKey: sortState.columnKey, order: sortState.order } })
  }
  // debug: print data sizes
  try { console.debug('repairsData length', repairsData.value.length, 'tableData length', tableData.value.length) } catch (e) {}
})

// edit/create/delete/upload handlers removed — read-only report
// removed edit/create/delete handlers and upload helpers: this page is read-only
</script>

<style scoped>
.repairs-page { padding: 12px }
.toolbar { margin-bottom: 12px }
.edit-form .ant-form-item-label > label { font-weight:600; color:#333 }
.edit-form .ant-form-item { margin-bottom:8px }
.ant-upload-list-picture-card .ant-upload-list-item { width:52px; height:52px }
.ant-upload-list-picture-card .ant-upload-list-item img { width:52px; height:52px; object-fit:cover }

/* Ensure table body always shows vertical scrollbar to keep UI consistent across pages */
.fee-report-table >>> .ant-table-body {
  overflow-y: scroll !important;
}
</style>
