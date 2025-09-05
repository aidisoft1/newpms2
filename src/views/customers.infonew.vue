<template>
  <div class="repair-page">
    <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
      <a-button size="small" @click="colSettingVisible = true">字段设置</a-button>
      <a-button size="small" @click="groupModalVisible = true">分组</a-button>
      <a-button size="small" @click="filterModalVisible = true">筛选</a-button>
      <a-button size="small" @click="resetSort">排序</a-button>
      <a-button size="small" type="primary" @click="onAdd">新增报修</a-button>
      <a-button size="small" @click="exportCsv">导出 CSV</a-button>
    </div>

    <a-table
      :columns="visibleColumns"
      :data-source="displayData"
      :pagination="{ pageSize: 20 }"
      row-key="id"
      size="small"
      bordered
      :rowClassName="() => 'repair-row'"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.dataIndex === 'completionImages'">
          <div style="display:flex; gap:6px; align-items:center">
            <img v-for="(img, i) in (record.completionImages || [])" :key="i" :src="img" style="width:40px; height:40px; object-fit:cover; border-radius:4px" />
            <a-button size="small" @click="() => uploadImage(record)">上传</a-button>
          </div>
        </div>
        <div v-else-if="column.dataIndex === 'priority'">
          <a-tag :color="priorityColor(record.priority)">{{ record.priority }}</a-tag>
        </div>
        <div v-else>
          {{ renderCell(record, column.dataIndex) }}
        </div>
      </template>
    </a-table>

	<template>
		<div class="repair-page">
			<div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
				<a-button size="small" @click="colSettingVisible = true">字段设置</a-button>
				<a-button size="small" @click="groupModalVisible = true">分组</a-button>
				<a-button size="small" @click="filterModalVisible = true">筛选</a-button>
				<a-button size="small" type="primary" @click="onAdd">新增报修</a-button>
				<a-button size="small" @click="exportCsv">导出 CSV</a-button>
			</div>

			<a-table
				:columns="visibleColumns"
				:data-source="displayData"
				:pagination="{ pageSize: 50 }"
				row-key="id"
				size="small"
				bordered
			>
				<template #bodyCell="{ column, record }">
					<div v-if="column.dataIndex === 'completionImages'">
						<div style="display:flex; gap:6px; align-items:center">
							<img v-for="(img, i) in (record.completionImages || [])" :key="i" :src="img" style="width:40px; height:40px; object-fit:cover; border-radius:4px" />
							<a-button size="small" @click="() => uploadImage(record)">上传</a-button>
						</div>
					</div>
					<div v-else-if="column.dataIndex === 'priority'">
						<a-tag :color="priorityColor(record.priority)">{{ record.priority }}</a-tag>
					</div>
					<div v-else>
						{{ record[column.dataIndex] }}
					</div>
				</template>
			</a-table>

			<!-- 字段设置抽屉 -->
			<a-drawer v-model:visible="colSettingVisible" title="字段设置" placement="right" :width="360">
				<div style="display:flex; gap:8px; margin-bottom:12px">
					<a-input v-model:value="fieldSearch" placeholder="搜索字段" allow-clear />
					<template>
						<div class="repair-page">
							<div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
								<a-button size="small" @click="colSettingVisible = true">字段设置</a-button>
								<a-button size="small" @click="groupModalVisible = true">分组</a-button>
								<a-button size="small" @click="filterModalVisible = true">筛选</a-button>
								<a-button size="small" type="primary" @click="onAdd">新增报修</a-button>
								<a-button size="small" @click="exportCsv">导出 CSV</a-button>
							</div>

							<a-table
								:columns="visibleColumns"
								:data-source="displayData"
								:pagination="{ pageSize: 50 }"
								row-key="id"
								size="small"
								bordered
							>
								<template #bodyCell="{ column, record }">
									<div v-if="column.dataIndex === 'completionImages'">
										<div style="display:flex; gap:6px; align-items:center">
											<img v-for="(img, i) in (record.completionImages || [])" :key="i" :src="img" style="width:40px; height:40px; object-fit:cover; border-radius:4px" />
											<a-button size="small" @click="() => uploadImage(record)">上传</a-button>
										</div>
									</div>
									<div v-else-if="column.dataIndex === 'priority'">
										<a-tag :color="priorityColor(record.priority)">{{ record.priority }}</a-tag>
									</div>
									<div v-else>
										{{ record[column.dataIndex] }}
									</div>
								</template>
							</a-table>

							<!-- 字段设置抽屉 -->
							<a-drawer v-model:visible="colSettingVisible" title="字段设置" placement="right" :width="360">
								<div style="display:flex; gap:8px; margin-bottom:12px">
									<a-input v-model:value="fieldSearch" placeholder="搜索字段" allow-clear />
									<a-button @click="showAllFields">全显</a-button>
								</div>
								<div style="display:flex; flex-direction:column; gap:8px">
									<div v-for="col in filteredFieldList" :key="col.dataIndex" style="display:flex; justify-content:space-between; align-items:center">
										<div style="display:flex; gap:8px; align-items:center">
											<a-checkbox :checked="!hiddenMap[col.dataIndex]" @change="() => toggleColumn(col.dataIndex)"></a-checkbox>
											<span>{{ col.title }}</span>
										</div>
										<div style="min-width:70px; text-align:right">{{ hiddenMap[col.dataIndex] ? '隐藏' : '显示' }}</div>
									</div>
								</div>
							</a-drawer>

							<!-- 分组弹窗（简单示例） -->
							<template>
								<div class="repair-page">
									<div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px">
										<a-button size="small" @click="colSettingVisible = true">字段设置</a-button>
										<a-button size="small" @click="groupModalVisible = true">分组</a-button>
										<a-button size="small" @click="filterModalVisible = true">筛选</a-button>
										<a-button size="small" type="primary" @click="onAdd">新增报修</a-button>
										<a-button size="small" @click="exportCsv">导出 CSV</a-button>
									</div>

									<a-table :columns="visibleColumns" :data-source="displayData" row-key="id" size="small" bordered>
										<template #bodyCell="{ column, record }">
											<div v-if="column.dataIndex === 'completionImages'">
												<div style="display:flex; gap:6px; align-items:center">
													<img v-for="(img, i) in (record.completionImages || [])" :key="i" :src="img" style="width:40px; height:40px; object-fit:cover; border-radius:4px" />
													<a-button size="small" @click="() => uploadImage(record)">上传</a-button>
												</div>
											</div>
											<div v-else-if="column.dataIndex === 'priority'">
												<a-tag :color="priorityColor(record.priority)">{{ record.priority }}</a-tag>
											</div>
											<div v-else>
												{{ record[column.dataIndex] }}
											</div>
										</template>
									</a-table>

									<a-drawer v-model:visible="colSettingVisible" title="字段设置" placement="right" :width="360">
										<div style="display:flex; gap:8px; margin-bottom:12px">
											<a-input v-model:value="fieldSearch" placeholder="搜索字段" allow-clear />
											<a-button @click="showAllFields">全显</a-button>
										</div>
										<div style="display:flex; flex-direction:column; gap:8px">
											<div v-for="col in filteredFieldList" :key="col.dataIndex" style="display:flex; justify-content:space-between; align-items:center">
												<div style="display:flex; gap:8px; align-items:center">
													<a-checkbox :checked="!hiddenMap[col.dataIndex]" @change="() => toggleColumn(col.dataIndex)"></a-checkbox>
													<span>{{ col.title }}</span>
												</div>
												<div style="min-width:70px; text-align:right">{{ hiddenMap[col.dataIndex] ? '隐藏' : '显示' }}</div>
											</div>
										</div>
									</a-drawer>

									<a-modal v-model:visible="groupModalVisible" title="分组" :footer="null">
										<a-form layout="vertical">
											<a-form-item label="按字段分组">
												<a-select v-model:value="groupField" placeholder="选择分组字段">
													<a-select-option v-for="c in groupableFields" :key="c.dataIndex" :value="c.dataIndex">{{ c.title }}</a-select-option>
												</a-select>
											</a-form-item>
											<a-form-item>
												<a-button type="primary" @click="applyGroup">应用分组</a-button>
												<a-button style="margin-left:8px" @click="clearGroup">清除分组</a-button>
											</a-form-item>
										</a-form>
									</a-modal>

									<a-drawer v-model:visible="filterModalVisible" title="筛选" placement="right" :width="360">
										<a-form layout="vertical">
											<a-form-item label="房间编号">
												<a-input v-model:value="filterForm.roomId" />
											</a-form-item>
											<a-form-item label="客户编号">
												<a-input v-model:value="filterForm.customerId" />
											</a-form-item>
											<a-form-item>
												<a-button type="primary" @click="applyFilter">应用筛选</a-button>
												<a-button style="margin-left:8px" @click="clearFilter">清除</a-button>
											</a-form-item>
										</a-form>
									</a-drawer>
								</div>
							</template>

							<script setup lang="ts">
							import { ref, computed } from 'vue'

							const allFields = [
								{ dataIndex: 'roomId', title: '房间编号' },
								{ dataIndex: 'customerId', title: '客户编号' },
								{ dataIndex: 'customerName', title: '客户名称' },
								{ dataIndex: 'phone', title: '联系电话' },
								{ dataIndex: 'priority', title: '优先级' },
								{ dataIndex: 'serviceCategory', title: '服务分类' },
								{ dataIndex: 'appointmentTime', title: '预约上门时间' },
								{ dataIndex: 'faultCategory', title: '故障类别' },
								{ dataIndex: 'repairStart', title: '上门维修开始时间' },
								{ dataIndex: 'repairEnd', title: '维修结束时间' },
								{ dataIndex: 'completionImages', title: '完工图片' },
								{ dataIndex: 'closeTime', title: '工单关闭时间' },
							]

							const hiddenMap = ref<Record<string, boolean>>({})
							allFields.forEach(f => { hiddenMap.value[f.dataIndex] = false })

							const colSettingVisible = ref(false)
							const groupModalVisible = ref(false)
							const filterModalVisible = ref(false)

							const fieldSearch = ref('')
							const filterForm = ref({ roomId: '', customerId: '' })

							const data = ref<any[]>([])
							for (let i = 1; i <= 30; i++) {
								data.value.push({
									id: i,
									roomId: `A-${Math.ceil(i/2)}`,
									customerId: `CUST${1000 + i}`,
									customerName: `客户 ${i}`,
									phone: `1380000${String(100 + i).slice(-3)}`,
									priority: i % 3 === 0 ? '高' : i % 3 === 1 ? '中' : '低',
									serviceCategory: i % 2 === 0 ? '水电' : '门禁',
									appointmentTime: '',
									faultCategory: i % 2 === 0 ? '漏水' : '无法开门',
									repairStart: '',
									repairEnd: '',
									completionImages: [],
									closeTime: '',
								})
							}

							const displayData = ref([...data.value])

							const filteredFieldList = computed(() => {
								const q = fieldSearch.value.trim().toLowerCase()
								return allFields.filter(f => !q || f.title.toLowerCase().includes(q) || f.dataIndex.toLowerCase().includes(q))
							})

							const visibleColumns = computed(() => {
								return allFields
									.filter(f => !hiddenMap.value[f.dataIndex])
									.map(f => ({ title: f.title, dataIndex: f.dataIndex, key: f.dataIndex, width: 160, ellipsis: true }))
							})

							const groupableFields = allFields
							const groupField = ref('')

							function toggleColumn(dataIndex: string) { hiddenMap.value[dataIndex] = !hiddenMap.value[dataIndex] }
							function showAllFields() { allFields.forEach(f => { hiddenMap.value[f.dataIndex] = false }) }

							function exportCsv() {
								const cols = allFields.filter(f => !hiddenMap.value[f.dataIndex])
								const headers = cols.map(c => c.title)
								const rows = displayData.value.map(r => cols.map(c => r[c.dataIndex] ?? ''))
								const csv = headers.join(',') + '\n' + rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n')
								const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
								const link = document.createElement('a')
								link.href = URL.createObjectURL(blob)
								link.setAttribute('download', '报修导出.csv')
								document.body.appendChild(link)
								link.click()
								document.body.removeChild(link)
							}

							function applyFilter() {
								const { roomId, customerId } = filterForm.value
								displayData.value = data.value.filter(r => {
									if (roomId && !String(r.roomId).includes(roomId)) return false
									if (customerId && !String(r.customerId).includes(customerId)) return false
									return true
								})
								filterModalVisible.value = false
							}

							function clearFilter() { filterForm.value.roomId = ''; filterForm.value.customerId = ''; displayData.value = [...data.value] }

							function applyGroup() {
								if (!groupField.value) return
								const key = groupField.value
								const map: Record<string, any[]> = {}
								data.value.forEach(r => { const k = r[key] ?? '__空__'; (map[k] || (map[k] = [])).push(r) })
								const out: any[] = []
								Object.keys(map).forEach(k => { out.push({ id: `g-${k}`, isGroup: true, [key]: k, children: map[k] }) })
								displayData.value = out
								groupModalVisible.value = false
							}

							function clearGroup() { displayData.value = [...data.value]; groupModalVisible.value = false }

							function uploadImage(record: any) {
								const input = document.createElement('input')
								input.type = 'file'
								input.accept = 'image/*'
								input.onchange = () => {
									const file = input.files && input.files[0]
									if (!file) return
									const reader = new FileReader()
									reader.onload = () => { record.completionImages = record.completionImages || []; record.completionImages.push(reader.result as string) }
									reader.readAsDataURL(file)
								}
								input.click()
							}

							function priorityColor(p: string) { if (p === '高') return 'red'; if (p === '中') return 'orange'; return 'green' }

							function onAdd() { const id = data.value.length + 1; const rec = { id, roomId: '', customerId: `CUST${1000 + id}`, customerName: '', phone: '', priority: '中', serviceCategory: '', appointmentTime: '', faultCategory: '', repairStart: '', repairEnd: '', completionImages: [], closeTime: '' }; data.value.unshift(rec); displayData.value = [...data.value] }

							</script>

							<style scoped>
							.repair-page { padding: 12px }
							.toolbar { margin-bottom: 8px }
							.repair-row .ant-table-cell { padding: 6px 8px }
							</style>
