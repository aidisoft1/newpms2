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
            <a-button type="primary" @click="onAddRoom">新增房间</a-button>
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
        <a-modal v-model:visible="editModalVisible" title="房间信息" :footer="null" width="720px" @cancel="handleEditCancel">
          <a-form :model="editForm" layout="vertical" class="modal-body-scroll">
            <a-row :gutter="12">
              <a-col :span="8"><a-form-item label="所属管理区" required>
                <a-select v-model:value="editForm.areaId" :options="areaOptions" show-search allow-clear placeholder="选择管理区" :loading="loadingAreas" @change="onEditAreaChange" />
              </a-form-item></a-col>
              <a-col :span="8"><a-form-item label="所属楼宇" required>
                <a-select v-model:value="editForm.buildingId" :options="buildingSelectOptions" show-search allow-clear placeholder="选择楼宇" />
              </a-form-item></a-col>
              <a-col :span="8"><a-form-item label="房间编号" required><a-input v-model:value="editForm.roomCode" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="客户编号"><a-input v-model:value="editForm.customerId" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="客户名称"><a-input v-model:value="editForm.customerName" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="建筑面积"><a-input v-model:value="editForm.size" type="number" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="使用面积"><a-input v-model:value="editForm.usableArea" type="number" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="房间用途"><a-input v-model:value="editForm.purpose" allow-clear /></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="房间类型"><a-select v-model:value="editForm.roomType" allow-clear>
                <a-select-option value="idle">空闲</a-select-option>
                <a-select-option value="leased">出租</a-select-option>
                <a-select-option value="other">其他</a-select-option>
              </a-select></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="是否出租"><a-select v-model:value="editForm.leased" allow-clear>
                <a-select-option :value="true">是</a-select-option>
                <a-select-option :value="false">否</a-select-option>
              </a-select></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="权属类型"><a-select v-model:value="editForm.ownershipType" allow-clear placeholder="选择">
                <a-select-option value="自持">自持</a-select-option>
                <a-select-option value="出售">出售</a-select-option>
                <a-select-option value="租赁">租赁</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="装修情况"><a-select v-model:value="editForm.fitmentStatus" allow-clear placeholder="选择">
                <a-select-option value="毛坯">毛坯</a-select-option>
                <a-select-option value="简装">简装</a-select-option>
                <a-select-option value="精装">精装</a-select-option>
                <a-select-option value="豪装">豪装</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select></a-form-item></a-col>
              <a-col :span="8"><a-form-item label="朝向"><a-select v-model:value="editForm.orientation" allow-clear>
                <a-select-option value="东">东</a-select-option>
                <a-select-option value="南">南</a-select-option>
                <a-select-option value="西">西</a-select-option>
                <a-select-option value="北">北</a-select-option>
                <a-select-option value="东南">东南</a-select-option>
                <a-select-option value="西南">西南</a-select-option>
                <a-select-option value="东北">东北</a-select-option>
                <a-select-option value="西北">西北</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="备注"><a-input v-model:value="editForm.remark" allow-clear /></a-form-item></a-col>
            </a-row>
            <p style="font-size:12px;color:#999;margin-top:4px;">提示：分摊面积为前端计算字段；权属类型与装修情况已接入后端。</p>
          </a-form>
          <div class="modal-footer-fixed">
            <a-button @click="handleEditCancel">取消</a-button>
            <a-button type="primary" @click="handleRoomSave" style="margin-left:12px">保存</a-button>
          </div>
        </a-modal>
        <a-modal v-model:visible="importPreviewVisible" title="导入房间预览" :footer="null" width="980px">
          <a-alert type="info" show-icon style="margin-bottom:8px" message="列：房间编号* / 管理区代码* / 楼宇代码(或楼宇编号) / 建筑面积 / 使用面积 / 权属类型 / 装修情况 / 房间用途 / 朝向 / 是否出租(是/否) / 备注。缺失*列将被跳过。" />
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

