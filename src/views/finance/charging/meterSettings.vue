<template>
  <div class="meter-page">
    <div class="meter-layout">
      <div class="tree-panel" :style="{ width: sidebarWidth + 'px' }" ref="treePanelRef">
        <div style="padding:8px; display:flex; gap:8px; align-items:center">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 / 房间（按 Enter）" allow-clear @keyup.enter="onTreeSearchEnter" />
          <a-button size="small" @click="onTreeSearchEnter">查询</a-button>
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
        <h3 style="margin:4px 0 8px;font-size:15px;font-weight:600">房间仪表设置</h3>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div>
            <a-space>
              <a-button type="primary" @click="onCreateMeter">新增仪表</a-button>
              <a-button type="primary" @click="openBatchModal">批量设置</a-button>
              <a-button @click="onImport">导入</a-button>
              <a-button @click="onExport">导出</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/仪表编号/名称" @search="onTableSearch" style="width:320px" />
          </div>
        </div>

        <div class="table-wrapper">
          <a-table
            :columns="excelColumns"
            :data-source="displayMeters"
            row-key="meterNo"
            size="small"
            :pagination="{ pageSize: 20 }"
            :scroll="{ x: 1400 }"
          >
          <template #bodyCell="slotProps">
            <template v-if="slotProps.column.key === 'actions'">
              <a-space>
                <a-button type="link" size="small" @click="editMeter(slotProps.record)">编辑</a-button>
                <a-button type="link" size="small" danger @click="deleteMeter(slotProps.record)">删除</a-button>
              </a-space>
            </template>
          </template>
          </a-table>
          <div v-if="!displayMeters.length" style="padding:32px 0; text-align:center; color:#999; font-size:13px">暂无仪表数据。点击“新增仪表”创建。</div>
        </div>
      </div>
    </div>

    <!-- 编辑模态保持可用 -->
  <a-modal class="compact-modal" v-model:visible="meterModalVisible" :title="isCreating ? '新增仪表' : '编辑仪表'" width="520" :maskClosable="false" :footer="null" :style="{ width: '520px' }">
      <div class="modal-body-scroll">
        <a-form :model="meterForm" layout="vertical" size="small">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-form-item>
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input v-model:value="meterForm.roomId" readonly size="small" placeholder="房间编号" />
                  <a-button size="small" @click="openRoomPicker">选择</a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input v-model:value="meterForm.customerId" size="small" placeholder="客户编号" />
                  <a-button size="small" @click="openCustomerPicker">选择</a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12"><a-form-item><a-input v-model:value="meterForm.roomName" readonly size="small" placeholder="房间名称" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item><a-select v-model:value="meterForm.meterType" size="small" placeholder="仪表类型"><a-select-option value="水表">水表</a-select-option><a-select-option value="电表">电表</a-select-option><a-select-option value="燃气表">燃气表</a-select-option></a-select></a-form-item></a-col>
            <a-col :span="12"><a-form-item><a-input v-model:value="meterForm.meterNo" readonly size="small" placeholder="仪表编号" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item><a-input v-model:value="meterForm.meterName" size="small" placeholder="仪表名称" /></a-form-item></a-col>
            <a-col :span="12">
              <a-form-item>
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input-number v-model:value="meterForm.multiple" :min="1" :precision="0" style="width:72px" size="small" placeholder="倍率" />
                  <a-space size="small">
                    <a-tooltip title="设为 1"><a-button size="small" type="link" @click="meterForm.multiple = 1">1</a-button></a-tooltip>
                    <a-tooltip title="设为 2"><a-button size="small" type="link" @click="meterForm.multiple = 2">2</a-button></a-tooltip>
                    <a-tooltip title="设为 4"><a-button size="small" type="link" @click="meterForm.multiple = 4">4</a-button></a-tooltip>
                  </a-space>
                  <a-tooltip title="倍率：用于将仪表原始读数乘以该值得到计费用量，常用 1、2、4">
                    <span style="font-size:14px;color:#999;cursor:help">ℹ️</span>
                  </a-tooltip>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <div style="display:flex; align-items:center; gap:8px">
                  <a-switch v-model:checked="meterForm.enabled" />
                  <span class="switch-text">{{ meterForm.enabled ? '启用' : '停用' }}</span>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="24"><a-form-item><a-input v-model:value="meterForm.remark" size="small" placeholder="备注" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item><a-date-picker v-model:value="meterForm.startDate" style="width:100%" :locale="zhCN" format="YYYY年MM月DD日" size="small" placeholder="开始日期（年-月-日）" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item><a-input-number v-model:value="meterForm.reading" :min="0" style="width:100%" size="small" placeholder="读数" /></a-form-item></a-col>
            <a-col :span="12"> 
              <a-form-item>
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input v-model:value="meterForm.chargeItem" size="small" placeholder="费项名称" />
                  <a-button size="small" @click="openChargePicker">选择</a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <div style="display:flex; gap:8px; align-items:center">
                  <a-input v-model:value="meterForm.formulaName" size="small" placeholder="公式名称" />
                  <a-button size="small" @click="openFormulaPicker">选择</a-button>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="12"><a-form-item><a-input-number v-model:value="meterForm.unitPrice" :min="0" style="width:100%" size="small" placeholder="单价" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </div>
      <div class="modal-footer-fixed">
        <a-button size="small" @click="resetMeterForm" style="margin-right:6px">重置</a-button>
        <a-button size="small" type="primary" @click="handleSaveAndClose">保存</a-button>
      </div>
    </a-modal>

    <!-- 批量设置模态 -->
    <a-modal v-model:visible="batchModalVisible" title="批量生成仪表（批量设置）" width="1000" :footer="null">
      <div style="display:flex; gap:12px;">
        <div style="width:320px; border-right:1px solid #f0f0f0; padding:8px 4px; box-sizing:border-box">
          <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center">
            <a-input v-model:value="batchTreeSearch" placeholder="树搜索（回车展开匹配）" @keyup.enter="onBatchTreeSearchEnter" style="flex:1" />
            <a-button size="small" @click="selectAllVisibleBatch">全选（含管理区/楼宇/房间）</a-button>
            <a-button size="small" @click="clearBatchSelection">清除</a-button>
          </div>
          <a-tree
            :tree-data="treeData"
            :expanded-keys="expandedKeys"
            :checked-keys="batchCheckedKeys"
            checkable
            :block-node="true"
            :show-icon="false"
            @check="onBatchTreeCheck"
            @expand="onTreeExpand"
            style="max-height:64vh; overflow:auto"
          />
        </div>

        <div style="flex:1; padding:8px; box-sizing:border-box">
          <a-form :model="batchForm" layout="vertical" size="small">
            <a-row :gutter="12">
              <a-col :span="8"><a-form-item label="仪表类型"><a-select v-model:value="batchForm.meterType" size="small" placeholder="选择仪表类型"><a-select-option value="水表">水表</a-select-option><a-select-option value="电表">电表</a-select-option><a-select-option value="燃气表">燃气表</a-select-option></a-select></a-form-item></a-col>
              <a-col :span="6"><a-form-item label="单价"><a-input-number v-model:value="batchForm.unitPrice" :min="0" :precision="2" style="width:100%" size="small" placeholder="单价" /></a-form-item></a-col>
              <a-col :span="6"><a-form-item label="倍率"><a-input-number v-model:value="batchForm.multiple" :min="1" :precision="0" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="4"><a-form-item label="违约金比例(%)"><a-input-number v-model:value="batchForm.penaltyRate" :min="0" :max="100" :precision="2" style="width:100%" size="small" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item label="计费开始时间"><a-date-picker v-model:value="batchForm.startDate" :locale="zhCN" format="YYYY年MM月DD日" style="width:100%" size="small" /></a-form-item></a-col>
                          <a-col :span="12"><a-form-item label="公式名称"><div style="display:flex; gap:8px; align-items:center"><a-input v-model:value="batchForm.formulaName" size="small" placeholder="公式名称" /><a-button size="small" @click="openFormulaPickerForBatch">选择</a-button></div></a-form-item></a-col>
            </a-row>
          </a-form>

          <div style="margin-top:8px; margin-bottom:8px; display:flex; gap:8px; align-items:center; justify-content:space-between">
            <div style="color:#666;font-size:13px">已选：<strong>{{ batchCheckedKeys.length }}</strong> 个</div>
            <div>
              <a-button size="small" @click="doBatchPreview">预览</a-button>
              <a-button type="primary" size="small" @click="doBatchCreate" :loading="batchLoading">生成</a-button>
              <a-button size="small" @click="exportBatchResults">导出结果</a-button>
            </div>
          </div>

          <div style="max-height:30vh; overflow:auto">
            <a-table :columns="batchPreviewColumns" :data-source="batchPreviewList" row-key="roomId" size="small" :pagination="false">
                <template #bodyCell="slotProps">
                  <template v-if="slotProps.column.key === 'actions'">
                    <a-space>
                      <a-button type="link" size="small" @click.stop="openPreviewEdit(slotProps.record)">编辑</a-button>
                      <a-button type="link" size="small" danger @click.stop="removePreviewRow(slotProps.record)">删除</a-button>
                    </a-space>
                  </template>
                </template>
            </a-table>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 选择器模态：房间/客户/费项/公式 -->
    <a-modal v-model:visible="importPreviewVisible" title="导入预览" width="820" :footer="null">
      <div style="max-height:60vh; overflow:auto">
        <a-table :columns="importPreviewColumns" :data-source="importPreviewRows" row-key="__row" size="small" :pagination="{ pageSize: 10 }"></a-table>
      </div>
      <div style="margin-top:8px; display:flex; justify-content:flex-end; gap:8px">
        <a-button size="small" @click="importPreviewVisible = false">取消</a-button>
        <a-button type="primary" size="small" @click="confirmImport">确认导入</a-button>
      </div>
    </a-modal>
  <a-modal v-model:visible="roomPickerVisible" title="选择房间" width="900" :footer="null" @openChange="onModalOpenChange">
      <div style="display:flex; gap:12px;">
        <div style="width:260px; border-right:1px solid #f0f0f0; padding:8px 4px; box-sizing:border-box">
          <div style="margin-bottom:8px; font-size:13px; color:#333">筛选树</div>
          <a-tree
            :tree-data="treeData"
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            :block-node="true"
            :show-icon="false"
            @select="onRoomTreeSelect"
            style="max-height:60vh; overflow:auto"
          />
        </div>
        <div style="flex:1; padding:8px; box-sizing:border-box">
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
            <a-input v-model:value="roomSearch" placeholder="按 房间编号/房间名称/客户编号 搜索，回车或点击查询" allow-clear @keyup.enter="doRoomSearchFirstPage" />
            <a-button size="small" @click="doRoomSearchFirstPage">查询</a-button>
            <span style="color:#888;font-size:12px">当前筛选：<strong>{{ currentFilterLabel }}</strong></span>
          </div>
          <a-table
            :columns="roomPickerColumns"
            :data-source="roomPickerResults"
            row-key="roomId"
            size="small"
            :loading="roomPickerLoading"
            :pagination="{ current: roomPage, pageSize: roomPageSize, total: roomTotal, showSizeChanger: true }"
            @change="onRoomTableChange">
            <template #bodyCell="slotProps">
              <template v-if="slotProps.column.key === 'actions'">
                <a-button type="link" size="small" @click.stop="selectRoom(slotProps.record)">选择</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="customerPickerVisible" title="选择客户" width="900" :footer="null">
      <div style="display:flex; gap:12px;">
        <div style="width:260px; border-right:1px solid #f0f0f0; padding:8px 4px; box-sizing:border-box">
          <div style="margin-bottom:8px; font-size:13px; color:#333">筛选树</div>
          <a-tree
            :tree-data="customerTreeData"
            :expanded-keys="customerExpandedKeys"
            :selected-keys="customerSelectedKeys"
            :block-node="true"
            :show-icon="false"
            @expand="onCustomerTreeExpand"
            @select="onCustomerTreeSelect"
            style="max-height:60vh; overflow:auto"
          />
        </div>
        <div style="flex:1; padding:8px; box-sizing:border-box">
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
            <a-input v-model:value="customerSearch" placeholder="按 客户编号/客户姓名/联系人 搜索，回车或点击查询" allow-clear @keyup.enter="doCustomerSearchFirstPage" />
            <a-button size="small" @click="doCustomerSearchFirstPage">查询</a-button>
            <span style="color:#888;font-size:12px">当前筛选：<strong>{{ customerFilterLabel }}</strong></span>
          </div>
          <a-table
            :columns="customerPickerColumns"
            :data-source="customerPickerResults"
            row-key="customerId"
            size="small"
            :loading="customerPickerLoading"
            :pagination="{ current: customerPage, pageSize: customerPageSize, total: customerTotal, showSizeChanger: true }"
            @change="onCustomerTableChange">
            <template #bodyCell="slotProps">
              <template v-if="slotProps.column.key === 'actions'">
                <a-button type="link" size="small" @click.stop="selectCustomer(slotProps.record)">选择</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="chargePickerVisible" title="选择费项" width="520" :footer="null">
  <a-table :columns="simplePickerColumns" :data-source="chargeItems" row-key="id" size="small" @rowDblclick="selectChargeRow">
        <template #bodyCell="slotProps">
          <template v-if="slotProps.column.key === 'actions'">
            <a-button type="link" size="small" @click.stop="selectCharge(slotProps.record)">选择</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>

    <a-modal v-model:visible="formulaPickerVisible" title="选择公式" width="520" :footer="null">
  <a-table :columns="simplePickerColumns" :data-source="formulaItems" row-key="id" size="small" @rowDblclick="selectFormulaRow">
        <template #bodyCell="slotProps">
          <template v-if="slotProps.column.key === 'actions'">
            <a-button type="link" size="small" @click.stop="selectFormula(slotProps.record)">选择</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted, computed, watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import { message, Modal } from 'ant-design-vue'

