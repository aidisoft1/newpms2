<template>
  <div class="room-layout">
    <div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
      <div class="tree-toolbar">
        <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 (回车)" allow-clear @keyup.enter="onTreeSearchEnter" />
      </div>
      <a-tree :tree-data="treeData" :expanded-keys="expandedKeys" :selected-keys="selectedKeys" block-node show-icon="false" @expand="onTreeExpand" @select="onSelect" />
    </div>
    <div class="splitter" @mousedown.prevent="onSplitterDown" />
    <div class="room-page data-panel">
      <div class="toolbar">
        <a-space>
          <a-button type="primary" @click="onAdd">新增房间</a-button>
          <a-button type="text" @click="toggleFilter">行内筛选</a-button>
          <a-button type="text" @click="exportCsv">导出</a-button>
        </a-space>
      </div>
      <div v-show="filterVisible" class="inline-filter">
        <a-form :model="filterForm" layout="inline">
          <a-form-item><a-select v-model:value="filterForm.areaId" :options="areaOptions" allow-clear show-search placeholder="管理区" style="min-width:160px" @change="onAreaChange" /></a-form-item>
          <a-form-item><a-select v-model:value="filterForm.buildingId" :options="buildingOptions" allow-clear show-search placeholder="楼宇" style="min-width:160px" /></a-form-item>
            <a-form-item><a-input v-model:value="filterForm.roomNo" placeholder="房号" style="min-width:120px" /></a-form-item>
            <a-form-item><a-input v-model:value="filterForm.ownerName" placeholder="业主/客户" style="min-width:140px" /></a-form-item>
          <a-form-item>
            <a-space>
              <a-button size="small" @click="resetFilter">重置</a-button>
              <a-button size="small" type="primary" @click="applyFilter">查询</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>
      <a-table :columns="columns" :data-source="tableData" row-key="id" size="small" bordered :scroll="{x:1600,y:520}" :row-class-name="()=>'dense-row'">
        <template #bodyCell="{column,record}">
          <template v-if="column.key==='actions'">
            <a-space size="small">
              <a-button type="link" size="small" @click="onEdit(record)">编辑</a-button>
              <a-popconfirm title="确认删除?" @confirm="() => onDelete(record)"><a-button type="link" size="small" danger>删除</a-button></a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      <a-modal v-model:visible="editVisible" title="房间信息" :footer="null" width="780px" @cancel="onCancel">
        <a-form :model="editForm" layout="vertical" class="modal-body-scroll">
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item label="管理区" required><a-select v-model:value="editForm.areaId" :options="areaOptions" allow-clear show-search placeholder="管理区" @change="onEditAreaChange" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="楼宇" required><a-select v-model:value="editForm.buildingId" :options="currentBuildingOptions" allow-clear show-search placeholder="楼宇" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="房号" required><a-input v-model:value="editForm.roomNo" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="单元"><a-input v-model:value="editForm.unit" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="楼层"><a-input v-model:value="editForm.floor" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="建筑面积(m²)"><a-input-number v-model:value="editForm.size" :min="0" style="width:100%" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="使用面积(m²)"><a-input-number v-model:value="editForm.usableArea" :min="0" style="width:100%" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="朝向"><a-select v-model:value="editForm.orientation" allow-clear><a-select-option value="东">东</a-select-option><a-select-option value="南">南</a-select-option><a-select-option value="西">西</a-select-option><a-select-option value="北">北</a-select-option><a-select-option value="东南">东南</a-select-option><a-select-option value="西南">西南</a-select-option><a-select-option value="东北">东北</a-select-option><a-select-option value="西北">西北</a-select-option><a-select-option value="其他">其他</a-select-option></a-select></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="用途"><a-select v-model:value="editForm.purpose" allow-clear><a-select-option value="住宅">住宅</a-select-option><a-select-option value="商用">商用</a-select-option><a-select-option value="办公">办公</a-select-option><a-select-option value="仓储">仓储</a-select-option><a-select-option value="其他">其他</a-select-option></a-select></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="状态"><a-select v-model:value="editForm.status" allow-clear><a-select-option value="空置">空置</a-select-option><a-select-option value="在用">在用</a-select-option><a-select-option value="装修">装修</a-select-option><a-select-option value="停用">停用</a-select-option></a-select></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="业主"><a-input v-model:value="editForm.ownerName" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="客户"><a-input v-model:value="editForm.customerName" /></a-form-item></a-col>
            <a-col :span="24"><a-form-item label="备注"><a-input v-model:value="editForm.remark" /></a-form-item></a-col>
          </a-row>
        </a-form>
        <div class="modal-footer-fixed">
          <a-button @click="onCancel">取消</a-button>
          <a-button type="primary" @click="onSave" style="margin-left:12px">保存</a-button>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'