// ---------- 常量 & 端口回退（统一 BASE_URL） ----------
let BASE_URL = 'http://127.0.0.1:4000'
let API_BUILDING = BASE_URL + '/api/buildings'
let API_AREA = BASE_URL + '/api/area2'
let API_ROOM = BASE_URL + '/api/rooms'
const TOKEN = 'test-token'
let portChecked = false
async function ensurePort(force=false){
  if(portChecked && !force) return
  const tryPorts = [4000,4001]
  for(const p of tryPorts){
    try {
      const controller = new AbortController()
      const timer = setTimeout(()=>controller.abort(), 3000)
      const testUrl = `http://127.0.0.1:${p}/api/area2?page=1&size=1`
      const r = await fetch(testUrl,{headers:{Authorization:`Bearer ${TOKEN}`}, signal: controller.signal})
      clearTimeout(timer)
      if(r.ok){
        if(BASE_URL.endsWith(String(p))===false){
          console.warn('[ensurePort] 切换后端端口为', p)
        }
        BASE_URL = `http://127.0.0.1:${p}`
        API_BUILDING = BASE_URL + '/api/buildings'
        API_AREA = BASE_URL + '/api/area2'
        API_ROOM = BASE_URL + '/api/rooms'
        portChecked = true
        return
      } else {
        console.warn('[ensurePort] 端口', p, '返回非 2xx 状态', r.status)
      }
    } catch (e:any) {
      console.warn('[ensurePort] 端口', p, '探测失败', e?.name||e?.message||e)
    }
  }
  message.error('无法连接后端 (4000/4001) 请确认后端已启动')
}

// ---------- 状态 ----------
const allAreas = ref<any[]>([])
const allBuildings = ref<any[]>([])
const allRooms = ref<any[]>([])
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

// 表格列（房间字段 + 操作）
const tableColumns = [
  { title:'房间编号', dataIndex:'roomCode', key:'roomCode', width:120 },
  { title:'客户编号', dataIndex:'customerId', key:'customerId', width:120 },
  { title:'客户名称', dataIndex:'customerName', key:'customerName', width:140 },
  { title:'楼宇名称', dataIndex:'buildingName', key:'buildingName', width:140 },
  { title:'建筑面积', dataIndex:'size', key:'size', width:110 },
  { title:'使用面积', dataIndex:'usableArea', key:'usableArea', width:110 },
  { title:'分摊面积', dataIndex:'shareArea', key:'shareArea', width:110 },
  { title:'房间类型', dataIndex:'roomType', key:'roomType', width:110 },
  { title:'权属类型', dataIndex:'ownershipType', key:'ownershipType', width:110 },
  { title:'房间用途', dataIndex:'purpose', key:'purpose', width:110 },
  { title:'装修情况', dataIndex:'fitmentStatus', key:'fitmentStatus', width:110 },
  { title:'房间地址', dataIndex:'address', key:'address', width:180 },
  { title:'朝向', dataIndex:'orientation', key:'orientation', width:80 },
  { title:'是否出租', dataIndex:'leased', key:'leased', width:90 },
  { title:'备注', dataIndex:'remark', key:'remark', width:160 },
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
  tableData.value = allRooms.value.filter(r =>
    (!filterForm.value.areaId || r.areaId == filterForm.value.areaId) &&
    (!filterForm.value.buildingId || String(r.buildingId).includes(filterForm.value.buildingId)) &&
    (!filterForm.value.buildingName || (r.buildingName||'').includes(filterForm.value.buildingName)) &&
    (!filterForm.value.address || (r.address||'').includes(filterForm.value.address))
  )
}
function resetFilter(){ filterForm.value = { areaId:'', buildingId:'', buildingName:'', address:'' }; tableData.value=[...allRooms.value] }
function toggleInlineFilter(){ inlineFilterVisible.value = !inlineFilterVisible.value }
function onAreaChange(){ applyFilter() }