// ================= 后端接入配置 =================
const API_BASE = 'http://localhost:4000'
const TOKEN = 'test-token'
// 可切换：true=使用后端；false=仅本地示例数据
const useBackend = ref(true)

// 管理区 / 楼宇 / 房间 / 仪表 数据源
const areasData = ref<any[]>([])
const allRooms = ref<any[]>([]) // 后端加载或示例
const metersData = ref<any[]>([])
const metersLoading = ref(false)
const treeLoading = ref(false)

// 本地示例（若后端不可用时回退）
const fallbackRooms = [
  { roomId: 'R001', roomName: '101室', customerId: 'C001', customerName: '张三', buildingName: '楼宇A1', areaName: '管理区A' },
  { roomId: 'R002', roomName: '201室', customerId: 'C002', customerName: '李四', buildingName: '楼宇A1', areaName: '管理区A' }
]

async function safeFetch(url: string, options: any = {}) {
  const opt = { ...options, headers: { 'Authorization': `Bearer ${TOKEN}`, ...(options.headers||{}) } }
  const res = await fetch(url, opt)
  if (!res.ok) throw new Error(await tryReadError(res))
  return res.json()
}
async function tryReadError(res: Response) { try { const j = await res.json(); return j.error || JSON.stringify(j) } catch { return res.status + '' } }

