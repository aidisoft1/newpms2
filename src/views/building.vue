<template>
  <div class="building-page">
    <div class="building-layout">
      <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
        <div class="tree-toolbar">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 (回车)" allow-clear @keyup.enter="onTreeSearchEnter" />
        </div>
        <a-tree :tree-data="treeData" :expanded-keys="expandedKeys" :selected-keys="selectedKeys" block-node show-icon="false" @expand="onTreeExpand" @select="onSelect" />
      </div>
      <div class="splitter" @mousedown.prevent="onSplitterDown" />
      <div class="data-panel">
        <input ref="fileInputRef" type="file" accept=".csv" style="display:none" @change="onFileInputChange" />
        <div class="toolbar">
          <a-space>
            <a-button type="primary" @click="onAdd">新增楼宇</a-button>
            <a-button type="text" @click="toggleInlineFilter">行内筛选</a-button>
            <a-button type="text" @click="onImport">导入</a-button>
            <a-button type="text" @click="onExport">导出</a-button>
            <a-button type="text" @click="doRequestFullscreen">
              <component :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined" />
              <span style="margin-left:4px">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
            </a-button>
          </a-space>
        </div>
        <div v-show="inlineFilterVisible" class="inline-filter">
          <a-form :model="filterForm" layout="inline">
            <a-form-item><a-select v-model:value="filterForm.areaId" :options="areaOptions" allow-clear show-search placeholder="管理区" style="min-width:160px" @change="onAreaChange" /></a-form-item>
            <a-form-item><a-input v-model:value="filterForm.buildingId" placeholder="楼宇编号" style="min-width:140px" /></a-form-item>
            <a-form-item><a-input v-model:value="filterForm.buildingName" placeholder="楼宇名称" style="min-width:140px" /></a-form-item>
            <a-form-item><a-input v-model:value="filterForm.address" placeholder="地址" style="min-width:140px" /></a-form-item>
            <a-form-item>
              <a-space>
                <a-button size="small" @click="resetFilter">重置</a-button>
                <a-button size="small" type="primary" @click="applyFilter">查询</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <a-table :columns="tableColumns" :data-source="tableData" row-key="id" size="small" bordered :scroll="{x:1200,y:420}" :row-class-name="()=>'dense-row'">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key==='actions'">
              <a-space size="small">
                <a-button type="link" size="small" @click="onEdit(record)">编辑</a-button>
                <a-popconfirm title="确认删除?" @confirm="() => onDelete(record)"><a-button type="link" size="small" danger>删除</a-button></a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
        <a-modal v-model:visible="editModalVisible" title="楼宇信息" :footer="null" width="660px" @cancel="handleEditCancel">
          <a-form :model="editForm" layout="vertical" class="modal-body-scroll">
            <a-row :gutter="12">
              <a-col :span="12"><a-form-item label="管理区" required>
                <a-space>
                  <a-select v-model:value="editForm.areaId" :options="areaOptions" show-search allow-clear placeholder="选择管理区" :loading="loadingAreas" style="min-width:200px" />
                  <a-button size="small" @click="ensureAreasLoaded(true)" :loading="loadingAreas">刷新</a-button>
                </a-space>
              </a-form-item></a-col>
              <a-col :span="12"><a-form-item label="楼宇编号" required><a-input v-model:value="editForm.buildingId" allow-clear /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="楼宇名称" required><a-input v-model:value="editForm.buildingName" allow-clear /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="地址"><a-input v-model:value="editForm.address" allow-clear /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="楼宇类型"><a-select v-model:value="editForm.buildingType" allow-clear><a-select-option value="住宅">住宅</a-select-option><a-select-option value="商用">商用</a-select-option><a-select-option value="写字楼">写字楼</a-select-option><a-select-option value="公寓">公寓</a-select-option><a-select-option value="其他">其他</a-select-option></a-select></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="楼宇结构"><a-select v-model:value="editForm.buildingStructure" allow-clear><a-select-option value="框架">框架</a-select-option><a-select-option value="砖混">砖混</a-select-option><a-select-option value="钢结构">钢结构</a-select-option><a-select-option value="剪力墙">剪力墙</a-select-option><a-select-option value="其他">其他</a-select-option></a-select></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="楼宇朝向"><a-select v-model:value="editForm.orientation" allow-clear><a-select-option value="东">东</a-select-option><a-select-option value="南">南</a-select-option><a-select-option value="西">西</a-select-option><a-select-option value="北">北</a-select-option><a-select-option value="东南">东南</a-select-option><a-select-option value="西南">西南</a-select-option><a-select-option value="东北">东北</a-select-option><a-select-option value="西北">西北</a-select-option><a-select-option value="其他">其他</a-select-option></a-select></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="备注"><a-input v-model:value="editForm.remark" allow-clear /></a-form-item></a-col>
            </a-row>
          </a-form>
          <div class="modal-footer-fixed">
            <a-button @click="handleEditCancel">取消</a-button>
            <a-button type="primary" @click="handleEditOk" style="margin-left:12px">保存</a-button>
          </div>
        </a-modal>
        <a-modal v-model:visible="importPreviewVisible" title="导入楼宇预览" :footer="null" width="760px">
          <a-table :columns="importPreviewColumns" :data-source="importPreviewRows" size="small" row-key="__row" :pagination="{pageSize:8}" />
          <div class="import-footer">
            <a-space>
              <a-button size="small" @click="importPreviewVisible=false">取消</a-button>
              <a-button size="small" type="primary" @click="confirmImport">确认导入</a-button>
            </a-space>
          </div>
        </a-modal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'

