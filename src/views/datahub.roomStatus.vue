<template>
  <div class="room-status-main">
    <div class="room-status-title">房态示意图</div>
    <div class="room-status-header">
      <a-space>
        <a-select v-model:value="selectedArea" style="width: 120px" placeholder="管理区">
          <a-select-option value="">全部管理区</a-select-option>
          <a-select-option v-for="area in areas" :key="area" :value="area">{{ area }}</a-select-option>
        </a-select>
        <a-select v-model:value="selectedBuilding" style="width: 120px" placeholder="楼宇">
          <a-select-option value="">全部楼宇</a-select-option>
          <a-select-option v-for="building in buildings" :key="building" :value="building">{{ building }}</a-select-option>
        </a-select>
        <a-select v-model:value="selectedRoom" style="width: 120px" placeholder="房间">
          <a-select-option value="">全部房间</a-select-option>
          <a-select-option v-for="room in rooms" :key="room" :value="room">{{ room }}</a-select-option>
        </a-select>
        <a-select v-model:value="selectedStatus" style="width: 120px" placeholder="房间状态">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option v-for="status in statusOptions" :key="status.value" :value="status.value">
            <span :style="{color: status.color}">●</span> {{ status.label }}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="queryRooms">查询</a-button>
      </a-space>
    </div>
    <div class="room-status-body">
      <div class="room-blocks">
        <div v-for="room in filteredRooms" :key="room.number" :class="['room-block', room.status]">
          <span class="room-block-text">{{ room.number }}</span>
        </div>
      </div>
    </div>
    <div class="room-status-board">
      <div class="board-title">数据看板</div>
      <div class="board-items">
        <div class="board-item">
          <div class="board-value">{{ stats.occupancyRate }}%</div>
          <div class="board-label">入住率</div>
        </div>
        <div class="board-item">
          <div class="board-value">{{ stats.vacancyRate }}%</div>
          <div class="board-label">空置率</div>
        </div>
        <div class="board-item">
          <div class="board-value">{{ stats.vacantOver3Months }}</div>
          <div class="board-label">超三个月空置房</div>
        </div>
        <div class="board-item">
          <div class="board-value">{{ stats.repairRepeatRate }}%</div>
          <div class="board-label">重复报修占比</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
export default defineComponent({
  name: 'RoomStatusDataView',
  setup() {
    // 筛选项
    const areas = ref(['一区', '二区'])
    const buildings = ref(['A栋', 'B栋'])
    // 增加更多房间
    const rooms = ref([
      'A-1-101', 'A-1-102', 'A-1-103', 'A-1-104', 'A-1-105',
      'A-2-201', 'A-2-202', 'A-2-203', 'A-2-204', 'A-2-205',
      'B-1-101', 'B-1-102', 'B-1-103', 'B-1-104', 'B-1-105',
      'B-2-201', 'B-2-202', 'B-2-203', 'B-2-204', 'B-2-205'
    ])
    const statusOptions = ref([
      { value: 'rented', label: '已租', color: '#e6fffb' },    // 绿色卡片背景
      { value: 'unrented', label: '未租', color: '#fffbe6' },  // 黄色卡片背景
      { value: 'occupied', label: '入住', color: '#e6f7ff' },  // 蓝色卡片背景
      { value: 'vacant', label: '空置', color: '#f5f5f5' },    // 灰色卡片背景
      { value: 'reserved', label: '预定', color: '#fff0f6' }   // 红橙色卡片背景
    ])
    const selectedArea = ref('')
    const selectedBuilding = ref('')
    const selectedRoom = ref('')
    const selectedStatus = ref('')
    // 房间数据
    // 随机分配房间状态
    const statusList = ['rented', 'unrented', 'occupied', 'vacant', 'reserved']
    function getRandomStatus() {
      return statusList[Math.floor(Math.random() * statusList.length)]
    }
    const allRooms = ref(
      rooms.value.map(number => ({ number, status: getRandomStatus() }))
    )
    // 与缴费数据页面一致的色系
    const statusColorMap: Record<string, string> = {
      rented:   '#e6fffb', // 已租 绿色卡片背景
      unrented: '#fffbe6', // 未租 黄色卡片背景
      occupied: '#e6f7ff', // 入住 蓝色卡片背景
      vacant:   '#f5f5f5', // 空置 灰色卡片背景
      reserved: '#fff0f6'  // 预定 红橙色卡片背景
    }
    const filteredRooms = computed(() => {
      return allRooms.value
        .filter(r => !selectedArea.value || r.number.startsWith(selectedArea.value[0]))
        .filter(r => !selectedBuilding.value || r.number.startsWith(selectedBuilding.value[0]))
        .filter(r => !selectedRoom.value || r.number === selectedRoom.value)
        .filter(r => !selectedStatus.value || r.status === selectedStatus.value)
        .map(r => ({ ...r, statusColor: statusColorMap[r.status] }))
    })
    function queryRooms() {
      // 实际项目可在此发起后端请求
    }
    // 数据看板示例数据
    const stats = ref({
      occupancyRate: 85.2,
      vacancyRate: 14.8,
      vacantOver3Months: 3,
      repairRepeatRate: 7.5
    })
    return {
      areas, buildings, rooms, statusOptions,
      selectedArea, selectedBuilding, selectedRoom, selectedStatus,
      filteredRooms, queryRooms, stats
    }
  }
})
</script>

<style scoped>
/* 房态数据页面样式，已清理所有语法错误 */
.room-status-main {
  margin: 0 auto;
  max-width: 1100px;
  background: none;
  padding: 0 8px;
}
.room-status-title {
  font-size: 17px;
  font-weight: 500;
  color: #222;
  margin-bottom: 8px;
}
.room-status-header {
  margin-bottom: 16px;
}
.room-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.room-block {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.1s;
}
.room-block.rented {
  background: #e6fffb;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.room-block.unrented {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}
.room-block.occupied {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}
.room-block.reserved {
  background: #fff0f6;
  color: #ff6f61;
  border: 1px solid #ffadd2;
}
.room-block.vacant {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #e4e4e4;
}
.room-block-text {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.5px;
}
.room-block:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.room-status-board {
  margin-top: 32px;
  background: #f7f9fa;
  border-radius: 8px;
  padding: 18px 12px 8px 12px;
}
.board-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}
.board-items {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.board-item {
  min-width: 120px;
  margin-bottom: 10px;
}
.board-value {
  font-size: 22px;
  font-weight: 600;
  color: #1890ff;
}
.board-label {
  font-size: 13px;
  color: #666;
}
</style>