// 加载管理区列表
async function loadAreas() {
  if (!useBackend.value) { return }
  treeLoading.value = true
  try {
    const data = await safeFetch(`${API_BASE}/api/area2?page=1&size=500`)
    areasData.value = Array.isArray(data.list) ? data.list : []
  } catch (e:any) {
    message.error('加载管理区失败，使用本地示例')
    areasData.value = []
    if (!allRooms.value.length) allRooms.value = fallbackRooms
  } finally { treeLoading.value = false; buildTree() }
}

// 加载房间（按管理区或楼宇）——需要后端提供 /api/rooms 接口（示例：/api/rooms?areaCode=xxx&building=xxx）
async function loadRoomsByArea(areaCode: string) {
  if (!useBackend.value) return
  try {
    const data = await safeFetch(`${API_BASE}/api/rooms?areaCode=${encodeURIComponent(areaCode)}`)
    if (Array.isArray(data.list)) {
      // 合并去重
      const map = new Map(allRooms.value.map((r:any)=>[r.roomId, r]))
      for (const r of data.list) map.set(r.roomId || r.id, { roomId: r.roomId || r.id, roomName: r.name || r.roomName || '', customerId: r.customerId||'', customerName: r.customerName||'', buildingName: r.buildingName||r.building||'', areaName: r.areaName||r.area||'' })
      allRooms.value = Array.from(map.values())
    }
  } catch (e) { /* 忽略，保持已有房间 */ }
}

// 加载仪表列表（按当前树节点 + 搜索）——需要后端提供 /api/meters 接口
async function loadMeters() {
  if (!useBackend.value) return
  metersLoading.value = true
  try {
    const params: any = {}
    const k = selectedNode.value ? String(selectedNode.value.key) : 'all'
    if (k.startsWith('area-')) params.areaCode = selectedNode.value.meta?.code || selectedNode.value.meta?.areaId
    if (k.startsWith('building-')) params.building = selectedNode.value.meta?.buildingName
    if (k.startsWith('room-')) params.roomId = selectedNode.value.meta?.roomId
    if (tableSearch.value) params.search = tableSearch.value.trim()
    const qs = Object.keys(params).length ? '?' + Object.entries(params).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : ''
    const data = await safeFetch(`${API_BASE}/api/meters${qs}`)
    const list = Array.isArray(data.list) ? data.list : []
    metersData.value = list.map((m:any)=>({
      meterNo: m.meterNo || m.id,
      meterName: m.meterName || m.name || '',
      meterType: m.meterType || m.type || '水表',
      roomId: m.roomId || m.room_id || '',
      customerId: m.customerId || '',
      roomName: m.roomName || '',
      multiple: m.multiple || 1,
      enabled: m.enabled !== false,
      remark: m.remark || m.description || '',
      startDate: m.startDate || null,
      reading: m.reading || 0,
      chargeItem: m.chargeItem || '',
      formulaName: m.formulaName || '',
      unitPrice: m.unitPrice || 0
    }))
  } catch (e:any) {
    message.error('加载仪表失败（使用临时本地数据模式）')
    if (!metersData.value.length) {
      // 保底示例
      metersData.value = [
        { meterNo: 'M-DEMO-1', meterName: '示例水表', meterType: '水表', roomId: 'R001', customerId: 'C001', roomName: '101室', multiple: 1, enabled: true, remark: '示例', startDate: null, reading: 0, chargeItem: '水费', formulaName: '', unitPrice: 2 }
      ]
    }
  } finally { metersLoading.value = false }
}

// 树数据：管理区 -> 楼宇 -> 房间（管理区来自后端 area2；楼宇/房间延迟加载）
// 如果后端暂未提供楼宇接口，可在展开时只加载房间或用占位节点
const areaBuildings: Record<string,string[]> = {}

