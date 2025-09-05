
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
        <div v-if="selectedBuilding">
          <h2>楼宇详情</h2>
          <a-descriptions bordered column="1">
            <a-descriptions-item label="管理区编号">{{ selectedBuilding.managementAreaId }}</a-descriptions-item>
            <a-descriptions-item label="楼宇编号">{{ selectedBuilding.id }}</a-descriptions-item>
            <a-descriptions-item label="楼宇名称">{{ selectedBuilding.name }}</a-descriptions-item>
            <a-descriptions-item label="地址">{{ selectedBuilding.address }}</a-descriptions-item>
            <a-descriptions-item label="楼宇类型">{{ selectedBuilding.type }}</a-descriptions-item>
            <a-descriptions-item label="楼宇结构">{{ selectedBuilding.structure }}</a-descriptions-item>
            <a-descriptions-item label="楼宇朝向">{{ selectedBuilding.orientation }}</a-descriptions-item>
            <a-descriptions-item label="备注">{{ selectedBuilding.remark }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <div v-else>
          <p>请选择楼宇查看详细信息</p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TreeDataItem } from 'ant-design-vue/es/tree';

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

function onSelect(selectedKeys: string[]) {
  if (!selectedKeys.length) {
    selectedBuilding.value = null;
    return;
  }
  const key = selectedKeys[0];
  for (const area of managementAreas) {
    const building = area.buildings.find(b => b.id === key);
    if (building) {
      selectedBuilding.value = building;
      return;
    }
  }
  selectedBuilding.value = null;
}
</script>

<style scoped>
.building-tree-layout {
  padding: 24px;
}
</style>
