<template>
  <div class="building-page">
    <div class="building-layout">
      <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
        <div style="padding:6px 8px; display:flex; gap:8px; align-items:center;">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇（按 Enter 或点击 查询）" allow-clear @input="onTreeSearchInput" @keyup.enter="onTreeSearchEnter" style="flex:1" />
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
  <input ref="fileInputRef" type="file" accept=".csv" style="display:none" @change="onFileInputChange" />
        <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <a-space>
              <a-button type="primary" @click="onAdd">新增楼宇</a-button>
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
              <a-select v-model:value="filterForm.areaId" :options="areaOptions" show-search allow-clear placeholder="管理区编号" style="min-width:140px" @change="onAreaChange" />
            </a-form-item>
            <a-form-item>
              <a-select v-model:value="filterForm.buildingId" :options="buildingOptions" show-search allow-clear placeholder="楼宇编号" style="min-width:140px" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="filterForm.buildingName" placeholder="楼宇名称" style="min-width:140px" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="filterForm.address" placeholder="地址" style="min-width:140px" />
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
          row-key="buildingId"
          bordered
          :scroll="{ x: 1200, y: 420 }"
          size="small"
          :row-class-name="() => 'dense-row'"
          style="width:100%;"
        >
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'actions'">
              <div class="table-actions">
                <a-button type="link" size="small" @click="onEdit(slotProps.record)">编辑</a-button>
                <a-button type="link" size="small" danger @click="onDelete(slotProps.record)">删除</a-button>
              </div>
            </template>
          </template>
        </a-table>
        <a-modal v-model:visible="editModalVisible" title="编辑 / 新增 楼宇" :footer="null" @cancel="handleEditCancel" width="600px">
          <a-config-provider :locale="zhCN">
          <a-card size="small">
            <div class="modal-body-scroll">
              <a-form :model="editForm" layout="vertical">
                <a-row :gutter="12">
                  <a-col :span="12">
                    <a-form-item label="管理区编号" required>
                      <a-select v-model:value="editForm.areaId" :options="areaOptions" show-search allow-clear placeholder="请选择管理区编号" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="楼宇编号" required>
                      <a-input v-model:value="editForm.buildingId" placeholder="请输入楼宇编号" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="楼宇名称" required>
                      <a-input v-model:value="editForm.buildingName" placeholder="请输入楼宇名称" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="地址">
                      <a-input v-model:value="editForm.address" placeholder="请输入地址" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="楼宇类型">
                      <a-select v-model:value="editForm.buildingType" placeholder="请选择楼宇类型" allow-clear>
                        <a-select-option value="住宅">住宅</a-select-option>
                        <a-select-option value="商用">商用</a-select-option>
                        <a-select-option value="写字楼">写字楼</a-select-option>
                        <a-select-option value="公寓">公寓</a-select-option>
                        <a-select-option value="其他">其他</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="楼宇结构">
                      <a-select v-model:value="editForm.buildingStructure" placeholder="请选择楼宇结构" allow-clear>
                        <a-select-option value="框架">框架</a-select-option>
                        <a-select-option value="砖混">砖混</a-select-option>
                        <a-select-option value="钢结构">钢结构</a-select-option>
                        <a-select-option value="剪力墙">剪力墙</a-select-option>
                        <a-select-option value="其他">其他</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="楼宇朝向">
                      <a-select v-model:value="editForm.orientation" placeholder="请选择楼宇朝向" allow-clear>
                        <a-select-option value="东">东</a-select-option>
                        <a-select-option value="南">南</a-select-option>
                        <a-select-option value="西">西</a-select-option>
                        <a-select-option value="北">北</a-select-option>
                        <a-select-option value="东南">东南</a-select-option>
                        <a-select-option value="西南">西南</a-select-option>
                        <a-select-option value="东北">东北</a-select-option>
                        <a-select-option value="西北">西北</a-select-option>
                        <a-select-option value="其他">其他</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item label="备注">
                      <a-input v-model:value="editForm.remark" placeholder="请输入备注" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
              </div>
            </a-card>
            </a-config-provider>
          <div class="modal-footer-fixed">
              <a-button @click="handleEditCancel" style="margin-right: 12px">取消</a-button>
              <a-button type="primary" @click="handleEditOk">确定</a-button>
          </div>
  </a-modal>
        <!-- 导入预览模态 -->
        <a-modal v-model:visible="importPreviewVisible" title="导入 管理区/楼宇 预览" width="820" :footer="null">
          <div style="max-height:60vh; overflow:auto">
            <a-table :columns="importPreviewColumns" :data-source="importPreviewRows" row-key="__row" size="small" :pagination="{ pageSize: 8 }"></a-table>
          </div>
          <div style="margin-top:8px; display:flex; justify-content:flex-end; gap:8px">
            <a-button size="small" @click="importPreviewVisible = false">取消</a-button>
            <a-button type="primary" size="small" @click="confirmImport">确认导入</a-button>
          </div>
        </a-modal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ...此处省略，请根据房间页面的逻辑复制并调整为管理区-楼宇两级树和楼宇表单/表格数据...