const treeData = ref<any[]>([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<any[]>(['all'])
const selectedNode = ref<any>(null)
const treeSearch = ref('')

function buildTree() {
  const nodes:any[] = [{ title: h('span', '全部'), key: 'all', level: 0 }]
  let idx = 1
  if (areasData.value.length) {
    for (const a of areasData.value) {
      const areaName = a.name || a.areaName || a.code || `管理区${idx}`
      const code = a.code || a.id
      // 楼宇子节点：若暂未有数据，创建一个占位楼宇集合（后端扩展点）
      const builds = (areaBuildings[areaName] || []).map((b, bi) => ({ title: h('span', b), key: `building-${idx}-${bi}`, meta: { type: 'building', buildingName: b, areaName, code }, children: [{ title: h('span', '(展开加载房间)'), placeholder: true }] }))
      nodes.push({ title: h('span', areaName), key: `area-${idx}`, meta: { type: 'area', areaName, code, areaId: a.id }, children: builds.length ? builds : [{ title: h('span', '(展开加载房间)'), key: `area-placeholder-${idx}`, placeholder: true }] })
      idx++
    }
  } else {
    // 回退：使用本地示例管理区
    const fallbackAreas = ['管理区A','管理区B']
    for (const fa of fallbackAreas) {
      nodes.push({ title: h('span', fa), key: `area-${idx}`, meta: { type:'area', areaName: fa, code: fa }, children: [{ title: h('span', '(展开加载房间)'), key: `area-placeholder-${idx}`, placeholder: true }] })
      idx++
    }
  }
  treeData.value = nodes
}

async function loadTreeData(node: any) {
  if (!node) return
  const key = String(node.key || '')
  // area 节点：加载其房间（按需可分楼宇；这里直接平铺房间作为子节点）
  if (key.startsWith('area-')) {
    const code = node.meta?.code
    if (code) await loadRoomsByArea(code)
    const roomsForArea = allRooms.value.filter((r:any)=> r.areaName === node.meta?.areaName)
    if (roomsForArea.length) {
      node.children = roomsForArea.map((r:any)=> ({ title: h('span', `${r.roomId} ${r.roomName||''}`), key: `room-${r.roomId}`, isLeaf: true, meta: { type:'room', roomId: r.roomId, roomName: r.roomName, areaName: r.areaName } }))
    } else {
      node.children = [{ title: h('span','(无房间)'), key:`room-empty-${key}`, isLeaf:true, meta:{ type:'placeholder' } }]
    }
  }
  // building 节点：同原逻辑（若后续添加楼宇层）
  if (key.startsWith('building-')) {
    const buildingName = node.meta?.buildingName
    const roomsForBuilding = allRooms.value.filter((r:any)=> r.buildingName === buildingName)
    node.children = roomsForBuilding.length ? roomsForBuilding.map((r:any)=> ({ title: h('span', `${r.roomId} ${r.roomName||''}`), key:`room-${r.roomId}`, isLeaf:true, meta:{ type:'room', roomId:r.roomId, roomName:r.roomName, areaName:r.areaName } })) : [{ title: h('span','(无房间)'), key:`room-empty-${key}`, isLeaf:true, meta:{ type:'placeholder' } }]
  }
}

async function onTreeExpand(keys:any) {
  expandedKeys.value = keys
  // for any newly expanded building nodes, load rooms if placeholder present
  for (const k of keys || []) {
    const node = findNode(treeData.value, k)
    if (node && node.children && node.children.length === 1 && node.children[0].placeholder) {
      try { await loadTreeData(node) } catch (e) { /* ignore */ }
    }
  }
}
async function onTreeSearchEnter() {
  const q = (treeSearch.value || '').trim().toLowerCase()
  if (!q) {
    // collapse to default
    expandedKeys.value = []
    selectedKeys.value = ['all']
    selectedNode.value = null
    return
  }
  // find matching areas/buildings/rooms
  const toExpand:Set<string> = new Set()
  let firstMatchKey: string | null = null
  for (const node of treeData.value) {
    // area node
    const areaKey = String(node.key)
    const areaName = String(node.meta?.areaName || node.title?.children || '')
    let areaMatched = false
    if (areaName.toLowerCase().includes(q) || String(node.title).toLowerCase().includes(q)) {
      toExpand.add(areaKey)
      areaMatched = true
    }
    if (node.children) {
      for (const b of node.children) {
        const bkey = String(b.key)
        const bname = String(b.meta?.buildingName || b.title?.children || '')
        if (bname.toLowerCase().includes(q) || btitleIncludes(b, q)) {
          toExpand.add(areaKey)
          toExpand.add(bkey)
          // ensure rooms loaded
          if (b.children && b.children.length === 1 && b.children[0].placeholder) {
            await loadTreeData(b)
          }
        }
        // check rooms under this building
        if (b.children) {
          for (const r of b.children) {
            const rtitle = String(r.title?.children || r.title || '')
            const roomMetaName = String(r.meta?.roomName || '')
            const roomId = String(r.meta?.roomId || (r.key || '')).toLowerCase()
            if (roomId.includes(q) || roomMetaName.toLowerCase().includes(q) || rtitle.toLowerCase().includes(q)) {
              toExpand.add(areaKey)
              toExpand.add(bkey)
              if (!firstMatchKey) firstMatchKey = String(r.key)
            }
          }
        }
      }
    }
  }
  // apply expansions and select first match if any
  expandedKeys.value = Array.from(toExpand)
  if (firstMatchKey) {
    selectedKeys.value = [firstMatchKey]
    const n = findNode(treeData.value, firstMatchKey)
    selectedNode.value = n
  }
}

function btitleIncludes(bNode: any, q: string) {
  try {
    const t = bNode.title
    if (!t) return false
    const s = (typeof t === 'string') ? t : (t.children ? String(t.children) : String(t))
    return s.toLowerCase().includes(q)
  } catch (e) { return false }
}

function findNode(nodes: any[], key: string): any {
  for (const n of nodes) {
    if (String(n.key) === String(key)) return n
    if (n.children) {
      const r: any = findNode(n.children, key)
      if (r) return r
    }
  }
  return null
}

async function onSelect(keys:any, info:any) {
  const k = Array.isArray(keys) ? keys[0] : keys
  selectedKeys.value = keys
  // try to find the node in local treeData
  let node = findNode(treeData.value, k)
  // if building selected and rooms not loaded, load them
  if (node && String(node.key || '').startsWith('building-') && node.children && node.children.length === 1 && node.children[0].placeholder) {
    await loadTreeData(node)
  }
  // if area selected, expand area and its building children, and ensure buildings load their rooms
  if (node && String(node.key || '').startsWith('area-')) {
    const toExpand = new Set<string>(expandedKeys.value || [])
    toExpand.add(String(node.key))
    if (node.children) {
      for (const b of node.children) {
        const bkey = String(b.key)
        toExpand.add(bkey)
        // if building has placeholder child, load its rooms so buildings show their children
        if (b.children && b.children.length === 1 && b.children[0].placeholder) {
          try { await loadTreeData(b) } catch (e) { /* ignore */ }
        }
      }
    }
    expandedKeys.value = Array.from(toExpand)
  }
  // fallback: try to extract original data object from info.node (AntD tree exposes dataRef)
  if (node) {
    selectedNode.value = node
  } else if (info && info.node) {
    // if key encodes room id, derive it directly
    if (String(k || '').startsWith('room-')) {
      const rid = String(k).replace(/^room-/, '')
      selectedNode.value = { key: k, meta: { type: 'room', roomId: rid, roomName: '' } }
    } else {
      const dataRef = (info.node as any).dataRef || (info.node as any).props?.dataRef || (info.node as any).origin || (info.node as any).raw
      if (dataRef) {
        selectedNode.value = dataRef
      } else {
        // minimal fallback
        selectedNode.value = { key: k, title: info.node?.title || '', meta: info.node?.meta || null }
      }
    }
  } else {
    selectedNode.value = null
  }
}

// 初始化：加载管理区 -> 构建树 -> 加载仪表
onMounted(async () => {
  await loadAreas()
  if (useBackend.value) await loadMeters()
})

buildTree() // 初始占位（避免空白闪烁）

// 表格与模态状态
const tableSearch = ref('')
const meterModalVisible = ref(false)
const isCreating = ref(true)
const roomPickerVisible = ref(false)
const customerPickerVisible = ref(false)
const chargePickerVisible = ref(false)
const formulaPickerVisible = ref(false)
const meterForm = ref<any>({ roomId: '', customerId: '', roomName: '', meterType: '', meterNo: '', meterName: '', multiple: 1, enabled: true, remark: '', startDate: null, reading: 0, chargeItem: '', formulaName: '', unitPrice: 0 })

function generateMeterNo() { return `M-${Date.now().toString().slice(-6)}` }

function resetMeterForm() { meterForm.value = { roomId: meterForm.value.roomId || '', customerId: meterForm.value.customerId || '', roomName: meterForm.value.roomName || '', meterType: '', meterNo: '', meterName: '', multiple: 1, enabled: true, remark: '', startDate: null, reading: 0, chargeItem: '', formulaName: '', unitPrice: 0 } }

async function saveMeter() {
  if (!meterForm.value.roomId) { message.error('请先选择房间'); return }
  const mult = meterForm.value.multiple
  if (mult == null || isNaN(Number(mult)) || Number(mult) < 1 || !Number.isInteger(Number(mult))) { message.error('倍率必须为大于等于 1 的整数'); return }
  const copy = { ...meterForm.value }
  if (!copy.meterNo) copy.meterNo = generateMeterNo()
  if (useBackend.value) {
    try {
      const payload = { ...copy, id: copy.meterNo }
      const method = metersData.value.find((m:any)=>m.meterNo === copy.meterNo) ? 'PUT' : 'POST'
      const url = method === 'POST' ? `${API_BASE}/api/meters` : `${API_BASE}/api/meters/${encodeURIComponent(copy.meterNo)}`
      await fetch(url, { method, headers: { 'Content-Type':'application/json','Authorization':`Bearer ${TOKEN}` }, body: JSON.stringify(payload) })
      message.success('保存成功')
      await loadMeters()
      return
    } catch (e:any) { message.error('后端保存失败，已写入本地列表') }
  }
  metersData.value = [...metersData.value.filter((m:any)=>m.meterNo !== copy.meterNo), copy]
  message.success('保存成功 (本地)')
}

function handleSaveAndClose() { saveMeter(); meterModalVisible.value = false }

function onCreateMeter() {
  // 如果树上选中房间，则使用其信息
  isCreating.value = true
  if (selectedNode.value && String(selectedNode.value.key || '').startsWith('room-')) {
    const rid = selectedNode.value.meta?.roomId || ''
    const rec = allRooms.value.find((r:any)=>r.roomId === rid)
    meterForm.value.roomId = rec?.roomId || ''
    meterForm.value.roomName = rec?.roomName || ''
    meterForm.value.customerId = rec?.customerId || ''
  }
  meterForm.value.meterNo = generateMeterNo()
  meterModalVisible.value = true
}

function editMeter(r:any) { meterForm.value = { ...r }; meterModalVisible.value = true }
function deleteMeter(r:any) {
  Modal.confirm({ title: '确认删除该仪表吗？', async onOk() {
    if (useBackend.value) {
      try {
        await fetch(`${API_BASE}/api/meters/${encodeURIComponent(r.meterNo)}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${TOKEN}` } })
        message.success('已删除')
        await loadMeters()
        return
      } catch (e:any) { message.error('后端删除失败，尝试本地移除') }
    }
    metersData.value = metersData.value.filter((x:any)=>x.meterNo !== r.meterNo)
    message.success('已删除 (本地)')
  } })
}