// ---------- 导入 ----------
const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
// 房间导入预览列
const importPreviewColumns = [
  { title:'行', dataIndex:'__row', key:'__row', width:60 },
  { title:'房间编号', dataIndex:'roomCode', key:'roomCode', width:120 },
  { title:'管理区代码', dataIndex:'areaCode', key:'areaCode', width:110 },
  { title:'楼宇代码', dataIndex:'buildingCode', key:'buildingCode', width:110 },
  { title:'楼宇编号', dataIndex:'buildingId', key:'buildingId', width:100 },
  { title:'建筑面积', dataIndex:'size', key:'size', width:90 },
  { title:'使用面积', dataIndex:'usableArea', key:'usableArea', width:90 },
  { title:'权属类型', dataIndex:'ownershipType', key:'ownershipType', width:90 },
  { title:'装修情况', dataIndex:'fitmentStatus', key:'fitmentStatus', width:90 },
  { title:'房间用途', dataIndex:'purpose', key:'purpose', width:100 },
  { title:'朝向', dataIndex:'orientation', key:'orientation', width:80 },
  { title:'是否出租', dataIndex:'leased', key:'leased', width:90 },
  { title:'备注', dataIndex:'remark', key:'remark', ellipsis:true }
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
    const headers = splitCsvLine(lines[0]).map(h=>h.trim())
    const rows = lines.slice(1).map(l=>{ const cols=splitCsvLine(l); const o:any={}; headers.forEach((h,i)=>o[h]=cols[i]); return o })
    importPreviewRows.value = rows.map((r:any,i:number)=>({
      __row:i+1,
      roomCode: r['房间编号']||r['roomCode']||'',
      areaCode: r['管理区代码']||r['areaCode']||r['area_code']||'',
      buildingCode: r['楼宇代码']||r['buildingCode']||r['building_code']||'',
      buildingId: r['楼宇编号']||r['buildingId']||'',
      size: r['建筑面积']||r['size']||'',
      usableArea: r['使用面积']||r['usableArea']||'',
      ownershipType: r['权属类型']||r['ownershipType']||'',
      fitmentStatus: r['装修情况']||r['fitmentStatus']||'',
      purpose: r['房间用途']||r['purpose']||'',
      orientation: r['朝向']||r['orientation']||'',
      leased: r['是否出租']||r['leased']||'',
      remark: r['备注']||r['remark']||''
    }))
    importPreviewVisible.value = true
  }
  reader.readAsText(file,'utf-8')
}
function splitCsvLine(line:string){ const res:string[]=[]; let cur=''; let inQ=false; for(const ch of line){ if(ch==='"'){ inQ=!inQ; continue } if(ch===','&&!inQ){ res.push(cur); cur=''; continue } cur+=ch } res.push(cur); return res.map(s=>s.trim()) }
async function confirmImport(){
  let ok=0, fail=0, skip=0
  await ensureAreasLoaded(true)
  await fetchBuildings()
  const areaCodeMap: Record<string, any> = {}; for(const a of allAreas.value){ areaCodeMap[a.code]=a }
  const buildingCodeMap: Record<string, any> = {}; for(const b of allBuildings.value){ buildingCodeMap[b.code]=b }
  for(const r of importPreviewRows.value){
    try {
      if(!r.roomCode || !r.areaCode){ skip++; continue }
      const area = areaCodeMap[r.areaCode]
      if(!area){ fail++; continue }
      let building:any = null
      if(r.buildingId){ building = allBuildings.value.find((b:any)=> String(b.id)===String(r.buildingId)) }
      if(!building && r.buildingCode){ building = buildingCodeMap[r.buildingCode] }
      if(!building){ fail++; continue }
      const payload:any = {
        code: r.roomCode,
        roomNo: r.roomCode,
        areaId: area.id,
        buildingId: building.id,
        size: Number(r.size)||0,
        usableArea: Number(r.usableArea)||0,
        status: (String(r.leased).trim()==='是'||String(r.leased).trim().toLowerCase()==='true') ? 'leased' : 'idle',
        purpose: r.purpose||'',
        orientation: r.orientation||'',
        ownershipType: r.ownershipType||'',
        fitmentStatus: r.fitmentStatus||'',
        remark: r.remark||''
      }
      const res = await fetch(API_ROOM,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)})
      res.ok ? ok++ : fail++
    } catch { fail++ }
  }
  importPreviewVisible.value=false
  await fetchRooms()
  message.success(`导入完成 成功${ok} 失败${fail} 跳过${skip}`)
}
function onExport(){
  try {
    const headers = ['房间编号','客户编号','客户名称','楼宇名称','建筑面积','使用面积','分摊面积','房间类型','权属类型','房间用途','装修情况','房间地址','朝向','是否出租','备注']
    const escape=(v:any)=> '"'+String(v??'').replace(/"/g,'""')+'"'
    const rows = tableData.value.map(r=>[
      r.roomCode||'', r.customerId||'', r.customerName||'', r.buildingName||'', r.size||'', r.usableArea||'', r.shareArea||'', r.roomType||'', r.ownershipType||'', r.purpose||'', r.fitmentStatus||'', r.address||'', r.orientation||'', r.leased||'', r.remark||''
    ])
    const csv = headers.map(escape).join(',')+'\n'+ rows.map(row=>row.map(escape).join(',')).join('\n')
    const blob = new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='房间列表.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),1500)
    message.success('导出完成')
  } catch(e:any){ message.error('导出失败:'+ (e?.message||'')) }
}

// ---------- 编辑弹窗（房间） ----------
const editModalVisible = ref(false)
const editForm = ref<any>({ id:null, areaId:'', buildingId:'', roomCode:'', customerId:'', customerName:'', size:'', usableArea:'', roomType:'', purpose:'', orientation:'', leased:false, ownershipType:'', fitmentStatus:'', remark:'' })
const loadingAreas = ref(false)
const buildingSelectOptions = ref<any[]>([])
async function ensureAreasLoaded(force=false){
  if(force || !allAreas.value.length){
    loadingAreas.value=true
    await fetchAreas()
    await fetchBuildings()
    loadingAreas.value=false
  }
}
function rebuildBuildingSelectOptions(areaId?:string){
  let list = allBuildings.value
  if(areaId) list = list.filter((b:any)=> String(b.areaId)===String(areaId))
  buildingSelectOptions.value = list.map((b:any)=>({label:`${b.code} | ${b.name}`, value:String(b.id)}))
}
function onEditAreaChange(val:any){ rebuildBuildingSelectOptions(val) }
async function onAddRoom(){
  editForm.value={ id:null, areaId:'', buildingId:'', roomCode:'', customerId:'', customerName:'', size:'', usableArea:'', roomType:'', purpose:'', orientation:'', leased:false, ownershipType:'', fitmentStatus:'', remark:'' }
  await ensureAreasLoaded()
  rebuildBuildingSelectOptions()
  editModalVisible.value=true
}
function onEdit(r:any){
  editForm.value={
    id:r.id,
    areaId:String(r.areaId),
    buildingId:String(r.buildingId),
    roomCode:r.roomCode||r.code,
    customerId:r.customerId||'',
    customerName:r.customerName||'',
    size:r.size||'',
    usableArea:r.usableArea||'',
    roomType:r.roomType||r.status||'',
    purpose:r.purpose||'',
    orientation:r.orientation||'',
  leased: r.status==='leased',
  ownershipType: r.ownershipType||'',
  fitmentStatus: r.fitmentStatus||'',
    remark:r.remark||''
  }
  rebuildBuildingSelectOptions(editForm.value.areaId)
  editModalVisible.value=true
}
function handleEditCancel(){ editModalVisible.value=false }
async function handleRoomSave(){
  if(!editForm.value.areaId||!editForm.value.buildingId||!editForm.value.roomCode){ message.error('必填项缺失'); return }
  editForm.value.roomCode = String(editForm.value.roomCode).trim()
  if(editForm.value.id) await updateRoom(editForm.value); else await createRoom(editForm.value)
}
async function createRoom(f:any){
  try {
    const b = allBuildings.value.find((x:any)=> String(x.id)===String(f.buildingId))
    const payload = {
      code: f.roomCode,
      roomNo: f.roomCode,
      areaId: b? b.areaId : Number(f.areaId),
      buildingId: Number(f.buildingId),
      size: Number(f.size)||0,
      usableArea: Number(f.usableArea)||0,
      status: f.leased ? 'leased' : (f.roomType||'idle'),
      purpose: f.purpose||'',
      orientation: f.orientation||'',
      customerId: f.customerId||null,
      customerName: f.customerName||null,
  ownershipType: f.ownershipType||'',
  fitmentStatus: f.fitmentStatus||'',
  remark: f.remark||''
    }
    const res = await fetch(API_ROOM,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)})
    if(res.ok){ message.success('新增房间成功'); editModalVisible.value=false; await fetchRooms() } else { const e=await res.json(); message.error('新增失败:'+ (e.error||'')) }
  } catch { message.error('新增失败(网络)') }
}
async function updateRoom(f:any){
  try {
    const payload = {
      code: f.roomCode,
      size: Number(f.size)||0,
      usableArea: Number(f.usableArea)||0,
      status: f.leased ? 'leased' : (f.roomType||'idle'),
      purpose: f.purpose||'',
      orientation: f.orientation||'',
      customerId: f.customerId||null,
      customerName: f.customerName||null,
  ownershipType: f.ownershipType||'',
  fitmentStatus: f.fitmentStatus||'',
  remark: f.remark||''
    }
    const res = await fetch(`${API_ROOM}/${f.id}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(payload)})
    if(res.ok){ message.success('编辑房间成功'); editModalVisible.value=false; await fetchRooms() } else { const e=await res.json(); message.error('编辑失败:'+ (e.error||'')) }
  } catch { message.error('编辑失败(网络)') }
}
async function deleteRoom(r:any){
  try { const res=await fetch(`${API_ROOM}/${r.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${TOKEN}`}}); if(res.ok){ message.success('删除成功'); await fetchRooms() } else { const e=await res.json(); message.error('删除失败:'+ (e.error||'')) } } catch { message.error('删除失败(网络)') }
}
function onDelete(r:any){ deleteRoom(r) }

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
  } else if(key.startsWith('building-')){
    // 可按楼宇过滤房间
    const bid = key.slice(9)
    tableData.value = allRooms.value.filter(r=> String(r.buildingId)===bid)
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
    if(r.status === 401){
      message.error('获取管理区失败: 未授权，请确认后端 token 配置')
      return
    }
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
      message.error('获取管理区失败(返回结构)')
      return
    }
    allAreas.value = list.map((a:any)=>({ id:a.id, code:a.code, name:a.name }))
    if(!allAreas.value.length){ console.warn('[fetchAreas] 管理区列表为空') }
    rebuildFilters()
  } catch (e:any) {
    console.error('[fetchAreas] 异常', e)
    message.error('获取管理区失败: '+ (e?.message||'网络'))
  }
}
async function fetchBuildings(){
  try {
    await ensurePort()
    const r=await fetch(API_BUILDING,{headers:{Authorization:`Bearer ${TOKEN}`}})
    if(r.status===401){ message.error('获取楼宇失败: 未授权'); return }
    if(!r.ok){ message.error('获取楼宇失败 status '+r.status); return }
    const list=await r.json();
    if(!Array.isArray(list)){ message.error('获取楼宇失败(返回结构)'); return }
    allBuildings.value=list; rebuildTree(); rebuildFilters();
  } catch (e:any) { console.warn('[fetchBuildings] 异常', e); message.error('获取楼宇失败: '+(e?.message||'网络')) }
}

async function fetchRooms(){
  try {
    const r = await fetch(API_ROOM,{headers:{Authorization:`Bearer ${TOKEN}`}})
    if(!r.ok){ message.error('获取房间失败 status '+r.status); return }
    const list = await r.json()
    // 建立楼宇映射
    const bMap: Record<number, any> = {}
    for(const b of allBuildings.value){ bMap[b.id]=b }
    allRooms.value = list.map((rm:any)=>{
      const b = bMap[rm.buildingId]||{}
      const share = (rm.usableArea && rm.size && rm.size>rm.usableArea) ? (rm.size - rm.usableArea) : ''
      return {
        ...rm,
        roomCode: rm.code,
        buildingName: b.name||'',
        size: rm.size,
        usableArea: rm.usableArea,
        shareArea: share === ''? '' : Number(share).toFixed(2),
        roomType: rm.status||'',
  ownershipType: rm.ownershipType||'',
        purpose: rm.purpose||'',
  fitmentStatus: rm.fitmentStatus||'',
        address: b.address||'',
        leased: rm.status==='leased' ? '是' : '否'
      }
    })
    tableData.value=[...allRooms.value]
    applyFilter()
  } catch(e){ message.error('获取房间失败') }
}

// ---------- 生命周期 ----------
onMounted(()=>{ window.addEventListener('mousemove',onMouseMove); window.addEventListener('mouseup',onMouseUp); fetchAreas().then(()=>fetchBuildings().then(fetchRooms)); document.addEventListener('fullscreenchange', syncFullscreen) })
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