let API_ROOM = 'http://127.0.0.1:4000/api/rooms'
let API_BUILDING = 'http://127.0.0.1:4000/api/buildings'
let API_AREA = 'http://127.0.0.1:4000/api/area2'
const TOKEN = 'test-token'
let portChecked=false
async function ensurePort(){
  if(portChecked) return
  try { const r = await fetch(API_AREA+'?page=1&size=1',{headers:{Authorization:`Bearer ${TOKEN}`}, signal: AbortSignal.timeout(1500)}); if(!r.ok) throw new Error('bad') }
  catch { API_ROOM='http://127.0.0.1:4001/api/rooms'; API_BUILDING='http://127.0.0.1:4001/api/buildings'; API_AREA='http://127.0.0.1:4001/api/area2'; console.warn('[rooms] 端口切换到 4001'); }
  finally { portChecked=true }
}

const allAreas = ref<any[]>([])
const allBuildings = ref<any[]>([])
const allRooms = ref<any[]>([])
const tableData = ref<any[]>([])
const filterVisible = ref(false)
const filterForm = ref({ areaId:'', buildingId:'', roomNo:'', ownerName:'' })
const areaOptions = ref<any[]>([])
const buildingOptions = ref<any[]>([])

// 树 & 布局相关
const treeData = ref<any[]>([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const treeSearch = ref('')
const treePanelRef = ref<HTMLElement|null>(null)
const sidebarWidth = ref(260)
const dragging = ref(false)

function rebuildTree(){
  const grouped: Record<number, any[]> = {}
  for(const b of allBuildings.value){ if(!grouped[b.areaId]) grouped[b.areaId]=[]; grouped[b.areaId].push(b) }
  treeData.value = allAreas.value.map(a=>{
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
        meta:{type:'building',buildingId:b.id, areaId:b.areaId}
      }))
    }
  })
}

function onTreeExpand(k:string[]){ expandedKeys.value=k }
function onSelect(k:string[], info:any){
  selectedKeys.value=k
  const node = info?.node?.meta
  if(node?.type==='area'){ filterForm.value.areaId = String(node.areaId); filterForm.value.buildingId=''; applyFilter() }
  else if(node?.type==='building'){ filterForm.value.buildingId=String(node.buildingId); filterForm.value.areaId=String(node.areaId); applyFilter() }
}
function onTreeSearchEnter(){ /* 简化：暂未实现搜索过滤 */ }
function onSplitterDown(e:MouseEvent){ dragging.value=true; e.preventDefault() }
function onMouseMove(e:MouseEvent){ if(!dragging.value) return; const rect=treePanelRef.value?.parentElement?.getBoundingClientRect(); const left=rect?rect.left:0; sidebarWidth.value=Math.min(560,Math.max(180,e.clientX-left)) }
function onMouseUp(){ dragging.value=false }