// onImport is implemented later with CSV parsing (handleImportFile)
function onExport() { const headers = ['房间编号','客户编号','房间名称','仪表类型','仪表编号','仪表名称','倍率','是否使用','备注','开始日期','读数','费项名称','公式名称','单价']; const rows = displayMeters.value.map((r:any)=>[r.roomId,r.customerId,r.roomName,r.meterType,r.meterNo,r.meterName,r.multiple, r.enabled, r.remark, r.startDate?String(r.startDate):'', r.reading, r.chargeItem, r.formulaName, r.unitPrice]); const csv = headers.join(',') + '\n' + rows.map((r:any)=>r.map((c:any)=>`"${c??''}"`).join(',')).join('\n'); const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.setAttribute('download','仪表列表.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link) }

// 选择器辅助数据与方法
const roomPickerColumns = [ { title: '房间编号', dataIndex: 'roomId', key: 'roomId' }, { title: '房间名称', dataIndex: 'roomName', key: 'roomName' }, { title: '楼宇', dataIndex: 'buildingName', key: 'buildingName' }, { title: '操作', key: 'actions', width: 100 } ]

const uniqueCustomers = computed(() => {
  const map = new Map<string, any>()
  for (const r of allRooms.value) map.set(r.customerId, { customerId: r.customerId, customerName: r.customerName })
  return Array.from(map.values())
})

const simplePickerColumns = [ { title: '名称', dataIndex: 'name', key: 'name' }, { title: '操作', key: 'actions', width: 100 } ]
const chargeItems = ref([{ id: 'c1', name: '水费' }, { id: 'c2', name: '电费' }])
const formulaItems = ref([{ id: 'f1', name: '公式A' }, { id: 'f2', name: '公式B' }])
// 公式选择目标：'meter' 表示为单条表单, 'batch' 表示为批量设置
const formulaPickerTarget = ref<'meter'|'batch'|'none'>('none')

// 房间远程搜索相关状态（模拟异步搜索，真实环境请调用后端接口）
const roomSearch = ref('')
const roomPickerResults = ref<any[]>([])
const roomPickerLoading = ref(false)
const miniTreeVisible = ref(false)

const currentFilterLabel = computed(() => {
  if (!selectedNode.value || selectedNode.value.key === 'all') return '全部'
  const k = String(selectedNode.value.key || '')
  if (k.startsWith('area-')) return selectedNode.value.meta?.areaName || '管理区'
  if (k.startsWith('building-')) return (selectedNode.value.meta?.areaName ? selectedNode.value.meta?.areaName + ' / ' : '') + (selectedNode.value.meta?.buildingName || '楼宇')
  if (k.startsWith('room-')) return selectedNode.value.meta?.roomName || selectedNode.value.title || '房间'
  return '全部'
})

const roomPage = ref(1)
const roomPageSize = ref(20)
const roomTotal = ref(0)

async function doRoomSearch(page = 1, size = roomPageSize.value) {
  roomPickerLoading.value = true
  roomPage.value = page
  roomPageSize.value = size
  // 模拟网络延迟
  await new Promise((res) => setTimeout(res, 200))
  const q = (roomSearch.value || '').toLowerCase()
  // 如果左侧树选中楼宇/管理区，则作为初始过滤条件
  let pool = allRooms.value
  if (selectedNode.value) {
    const k = String(selectedNode.value.key || '')
    if (k.startsWith('building-')) {
      const bname = selectedNode.value.meta?.buildingName
      pool = allRooms.value.filter((r:any) => r.buildingName === bname)
    } else if (k.startsWith('area-')) {
      const aname = selectedNode.value.meta?.areaName
      pool = allRooms.value.filter((r:any) => r.areaName === aname)
    } else if (k.startsWith('room-')) {
      const rid = selectedNode.value.meta?.roomId || k.replace('room-','')
      pool = allRooms.value.filter((r:any) => String(r.roomId) === String(rid))
    }
  }
  const filtered = pool.filter((r:any) => {
    if (!q) return true
    return String(r.roomId || '').toLowerCase().includes(q) || String(r.roomName || '').toLowerCase().includes(q) || String(r.customerId || '').toLowerCase().includes(q)
  })
  roomTotal.value = filtered.length
  const start = (page - 1) * size
  roomPickerResults.value = filtered.slice(start, start + size)
  roomPickerLoading.value = false
}

function onRoomTableChange(pagination: any) {
  const cur = pagination && pagination.current ? Number(pagination.current) : 1
  const ps = pagination && pagination.pageSize ? Number(pagination.pageSize) : roomPageSize.value
  doRoomSearch(cur, ps)
}

function onRoomTreeSelect(keys: any, info: any) {
  onSelect(keys, info)
  if (roomPickerVisible.value) doRoomSearch(1, roomPageSize.value)
}

function doRoomSearchFirstPage() { doRoomSearch(1, roomPageSize.value) }
function doRoomSearchWithPageSize() { doRoomSearch(1, roomPageSize.value) }

function onModalOpenChange(open:boolean) { /* no-op handler to make v-on explicit for template compiler */ }

function openRoomPicker() { 
  roomSearch.value = ''
  roomPickerResults.value = []
  roomPickerVisible.value = true
  // 弹窗打开后，触发一次基于树节点的初始搜索（异步）
  // 用 setTimeout 确保 modal 打开后执行
  setTimeout(()=>{ doRoomSearch() }, 50)
}
function selectRoom(r:any) { meterForm.value.roomId = r.roomId; meterForm.value.roomName = r.roomName; meterForm.value.customerId = r.customerId; roomPickerVisible.value = false }
function selectRoomRow(r:any) { selectRoom(r) }

function openCustomerPicker() { customerPickerVisible.value = true }
// old selectCustomer removed; new selectCustomer implemented with richer assignment below
function selectCustomerRow(r:any) { selectCustomer(r) }

function openChargePicker() { chargePickerVisible.value = true }
function openFormulaPicker() { formulaPickerTarget.value = 'meter'; formulaPickerVisible.value = true }

function selectCharge(r:any) { meterForm.value.chargeItem = r.name; chargePickerVisible.value = false }
function selectChargeRow(r:any) { selectCharge(r) }
function selectFormula(r:any) { if (formulaPickerTarget.value === 'batch') { batchForm.value.formulaName = r.name } else { meterForm.value.formulaName = r.name } formulaPickerVisible.value = false; formulaPickerTarget.value = 'none' }
function selectFormulaRow(r:any) { selectFormula(r) }

// ========== 客户选择器相关（复用 customers.info 的数据结构与按树过滤逻辑）
const customersData = ref<any[]>([
  { customerId: 'C001', contact: '张三', customerName: '张三个人', customerType: '个人', phone: '13800000001', address: '地址A1', tel: '', fax: '', birthday: '1990-01-01', idType: '身份证', idNumber: '110101199001010011', moveInDate: '2020-01-01', decorationDate: '2020-02-01', bankId: 'B001', accountName: '张三', bankAccount: '6222020202020', bankBranch: '某某支行', remark: '', buildingName: '楼宇A1', roomId: 'R001' }
])

const customerTreeData = ref<any[]>([])
const customerExpandedKeys = ref<string[]>([])
const customerSelectedKeys = ref<any[]>(['all'])
const customerSearch = ref('')
const customerPickerResults = ref<any[]>([])
const customerPickerLoading = ref(false)
const customerPage = ref(1)
const customerPageSize = ref(20)
const customerTotal = ref(0)

const customerPickerColumns = [ { title: '客户编号', dataIndex: 'customerId', key: 'customerId' }, { title: '客户姓名', dataIndex: 'customerName', key: 'customerName' }, { title: '联系人', dataIndex: 'contact', key: 'contact' }, { title: '操作', key: 'actions', width: 100 } ]

function buildCustomerTree() {
  const nodes:any[] = [{ title: h('span', '全部'), key: 'all', level: 0 }]
  let ai = 1
  for (const [area, builds] of Object.entries(areaBuildings)) {
    const bchildren = builds.map((b, idx) => ({ title: h('span', b), key: `building-${ai}-${idx}`, meta: { type: 'building', buildingName: b, areaName: area }, children: [{ title: h('span', '(双击展开)'), placeholder: true }] }))
    nodes.push({ title: h('span', area), key: `area-${ai}`, meta: { type: 'area', areaName: area }, children: bchildren })
    ai++
  }
  customerTreeData.value = nodes
}

async function onCustomerTreeExpand(keys:any) {
  customerExpandedKeys.value = keys
  for (const k of keys || []) {
    const node = findNode(customerTreeData.value, k)
    if (node && node.children && node.children.length === 1 && node.children[0].placeholder) {
      // load customers as rooms under building
      const buildingName = node.meta?.buildingName
      const customersForBuilding = customersData.value.filter((r:any) => r.buildingName === buildingName)
      node.children = customersForBuilding.length ? customersForBuilding.map((r:any) => ({ title: h('span', `${r.roomId||''} ${r.customerName||''}`), key: `room-${r.roomId}`, isLeaf: true, meta: { type: 'room', roomId: r.roomId, customerId: r.customerId } })) : [{ title: h('span', '(无客户)'), key: `room-empty-${k}`, isLeaf: true, meta: { type: 'placeholder' } }]
    }
  }
}

function customerFilterPool() {
  let pool = customersData.value
  if (selectedNode.value) {
    const k = String(selectedNode.value.key || '')
    if (k.startsWith('building-')) {
      const bname = selectedNode.value.meta?.buildingName
      pool = customersData.value.filter((r:any) => r.buildingName === bname)
    } else if (k.startsWith('area-')) {
      const aname = selectedNode.value.meta?.areaName
      pool = customersData.value.filter((r:any) => r.areaName === aname)
    } else if (k.startsWith('room-')) {
      const rid = selectedNode.value.meta?.roomId || k.replace('room-','')
      pool = customersData.value.filter((r:any) => String(r.roomId) === String(rid))
    }
  }
  return pool
}

async function doCustomerSearch(page = 1, size = customerPageSize.value) {
  customerPickerLoading.value = true
  customerPage.value = page
  customerPageSize.value = size
  await new Promise((res)=>setTimeout(res, 150))
  const q = (customerSearch.value||'').toLowerCase()
  const pool = customerFilterPool()
  const filtered = pool.filter((r:any) => {
    if (!q) return true
    return String(r.customerId||'').toLowerCase().includes(q) || String(r.customerName||'').toLowerCase().includes(q) || String(r.contact||'').toLowerCase().includes(q)
  })
  customerTotal.value = filtered.length
  const start = (page-1)*size
  customerPickerResults.value = filtered.slice(start, start+size)
  customerPickerLoading.value = false
}

function doCustomerSearchFirstPage() { doCustomerSearch(1, customerPageSize.value) }

function onCustomerTableChange(pagination:any) { const cur = pagination && pagination.current ? Number(pagination.current) : 1; const ps = pagination && pagination.pageSize ? Number(pagination.pageSize) : customerPageSize.value; doCustomerSearch(cur, ps) }

function onCustomerTreeSelect(keys:any, info:any) {
  customerSelectedKeys.value = keys
  // when user selects in this picker, set global selectedNode for filtering demonstration
  onSelect(keys, info)
  doCustomerSearchFirstPage()
}

const customerFilterLabel = computed(() => {
  if (!selectedNode.value || selectedNode.value.key === 'all') return '全部'
  const k = String(selectedNode.value.key || '')
  if (k.startsWith('area-')) return selectedNode.value.meta?.areaName || '管理区'
  if (k.startsWith('building-')) return (selectedNode.value.meta?.areaName ? selectedNode.value.meta?.areaName + ' / ' : '') + (selectedNode.value.meta?.buildingName || '楼宇')
  if (k.startsWith('room-')) return selectedNode.value.meta?.roomName || selectedNode.value.title || '房间'
  return '全部'
})

function selectCustomer(r:any) { meterForm.value.customerId = r.customerId; meterForm.value.customerName = r.customerName; customerPickerVisible.value = false }

buildCustomerTree()

// 列定义（Excel 风格）
const excelColumns = [
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId', width: 120 },
  { title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName', width: 140 },
  { title: '仪表类型', dataIndex: 'meterType', key: 'meterType', width: 100 },
  { title: '仪表编号', dataIndex: 'meterNo', key: 'meterNo', width: 140 },
  { title: '仪表名称', dataIndex: 'meterName', key: 'meterName', width: 160 },
  { title: '倍率', dataIndex: 'multiple', key: 'multiple', width: 80 },
  { title: '是否使用', dataIndex: 'enabled', key: 'enabled', width: 90 },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 140 },
  { title: '读数', dataIndex: 'reading', key: 'reading', width: 100 },
  { title: '费项名称', dataIndex: 'chargeItem', key: 'chargeItem', width: 140 },
  { title: '公式名称', dataIndex: 'formulaName', key: 'formulaName', width: 140 },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' }
]

const displayMeters = computed(() => {
  if (useBackend.value) {
    // 后端已按筛选加载，这里只做搜索兜底过滤
    return metersData.value.filter(m=>filterBySearch(m))
  }
  // 本地模式仍按树节点过滤
  if (!selectedNode.value || selectedNode.value.key === 'all') return metersData.value.filter(m=>filterBySearch(m))
  const k = String(selectedNode.value.key)
  if (k.startsWith('area-')) {
    const area = selectedNode.value.meta?.areaName
    const roomIds = allRooms.value.filter((r:any)=>r.areaName === area).map((r:any)=>r.roomId)
    return metersData.value.filter((m:any)=>roomIds.includes(m.roomId) && filterBySearch(m))
  }
  if (k.startsWith('building-')) {
    const bname = selectedNode.value.meta?.buildingName
    const roomIds = allRooms.value.filter((r:any)=>r.buildingName === bname).map((r:any)=>r.roomId)
    return metersData.value.filter((m:any)=>roomIds.includes(m.roomId) && filterBySearch(m))
  }
  if (k.startsWith('room-')) {
    const rid = selectedNode.value.meta?.roomId || k.replace('room-','')
    return metersData.value.filter((m:any)=>m.roomId === rid && filterBySearch(m))
  }
  return metersData.value.filter(m=>filterBySearch(m))
})

function filterBySearch(m:any) {
  const s = (tableSearch.value || '').toLowerCase()
  if (!s) return true
  return String(m.roomId || '').toLowerCase().includes(s)
    || String(m.roomName || '').toLowerCase().includes(s)
    || String(m.customerId || '').toLowerCase().includes(s)
    || String(m.meterNo||'').toLowerCase().includes(s)
    || String(m.meterName||'').toLowerCase().includes(s)
    || String(m.chargeItem||'').toLowerCase().includes(s)
    || String(m.formulaName||'').toLowerCase().includes(s)
    || String(m.meterType||'').toLowerCase().includes(s)
}

function onTableSearch() { if (useBackend.value) loadMeters() }

// 监听树节点选择变化（后端模式自动刷新仪表）
watch(selectedNode, () => { if (useBackend.value) loadMeters() })

// 分割条逻辑
const treePanelRef = ref<any>(null)
const sidebarWidth = ref(300)
let dragging = false
function onSplitterDown(e:MouseEvent) { dragging = true; e.preventDefault() }
function onMouseMove(e:MouseEvent) { if (!dragging) return; const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect(); const left = parentRect ? parentRect.left : 0; const newWidth = Math.min(640, Math.max(180, e.clientX - left)); sidebarWidth.value = newWidth }
function onMouseUp() { dragging = false }
onMounted(()=>{ window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp) })
onUnmounted(()=>{ window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) })