import { ref, h, computed, onMounted, onUnmounted, inject, nextTick, watch } from 'vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import { FullscreenOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 管理区-楼宇数据示例
const areaBuildings: Record<string, string[]> = {
  '管理区A': ['楼宇A1', '楼宇A2'],
  '管理区B': ['楼宇B1']
};

// 楼宇数据
const allBuildings = ref([
  { areaId: 'A', buildingId: 'A1', buildingName: '楼宇A1', address: '地址A1', buildingType: '住宅', buildingStructure: '框架', orientation: '南', remark: '' },
  { areaId: 'A', buildingId: 'A2', buildingName: '楼宇A2', address: '地址A2', buildingType: '住宅', buildingStructure: '框架', orientation: '东', remark: '' },
  { areaId: 'B', buildingId: 'B1', buildingName: '楼宇B1', address: '地址B1', buildingType: '商用', buildingStructure: '砖混', orientation: '西', remark: '' }
]);

// 树相关
const treeData = ref<any[]>([]);
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const treeSearch = ref('');
const treePanelRef = ref<any>(null);
const sidebarWidth = ref<number>(260);
const dragging = ref(false);

function buildTree() {
  const nodes: any[] = [];
  let areaIdx = 1;
  for (const [areaName, buildings] of Object.entries(areaBuildings)) {
    const buildingNodes = buildings.map((bName, idx) => {
      const meta = { type: 'building', areaName, buildingName: bName };
      return { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName) ]), key: `building-${areaIdx}-${idx+1}`, isLeaf: true, meta };
    });
    const areaNode = { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, areaName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${buildings.length}栋`) ]), key: `area-${areaIdx}`, meta: { type: 'area', areaName }, children: buildingNodes };
    nodes.push(areaNode);
    areaIdx++;
  }
  treeData.value = nodes;
}
buildTree();

function onTreeExpand(keys: string[]) { expandedKeys.value = keys; }
function onSelect(keys: string[]) { selectedKeys.value = keys; }
function onSplitterDown(e: MouseEvent) { dragging.value = true; e.preventDefault(); }
function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return;
  const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect();
  const left = parentRect ? parentRect.left : 0;
  const newWidth = Math.min(560, Math.max(180, e.clientX - left));
  sidebarWidth.value = newWidth;
}
function onMouseUp() { dragging.value = false; }
onMounted(() => { window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp); });
onUnmounted(() => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); });

function onTreeSearchInput(e: any) { treeSearch.value = e?.target?.value ?? (e || ''); }
function onTreeSearchEnter() { /* 可实现树节点搜索高亮 */ }

// 表格与表单
const tableColumns = [
  { title: '管理区编号', dataIndex: 'areaId', key: 'areaId', width: 120 },
  { title: '楼宇编号', dataIndex: 'buildingId', key: 'buildingId', width: 120 },
  { title: '楼宇名称', dataIndex: 'buildingName', key: 'buildingName', width: 140 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 200 },
  { title: '楼宇类型', dataIndex: 'buildingType', key: 'buildingType', width: 120 },
  { title: '楼宇结构', dataIndex: 'buildingStructure', key: 'buildingStructure', width: 120 },
  { title: '楼宇朝向', dataIndex: 'orientation', key: 'orientation', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' }
];
const tableData = ref([...allBuildings.value]);

const filterModalVisible = ref(false);
const filterForm = ref({ areaId: '', buildingId: '', buildingName: '', address: '' });
const inlineFilterVisible = ref(false);
const areaOptions = ref(Object.keys(areaBuildings).map(a => ({ label: a, value: a })));
const buildingOptions = ref<any[]>(allBuildings.value.map(b => ({ label: b.buildingId, value: b.buildingId })));

function onAreaChange(val: string) {
  if (!val) {
    buildingOptions.value = allBuildings.value.map(b => ({ label: b.buildingId, value: b.buildingId }));
    filterForm.value.buildingId = '';
    return;
  }
  const blds = allBuildings.value.filter(b => b.areaId === val).map(b => ({ label: b.buildingId, value: b.buildingId }));
  buildingOptions.value = blds;
  filterForm.value.buildingId = '';
}
function resetFilter() { filterForm.value = { areaId: '', buildingId: '', buildingName: '', address: '' }; tableData.value = [...allBuildings.value]; }
function applyFilter() {
  tableData.value = allBuildings.value.filter(b => {
    return (!filterForm.value.areaId || b.areaId === filterForm.value.areaId)
      && (!filterForm.value.buildingId || b.buildingId === filterForm.value.buildingId)
      && (!filterForm.value.buildingName || b.buildingName.includes(filterForm.value.buildingName))
      && (!filterForm.value.address || b.address.includes(filterForm.value.address));
  });
}
function openFilter() { filterModalVisible.value = true; }
function toggleInlineFilter() { inlineFilterVisible.value = !inlineFilterVisible.value; }
const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
const importPreviewColumns = ref<any[]>([
  { title: '管理区', dataIndex: 'area', key: 'area' },
  { title: '楼宇编号', dataIndex: 'buildingId', key: 'buildingId' },
  { title: '楼宇名称', dataIndex: 'buildingName', key: 'buildingName' },
  { title: '地址', dataIndex: 'address', key: 'address' }
])

const fileInputRef = ref<HTMLInputElement | null>(null)
function onImport() {
  // trigger hidden file input
  try { fileInputRef.value && fileInputRef.value.click() } catch (e) { message.error('无法打开文件选择器') }
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files && input.files[0]
  if (f) handleImportFile(f)
  // clear value to allow re-selecting same file
  input.value = ''
}

function handleImportFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = String(e.target?.result || '')
    const lines = text.split(/\r?\n/).filter(l=>l.trim())
    if (!lines.length) { message.error('CSV 内容为空'); return }
    const headers = splitCsvLine(lines[0]).map(h=>h.trim())
    const rows = lines.slice(1).map(l=>{
      const cols = splitCsvLine(l)
      const obj:any = {}
      for (let i=0;i<headers.length;i++) obj[headers[i]] = cols[i]
      return obj
    })
    // map to preview rows: expect columns like 管理区, 管理区名称, 楼宇编号, 楼宇名称, 地址
    importPreviewRows.value = rows.map((r:any, idx:number)=>({ __row: idx, area: r['管理区']||r['area']||r['管理区名称']||'', buildingId: r['楼宇编号']||r['buildingId']||r['building_id']||'', buildingName: r['楼宇名称']||r['buildingName']||'', address: r['地址']||r['address']||'' }))
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
  // transform preview rows into areaBuildings/allBuildings
  for (const r of importPreviewRows.value) {
    const areaName = r.area || '默认管理区'
    const bId = r.buildingId || (`B-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*90)}`)
    const bName = r.buildingName || bId
    // ensure area exists
    if (!areaBuildings[areaName]) areaBuildings[areaName] = []
    if (!areaBuildings[areaName].includes(bName)) areaBuildings[areaName].push(bName)
    // push building record
    const rec = { areaId: areaName, buildingId: bId, buildingName: bName, address: r.address||'', buildingType: '', buildingStructure: '', orientation: '', remark: '' }
    // dedupe by buildingId
    if (!allBuildings.value.find((x:any)=>x.buildingId === bId)) {
      allBuildings.value.push(rec)
    }
  }
  // rebuild tree and table data
  buildTree()
  tableData.value = [...allBuildings.value]
  areaOptions.value = Object.keys(areaBuildings).map(a=>({ label: a, value: a }))
  importPreviewRows.value = []
  importPreviewVisible.value = false
  message.success('导入完成')
}
function onExport() { message.info('导出功能待实现'); }
function doRequestFullscreen() { /* 可实现全屏 */ }

const editModalVisible = ref(false);
const editForm = ref({ areaId: '', buildingId: '', buildingName: '', address: '', buildingType: '', buildingStructure: '', orientation: '', remark: '' });
function onAdd() { editForm.value = { areaId: '', buildingId: '', buildingName: '', address: '', buildingType: '', buildingStructure: '', orientation: '', remark: '' }; editModalVisible.value = true; }
function onEdit(record: any) { editForm.value = { ...record }; editModalVisible.value = true; }
function onDelete(record: any) {
  allBuildings.value = allBuildings.value.filter(b => b.buildingId !== record.buildingId);
  tableData.value = tableData.value.filter(b => b.buildingId !== record.buildingId);
  message.success('删除成功');
}
function handleEditCancel() { editModalVisible.value = false; }
function handleEditOk() {
  const idx = allBuildings.value.findIndex(b => b.buildingId === editForm.value.buildingId);
  if (idx !== -1) {
    allBuildings.value[idx] = { ...editForm.value };
    message.success('编辑成功');
  } else {
    allBuildings.value.push({ ...editForm.value });
    message.success('新增成功');
  }
  tableData.value = [...allBuildings.value];
  editModalVisible.value = false;
}

// 楼宇 modal 拖拽支持
const bModalElRef = ref<HTMLElement | null>(null)
let bHeaderDown: ((e: MouseEvent) => void) | null = null
let bDocMove: ((e: MouseEvent) => void) | null = null
let bDocUp: ((e: MouseEvent) => void) | null = null
const bModalDragging = ref(false)
let bDragStartX = 0
let bDragStartY = 0

function attachBuildingModalDrag() {
  nextTick(() => {
    const modals = Array.from(document.querySelectorAll('.ant-modal')) as HTMLElement[]
    if (!modals.length) return
    const modalEl = modals[modals.length - 1]
    bModalElRef.value = modalEl
    modalEl.style.margin = '0'
    modalEl.style.position = 'absolute'
    modalEl.style.zIndex = '1000'
    const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
    if (!header) return
    header.style.cursor = 'move'
    bHeaderDown = (e: MouseEvent) => {
      const rect = modalEl.getBoundingClientRect()
      bDragStartX = e.clientX - rect.left
      bDragStartY = e.clientY - rect.top
      bModalDragging.value = true
      bDocMove = (ev: MouseEvent) => {
        if (!bModalDragging.value || !bModalElRef.value) return
        const left = Math.min(Math.max(ev.clientX - bDragStartX, 0), window.innerWidth - bModalElRef.value.offsetWidth)
        const top = Math.min(Math.max(ev.clientY - bDragStartY, 0), window.innerHeight - bModalElRef.value.offsetHeight)
        bModalElRef.value.style.left = `${left}px`
        bModalElRef.value.style.top = `${top}px`
      }
      bDocUp = () => {
        bModalDragging.value = false
        if (bDocMove) document.removeEventListener('mousemove', bDocMove)
        if (bDocUp) document.removeEventListener('mouseup', bDocUp)
      }
      document.addEventListener('mousemove', bDocMove)
      document.addEventListener('mouseup', bDocUp)
    }
    header.addEventListener('mousedown', bHeaderDown)
  })
}

function detachBuildingModalDrag() {
  try {
    const modalEl = bModalElRef.value
    if (modalEl) {
      const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
      if (header && bHeaderDown) header.removeEventListener('mousedown', bHeaderDown)
      modalEl.style.position = ''
      modalEl.style.left = ''
      modalEl.style.top = ''
      modalEl.style.margin = ''
      modalEl.style.zIndex = ''
    }
  } catch (e) { }
  if (bDocMove) { document.removeEventListener('mousemove', bDocMove); bDocMove = null }
  if (bDocUp) { document.removeEventListener('mouseup', bDocUp); bDocUp = null }
  bHeaderDown = null
  bModalElRef.value = null
  bModalDragging.value = false
}

watch(editModalVisible, (v) => { if (v) attachBuildingModalDrag(); else detachBuildingModalDrag() })
</script>

<style scoped>
/* 复制房间页面的样式 */
.building-page { padding: 0 }
.building-layout { display:flex; height:100vh; }
.tree-panel { width:260px; border-right:1px solid #eee; padding:16px 8px; background:#fff; height:100vh; box-sizing:border-box; overflow:auto }
.splitter { width:6px; cursor:col-resize; background:linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.data-panel { flex:1; padding:16px; height:100vh; overflow:auto }
.dense-row .ant-table-cell { padding:6px 8px; font-size:13px }
.dense-row .ant-table-cell { padding:2px 6px; font-size:11px; line-height:1.1 }
.ant-table-cell { white-space:nowrap }
.dense-row .ant-table-cell, .ant-table-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dense-row .ant-table-cell { padding: 10px 12px; font-size: 13px }
.ant-table-tbody > tr > td { padding-top: 10px; padding-bottom: 10px }
.table-actions { display: inline-flex; gap: 8px; align-items: center; white-space: nowrap }
.table-actions .ant-btn { padding: 0 8px }
.table-actions .ant-btn-primary { background: #1890ff; border-color: #1890ff }
.table-actions .ant-btn-dangerous { color: #ff4d4f }
.tree-panel .ant-tree-node-content-wrapper { border-radius:6px; padding:6px 8px; transition: background .12s, box-shadow .12s; }
.tree-panel .ant-tree-node-content-wrapper:hover { background: #f5fbff; }
.tree-panel .ant-tree-treenode-selected > .ant-tree-node-content-wrapper { background: #e6f7ff; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.tree-panel .ant-tree-node { margin:4px 0 }
.tree-panel .ant-tree { padding: 6px }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0)); border-radius:4px }
.tree-panel .ant-input { border-radius:6px }
.tree-node-title { display:inline-flex; align-items:center; gap:6px }
.tree-node-title .node-main { font-weight:500 }
.tree-node-title .node-badge { background:#f0f5ff; color:#2f54eb; padding:2px 6px; border-radius:10px; font-size:12px }
.tree-node-title .node-rented { color:#fa8c16; font-size:12px }
.compact-inline .ant-form-item { margin-right: 8px }
.compact-inline .ant-select-selector, .compact-inline .ant-input { padding:4px 8px; font-size:12px }
.compact-inline { white-space:nowrap; overflow:hidden }
.compact-inline .inline-actions { display:inline-flex; gap:6px; align-items:center }
.card-inline .ant-form-item { margin-right:8px; margin-bottom:8px }
.card-inline .ant-input, .card-inline .ant-select-selector { height:30px; padding:4px 8px }
.card-inline .ant-form { display:flex; flex-wrap:wrap; align-items:center }
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

/* 楼宇 modal 可滚动表单体 */
.modal-body-scroll { max-height: calc(60vh); overflow-y: auto; padding-right: 8px }
.modal-body-scroll .ant-row { padding-bottom: 8px }
</style>