// ---------- 常量 & 端口回退 ----------
let API_BUILDING = 'http://127.0.0.1:4000/api/buildings'
let API_AREA = 'http://127.0.0.1:4000/api/area2'
const TOKEN = 'test-token'
async function ensurePort(){
  try { const r = await fetch(API_AREA+'?page=1&size=1',{headers:{Authorization:`Bearer ${TOKEN}`}, signal: AbortSignal.timeout(1800)}); if(!r.ok) throw new Error('bad'); }
  catch { API_BUILDING='http://127.0.0.1:4001/api/buildings'; API_AREA='http://127.0.0.1:4001/api/area2' }
}

// ---------- 状态 ----------
const allAreas = ref<any[]>([])
const allBuildings = ref<any[]>([])
const tableData = ref<any[]>([])
const treeData = ref<any[]>([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const treeSearch = ref('')
const treePanelRef = ref<HTMLElement|null>(null)
const sidebarWidth = ref(260)
const dragging = ref(false)

// 筛选
const filterForm = ref({ areaId:'', buildingId:'', buildingName:'', address:'' })
const inlineFilterVisible = ref(false)
const areaOptions = ref<any[]>([])
const buildingOptions = ref<any[]>([])

// 表格列
const tableColumns = [
  { title:'管理区ID', dataIndex:'areaId', key:'areaId', width:100 },
  { title:'楼宇编号', dataIndex:'code', key:'code', width:120 },
  { title:'楼宇名称', dataIndex:'name', key:'name', width:140 },
  { title:'地址', dataIndex:'address', key:'address', width:200 },
  { title:'楼宇类型', dataIndex:'buildingType', key:'buildingType', width:120 },
  { title:'楼宇结构', dataIndex:'buildingStructure', key:'buildingStructure', width:120 },
  { title:'楼宇朝向', dataIndex:'orientation', key:'orientation', width:100 },
  { title:'备注', dataIndex:'remark', key:'remark', width:180 },
  { title:'操作', key:'actions', width:120, fixed:'right' }
]

// ---------- 构建树 ----------
function rebuildTree(){
  const grouped: Record<number, any[]> = {}
  for(const b of allBuildings.value){ if(!grouped[b.areaId]) grouped[b.areaId]=[]; grouped[b.areaId].push(b) }
  const areaNodes = allAreas.value.map(a=>{
    const bs = grouped[a.id]||[]
    return {
      title: h('span',{class:'tree-node-title'},[
        h('span',{class:'node-main'}, a.name),
        h('a-tag',{color:'default',style:{marginLeft:'6px',fontSize:'12px'}}, ()=> `${bs.length}栋`)
      ]),
      key:'area-'+a.id,
      meta:{type:'area',areaId:a.id},
      children: bs.map(b=>({
        title: h('span',{class:'tree-node-title'},[h('span',{class:'node-main'}, b.name)]),
        key:'building-'+b.id,
        isLeaf:true,
        meta:{type:'building', buildingId:b.id}
      }))
    }
  })
  treeData.value = [{
    title: h('span',{class:'tree-node-title'},[
      h('span',{class:'node-main'}, '全部'),
      h('a-tag',{color:'blue',style:{marginLeft:'6px',fontSize:'12px'}}, ()=> `${allBuildings.value.length}栋`)
    ]),
    key:'root-all',
    meta:{type:'all'},
    children: areaNodes
  }]
  if(!expandedKeys.value.length) expandedKeys.value=['root-all']
  if(!selectedKeys.value.length) selectedKeys.value=['root-all']
}

function rebuildFilters(){
  areaOptions.value = allAreas.value.map(a=>({label:`${a.code} | ${a.name}`, value:a.id}))
  buildingOptions.value = allBuildings.value.map(b=>({label:`${b.code} | ${b.name}`, value:b.id}))
}

function applyFilter(){
  tableData.value = allBuildings.value.filter(b =>
    (!filterForm.value.areaId || b.areaId == filterForm.value.areaId) &&
    (!filterForm.value.buildingId || (b.code||'').includes(filterForm.value.buildingId)) &&
    (!filterForm.value.buildingName || (b.name||'').includes(filterForm.value.buildingName)) &&
    (!filterForm.value.address || (b.address||'').includes(filterForm.value.address))
  )
}
function resetFilter(){ filterForm.value = { areaId:'', buildingId:'', buildingName:'', address:'' }; tableData.value=[...allBuildings.value] }
function toggleInlineFilter(){ inlineFilterVisible.value = !inlineFilterVisible.value }
function onAreaChange(){ applyFilter() }

// ---------- 导入 ----------
const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
const importPreviewColumns = [
  { title:'管理区', dataIndex:'area', key:'area' },
  { title:'楼宇编号', dataIndex:'buildingId', key:'buildingId' },
  { title:'楼宇名称', dataIndex:'buildingName', key:'buildingName' },
  { title:'地址', dataIndex:'address', key:'address' }
]
const fileInputRef = ref<HTMLInputElement|null>(null)
function onImport(){ fileInputRef.value?.click() }
function onFileInputChange(e:Event){ const input=e.target as HTMLInputElement; const f=input.files?.[0]; if(f) handleImportFile(f); if(input) input.value='' }
function handleImportFile(file:File){
  const reader = new FileReader()
  reader.onload = ev => {
    const text = String(ev.target?.result||'')
    const lines = text.split(/\r?\n/).filter(l=>l.trim())
    if(!lines.length){ message.error('CSV 为空'); return }
    const headers = splitCsvLine(lines[0])
    const rows = lines.slice(1).map(l=>{ const cols=splitCsvLine(l); const o:any={}; headers.forEach((h,i)=>o[h]=cols[i]); return o })
    importPreviewRows.value = rows.map((r:any,i:number)=>({ __row:i, area:r['管理区']||r['area']||'', buildingId:r['楼宇编号']||r['buildingId']||'', buildingName:r['楼宇名称']||r['buildingName']||'', address:r['地址']||r['address']||'' }))
    importPreviewVisible.value = true
  }
  reader.readAsText(file,'utf-8')
}
function splitCsvLine(line:string){ const res:string[]=[]; let cur=''; let inQ=false; for(const ch of line){ if(ch==='"'){ inQ=!inQ; continue } if(ch===','&&!inQ){ res.push(cur); cur=''; continue } cur+=ch } res.push(cur); return res.map(s=>s.trim()) }
async function confirmImport(){
  let ok=0, fail=0
  for(const r of importPreviewRows.value){
    try {
      const area = allAreas.value[0]
      if(!area) { fail++; continue }
      const payload = { name:r.buildingName||r.buildingId||'未命名', code:r.buildingId||('B'+Date.now()+Math.floor(Math.random()*100)), areaId:area.id, areaCode:area.code, address:r.address||'' }
      const res = await fetch(API_BUILDING,{ method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}`}, body:JSON.stringify(payload) })
      res.ok ? ok++ : fail++
    } catch { fail++ }
  }
  importPreviewVisible.value=false
  await fetchBuildings()
  message.success(`导入完成 成功${ok} 失败${fail}`)
}
function onExport(){
  try {
    const headers = ['管理区ID','楼宇编号','楼宇名称','地址','楼宇类型','楼宇结构','楼宇朝向','备注']
    const escape=(v:any)=> '"'+String(v??'').replace(/"/g,'""')+'"'
    const rows = tableData.value.map(r=>[r.areaId,r.code,r.name,r.address||'',r.buildingType||'',r.buildingStructure||'',r.orientation||'',r.remark||''])
    const csv = headers.map(escape).join(',')+'\n'+ rows.map(row=>row.map(escape).join(',')).join('\n')
    const blob = new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='楼宇列表.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),1500)
    message.success('导出完成')
  } catch(e:any){ message.error('导出失败:'+ (e?.message||'')) }
}

// ---------- 编辑弹窗 ----------
const editModalVisible = ref(false)
const editForm = ref<any>({ areaId:'', buildingId:'', buildingName:'', address:'', buildingType:'', buildingStructure:'', orientation:'', remark:'' })
const loadingAreas = ref(false)
async function ensureAreasLoaded(force=false){
  if(force || !allAreas.value.length){
    loadingAreas.value=true
    await fetchAreas()
    loadingAreas.value=false
  }
}
async function onAdd(){
  editForm.value={ areaId:'', buildingId:'', buildingName:'', address:'', buildingType:'', buildingStructure:'', orientation:'', remark:'' }
  await ensureAreasLoaded()
  if(!allAreas.value.length){ message.warning('没有管理区，请先创建管理区再新增楼宇'); }
  editModalVisible.value=true
}
function onEdit(r:any){ editForm.value={ id:r.id, areaId:String(r.areaId), buildingId:r.code, buildingName:r.name, address:r.address||'', buildingType:r.buildingType||'', buildingStructure:r.buildingStructure||'', orientation:r.orientation||'', remark:r.remark||'' }; editModalVisible.value=true }
function handleEditCancel(){ editModalVisible.value=false }
async function handleEditOk(){
  if(!editForm.value.areaId||!editForm.value.buildingId||!editForm.value.buildingName){ message.error('必填项不能为空'); return }
  editForm.value.buildingId = String(editForm.value.buildingId).trim()
  editForm.value.buildingName = String(editForm.value.buildingName).trim()
  if(editForm.value.id) {
    await updateBuilding(editForm.value)
  } else {
    await createBuilding(editForm.value)
  }
}
async function createBuilding(f:any){
  const payload={ name:f.buildingName, code:f.buildingId, areaId:Number(f.areaId), areaCode:(allAreas.value.find(a=>a.id==f.areaId)?.code)||undefined, address:f.address||'', buildingType:f.buildingType||'', buildingStructure:f.buildingStructure||'', orientation:f.orientation||'', remark:f.remark||'' }
  try { const res=await fetch(API_BUILDING,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)}); if(res.ok){ message.success('新增成功'); editModalVisible.value=false; await fetchBuildings() } else { const e=await res.json(); message.error('新增失败:'+ (e.error||'')) } } catch { message.error('新增失败(网络)') }
}
async function updateBuilding(f:any){
  const id=f.id
  const payload={ name:f.buildingName, code:f.buildingId, address:f.address||'', buildingType:f.buildingType||'', buildingStructure:f.buildingStructure||'', orientation:f.orientation||'', remark:f.remark||'' }
  try { const res=await fetch(`${API_BUILDING}/${id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)}); if(res.ok){ message.success('编辑成功'); editModalVisible.value=false; await fetchBuildings() } else { const e=await res.json(); message.error('编辑失败:'+ (e.error||'')) } } catch { message.error('编辑失败(网络)') }
}
async function deleteBuilding(r:any){
  try { const res=await fetch(`${API_BUILDING}/${r.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}}); if(res.ok){ message.success('删除成功'); await fetchBuildings() } else { const e=await res.json(); message.error('删除失败:'+ (e.error||'')) } } catch { message.error('删除失败(网络)') }
}
function onDelete(r:any){ deleteBuilding(r) }

// ---------- 交互辅助 ----------
const isFullscreen = ref(false)
function syncFullscreen(){ isFullscreen.value = !!document.fullscreenElement }
function doRequestFullscreen(){
  const root = document.querySelector('.building-page') as HTMLElement | null
  if(!document.fullscreenElement){
    (root||document.documentElement).requestFullscreen?.().catch(e=>{ console.warn('进入全屏失败', e); message.error('全屏失败') })
  } else {
    document.exitFullscreen?.().catch(e=>{ console.warn('退出全屏失败', e); message.error('退出全屏失败') })
  }
}
function onTreeExpand(k:string[]){ expandedKeys.value=k }
function onSelect(k:string[]){
  selectedKeys.value=k
  if(!k.length) return
  const key=k[0]
  if(key==='root-all'){
    filterForm.value.areaId=''
    applyFilter()
  } else if(key.startsWith('area-')){
    const id = key.slice(5)
    filterForm.value.areaId = id
    applyFilter()
  }
}
function onSplitterDown(e:MouseEvent){ dragging.value=true; e.preventDefault() }
function onMouseMove(e:MouseEvent){ if(!dragging.value) return; const rect=treePanelRef.value?.parentElement?.getBoundingClientRect(); const left=rect?rect.left:0; sidebarWidth.value=Math.min(560,Math.max(180,e.clientX-left)) }
function onMouseUp(){ dragging.value=false }
function onTreeSearchEnter(){ if(!treeSearch.value){ rebuildTree(); return } const kw=treeSearch.value.trim(); expandedKeys.value=[]; selectedKeys.value=[]; treeData.value = treeData.value.map(a=>a) /* 简化：未实现过滤 */ }

// ---------- 数据加载 ----------
async function fetchAreas(){
  try {
    await ensurePort();
    const url = `${API_AREA}?page=1&size=500&sort=code:asc`;
    console.log('[fetchAreas] 请求 =>', url)
    const r = await fetch(url,{headers:{Authorization:`Bearer ${TOKEN}`}})
    if(!r.ok){
      message.error('获取管理区失败 status '+r.status)
      console.warn('[fetchAreas] bad status', r.status)
      return
    }
    const data = await r.json()
    console.log('[fetchAreas] 原始返回', data)
    let list: any[] = []
    if(Array.isArray(data.list)) list = data.list
    else if(Array.isArray(data)) list = data
    else {
      console.warn('[fetchAreas] 未识别的返回结构，期望 data.list 为数组')
      message.error('获取管理区失败(结构)')
      return
    }
    allAreas.value = list.map((a:any)=>({ id:a.id, code:a.code, name:a.name }))
    if(!allAreas.value.length){ console.warn('[fetchAreas] 管理区为空，创建楼宇时下拉将没有数据') }
    rebuildFilters()
  } catch (e:any) {
    console.error('[fetchAreas] 异常', e)
    message.error('获取管理区失败: '+ (e?.message||'网络'))
  }
}
async function fetchBuildings(){
  try { const r=await fetch(API_BUILDING,{headers:{Authorization:`Bearer ${TOKEN}`}}); const list=await r.json(); allBuildings.value=list; tableData.value=[...list]; rebuildTree(); rebuildFilters(); applyFilter() } catch { message.error('获取楼宇失败') }
}

// ---------- 生命周期 ----------
onMounted(()=>{ window.addEventListener('mousemove',onMouseMove); window.addEventListener('mouseup',onMouseUp); fetchAreas().then(fetchBuildings); document.addEventListener('fullscreenchange', syncFullscreen) })
onUnmounted(()=>{ window.removeEventListener('mousemove',onMouseMove); window.removeEventListener('mouseup',onMouseUp); document.removeEventListener('fullscreenchange', syncFullscreen) })
</script>

<style scoped>
.building-layout{display:flex;height:100vh}
.tree-panel{width:260px;border-right:1px solid #eee;padding:12px 8px;background:#fff;box-sizing:border-box;overflow:auto}
.tree-toolbar{padding:4px 4px 10px}
.splitter{width:8px;cursor:col-resize;background:linear-gradient(90deg,rgba(0,0,0,0.04),rgba(0,0,0,0));}
.data-panel{flex:1;padding:12px 16px;display:flex;flex-direction:column;overflow:auto}
.toolbar{margin-bottom:8px}
.inline-filter{margin-bottom:8px;padding:6px 8px;background:#fafafa;border:1px solid #eee;border-radius:6px}
.dense-row .ant-table-cell{padding:6px 8px;font-size:12px;line-height:1.2}
.table-actions{display:flex;gap:6px}
.tree-node-title{display:inline-flex;align-items:center}
.modal-body-scroll{max-height:60vh;overflow:auto;padding-right:4px}
.modal-footer-fixed{display:flex;justify-content:flex-end;padding:12px 8px;margin-top:8px;border-top:1px solid #eee;background:#fff}
.import-footer{margin-top:10px;display:flex;justify-content:flex-end}
</style>
