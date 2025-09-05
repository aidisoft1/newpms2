<template>
  <div class="periodic-fee-page">
    <div class="fee-layout">
      <!-- 左侧树状结构 -->
      <div class="tree-panel" :style="{ width: sidebarWidth + 'px' }" ref="treePanelRef">
        <div style="padding:8px; display:flex; gap:8px; align-items:center">
          <a-input v-model:value="treeSearch" placeholder="搜索 管理区/楼宇/房间（回车）" allow-clear @keyup.enter="onTreeSearchEnter" />
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
      <!-- 右侧数据表格 -->
      <div class="data-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <div>
            <a-space>
              <a-button type="primary" @click="openBatchModal">批量调整</a-button>
              <a-button @click="onImport">导入</a-button>
              <a-button @click="onExport">导出</a-button>
            </a-space>
          </div>
          <div>
            <a-input-search v-model:value="tableSearch" placeholder="搜索 房间编号/客户编号/客户名称" @search="onTableSearch" style="width:320px" />
          </div>
        </div>
        <div class="table-wrapper">
          <a-table
            :columns="feeColumns"
            :data-source="displayFees"
            row-key="id"
            size="small"
            :pagination="{ pageSize: 20 }"
            :scroll="{ x: 1800 }"
          >
            <template #bodyCell="slotProps">
              <template v-if="slotProps.column.key === 'actions'">
                <a-space>
                  <a-button type="link" size="small" @click="() => editFee(slotProps.record)">编辑</a-button>
                  <a-button type="link" size="small" danger @click="() => removeFee(slotProps.record)">删除</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <!-- 批量调整模态 -->
    <a-modal v-model:visible="batchModalVisible" title="批量费用调整" width="1000" :footer="null">
      <div style="display:flex; gap:12px;">
        <div style="width:320px; border-right:1px solid #f0f0f0; padding:8px 4px; box-sizing:border-box">
          <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center">
            <a-input v-model:value="batchTreeSearch" placeholder="树搜索（回车展开匹配）" @keyup.enter="onBatchTreeSearchEnter" style="flex:1" />
            <a-button size="small" @click="selectAllVisibleBatch">全选</a-button>
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
              <a-col :span="8">
                <a-form-item label="调整金额">
                  <a-input-number v-model:value="batchForm.amount" style="width:100%" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="调整原因">
                  <a-input v-model:value="batchForm.reason" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary" @click="onBatchAdjust">批量调整</a-button>
          </a-form>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchExpenses, createExpense, updateExpense, deleteExpense, type Expense } from '@/api/expenses'
import { message } from 'ant-design-vue'

const sidebarWidth = ref(260)
const treeSearch = ref('')
const tableSearch = ref('')
const treeData = ref([])
const expandedKeys = ref([])
const selectedKeys = ref([])
const displayFees = ref<Expense[]>([])
const feeColumns = [
  { title: 'ID', dataIndex: 'Id', key: 'Id', width: 60 },
  { title: '房间ID', dataIndex: 'Room_ID', key: 'Room_ID', width: 100 },
  { title: '客户ID', dataIndex: 'Customer_ID', key: 'Customer_ID', width: 100 },
  { title: '费用项ID', dataIndex: 'ExpItem_ID', key: 'ExpItem_ID', width: 100 },
  { title: '日期', dataIndex: 'FDate', key: 'FDate', width: 100 },
  { title: '金额', dataIndex: 'Amount', key: 'Amount', width: 80 },
  { title: '滞纳金', dataIndex: 'ZnjAmount', key: 'ZnjAmount', width: 80 },
  { title: '滞纳金起', dataIndex: 'ZnjBeginDate', key: 'ZnjBeginDate', width: 100 },
  { title: '滞纳金止', dataIndex: 'ZnjEndDate', key: 'ZnjEndDate', width: 100 },
  { title: '结清金额', dataIndex: 'EndAmount', key: 'EndAmount', width: 100 },
  { title: '备注', dataIndex: 'Note', key: 'Note', width: 120 },
  { title: '操作', key: 'actions', width: 120, customRender: () => null },
]
const batchModalVisible = ref(false)
const batchTreeSearch = ref('')
const batchCheckedKeys = ref([])
const batchForm = ref({ amount: 0, reason: '' })
const editingId = ref<number|null>(null)
const editRecord = ref<Partial<Expense>>({})

async function loadExpenses() {
  try {
    const res = await fetchExpenses()
    displayFees.value = res.data
  } catch (e) {
    message.error('加载费用数据失败')
  }
}

function onTreeSearchEnter(){}
function onTreeExpand(){}
function onSelect(){}
function onSplitterDown(){}
function openBatchModal(){ batchModalVisible.value = true }
function onImport(){}
function onExport(){}
function onTableSearch(){}

function editFee(record?: Expense) {
  if (!record) return
  editingId.value = record.Id
  editRecord.value = { ...record }
}

async function saveEdit() {
  if (!editingId.value) return
  try {
    await updateExpense(editingId.value, editRecord.value)
    message.success('保存成功')
    editingId.value = null
    loadExpenses()
  } catch (e) {
    message.error('保存失败')
  }
}

async function removeFee(record?: Expense) {
  if (!record) return
  try {
    await deleteExpense(record.Id)
    message.success('删除成功')
    loadExpenses()
  } catch (e) {
    message.error('删除失败')
  }
}

function onBatchTreeSearchEnter(){}
function selectAllVisibleBatch(){}
function clearBatchSelection(){}
function onBatchTreeCheck(){}
function onBatchAdjust(){}

onMounted(loadExpenses)
</script>

<style scoped>
.periodic-fee-page { height:100vh; }
.fee-layout { display:flex; height:100%; }
.tree-panel { background:#fafbfc; border-right:1px solid #f0f0f0; overflow:auto; transition:width .2s; }
.splitter { width:6px; cursor:col-resize; background:#f0f0f0; }
.data-panel { flex:1; padding:16px; overflow:auto; }
.table-wrapper { background:#fff; border-radius:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03); padding:12px; }
</style>
