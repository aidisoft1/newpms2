<template>
  <div class="building-analytics">
    <div class="layout">
      <div class="left">
        <div class="tree-header">
          <a-input v-model:value="treeKeyword" size="small" placeholder="搜索" allow-clear @change="filterTree" />
        </div>
        <a-tree
          :tree-data="treeData"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedKeys"
          block-node
          @expand="onExpand"
          @select="onSelect"
        />
      </div>
      <div class="split" />
      <div class="right">
        <div class="toolbar">
          <a-space>
            <a-button type="link" @click="showAll" :disabled="isAllView">全部汇总</a-button>
            <div class="crumb">当前范围：<span class="scope">{{ scopeLabel }}</span></div>
          </a-space>
        </div>
        <div class="chart-wrapper">
          <v-chart :option="chartOption" autoresize class="chart" />
        </div>
        <div class="table-wrapper">
          <a-table :data-source="tableRows" :columns="columns" row-key="id" size="small" :pagination="false" bordered />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import VChart from 'vue-echarts'

// API
let API_AREA = 'http://127.0.0.1:4000/api/area2'
let API_BUILDING = 'http://127.0.0.1:4000/api/buildings'
const TOKEN = 'test-token'
async function ensurePort(){
  try { const r=await fetch(API_AREA+'?page=1&size=1',{headers:{Authorization:`Bearer ${TOKEN}`},signal:AbortSignal.timeout(1800)}); if(!r.ok) throw new Error('bad') }
  catch { API_AREA='http://127.0.0.1:4001/api/area2'; API_BUILDING='http://127.0.0.1:4001/api/buildings' }
}

// state
const rawAreas = ref<any[]>([])
const rawBuildings = ref<any[]>([])

const treeData = ref<any[]>([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>(['all-root'])
const treeKeyword = ref('')

const currentScope = ref<{type:'all'|'area'; id?:number}>({type:'all'})
const isAllView = computed(()=> currentScope.value.type==='all')

const scopeLabel = computed(()=>{
  if(currentScope.value.type==='all') return '全部'
  const a = rawAreas.value.find(a=>a.id===currentScope.value.id)
  return a? `管理区：${a.code} ${a.name}` : '未知'
})

const columns = [
  {title:'楼宇编号',dataIndex:'code'},
  {title:'楼宇名称',dataIndex:'name'},
  {title:'地址',dataIndex:'address'},
  {title:'类型',dataIndex:'buildingType'},
  {title:'结构',dataIndex:'buildingStructure'}
]
const tableRows = ref<any[]>([])

// chart option
const chartOption = ref<any>({
  title:{text:'楼宇数汇总'},
  tooltip:{},
  xAxis:{type:'category',data:[]},
  yAxis:{type:'value'},
  series:[{type:'bar',data:[],itemStyle:{color:'#1890ff'}}]
})

function buildTree(){
  const children = rawAreas.value.map(a=>({
    title:`${a.code} ${a.name}`,
    key:'area-'+a.id,
  }))
  treeData.value=[{title:'全部',key:'all-root',children}]
  expandedKeys.value=['all-root']
}

function refreshTableAndChart(){
  let buildings: any[]
  if(currentScope.value.type==='all') buildings = rawBuildings.value
  else buildings = rawBuildings.value.filter(b=> b.areaId===currentScope.value.id)

  tableRows.value = buildings

  // 汇总：按管理区统计数量（全部视图）或当前管理区内按类型统计
  if(currentScope.value.type==='all'){
    const map: Record<string, number> = {}
    for(const b of rawBuildings.value){
      const key = String(b.areaId)
      map[key] = (map[key]||0)+1
    }
    const labels = rawAreas.value.map(a=> `${a.code}`)
    chartOption.value = {
      title:{text:'各管理区楼宇数'},
      tooltip:{},
      xAxis:{type:'category',data:labels},
      yAxis:{type:'value'},
      series:[{type:'bar',data:labels.map(l=>{ const area = rawAreas.value.find(a=>a.code===l); return area? map[String(area.id)]||0:0 })}]
    }
  } else {
    const map: Record<string, number> = {}
    for(const b of buildings){
      const key = b.buildingType||'未分类'
      map[key] = (map[key]||0)+1
    }
    const labels = Object.keys(map)
    chartOption.value = {
      title:{text:'楼宇类型分布'},
      tooltip:{},
      xAxis:{type:'category',data:labels},
      yAxis:{type:'value'},
      series:[{type:'bar',data:labels.map(l=>map[l])}]
    }
  }
}

function onExpand(keys:string[]){ expandedKeys.value = keys }
function onSelect(keys:string[]){
  selectedKeys.value = keys
  if(!keys.length) return
  const k = keys[0]
  if(k==='all-root'){ currentScope.value={type:'all'} }
  else if(k.startsWith('area-')){ const id = Number(k.slice(5)); currentScope.value={type:'area', id} }
  refreshTableAndChart()
}

function showAll(){ currentScope.value={type:'all'}; selectedKeys.value=['all-root']; refreshTableAndChart() }

function filterTree(){
  const kw = treeKeyword.value.trim()
  if(!kw){ buildTree(); return }
  const filteredAreas = rawAreas.value.filter(a=> (a.code||'').includes(kw) || (a.name||'').includes(kw))
  treeData.value=[{title:'全部',key:'all-root',children: filteredAreas.map(a=>({title:`${a.code} ${a.name}` , key:'area-'+a.id}))}]
  expandedKeys.value=['all-root']
}

async function fetchAreas(){
  try { await ensurePort(); const r=await fetch(`${API_AREA}?page=1&size=500&sort=code:asc`,{headers:{Authorization:`Bearer ${TOKEN}`}}); const data=await r.json(); rawAreas.value = Array.isArray(data.list)? data.list : Array.isArray(data)? data : []; buildTree(); } catch(e){ message.error('拉取管理区失败') }
}
async function fetchBuildings(){
  try { const r=await fetch(API_BUILDING,{headers:{Authorization:`Bearer ${TOKEN}`}}); rawBuildings.value=await r.json(); refreshTableAndChart(); } catch(e){ message.error('拉取楼宇失败') }
}

onMounted(()=>{ fetchAreas().then(fetchBuildings) })
</script>

<style scoped>
.building-analytics{display:flex;flex-direction:column;height:100%;}
.layout{display:flex;height:100%;}
.left{width:260px;border-right:1px solid #eee;padding:8px 8px 12px;box-sizing:border-box;overflow:auto;background:#fff}
.tree-header{margin-bottom:8px}
.split{width:6px;background:linear-gradient(90deg,rgba(0,0,0,0.05),rgba(0,0,0,0));}
.right{flex:1;display:flex;flex-direction:column;padding:8px 12px;overflow:auto}
.toolbar{margin-bottom:8px;}
.chart-wrapper{height:320px;border:1px solid #eee;border-radius:6px;padding:8px;margin-bottom:12px;background:#fff}
.chart{width:100%;height:100%}
.table-wrapper{flex:1;overflow:auto;background:#fff;border:1px solid #eee;border-radius:6px;padding:8px}
.scope{color:#1890ff;font-weight:500}
</style>