// ========== 批量设置 (Batch Create) ==========
const batchModalVisible = ref(false)
const batchTreeSearch = ref('')
const batchCheckedKeys = ref<string[]>([])
const batchForm = ref<any>({ meterType: '水表', unitPrice: 0, multiple: 1, penaltyRate: 0, startDate: null, formulaName: '' })
const batchPreviewList = ref<any[]>([])
const batchLoading = ref(false)

const batchPreviewColumns = [
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId' },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName' },
  { title: '仪表类型', dataIndex: 'meterType', key: 'meterType' },
  { title: '仪表编号', dataIndex: 'meterNo', key: 'meterNo' },
  { title: '仪表名称', dataIndex: 'meterName', key: 'meterName' },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: '倍率', dataIndex: 'multiple', key: 'multiple' },
  { title: '违约金比例(%)', dataIndex: 'penaltyRate', key: 'penaltyRate' },
  { title: '开始时间', dataIndex: 'startDate', key: 'startDate' },
  { title: '公式名称', dataIndex: 'formulaName', key: 'formulaName' },
  { title: '操作', dataIndex: 'actions', key: 'actions', width: 140 }
]

function openBatchModal() {
  batchModalVisible.value = true
  batchCheckedKeys.value = []
  batchPreviewList.value = []
}

