<template>
  <div class="building-page">
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
          :loading="loading"
          row-key="areaId"
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
import { ref, h, onMounted, onUnmounted, nextTick, watch } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import { FullscreenOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 配置axios
axios.defaults.baseURL = 'http://192.168.1.10:3000';
axios.defaults.headers.common['Authorization'] = 'mock-token';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 管理区数据
const allAreas = ref<any[]>([]);
const loading = ref(false);

// API 调用函数
async function fetchAreas() {
  try {
    loading.value = true;
    console.log('正在获取管理区数据...');
    
    const response = await axios.get('/api/gardens');
    console.log('API 响应:', response.data);
    
    // 检查响应数据类型
    if (!response.data) {
      console.warn('API 返回空数据');
      allAreas.value = [];
      tableData.value = [];
      buildTree();
      return;
    }
    
    // 如果返回的是错误对象而不是数组
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // 确保返回的是数组
    const dataArray = Array.isArray(response.data) ? response.data : [];
    console.log('处理后的数据数组:', dataArray);
    
    // 将后端数据映射到前端格式
    allAreas.value = dataArray.map((item: any) => ({
      areaId: item.area_id || item.id || `temp_${Date.now()}_${Math.random()}`,
      id: item.id, // 保存数据库ID用于更新和删除
      name: item.name || '未命名管理区',
      address: item.address || '',
      description: item.description || '',
      lowBuildingCount: item.low_building_count || 0,
      highBuildingCount: item.high_building_count || 0,
      buildArea: item.build_area || 0,
      landArea: item.land_area || 0,
      publicArea: item.public_area || 0,
      greenArea: item.green_area || 0,
      roadArea: item.road_area || 0,
      parkingArea: item.parking_area || 0,
      garageArea: item.garage_area || 0,
      remark: item.description || ''
    }));
    
    tableData.value = [...allAreas.value];
    buildTree();
    console.log('管理区数据加载完成:', allAreas.value);
    
    if (allAreas.value.length === 0) {
      message.info('当前没有管理区数据，可以点击"新增管理区"添加数据');
    }
    
  } catch (error: any) {
    console.error('获取管理区数据失败:', error);
    
    // 更详细的错误处理
    let errorMessage = '获取管理区数据失败';
    if (error.response) {
      // 服务器返回了错误响应
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
      
      if (error.response.status === 404) {
        errorMessage = 'API 路径不存在，请检查后端服务';
      } else if (error.response.status === 500) {
        errorMessage = '服务器内部错误: ' + (error.response.data?.error || '数据库连接问题');
      } else {
        errorMessage = error.response.data?.error || `HTTP ${error.response.status} 错误`;
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('请求对象:', error.request);
      errorMessage = '无法连接到后端服务，请检查服务是否启动';
    } else {
      // 其他错误
      errorMessage = error.message;
    }
    
    message.error(errorMessage);
    
    // 使用默认数据避免页面崩溃
    allAreas.value = [
      { 
        areaId: 'demo_1', 
        id: null,
        name: '示例管理区', 
        address: '示例地址', 
        description: '这是示例数据，请检查后端服务连接', 
        lowBuildingCount: 0, 
        highBuildingCount: 0, 
        buildArea: 0, 
        landArea: 0, 
        publicArea: 0, 
        greenArea: 0, 
        roadArea: 0, 
        parkingArea: 0, 
        garageArea: 0, 
        remark: '示例数据' 
      }
    ];
    tableData.value = [...allAreas.value];
    buildTree();
  } finally {
    loading.value = false;
  }
}

async function saveArea(areaData: any) {
  try {
    loading.value = true;
    console.log('正在保存管理区数据:', areaData);
    
    // 将前端数据映射到后端格式
    const apiData = {
      name: areaData.name,
      area_id: areaData.areaId,
      address: areaData.address || '未填写地址',
      description: areaData.remark || areaData.description || '',
      low_building_count: areaData.lowBuildingCount || 0,
      high_building_count: areaData.highBuildingCount || 0,
      build_area: areaData.buildArea || 0,
      land_area: areaData.landArea || 0,
      public_area: areaData.publicArea || 0,
      green_area: areaData.greenArea || 0,
      road_area: areaData.roadArea || 0,
      parking_area: areaData.parkingArea || 0,
      garage_area: areaData.garageArea || 0
    };
    
    let response;
    if (areaData.id) {
      // 更新现有记录
      response = await axios.put(`/api/gardens/${areaData.id}`, apiData);
      message.success('管理区更新成功');
    } else {
      // 创建新记录
      response = await axios.post('/api/gardens', apiData);
      console.log('创建响应:', response.data);
      message.success('管理区创建成功');
    }
    
    // 重新获取数据
    await fetchAreas();
    return response.data;
  } catch (error: any) {
    console.error('保存管理区失败:', error);
    message.error('保存管理区失败: ' + (error.response?.data?.error || error.message));
    throw error;
  } finally {
    loading.value = false;
  }
}

async function deleteArea(areaId: any) {
  try {
    loading.value = true;
    console.log('正在删除管理区:', areaId);
    
    // 查找对应的数据库记录ID
    const area = allAreas.value.find(a => a.areaId === areaId);
    if (area && area.id) {
      await axios.delete(`/api/gardens/${area.id}`);
      message.success('删除成功');
    } else {
      console.warn('未找到对应的数据库记录ID，只从本地删除');
      message.success('删除成功');
    }
    
    // 重新获取数据以确保同步
    await fetchAreas();
  } catch (error: any) {
    console.error('删除管理区失败:', error);
    let errorMessage = '删除失败';
    if (error.response?.data?.error) {
      errorMessage += ': ' + error.response.data.error;
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
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
onMounted(() => { 
  window.addEventListener('mousemove', onMouseMove); 
  window.addEventListener('mouseup', onMouseUp); 
  fetchAreas(); // 初始化时获取数据
});
onUnmounted(() => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); });

function onTreeSearchInput(e: any) { treeSearch.value = e?.target?.value ?? (e || ''); }
function onTreeSearchEnter() { /* 可实现树节点搜索高亮 */ }

// 表格与表单
const tableColumns = [
  { title: '管理区编号', dataIndex: 'areaId', key: 'areaId', width: 120 },
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
];
const tableData = ref([...allAreas.value]);

// advanced filter removed: no filterModalVisible
const filterForm = ref({ areaId: '', name: '' });
const inlineFilterVisible = ref(false);

function resetFilter() { filterForm.value = { areaId: '', name: '' }; tableData.value = [...allAreas.value]; }
function applyFilter() {
  tableData.value = allAreas.value.filter(a => {
    return (!filterForm.value.areaId || a.areaId.includes(filterForm.value.areaId))
      && (!filterForm.value.name || a.name.includes(filterForm.value.name));
  });
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

function confirmImport() {
  for (const r of importPreviewRows.value) {
    const rec = { areaId: r.areaId || (`A-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*90)}`), name: r.name || r.areaId || '未知管理区', lowBuildingCount: 0, highBuildingCount: 0, buildArea: 0, landArea: 0, publicArea: 0, greenArea: 0, roadArea: 0, parkingArea: 0, garageArea: 0, remark: r.remark || '' }
    if (!allAreas.value.find((a:any)=>a.areaId === rec.areaId)) allAreas.value.push(rec)
  }
  tableData.value = [...allAreas.value]
  buildTree()
  importPreviewRows.value = []
  importPreviewVisible.value = false
  message.success('导入完成')
}
function onExport() {
  try {
    const data = tableData.value || []
    const headers = ['管理区编号','管理区名称','多层楼宇数量','高层楼宇数量','建筑面积','占地面积','公共场所面积','绿化面积','道路面积','车位面积','车库面积','备注']
    const escape = (v:any) => {
      if (v == null) return ''
      const s = String(v)
      // 双引号转义
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
    // 回收 URL
    setTimeout(()=> URL.revokeObjectURL(url), 5000)
    message.success('导出已开始')
  } catch (err:any) {
    message.error('导出失败: ' + (err?.message || '未知错误'))
  }
}
function doRequestFullscreen() { /* 可实现全屏 */ }

const editModalVisible = ref(false);
const editForm = ref({ areaId: '', name: '', lowBuildingCount: '', highBuildingCount: '', buildArea: '', landArea: '', publicArea: '', greenArea: '', roadArea: '', parkingArea: '', garageArea: '', remark: '' });
function onAdd() { editForm.value = { areaId: '', name: '', lowBuildingCount: '', highBuildingCount: '', buildArea: '', landArea: '', publicArea: '', greenArea: '', roadArea: '', parkingArea: '', garageArea: '', remark: '' }; editModalVisible.value = true; }
function onEdit(record: any) { editForm.value = { ...record }; editModalVisible.value = true; }
function onDelete(record: any) {
  deleteArea(record.areaId);
}
function handleEditCancel() { editModalVisible.value = false; }
async function handleEditOk() {
  try {
    // 将表单中的数字字段转为 number 类型
    const toNumber = (v: any) => v === '' ? 0 : Number(v);
    const data = {
      id: editForm.value.areaId ? allAreas.value.find(a => a.areaId === editForm.value.areaId)?.id : undefined,
      areaId: editForm.value.areaId || `A${Date.now()}`,
      name: editForm.value.name,
      address: '管理区地址', // 可以添加地址字段到表单
      description: editForm.value.remark,
      lowBuildingCount: toNumber(editForm.value.lowBuildingCount),
      highBuildingCount: toNumber(editForm.value.highBuildingCount),
      buildArea: toNumber(editForm.value.buildArea),
      landArea: toNumber(editForm.value.landArea),
      publicArea: toNumber(editForm.value.publicArea),
      greenArea: toNumber(editForm.value.greenArea),
      roadArea: toNumber(editForm.value.roadArea),
      parkingArea: toNumber(editForm.value.parkingArea),
      garageArea: toNumber(editForm.value.garageArea),
      remark: editForm.value.remark
    };
    
    await saveArea(data);
    editModalVisible.value = false;
  } catch (error) {
    console.error('保存失败:', error);
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