// 表格列
const columns = [
  { title:'管理区ID', dataIndex:'areaId', key:'areaId', width:90 },
  { title:'楼宇ID', dataIndex:'buildingId', key:'buildingId', width:90 },
  { title:'房号', dataIndex:'roomNo', key:'roomNo', width:120 },
  { title:'单元', dataIndex:'unit', key:'unit', width:80 },
  { title:'楼层', dataIndex:'floor', key:'floor', width:80 },
  { title:'建筑面积', dataIndex:'size', key:'size', width:100 },
  { title:'使用面积', dataIndex:'usableArea', key:'usableArea', width:100 },
  { title:'朝向', dataIndex:'orientation', key:'orientation', width:90 },
  { title:'用途', dataIndex:'purpose', key:'purpose', width:90 },
  { title:'状态', dataIndex:'status', key:'status', width:90 },
  { title:'业主', dataIndex:'ownerName', key:'ownerName', width:110 },
  { title:'客户', dataIndex:'customerName', key:'customerName', width:110 },
  { title:'备注', dataIndex:'remark', key:'remark', width:140 },
  { title:'操作', key:'actions', width:120, fixed:'right' }
]

function rebuildOptions(){
  areaOptions.value = allAreas.value.map(a=>({label:`${a.code} | ${a.name}`, value:a.id}))
  buildingOptions.value = allBuildings.value.map(b=>({label:`${b.code} | ${b.name}`, value:b.id}))
}

function applyFilter(){
  tableData.value = allRooms.value.filter(r =>
    (!filterForm.value.areaId || r.areaId == filterForm.value.areaId) &&
    (!filterForm.value.buildingId || r.buildingId == filterForm.value.buildingId) &&
    (!filterForm.value.roomNo || (r.roomNo||'').includes(filterForm.value.roomNo)) &&
    (!filterForm.value.ownerName || (r.ownerName||'').includes(filterForm.value.ownerName) || (r.customerName||'').includes(filterForm.value.ownerName))
  )
}
function resetFilter(){ filterForm.value={ areaId:'', buildingId:'', roomNo:'', ownerName:'' }; tableData.value=[...allRooms.value] }
function toggleFilter(){ filterVisible.value = !filterVisible.value }
function onAreaChange(){ applyFilter() }

// CRUD
const editVisible = ref(false)
const editForm = ref<any>({ areaId:'', buildingId:'', roomNo:'', unit:'', floor:'', size:null, usableArea:null, orientation:'', purpose:'', status:'', ownerName:'', customerName:'', remark:'' })
function onAdd(){ editForm.value={ areaId:'', buildingId:'', roomNo:'', unit:'', floor:'', size:null, usableArea:null, orientation:'', purpose:'', status:'', ownerName:'', customerName:'', remark:'' }; editVisible.value=true }
function onEdit(r:any){ editForm.value={ id:r.id, areaId:r.areaId, buildingId:r.buildingId, roomNo:r.roomNo||'', unit:r.unit||'', floor:r.floor||'', size:r.size||null, usableArea:r.usableArea||null, orientation:r.orientation||'', purpose:r.purpose||'', status:r.status||'', ownerName:r.ownerName||'', customerName:r.customerName||'', remark:r.remark||'' }; editVisible.value=true }
function onCancel(){ editVisible.value=false }
async function onSave(){
  if(!editForm.value.areaId || !editForm.value.buildingId || !editForm.value.roomNo){ message.error('必填项不能为空'); return }
  if(editForm.value.id){
    await updateRoom(editForm.value)
  } else {
    await createRoom(editForm.value)
  }
}
async function createRoom(f:any){
  const payload={ areaId:Number(f.areaId), buildingId:Number(f.buildingId), roomNo:f.roomNo, unit:f.unit||'', floor:f.floor||'', size:f.size?Number(f.size):null, usableArea:f.usableArea?Number(f.usableArea):null, orientation:f.orientation||'', purpose:f.purpose||'', status:f.status||'', ownerName:f.ownerName||'', customerName:f.customerName||'', remark:f.remark||'' }
  try { const r=await fetch(API_ROOM,{method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}`}, body:JSON.stringify(payload)}); if(r.ok){ message.success('新增成功'); editVisible.value=false; await fetchRooms() } else { const e=await r.json(); message.error('新增失败:'+ (e.error||'')) } } catch { message.error('新增失败(网络)') }
}
async function updateRoom(f:any){
  const id=f.id
  const payload={ roomNo:f.roomNo, unit:f.unit||'', floor:f.floor||'', size:f.size?Number(f.size):null, usableArea:f.usableArea?Number(f.usableArea):null, orientation:f.orientation||'', purpose:f.purpose||'', status:f.status||'', ownerName:f.ownerName||'', customerName:f.customerName||'', remark:f.remark||'' }
  try { const r=await fetch(`${API_ROOM}/${id}`,{method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}`}, body:JSON.stringify(payload)}); if(r.ok){ message.success('编辑成功'); editVisible.value=false; await fetchRooms() } else { const e=await r.json(); message.error('编辑失败:'+ (e.error||'')) } } catch { message.error('编辑失败(网络)') }
}
async function deleteRoom(r:any){
  try { const resp=await fetch(`${API_ROOM}/${r.id}`,{method:'DELETE', headers:{Authorization:`Bearer ${TOKEN}`}}); if(resp.ok){ message.success('删除成功'); await fetchRooms() } else { const e=await resp.json(); message.error('删除失败:'+ (e.error||'')) } } catch { message.error('删除失败(网络)') }
}
function onDelete(r:any){ deleteRoom(r) }