function onBatchTreeCheck(checked:any, info:any) {
  // AntD may pass either an array of keys or an object { checked: [...], halfChecked: [...] }
  const keys = Array.isArray(checked) ? checked : (checked?.checked || [])
  // if user checked the special 'all' node, expand to include every node key (areas, buildings, rooms)
  if (keys.includes('all')) {
    selectAllVisibleBatch()
    return
  }
  batchCheckedKeys.value = keys
}

function selectAllVisibleBatch() {
  // collect all keys currently loaded in treeData (areas, buildings, rooms)
  const keys: string[] = []
  function walk(nodes:any[]) {
    for (const n of nodes) {
      if (n && n.key != null) keys.push(String(n.key))
      if (n.children) walk(n.children)
    }
  }
  walk(treeData.value)
  // ensure deduplicated
  batchCheckedKeys.value = Array.from(new Set(keys))
}

function clearBatchSelection() { batchCheckedKeys.value = []; batchPreviewList.value = [] }

function onBatchTreeSearchEnter() {
  const q = (batchTreeSearch.value||'').trim().toLowerCase()
  if (!q) { expandedKeys.value = []; return }
  const matched: string[] = []
  function collect(nodes:any[], parents:string[] = []) {
    for (const n of nodes) {
      const title = String(n.meta?.areaName || n.meta?.buildingName || n.meta?.roomId || (n.title && n.title.children) || n.title || '')
      const key = String(n.key || '')
      const path = [...parents, key]
      if (title.toLowerCase().includes(q)) matched.push(...path)
      if (n.children) collect(n.children, path)
    }
  }
  collect(treeData.value)
  expandedKeys.value = Array.from(new Set(matched))
}

function doBatchPreview() {
  // build preview list from checked keys (collect only actual room ids, expand area/building nodes)
  ;(async () => {
    const roomIds = await collectRoomIdsFromCheckedKeys()
    const list = allRooms.value.filter((r:any)=>roomIds.includes(String(r.roomId)))
    batchPreviewList.value = list.map(r=>({
      ...r,
      meterType: batchForm.value.meterType || '水表',
      meterNo: generateMeterNo(),
      meterName: `${batchForm.value.meterType || '水表'}-${r.roomId}`,
      unitPrice: batchForm.value.unitPrice || 0,
      multiple: batchForm.value.multiple || 1,
      penaltyRate: batchForm.value.penaltyRate || 0,
      startDate: batchForm.value.startDate || null,
      formulaName: batchForm.value.formulaName || '',
      _status: 'pending',
      _error: ''
    }))
  })()
}

// Helper: from batchCheckedKeys produce a list of actual room IDs (expanding areas/buildings)
async function collectRoomIdsFromCheckedKeys(): Promise<string[]> {
  const keys = Array.from(new Set(batchCheckedKeys.value || []))
  const roomIds:Set<string> = new Set()
  // helper to ensure building nodes have loaded rooms
  async function ensureNodeRooms(node:any) {
    if (!node) return
    if (String(node.key).startsWith('building-')) {
      if (node.children && node.children.length === 1 && node.children[0].placeholder) {
        try { await loadTreeData(node) } catch(e) { /* ignore */ }
      }
      if (node.children) {
        for (const c of node.children) {
          if (String(c.key).startsWith('room-')) roomIds.add(String(c.meta?.roomId || String(c.key).replace('room-','')))
        }
      }
    }
  }

  // traverse treeData to find matching keys and collect room ids
  async function walk(nodes:any[]) {
    for (const n of nodes) {
      const k = String(n.key)
      if (keys.includes(k)) {
        // if it's a room node
        if (k.startsWith('room-')) {
          roomIds.add(String(n.meta?.roomId || k.replace('room-','')))
        } else if (k.startsWith('building-')) {
          await ensureNodeRooms(n)
        } else if (k.startsWith('area-')) {
          // gather all building children under area
          if (n.children) {
            for (const b of n.children) {
              await ensureNodeRooms(b)
            }
          }
        } else if (k === 'all') {
          // select all rooms in entire tree
          await ensureNodeRooms(n)
          if (n.children) {
            for (const a of n.children) {
              if (a.children) {
                for (const b of a.children) {
                  await ensureNodeRooms(b)
                }
              }
            }
          }
        }
      } else {
        if (n.children) await walk(n.children)
      }
    }
  }

  await walk(treeData.value)
  return Array.from(roomIds)
}

// unified doBatchCreate implemented later (with backend toggle)

