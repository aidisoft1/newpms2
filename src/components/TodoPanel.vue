
<template>
  <div class="todo-wrap">
  <a-card class="todo-card" :bordered="false">
      <div class="todo-header">
        <div class="title">待办事项</div>
        <div class="controls">
          <a-button type="text" @click="toggleExpand">
            <span v-if="expanded">收起</span>
            <span v-else>展开</span>
          </a-button>
        </div>
      </div>

      <div class="todo-body" v-show="expanded">
        <div class="cols">
          <div class="col">
            <div class="col-header">
              <span class="icon-bg icon-bg-red"><AlertOutlined class="col-icon" /></span>
              <div class="col-title">紧急报修待处理</div>
              <a-badge :count="repairs.total" style="margin-left:auto" />
            </div>
            <ul class="items">
              <li v-for="r in repairs.items" :key="r">{{ r }}</li>
            </ul>
            <a-row justify="end"><a-button type="link" @click="viewAll('repairs')">查看全部</a-button></a-row>
          </div>

          <div class="col">
            <div class="col-header">
              <span class="icon-bg icon-bg-blue"><FileDoneOutlined class="col-icon" /></span>
              <div class="col-title">合同待审核</div>
              <a-badge :count="contracts.total" style="margin-left:auto" />
            </div>
            <ul class="items">
              <li v-for="c in contracts.items" :key="c">{{ c }}</li>
            </ul>
            <a-row justify="end"><a-button type="link" @click="viewAll('contracts')">查看全部</a-button></a-row>
          </div>

          <div class="col">
            <div class="col-header">
              <span class="icon-bg icon-bg-green"><SafetyCertificateOutlined class="col-icon" /></span>
              <div class="col-title">住户认证申请</div>
              <a-badge :count="auths.total" style="margin-left:auto" />
            </div>
            <ul class="items">
              <li v-for="a in auths.items" :key="a">{{ a }}</li>
            </ul>
            <a-row justify="end"><a-button type="link" @click="viewAll('auths')">查看全部</a-button></a-row>
          </div>
        </div>
      </div>

      <div class="todo-collapsed" v-show="!expanded">
        <div class="summary">
          <span>报修 {{ repairs.total }} • 合同 {{ contracts.total }} • 认证 {{ auths.total }}</span>
          <a-button type="link" @click="toggleExpand">展开详情</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AlertOutlined, FileDoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'TodoPanel',
  components: { AlertOutlined, FileDoneOutlined, SafetyCertificateOutlined },
  setup() {
    const router = useRouter()
    const expanded = ref(true)

    const repairs = { total: 3, items: ['报修一', '报修二', '报修三'] }
    const contracts = { total: 15, items: ['合同一', '合同二', '合同三'] }
    const auths = { total: 8, items: ['住户一', '住户二', '住户三'] }

    function toggleExpand() {
      expanded.value = !expanded.value
    }

    function viewAll(type: string) {
      if (type === 'repairs') router.push('/repairs').catch(() => {})
      else if (type === 'contracts') router.push('/contracts').catch(() => {})
      else if (type === 'auths') router.push('/auths').catch(() => {})
    }

    return { expanded, repairs, contracts, auths, toggleExpand, viewAll }
  }
})
</script>

<style scoped>
.todo-card { width:100%; border-radius:8px; background: #fff }
.todo-header { display:flex; align-items:center; justify-content:space-between; padding-bottom:6px }
.title { font-weight:700; color:#1f2d3d }
.cols { display:flex; gap:12px }
.col { flex:1; background: linear-gradient(180deg,#fff,#fbfdff); border-radius:6px; padding:10px; box-shadow: 0 4px 12px rgba(20,30,50,0.04) }
.col-header { display:flex; align-items:center; gap:8px; margin-bottom:8px }
.col-icon { font-size:22px; color:#fff; vertical-align:middle }
.icon-bg {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:36px;
  height:36px;
  border-radius:50%;
  margin-right:6px;
  box-shadow:0 2px 8px rgba(0,0,0,0.08);
}
.icon-bg-red {
  background:linear-gradient(135deg,#ff7875,#ff4d4f 80%);
}
.icon-bg-blue {
  background:linear-gradient(135deg,#69c0ff,#1890ff 80%);
}
.icon-bg-green {
  background:linear-gradient(135deg,#95de64,#52c41a 80%);
}
.col-title { font-weight:600 }
.items { margin:0; padding-left:16px; color:#444 }
.items li { margin:6px 0 }
.todo-collapsed { padding:8px 0 }
.summary { display:flex; justify-content:space-between; align-items:center }
</style>