// 级联楼宇选项
const currentBuildingOptions = computed(()=> buildingOptions.value.filter(b=>!editForm.value.areaId || allBuildings.value.find(x=>x.id==b.value)?.areaId == Number(editForm.value.areaId)))
function onEditAreaChange(){ editForm.value.buildingId=''; }

// 数据加载
async function fetchAreas(){
  try { await ensurePort(); const r=await fetch(`${API_AREA}?page=1&size=500`,{headers:{Authorization:`Bearer ${TOKEN}`}}); const data=await r.json(); allAreas.value=(data.list||[]).map((a:any)=>({id:a.id, code:a.code, name:a.name})) } catch { message.error('获取管理区失败') }
}
async function fetchBuildings(){
  try { const r=await fetch(API_BUILDING,{headers:{Authorization:`Bearer ${TOKEN}`}}); const list=await r.json(); allBuildings.value=list; rebuildOptions(); rebuildTree() } catch { message.error('获取楼宇失败') }
}
async function fetchRooms(){
  try { const r=await fetch(API_ROOM,{headers:{Authorization:`Bearer ${TOKEN}`}}); const list=await r.json(); allRooms.value=list; tableData.value=[...list]; applyFilter() } catch { message.error('获取房间失败') }
}

onMounted(()=>{ window.addEventListener('mousemove',onMouseMove); window.addEventListener('mouseup',onMouseUp); fetchAreas().then(fetchBuildings).then(fetchRooms) })
onUnmounted(()=>{ window.removeEventListener('mousemove',onMouseMove); window.removeEventListener('mouseup',onMouseUp) })

function exportCsv(){
  try {
    const headers = ['ID','管理区ID','楼宇ID','房号','单元','楼层','建筑面积','使用面积','朝向','用途','状态','业主','客户','备注']
    const esc=(v:any)=> '"'+String(v??'').replace(/"/g,'""')+'"'
    const rows = tableData.value.map(r=>[r.id,r.areaId,r.buildingId,r.roomNo,r.unit||'',r.floor||'',r.size||'',r.usableArea||'',r.orientation||'',r.purpose||'',r.status||'',r.ownerName||'',r.customerName||'',r.remark||''])
    const csv = headers.map(esc).join(',')+'\n'+rows.map(row=>row.map(esc).join(',')).join('\n')
    const blob=new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='房间列表.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),1500)
    message.success('导出完成')
  } catch(e:any){ message.error('导出失败:'+ (e?.message||'')) }
}
</script>

<style scoped>
.room-page{padding:12px 16px}
.toolbar{margin-bottom:8px}
.inline-filter{margin-bottom:8px;padding:6px 8px;background:#fafafa;border:1px solid #eee;border-radius:6px}
.dense-row .ant-table-cell{padding:6px 8px;font-size:12px;line-height:1.2}
.modal-body-scroll{max-height:60vh;overflow:auto;padding-right:4px}
.modal-footer-fixed{display:flex;justify-content:flex-end;padding:12px 8px;margin-top:8px;border-top:1px solid #eee;background:#fff}
</style>