function exportBatchResults() {
  const headers = ['房间编号','房间名称','楼宇','客户编号','状态','信息']
  const rows = batchPreviewList.value.map((r:any)=>[r.roomId, r.roomName, r.buildingName || '', r.customerId || '', r._status, r._error || ''])
  const csv = headers.join(',') + '\n' + rows.map((r:any)=>r.map((c:any)=>`"${c??''}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'}); const link = document.createElement('a'); link.href=URL.createObjectURL(blob); link.setAttribute('download','批量生成结果.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link)
}

// 后端开关：如果为 true，则 doBatchCreate 会调用后端接口（此处为示例 URL），否则使用本地模拟逻辑
const useBackendBatchApi = ref(false)

function openFormulaPickerForBatch() { formulaPickerVisible.value = true }

// CSV 导入实现（简单字段映射与校验）
function handleImportFile(file: File) {
  // parse and show preview
  parseCSV(file)
}

const importPreviewVisible = ref(false)
const importPreviewRows = ref<any[]>([])
const importPreviewColumns = ref<any[]>([
  { title: '房间编号', dataIndex: 'roomId', key: 'roomId' },
  { title: '房间名称', dataIndex: 'roomName', key: 'roomName' },
  { title: '仪表类型', dataIndex: 'meterType', key: 'meterType' },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: '备注', dataIndex: 'remark', key: 'remark' }
])
const pendingImportRows = ref<any[]>([])

function parseCSV(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = String(e.target?.result || '')
    // more robust split: handle quoted fields by a simple regex
    const lines = text.split(/\r?\n/).filter(l=>l.trim())
    if (!lines.length) { message.error('CSV 内容为空'); return }
    // parse header
    const headers = splitCsvLine(lines[0])
    const rows = lines.slice(1).map(l=>{
      const cols = splitCsvLine(l)
      const obj:any = {}
      for (let i=0;i<headers.length;i++) obj[headers[i]] = cols[i]
      return obj
    })
    const bad = rows.filter(r=>!(r['房间编号']||r['roomId']||r['room']||r['room_id']))
    if (bad.length) { message.error('部分行缺少 房间编号，导入取消'); return }
    // build preview rows
    pendingImportRows.value = rows.map((r, idx)=>{
      const roomId = r['房间编号']||r['roomId']||r['room']||r['room_id']
      const room = allRooms.value.find((x:any)=>String(x.roomId) === String(roomId))
      return { __row: idx, roomId, roomName: room?.roomName||r['房间名称']||'', meterType: r['仪表类型']||'水表', unitPrice: Number(r['单价']||0), remark: r['备注']||'', raw: r }
    })
    importPreviewRows.value = pendingImportRows.value
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
  for (const r of pendingImportRows.value) {
    const rec = { meterNo: generateMeterNo(), meterName: `${r.meterType}-${r.roomId}`, meterType: r.meterType, roomId: r.roomId, customerId: '', roomName: r.roomName, multiple: 1, enabled: true, remark: r.remark||'', startDate: null, reading: 0, chargeItem: '', formulaName: '', unitPrice: r.unitPrice }
    metersData.value.push(rec)
  }
  message.success('导入完成: ' + pendingImportRows.value.length + ' 行')
  pendingImportRows.value = []
  importPreviewVisible.value = false
}

function onImport() { const input = document.createElement('input'); input.type='file'; input.accept='.csv'; input.onchange = ()=>{ const f = input.files && input.files[0]; if (f) handleImportFile(f) }; input.click() }

async function doBatchCreate() {
  if (!batchForm.value.meterType) { message.error('请选择仪表类型'); return }
  // collect only valid room ids from checked keys (expand area/building nodes)
  const roomIds = await collectRoomIdsFromCheckedKeys()
  if (!roomIds.length) { message.info('请先选择房间'); return }
  batchLoading.value = true
  // if backend toggle enabled - call backend API
  if (useBackendBatchApi.value) {
    try {
      // mock fetch to backend
      const payload = { rooms: roomIds, params: batchForm.value }
      const res = await fetch('/api/meters/batch-create', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('后端返回错误')
      const j = await res.json()
      // assume j.results array with { roomId, status, error, meter } entries
      batchPreviewList.value = (j.results || []).map((x:any)=>({ ...x }))
      // append successful meters if provided
      for (const r of (j.results||[])) if (r.status === 'success' && r.meter) metersData.value.push(r.meter)
      message.success('已提交到后端，查看结果')
    } catch (err:any) {
      message.error('批量调用后端失败: ' + (err?.message||''))
    } finally { batchLoading.value = false }
    return
  }
  // otherwise fallback to local simulate (original logic moved here)
  batchPreviewList.value = batchPreviewList.value.length ? batchPreviewList.value : allRooms.value.filter((r:any)=>roomIds.includes(String(r.roomId))).map(r=>({ ...r, _status:'pending', _error:'' }))
  for (const item of batchPreviewList.value) {
    try {
      if (!item.roomId) throw new Error('房间ID 缺失')
      const rec = { meterNo: generateMeterNo(), meterName: `${batchForm.value.meterType}-${item.roomId}`, meterType: batchForm.value.meterType, roomId: item.roomId, customerId: item.customerId, roomName: item.roomName, multiple: batchForm.value.multiple || 1, enabled: true, remark: '', startDate: batchForm.value.startDate, reading: 0, chargeItem: batchForm.value.meterType === '水表' ? '水费' : '', formulaName: batchForm.value.formulaName || '', unitPrice: batchForm.value.unitPrice }
      const exists = metersData.value.find((m:any)=>m.roomId === item.roomId && m.meterType === rec.meterType)
      if (exists) { item._status = 'failed'; item._error = '该房间已有相同类型仪表，已跳过' }
      else { metersData.value.push(rec); item._status = 'success' }
      await new Promise((res)=>setTimeout(res, 60))
    } catch (err:any) { item._status = 'failed'; item._error = err?.message || '未知错误' }
  }
  batchLoading.value = false
  // compute results
  const succ = batchPreviewList.value.filter((p:any)=>p._status === 'success').length
  const fail = batchPreviewList.value.filter((p:any)=>p._status === 'failed').length
  const failedList = batchPreviewList.value.filter((p:any)=>p._status === 'failed')
  // refresh preview list to ensure UI updates
  batchPreviewList.value = batchPreviewList.value.map((x:any)=>({ ...x }))

  // show modal with summary and failed details (if any)
  Modal.info({
    title: '批量生成结果',
    content: h('div', [
      h('p', `成功：${succ} 条，失败：${fail} 条`),
      fail ? h('div', failedList.map((f:any)=> h('div', `${f.roomId}：${f._error || '未知错误'}`))) : null
    ]),
    onOk() {}
  })
  message.success('批量生成完成')
}

function openPreviewEdit(record:any) {
  // populate meter form for editing and open modal
  meterForm.value = {
    roomId: record.roomId,
    roomName: record.roomName,
    customerId: record.customerId || '',
    meterType: record.meterType || batchForm.value.meterType || '水表',
    meterNo: record.meterNo || generateMeterNo(),
    meterName: record.meterName || `${record.meterType||'水表'}-${record.roomId}`,
    multiple: record.multiple || 1,
    enabled: true,
    remark: '',
    startDate: record.startDate || null,
    reading: 0,
    chargeItem: record.chargeItem || '',
    formulaName: record.formulaName || '',
    unitPrice: record.unitPrice || 0
  }
  isCreating.value = true
  meterModalVisible.value = true
}

function removePreviewRow(record:any) {
  const idx = batchPreviewList.value.findIndex((r:any)=>r.roomId === record.roomId)
  if (idx >= 0) batchPreviewList.value.splice(idx, 1)
}
</script>

<style scoped>
.meter-layout { display:flex; height:100vh }
.tree-panel { width:300px; border-right:1px solid #eee; padding:12px; background:#fff; box-sizing:border-box; overflow:auto }
.splitter { width:8px; cursor:col-resize; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0)); border-radius:4px }
.data-panel { flex:1; padding:12px; height:100vh; overflow:auto }
.table-wrapper { height: calc(100vh - 120px); overflow-y: auto; }
.modal-body-scroll { max-height: calc(48vh); overflow-y: auto; padding-right:6px }
.modal-footer-fixed { position: sticky; bottom: 0; right: 0; width: 100%; background: #fff; display:flex; justify-content:flex-end; align-items:center; padding:8px 12px; z-index: 10; border-top: 1px solid #f0f0f0 }
.compact-modal .ant-modal-content { padding: 6px 10px }
.compact-modal .ant-modal-header { padding: 6px 10px }
.compact-modal .ant-modal-title { font-size: 13px }
.compact-modal .ant-modal-body { padding: 6px }
.compact-modal .ant-form-item-label > label { font-size: 11px }
.compact-modal .ant-input, .compact-modal .ant-select-selector, .compact-modal .ant-input-number { height: 26px; line-height: 26px }
.compact-modal .ant-btn { padding: 0 8px; height: 28px }
/* 强制覆盖 AntD Modal 宽度，确保 compact 模态实际变窄 */
.ant-modal.compact-modal, .compact-modal.ant-modal, .compact-modal .ant-modal {
  width: 520px !important;
  max-width: 520px !important;
}
.switch-text { font-size: 12px; color: #666 }
</style>

