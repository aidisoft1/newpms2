
<template>
  <div class="building-tree-layout">
    <a-row gutter="16">
      <a-col :span="6">
        <a-tree
          :tree-data="treeData"
          :default-expand-all="true"
          @select="onSelect"
        />
      </a-col>
      <a-col :span="18">
        <div v-if="selectedArea">
          <h2>{{ selectedArea.name }}下所有楼宇</h2>
          <div style="overflow-x: auto;">
            <a-table
              :data-source="selectedArea.buildings"
              :columns="columns"
              row-key="id"
              bordered
              :pagination="false"
              :scroll="{ x: 1200 }"
            />
          </div>
        </div>
        <div v-else-if="selectedBuilding">
          <h2>楼宇详情</h2>
          <a-descriptions bordered column="1">
            <a-descriptions-item label="管理区编号">{{ selectedBuilding.managementAreaId }}</a-descriptions-item>
            <a-descriptions-item label="楼宇编号">{{ selectedBuilding.id }}</a-descriptions-item>
            <a-descriptions-item label="楼宇名称">{{ selectedBuilding.name }}</a-descriptions-item>
            <a-descriptions-item label="地址">{{ selectedBuilding.address }}</a-descriptions-item>
            <a-descriptions-item label="楼宇类型">{{ selectedBuilding.type }}</a-descriptions-item>
            <a-descriptions-item label="楼宇结构">{{ selectedBuilding.structure }}</a-descriptions-item>
            <a-descriptions-item label="楼宇朝向">{{ selectedBuilding.orientation }}</a-descriptions-item>
            <a-descriptions-item label="备注">
              {{ selectedBuilding.remark }}
              <a-button type="link" size="small" @click="onEdit(selectedBuilding)" style="margin-left:8px;">编辑</a-button>
              <a-button type="link" size="small" danger @click="onDelete(selectedBuilding)">删除</a-button>
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div v-else>
          <p>请选择楼宇或管理区查看详细信息</p>
        </div>
      </a-col>
    </a-row>
  </div>
  <a-modal v-model:open="editModal.visible" title="编辑楼宇" @ok="handleEditOk" @cancel="editModal.visible = false">
  <a-form v-if="editModal.building" layout="vertical">
    <a-form-item label="管理区编号">
      <a-input v-model:value="editModal.building.managementAreaId" disabled />
    </a-form-item>
    <a-form-item label="楼宇编号">
      <a-input v-model:value="editModal.building.id" disabled />
    </a-form-item>
    <a-form-item label="楼宇名称">
      <a-input v-model:value="editModal.building.name" />
    </a-form-item>
    <a-form-item label="地址">
      <a-input v-model:value="editModal.building.address" />
    </a-form-item>
    <a-form-item label="楼宇类型">
      <a-input v-model:value="editModal.building.type" />
    </a-form-item>
    <a-form-item label="楼宇结构">
      <a-input v-model:value="editModal.building.structure" />
    </a-form-item>
    <a-form-item label="楼宇朝向">
      <a-input v-model:value="editModal.building.orientation" />
    </a-form-item>
    <a-form-item label="备注">
      <a-input v-model:value="editModal.building.remark" />
    </a-form-item>
  </a-form>
  <div v-else>无数据</div>
</a-modal>
</template>

<script setup lang="ts">
import { h, reactive } from 'vue';

const editModal = reactive({
  visible: false,
  building: null as any,
});

function onEdit(building: any) {
  editModal.visible = true;
  editModal.building = { ...building };
}

function onDelete(building: any) {
  if (confirm('确定要删除楼宇：' + building.name + ' 吗？')) {
    const area = managementAreas.find(a => a.id === building.managementAreaId);
    if (area) {
      area.buildings = area.buildings.filter((b: any) => b.id !== building.id);
      if (selectedArea.value && selectedArea.value.id === area.id) {
        selectedArea.value = { ...area };
      }
    }
  }
}

function handleEditOk() {
  const area = managementAreas.find(a => a.id === editModal.building.managementAreaId);
  if (area) {
    const idx = area.buildings.findIndex((b: any) => b.id === editModal.building.id);
    if (idx > -1) {
      area.buildings[idx] = { ...editModal.building };
      if (selectedArea.value && selectedArea.value.id === area.id) {
        selectedArea.value = { ...area };
      }
    }
  }
  editModal.visible = false;
}


// 示例数据
const managementAreas = [
  {
    id: 'MA001',
    name: '管理区A',
    buildings: [
      {
        id: 'B001',
        name: 'A区1号楼',
        address: 'A区1号',
        type: '住宅',
        structure: '框架',
        orientation: '南',
        remark: '无',
        managementAreaId: 'MA001',
      },
      {
        id: 'B002',
        name: 'A区2号楼',
        address: 'A区2号',
        type: '写字楼',
        structure: '砖混',
        orientation: '东',
        remark: '新建',
        managementAreaId: 'MA001',
      },
    ],
  },
  {
    id: 'MA002',
    name: '管理区B',
    buildings: [
      {
        id: 'B003',
        name: 'B区1号楼',
        address: 'B区1号',
        type: '住宅',
        structure: '框架',
        orientation: '西',
        remark: '老楼',
        managementAreaId: 'MA002',
      },
    ],
  },
];

const treeData = managementAreas.map(area => ({
  title: area.name,
  key: area.id,
  children: area.buildings.map(b => ({
    title: b.name,
    key: b.id,
    isLeaf: true,
  })),
}));

const selectedBuilding = ref<any>(null);
const selectedArea = ref<any>(null);

const columns = [
  { title: '管理区编号', dataIndex: 'managementAreaId', key: 'managementAreaId' },
  { title: '楼宇编号', dataIndex: 'id', key: 'id' },
  { title: '楼宇名称', dataIndex: 'name', key: 'name' },
  { title: '地址', dataIndex: 'address', key: 'address' },
  { title: '楼宇类型', dataIndex: 'type', key: 'type' },
  { title: '楼宇结构', dataIndex: 'structure', key: 'structure' },
  { title: '楼宇朝向', dataIndex: 'orientation', key: 'orientation' },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    customRender({ record }: any) {
      return h('span', {}, [
        record.remark,
        h(
          'a-button',
          {
            type: 'link',
            size: 'small',
            style: 'margin-left:8px;',
            onClick: () => onEdit(record),
          },
          { default: () => '编辑' }
        ),
        h(
          'a-button',
          {
            type: 'link',
            size: 'small',
            danger: true,
            onClick: () => onDelete(record),
          },
          { default: () => '删除' }
        ),
      ]);
    },
  },
];
function onSelect(selectedKeys: string[]) {
  selectedBuilding.value = null;
  selectedArea.value = null;
  if (!selectedKeys.length) return;
  const key = selectedKeys[0];
  // 先查管理区
  const area = managementAreas.find(a => a.id === key);
  if (area) {
    selectedArea.value = area;
    return;
  }
  // 查楼宇
  for (const area of managementAreas) {
    const building = area.buildings.find(b => b.id === key);
    if (building) {
      selectedBuilding.value = building;
      return;
    }
  }
}
// 注册 a-button 组件（仅 script setup 语法下需要）
defineProps();
</script>

<style scoped>
.building-tree-layout {
  padding: 24px;
}
</style>
