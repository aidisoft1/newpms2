<template>
  <div class="urgent-wrap">
  <a-card class="diary" :bordered="false">
      <div class="diary-header">
        <div class="title">紧急任务提醒</div>
        <a-tag color="#f56a79">紧急</a-tag>
      </div>

      <div class="cards">
        <a-card size="small" class="task" bordered>
          <div class="task-left">
            <CalendarOutlined class="task-icon" />
          </div>
          <div class="task-body">
            <div class="task-title">3号楼消防系统年检</div>
            <div class="task-meta">剩余 2 天 • 请尽快安排检测流程、准备资料及协调资源</div>
          </div>
          <div class="task-actions">
            <a-button type="link" @click="openArrangeModal">安排</a-button>
          </div>
        </a-card>

        <a-card size="small" class="task" bordered>
          <div class="task-left">
            <ToolOutlined class="task-icon" />
          </div>
          <div class="task-body">
            <div class="task-title">A区空调主机维修</div>
            <div class="task-meta">今日截止 • 请及时完成维修，避免影响业主使用</div>
          </div>
          <div class="task-actions">
            <a-button type="link" @click="followUpMaintenance">跟进</a-button>
          </div>
        </a-card>

        <a-card size="small" class="task" bordered>
          <div class="task-left">
            <ExclamationCircleOutlined class="task-icon" />
          </div>
          <div class="task-body">
            <div class="task-title">业主投诉处理（#2024 - 089）</div>
            <div class="task-meta">需立即处理 • 请马上响应，维护物业与业主关系</div>
          </div>
          <div class="task-actions">
            <a-button type="link" @click="openComplaintModal">处理</a-button>
          </div>
        </a-card>
      </div>
    </a-card>

    <!-- Modals -->
  <a-modal v-model:visible="arrangeVisible" title="安排检测 — 3号楼消防系统年检" :confirmLoading="arrangeLoading" @ok="submitArrange" ok-text="确定" cancel-text="取消">
      <a-form :model="arrangeForm">
        <a-form-item label="负责人">
          <a-input v-model:value="arrangeForm.responsible" placeholder="输入负责人姓名" />
        </a-form-item>
        <a-form-item label="计划时间">
          <a-date-picker v-model:value="arrangeForm.scheduledAt" style="width:100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-model:value="arrangeForm.note" placeholder="可选备注" />
        </a-form-item>
      </a-form>
    </a-modal>

  <a-modal v-model:visible="complaintVisible" title="处理投诉 — #2024-089" :confirmLoading="complaintLoading" @ok="submitComplaint" ok-text="确定" cancel-text="取消">
      <a-form :model="complaintForm">
        <a-form-item label="处理结果">
          <a-textarea v-model:value="complaintForm.result" rows="4" />
        </a-form-item>
        <a-form-item label="是否需要上门">
          <a-switch v-model:checked="complaintForm.onSite" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CalendarOutlined, ToolOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  name: 'UrgentReminders',
  components: { CalendarOutlined, ToolOutlined, ExclamationCircleOutlined },
  setup() {
    const router = useRouter()

    // Arrange modal state
    const arrangeVisible = ref(false)
    const arrangeLoading = ref(false)
    const arrangeForm = reactive({ responsible: '', scheduledAt: null as any, note: '' })

    // Complaint modal state
    const complaintVisible = ref(false)
    const complaintLoading = ref(false)
    const complaintForm = reactive({ result: '', onSite: false })

    function openArrangeModal() {
      arrangeForm.responsible = ''
      arrangeForm.scheduledAt = null
      arrangeForm.note = ''
      arrangeVisible.value = true
    }

    async function submitArrange() {
      if (!arrangeForm.responsible) {
        message.error('请填写负责人')
        return
      }
      arrangeLoading.value = true
      try {
        // try to call backend (stub)
        await fetch('/api/workorders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'inspection',
            target: '3号楼消防系统年检',
            responsible: arrangeForm.responsible,
            scheduledAt: arrangeForm.scheduledAt,
            note: arrangeForm.note
          })
        })
        message.success('已创建工单并安排检测')
        arrangeVisible.value = false
        // navigate to workorders list or detail (adjust route as needed)
        router.push('/workorders').catch(() => {})
      } catch (e) {
        message.error('创建工单失败（请检查网络或后端）')
      } finally {
        arrangeLoading.value = false
      }
    }

    function followUpMaintenance() {
      // Navigate to maintenance workorder page (example route)
      router.push('/workorders/aircon').catch(() => {})
    }

    function openComplaintModal() {
      complaintForm.result = ''
      complaintForm.onSite = false
      complaintVisible.value = true
    }

    async function submitComplaint() {
      if (!complaintForm.result) {
        message.error('请填写处理结果')
        return
      }
      complaintLoading.value = true
      try {
        await fetch('/api/complaints/2024-089/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: complaintForm.result, onSite: complaintForm.onSite })
        })
        message.success('投诉已处理')
        complaintVisible.value = false
        router.push('/complaints/2024-089').catch(() => {})
      } catch (e) {
        message.error('提交处理失败')
      } finally {
        complaintLoading.value = false
      }
    }

    return {
      openArrangeModal,
      arrangeVisible,
      arrangeForm,
      arrangeLoading,
      submitArrange,
      followUpMaintenance,
      openComplaintModal,
      complaintVisible,
      complaintForm,
      complaintLoading,
      submitComplaint
    }
  }
})
</script>

<style scoped>
.urgent-wrap { display:flex; align-items:center }
.diary { width:360px; background: linear-gradient(180deg, #ffffff, #fcfdff); border-radius:8px; box-shadow: 0 6px 18px rgba(20,30,50,0.06) }
.diary-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
.diary-header .title { font-weight:700; color:#1f2d3d }
.cards { display:flex; flex-direction:column; gap:8px }
.task { display:flex; align-items:center; padding:8px }
.task-left { width:36px; display:flex; justify-content:center }
.task-icon { font-size:18px; color:#1890ff }
.task-body { flex:1; padding-left:8px }
.task-title { font-weight:600; color:#17202a }
.task-meta { font-size:12px; color:#666; margin-top:4px }
.task-actions { width:56px; text-align:right }

/* Comfortable pastel accents */
.task:nth-child(1) .task-icon { color:#2f54eb }
.task:nth-child(2) .task-icon { color:#52c41a }
.task:nth-child(3) .task-icon { color:#fa8c16 }

@media (max-width: 900px) {
  .diary { display:none }
}
</style>
