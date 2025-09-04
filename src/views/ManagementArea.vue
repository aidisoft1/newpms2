<template>
  <div class="building-page">
    <div v-if="backendDown" style="position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:2000;background:#fff1f0;border:1px solid #ffa39e;color:#cf1322;padding:4px 12px;border-radius:4px;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.08)">
      后端未启动或无法连接，请先在 backend 目录启动服务 (npm run dev / start)。
    </div>
    <div class="building-layout">
      <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
        <div style="padding:6px 8px; display:flex; gap:8px; align-items:center;">
          <a-input v-model:value="treeSearch" placeholder="搜索管理区（按 Enter 或点击 查询）" allow-clear @input="onTreeSearchInput" @keyup.enter="onTreeSearchEnter" style="flex:1" />
          <a-button type="primary" @click="onTreeSearchEnter">查询</a-button>
        </div>
        <a-tree
          :tree-data="treeData"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          block-node
          show-icon="false"
          @expand="onTreeExpand"
          @select="onSelect"
        />
      </div>
      <div class="splitter" @mousedown.prevent="onSplitterDown" title="拖动调整宽度"></div>
      <div class="data-panel">
  <input ref="maFileInputRef" type="file" accept=".csv" style="display:none" @change="onMaFileInputChange" />
        <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <a-space>
              <a-button type="primary" @click="onAdd">新增管理区</a-button>
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
              <a-input v-model:value="filterForm.areaId" placeholder="管理区编号" style="min-width:140px" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="filterForm.name" placeholder="管理区名称" style="min-width:140px" />
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
          row-key="areaId"
          bordered
          :scroll="{ x: 1200, y: 420 }"
          size="small"
          :row-class-name="() => 'dense-row'"
          style="width:100%;"
          @change="onTableChange"
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
  <a-modal v-model:visible="editModalVisible" title="编辑 / 新增管理区" :footer="null" @cancel="handleEditCancel" width="420px">
          <a-card size="small">
            <div class="modal-body-scroll">
            <a-form :model="editForm" layout="vertical">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="管理区编号" required>
                    <a-input v-model:value="editForm.areaId" placeholder="请输入管理区编号" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="管理区名称" required>
                    <a-input v-model:value="editForm.name" placeholder="请输入管理区名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="多层楼宇数量">
                    <a-input v-model:value="editForm.lowBuildingCount" placeholder="请输入多层楼宇数量" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="高层楼宇数量">
                    <a-input v-model:value="editForm.highBuildingCount" placeholder="请输入高层楼宇数量" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="建筑面积">
                    <a-input v-model:value="editForm.buildArea" placeholder="请输入建筑面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="占地面积">
                    <a-input v-model:value="editForm.landArea" placeholder="请输入占地面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="公共场所面积">
                    <a-input v-model:value="editForm.publicArea" placeholder="请输入公共场所面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="绿化面积">
                    <a-input v-model:value="editForm.greenArea" placeholder="请输入绿化面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="道路面积">
                    <a-input v-model:value="editForm.roadArea" placeholder="请输入道路面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="车位面积">
                    <a-input v-model:value="editForm.parkingArea" placeholder="请输入车位面积" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="车库面积">
                    <a-input v-model:value="editForm.garageArea" placeholder="请输入车库面积" />
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
          <div class="modal-footer-fixed">
            <a-button @click="handleEditCancel" style="margin-right: 12px">取消</a-button>
            <a-button type="primary" @click="handleEditOk">确定</a-button>
          </div>
        </a-modal>
        <!-- 导入预览模态 -->
        <a-modal v-model:visible="importPreviewVisible" title="导入 管理区 预览" width="720" :footer="null">
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
import { ref, h, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import { FullscreenOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 管理区数据（由接口驱动）
const allAreas = ref<any[]>([])
// 表格数据
const tableData = ref<any[]>([])
// 后端健康指示 (新增失败/health探测失败时显示横幅)
const backendDown = ref(false)

// 使用 127.0.0.1 避免某些环境下 localhost IPv6 解析导致连接问题；支持 4000 -> 4001 自动回退
let API_BASE = 'http://127.0.0.1:4000/api/area2'
let API_HEALTH = 'http://127.0.0.1:4000/health'
const TOKEN = 'test-token'
let portChecked = false
async function ensurePort(){
  if(portChecked) return
  try {
    const r = await fetch(API_BASE+'?page=1&size=1', { headers:{Authorization:`Bearer ${TOKEN}`}, signal: AbortSignal.timeout(1500) })
    if(!r.ok) throw new Error('bad status '+r.status)
  } catch(e){
    // 切换到 4001
    API_BASE = 'http://127.0.0.1:4001/api/area2'
    API_HEALTH = 'http://127.0.0.1:4001/health'
    console.warn('切换到备用端口 4001 (Area API)')
  } finally { portChecked = true }
}

// 移除本地排序函数，统一改为后端 orderBy。

async function fetchAreaList() {
  try {
  await ensurePort()
  const res = await fetch(`${API_BASE}?page=1&size=100&sort=code:asc`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
    const data = await res.json()
    console.log('fetchAreaList 返回：', data)
    if (Array.isArray(data.list)) {
  const mapped = data.list.map((a: any) => ({
        id: a.id, // 数据库主键
        areaId: a.code, // code 作为唯一编号
        name: a.name,
        lowBuildingCount: a.lowBuildingCount ?? 0,
        highBuildingCount: a.highBuildingCount ?? 0,
        buildArea: a.buildArea ?? 0,
        landArea: a.landArea ?? 0,
        publicArea: a.publicArea ?? 0,
        greenArea: a.greenArea ?? 0,
        roadArea: a.roadArea ?? 0,
        parkingArea: a.parkingArea ?? 0,
        garageArea: a.garageArea ?? 0,
        remark: a.description ?? ''
      }))
  allAreas.value = mapped
  tableData.value = [...allAreas.value]
      buildTree()
    }
  } catch (e) { message.error('获取管理区列表失败') }
}

const editSubmitting = ref(false)
async function addArea(form: any) {
  if (editSubmitting.value) return
  const code = (form.areaId||'').trim()
  const name = (form.name||'').trim()
  if (!code) { message.error('管理区编号不能为空'); return }
  if (!name) { message.error('管理区名称不能为空'); return }
  editSubmitting.value = true
  await ensurePort()
  const payload = {
    name,
    code,
    description: form.remark?.trim() || '',
    lowBuildingCount: Number(form.lowBuildingCount)||0,
    highBuildingCount: Number(form.highBuildingCount)||0,
    buildArea: Number(form.buildArea)||0,
    landArea: Number(form.landArea)||0,
    publicArea: Number(form.publicArea)||0,
    greenArea: Number(form.greenArea)||0,
    roadArea: Number(form.roadArea)||0,
    parkingArea: Number(form.parkingArea)||0,
    garageArea: Number(form.garageArea)||0
  }
  console.log('POST /api/area2 payload =>', payload)
  // 额外健康检查（不阻塞）真实健康地址是 /health （非 /api/health）
  fetch(API_HEALTH).then(r=>r.json().then(j=>console.log('Health ok', j)).catch(()=>console.log('Health status', r.status))).catch(err=>console.warn('Health check fail', err))
  try {
    console.log('[addArea] POST ->', API_BASE)
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      message.success('新增成功')
      await fetchAreaList()
      editModalVisible.value = false
    } else {
      let errText = ''
      try { const err = await res.json(); errText = err.error || JSON.stringify(err) } catch { errText = res.status + '' }
      if (/unique/i.test(errText) || /constraint/i.test(errText)) errText = '管理区编号已存在'
      message.error('新增失败: ' + errText)
      console.warn('Add area failed response:', errText, 'API_BASE=', API_BASE)
    }
  } catch (e:any) {
    // 若首次失败且尚未尝试 4001，再强制重试一次（可能端口刚切换）
    if(portChecked && API_BASE.includes(':4000/')){
      portChecked=false; // 允许 ensurePort 再次检测
      await ensurePort()
      try {
        const retry = await fetch(API_BASE, { method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${TOKEN}` }, body: JSON.stringify(payload) })
        if(retry.ok){ message.success('新增成功(重试)'); await fetchAreaList(); editModalVisible.value=false; return }
      } catch {}
    }
  const msg = '新增失败(网络): ' + (e?.message || '无法连接后端') + (API_BASE.includes(':4001/') ? ' (已切换 4001)' : '')
  message.error(msg)
  console.error('Add area network exception:', e, 'API_BASE=', API_BASE)
  backendDown.value = true
  } finally { editSubmitting.value = false }
}

async function updateArea(form: any) {
  try {
  await ensurePort()
    const res = await fetch(`${API_BASE}/${encodeURIComponent(form.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify({
        name: form.name,
        code: form.areaId,
        description: form.remark,
        lowBuildingCount: Number(form.lowBuildingCount)||0,
        highBuildingCount: Number(form.highBuildingCount)||0,
        buildArea: Number(form.buildArea)||0,
        landArea: Number(form.landArea)||0,
        publicArea: Number(form.publicArea)||0,
        greenArea: Number(form.greenArea)||0,
        roadArea: Number(form.roadArea)||0,
        parkingArea: Number(form.parkingArea)||0,
        garageArea: Number(form.garageArea)||0
      })
    })
    if (res.ok) { message.success('编辑成功'); await fetchAreaList(); editModalVisible.value = false }
    else { const err = await res.json(); message.error('编辑失败: ' + (err.error||'')) }
  } catch (e) { message.error('编辑失败') }
}

async function deleteArea(record: any) {
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(record.id)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
    if (res.ok) { message.success('删除成功'); await fetchAreaList() }
    else { const err = await res.json(); message.error('删除失败: ' + (err.error||'')) }
  } catch (e) { message.error('删除失败') }
}

// 树相关
const treeData = ref<any[]>([]);
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const treeSearch = ref('');
const treePanelRef = ref<any>(null);
const sidebarWidth = ref<number>(260);
const dragging = ref(false);

function buildTree() {
  treeData.value = allAreas.value.map(area => ({
    title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, area.name) ]),
    key: area.areaId,
    isLeaf: true,
    meta: area
  }));
}
onMounted(fetchAreaList)

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

// 表格与表单 + 排序 (替换原 const tableColumns = [...])
const areaSortOrder = ref<'ascend'|'descend'|null>('ascend')
const tableColumns = computed(()=>[
  { title: '管理区编号', dataIndex: 'areaId', key: 'areaId', width: 120, sorter: true, sortOrder: areaSortOrder.value||undefined },
  { title: '管理区名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: '多层楼宇数量', dataIndex: 'lowBuildingCount', key: 'lowBuildingCount', width: 120 },
  { title: '高层楼宇数量', dataIndex: 'highBuildingCount', key: 'highBuildingCount', width: 120 },
  { title: '建筑面积', dataIndex: 'buildArea', key: 'buildArea', width: 120 },
  { title: '占地面积', dataIndex: 'landArea', key: 'landArea', width: 120 },
  { title: '公共场所面积', dataIndex: 'publicArea', key: 'publicArea', width: 120 },
  { title: '绿化面积', dataIndex: 'greenArea', key: 'greenArea', width: 120 },
  { title: '道路面积', dataIndex: 'roadArea', key: 'roadArea', width: 120 },
  { title: '车位面积', dataIndex: 'parkingArea', key: 'parkingArea', width: 120 },
  { title: '车库面积', dataIndex: 'garageArea', key: 'garageArea', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' }
])
async function onTableChange(p:any,f:any,sorter:any){
  if(Array.isArray(sorter)) sorter=sorter[0]
  if(sorter && sorter.field==='areaId'){
    areaSortOrder.value = sorter.order || null
    let sortParam = 'code:asc'
    if(areaSortOrder.value==='descend') sortParam='code:desc'
    if(areaSortOrder.value===null) sortParam='code:asc'
    try {
      const res = await fetch(`${API_BASE}?page=1&size=100&sort=${sortParam}`, { headers:{Authorization:`Bearer ${TOKEN}`} })
      const data = await res.json()
      if(Array.isArray(data.list)){
        const mapped = data.list.map((a:any)=>({
          id:a.id, areaId:a.code, name:a.name,
          lowBuildingCount:a.lowBuildingCount??0, highBuildingCount:a.highBuildingCount??0,
          buildArea:a.buildArea??0, landArea:a.landArea??0, publicArea:a.publicArea??0,
          greenArea:a.greenArea??0, roadArea:a.roadArea??0, parkingArea:a.parkingArea??0,
          garageArea:a.garageArea??0, remark:a.description??''
        }))
        allAreas.value = mapped
        tableData.value=[...allAreas.value]
        buildTree()
      }
    } catch(e){ message.error('排序刷新失败') }
  }
}

// advanced filter removed: no filterModalVisible
const filterForm = ref({ areaId: '', name: '' });
const inlineFilterVisible = ref(false);

function resetFilter() { filterForm.value = { areaId: '', name: '' }; tableData.value = [...allAreas.value]; }
async function applyFilter() {
  // 行内筛选走后端接口，支持模糊搜索
  const search = [filterForm.value.areaId, filterForm.value.name].filter(Boolean).join(' ')
  try {
    const res = await fetch(`${API_BASE}?page=1&size=100&sort=code:asc${search ? `&search=${encodeURIComponent(search)}` : ''}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
    const data = await res.json()
    if (Array.isArray(data.list)) {
      const mapped = data.list.map((a: any) => ({
        id: a.id,
        areaId: a.code,
        name: a.name,
        lowBuildingCount: a.lowBuildingCount ?? 0,
        highBuildingCount: a.highBuildingCount ?? 0,
        buildArea: a.buildArea ?? 0,
        landArea: a.landArea ?? 0,
        publicArea: a.publicArea ?? 0,
        greenArea: a.greenArea ?? 0,
        roadArea: a.roadArea ?? 0,
        parkingArea: a.parkingArea ?? 0,
        garageArea: a.garageArea ?? 0,
        remark: a.description ?? ''
      }))
  allAreas.value = mapped
  tableData.value = [...allAreas.value]
      buildTree()
    }
  } catch (e) { message.error('筛选失败') }
}
// openFilter removed because advanced filter modal was removed
function toggleInlineFilter() { inlineFilterVisible.value = !inlineFilterVisible.value; }
const maFileInputRef = ref<HTMLInputElement | null>(null)
const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
const importPreviewColumns = ref<any[]>([
  { title: '管理区编号', dataIndex: 'areaId', key: 'areaId' },
  { title: '管理区名称', dataIndex: 'name', key: 'name' },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
])

function onImport() { try { maFileInputRef.value && maFileInputRef.value.click() } catch(e) { message.error('无法打开文件选择器') } }

function onMaFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files && input.files[0]
  if (f) handleMaImportFile(f)
  input.value = ''
}

function handleMaImportFile(file: File) {
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
    importPreviewRows.value = rows.map((r:any, idx:number)=>({ __row: idx, areaId: r['管理区编号']||r['areaId']||r['area_id']||'', name: r['管理区名称']||r['name']||'', remark: r['备注']||r['remark']||'' }))
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

async function confirmImport() {
  let success = 0, fail = 0
  for (const r of importPreviewRows.value) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify({
          name: r.name || r.areaId || '未知管理区',
          code: r.areaId || (`A-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*90)}`),
          description: r.remark || ''
        })
      })
      if (res.ok) success++
      else fail++
    } catch { fail++ }
  }
  await fetchAreaList()
  importPreviewRows.value = []
  importPreviewVisible.value = false
  message.success(`导入完成，成功${success}条，失败${fail}条`)
}
function onExport() {
  try {
    const data = tableData.value || []
    const headers = ['管理区编号','管理区名称','多层楼宇数量','高层楼宇数量','建筑面积','占地面积','公共场所面积','绿化面积','道路面积','车位面积','车库面积','备注']
    const escape = (v:any) => {
      if (v == null) return ''
      const s = String(v)
      return '"' + s.replace(/"/g, '""') + '"'
    }
    const rows = data.map((r:any) => [r.areaId, r.name, r.lowBuildingCount, r.highBuildingCount, r.buildArea, r.landArea, r.publicArea, r.greenArea, r.roadArea, r.parkingArea, r.garageArea, r.remark])
    const csvBody = rows.map((row:any)=> row.map(escape).join(',')).join('\n')
    const csv = headers.map(h=>`"${h.replace(/"/g,'""')}"`).join(',') + '\n' + csvBody
    const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '管理区列表.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(()=> URL.revokeObjectURL(url), 5000)
    message.success('导出已开始')
  } catch (err:any) {
    message.error('导出失败: ' + (err?.message || '未知错误'))
  }
}
function doRequestFullscreen() { /* 可实现全屏 */ }

const editModalVisible = ref(false);
interface EditFormShape { id?: number; areaId: string; name: string; lowBuildingCount: string; highBuildingCount: string; buildArea: string; landArea: string; publicArea: string; greenArea: string; roadArea: string; parkingArea: string; garageArea: string; remark: string }
const editForm = ref<EditFormShape>({ areaId: '', name: '', lowBuildingCount: '', highBuildingCount: '', buildArea: '', landArea: '', publicArea: '', greenArea: '', roadArea: '', parkingArea: '', garageArea: '', remark: '' });
function onAdd() {
  editForm.value = { areaId: '', name: '', lowBuildingCount: '', highBuildingCount: '', buildArea: '', landArea: '', publicArea: '', greenArea: '', roadArea: '', parkingArea: '', garageArea: '', remark: '' }
  // 新增时不带 id 字段
  editModalVisible.value = true
}
function onEdit(record: any) {
  // 编辑时带上 id 字段
  editForm.value = { ...record, id: record.id }
  editModalVisible.value = true
}
function onDelete(record: any) {
  deleteArea(record)
}
function handleEditCancel() { editModalVisible.value = false; }
function handleEditOk() {
  if (!editForm.value.areaId || !editForm.value.name) {
    message.error('管理区编号和名称必填');
    return;
  }
  if (editForm.value.id) {
    updateArea(editForm.value)
  } else {
    addArea(editForm.value)
  }
}

// 管理区 modal 拖拽支持
const maModalElRef = ref<HTMLElement | null>(null)
let maHeaderDown: ((e: MouseEvent) => void) | null = null
let maDocMove: ((e: MouseEvent) => void) | null = null
let maDocUp: ((e: MouseEvent) => void) | null = null
const maModalDragging = ref(false)
let maDragStartX = 0
let maDragStartY = 0

function attachMaModalDrag() {
  nextTick(() => {
    const modals = Array.from(document.querySelectorAll('.ant-modal')) as HTMLElement[]
    if (!modals.length) return
    const modalEl = modals[modals.length - 1]
    maModalElRef.value = modalEl
    modalEl.style.margin = '0'
    modalEl.style.position = 'absolute'
    modalEl.style.zIndex = '1000'
    const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
    if (!header) return
    header.style.cursor = 'move'
    maHeaderDown = (e: MouseEvent) => {
      const rect = modalEl.getBoundingClientRect()
      maDragStartX = e.clientX - rect.left
      maDragStartY = e.clientY - rect.top
      maModalDragging.value = true
      maDocMove = (ev: MouseEvent) => {
        if (!maModalDragging.value || !maModalElRef.value) return
        const left = Math.min(Math.max(ev.clientX - maDragStartX, 0), window.innerWidth - maModalElRef.value.offsetWidth)
        const top = Math.min(Math.max(ev.clientY - maDragStartY, 0), window.innerHeight - maModalElRef.value.offsetHeight)
        maModalElRef.value.style.left = `${left}px`
        maModalElRef.value.style.top = `${top}px`
      }
      maDocUp = () => {
        maModalDragging.value = false
        if (maDocMove) document.removeEventListener('mousemove', maDocMove)
        if (maDocUp) document.removeEventListener('mouseup', maDocUp)
      }
      document.addEventListener('mousemove', maDocMove)
      document.addEventListener('mouseup', maDocUp)
    }
    header.addEventListener('mousedown', maHeaderDown)
  })
}

function detachMaModalDrag() {
  try {
    const modalEl = maModalElRef.value
    if (modalEl) {
      const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
      if (header && maHeaderDown) header.removeEventListener('mousedown', maHeaderDown)
      modalEl.style.position = ''
      modalEl.style.left = ''
      modalEl.style.top = ''
      modalEl.style.margin = ''
      modalEl.style.zIndex = ''
    }
  } catch (e) { }
  if (maDocMove) { document.removeEventListener('mousemove', maDocMove); maDocMove = null }
  if (maDocUp) { document.removeEventListener('mouseup', maDocUp); maDocUp = null }
  maHeaderDown = null
  maModalElRef.value = null
  maModalDragging.value = false
}

watch(editModalVisible, (v) => { if (v) attachMaModalDrag(); else detachMaModalDrag() })
</script>


<style scoped>
/* 复制楼宇页面的紧凑美化样式 */
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

/* 管理区 modal 可滚动表单体 */
.modal-body-scroll { max-height: calc(60vh); overflow-y: auto; padding-right: 8px }
.modal-body-scroll .ant-row { padding-bottom: 8px }
</style>
