<template>
  <div class="public-consult-page">
    <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:12px;">
      <a-button type="primary" size="small" @click="createNewConsult">新增事件</a-button>
      <a-button size="small" @click="fieldSettingsVisible = true">字段设置</a-button>
      <a-button size="small" @click="groupVisible = true">分组</a-button>
      <a-button v-if="groupField" size="small" @click="clearGroup">取消分组</a-button>
      <a-button size="small" @click="filterVisible = true">筛选</a-button>
      <a-button size="small" @click="columnFilterVisible = true">列筛选</a-button>
      <a-button size="small" @click="onSort">排序</a-button>
      <a-button size="small" type="primary" @click="exportCsv">导出CSV</a-button>
      <a-button size="small" @click="importCsv">导入CSV</a-button>
    </div>
    

              <!-- 列筛选 Drawer -->
              <a-drawer v-model:visible="columnFilterVisible" title="列筛选" placement="right" :width="420">
                <div style="display:flex; flex-direction:column; gap:12px">
                  <div v-for="f in allFieldsVisible" :key="f.key" style="border-bottom:1px dashed #f0f0f0; padding-bottom:8px">
                    <div style="display:flex; align-items:center">
                      <div style="font-weight:600">{{ f.title }}</div>
                    </div>
                    <div style="margin-top:8px">
                      <a-input :value="(colFilters[f.key] && colFilters[f.key].q) || ''" placeholder="包含" @input="onColInput($event, f.key)" @pressEnter="applyColumnFromDrawer(f.key)" />
                    </div>
                    <div v-if="f.key === 'status'" style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">
                      <a-tag v-for="s in statusOptions" :key="s" :color="statusColor(s)" @click="() => (colFilters[f.key] = colFilters[f.key] || {}, colFilters[f.key].eq = s)">{{ s }}</a-tag>
                    </div>
                    <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
                      <a-select v-if="uniqueValuesFor(f.key).length" :value="(colFilters[f.key] && colFilters[f.key].eq) || undefined" @change="onColSelectChange($event, f.key)" allow-clear placeholder="相等">
                        <a-select-option v-for="v in uniqueValuesFor(f.key)" :key="v" :value="v">{{ v }}</a-select-option>
                      </a-select>
                      <a-button size="small" @click="() => onColSetPresent(f.key, true)">已填写</a-button>
                      <a-button size="small" @click="() => onColSetPresent(f.key, false)">未填写</a-button>
                    </div>
                    <div v-if="f.key === 'appointmentTime'" style="margin-top:8px">
                      <a-range-picker :value="colRange[f.key] || undefined" @change="onColRangeChange($event, f.key)" style="width:100%" />
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px">
                      <a-button size="small" @click="clearColumnFromDrawer(f.key)">清除</a-button>
                      <a-button type="primary" size="small" @click="applyColumnFromDrawer(f.key)">应用</a-button>
                    </div>
                  </div>
                  <div style="display:flex; justify-content:space-between; padding-top:8px">
                    <a-button @click="clearAllColumnFilters">全部清除</a-button>
                    <a-button type="primary" @click="applyAllColumnFilters">应用全部</a-button>
                  </div>
                </div>
              </a-drawer>

              <!-- 编辑 Modal -->
              <a-modal v-model:visible="editModalVisible" title="编辑紧急事件" :width="720" :bodyStyle="{ maxHeight: '70vh', overflow: 'auto', padding: '16px 20px' }" @ok="saveEditModal" @cancel="closeEditModal" :destroyOnClose="true" @afterClose="onEditModalAfterClose" centered>
                <a-form layout="vertical" class="edit-form">
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                    <a-form-item label="状态">
                      <a-select size="small" v-model:value="editingRow.status" allow-clear>
                        <a-select-option value="新建">新建</a-select-option>
                        <a-select-option value="处理中">处理中</a-select-option>
                        <a-select-option value="待确认">待确认</a-select-option>
                        <a-select-option value="已解决">已解决</a-select-option>
                        <a-select-option value="已关闭">已关闭</a-select-option>
                      </a-select>
                    </a-form-item>

                    <a-form-item label="房间编号">
                      <a-select size="small" v-model:value="editingRow.roomId" @change="onRoomSelectChange" allow-clear>
                        <a-select-option v-for="r in roomsList" :key="r" :value="r">{{ r }}</a-select-option>
                      </a-select>
                    </a-form-item>

                    <a-form-item label="客户编号">
                      <a-input size="small" v-model:value="editingRow.customerId" />
                    </a-form-item>

                    <a-form-item label="客户名称">
                      <a-input size="small" v-model:value="editingRow.customerName" />
                    </a-form-item>

                    <a-form-item label="联系电话">
                      <a-input size="small" v-model:value="editingRow.phone" />
                    </a-form-item>

                    <a-form-item label="优先级">
                      <a-select size="small" v-model:value="editingRow.priority">
                        <a-select-option value="低">低</a-select-option>
                        <a-select-option value="中">中</a-select-option>
                        <a-select-option value="高">高</a-select-option>
                      </a-select>
                    </a-form-item>

                    <a-form-item label="事件类型">
                      <div style="display:flex; gap:8px; align-items:center">
                        <a-select size="small" v-model:value="editingRow.serviceCategory" style="flex:1">
                          <a-select-option v-for="s in serviceCategoryOptions" :key="s" :value="s">{{ s }}</a-select-option>
                        </a-select>
                        <a-button size="small" @click="openManageService">管理</a-button>
                      </div>
                    </a-form-item>

                    <a-form-item label="预约上门时间">
                      <a-date-picker size="small" show-time style="width:100%" v-model:value="editingRow.appointmentTime" />
                    </a-form-item>

                    <a-form-item label="处理说明">
                      <a-input size="small" v-model:value="editingRow.description" />
                    </a-form-item>

                    <a-form-item label="处理开始时间">
                      <a-date-picker size="small" show-time style="width:100%" v-model:value="editingRow.visitStartTime" />
                    </a-form-item>

                    <a-form-item label="处理结束时间">
                      <a-date-picker size="small" show-time style="width:100%" v-model:value="editingRow.repairEndTime" />
                    </a-form-item>

                    <a-form-item label="关闭时间">
                      <a-date-picker size="small" show-time style="width:100%" v-model:value="editingRow.orderCloseTime" />
                    </a-form-item>

                    <a-form-item label="图片" style="grid-column: span 2;">
                      <a-upload list-type="picture-card" :file-list="editingRow._fileList || []" :customRequest="handleUpload" @remove="handleRemove">
                        <div style="display:flex; flex-direction:column; align-items:center; font-size:12px;">
                          <div style="font-size:18px; line-height:18px;">＋</div>
                          <div style="font-size:12px">上传</div>
                        </div>
                      </a-upload>
                      <div style="color:#888; font-size:12px; margin-top:6px">支持多图上传，图片将以 Base64 存储（仅示例，生产请接入文件服务）。</div>
                    </a-form-item>

                  </div>
                </a-form>
              </a-modal>

              <!-- 图片预览 Modal -->
              <a-modal v-model:visible="previewVisible" title="图片预览" footer="" :width="600" @cancel="closePreview">
                <div style="text-align:center"><img :src="previewSrc" style="max-width:100%; max-height:70vh;" /></div>
              </a-modal>

              <!-- 管理事件类型 Modal -->
              <a-modal v-model:visible="manageServiceVisible" title="管理事件类型" @ok="saveManageService" @cancel="manageServiceVisible=false">
                <div style="display:flex; flex-direction:column; gap:8px">
                  <div v-for="(s, idx) in tmpServiceList" :key="idx" style="display:flex; gap:8px; align-items:center">
                    <a-input v-model:value="tmpServiceList[idx]" />
                    <a-button size="small" danger @click="() => removeServiceAt(idx)">删除</a-button>
                  </div>
                  <div style="display:flex; gap:8px">
                    <a-button @click="addServiceEmpty">新增一项</a-button>
                  </div>
                </div>
              </a-modal>

  <!-- 主内容：分组视图或表格 -->
  <div style="margin-top:12px">
    <div v-if="groupField">
      <div v-for="(rows, g) in groupedData" :key="g" style="margin-bottom:12px">
        <a-card size="small">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <div style="font-weight:600">{{ groupFieldLabel }}: {{ g }} （{{ rows.length }}）</div>
            <div>
              <a-button size="small" @click="toggleGroupCollapse(g)">{{ collapsedGroups[g] ? '展开' : '收起' }}</a-button>
            </div>
          </div>
          <div v-show="!collapsedGroups[g]">
            <a-table :columns="antColumns" :data-source="rowsWithIndex(rows)" row-key="id" size="small" :pagination="{ pageSize: 10 }" :scroll="{ x: scrollX }" @change="onTableChange"></a-table>
          </div>
        </a-card>
      </div>
    </div>
    <div v-else>
      <a-table :columns="antColumns" :data-source="tableData" row-key="id" size="small" :pagination="{ pageSize: 20 }" :scroll="{ x: scrollX }" @change="onTableChange"></a-table>
    </div>
  </div>

            </div>
          </template>

          <script setup lang="ts">
          import { ref, reactive, computed, watch, onMounted, h } from 'vue'
          import { message } from 'ant-design-vue'

          // fields adapted for 紧急事件响应
          const allFields = ref([
            { key: 'status', title: '状态', visible: true, groupable: true },
            { key: 'roomId', title: '事件地点', visible: true, groupable: true },
            { key: 'customerId', title: '上报人编号', visible: true, groupable: false },
            { key: 'customerName', title: '上报人姓名', visible: true, groupable: false },
            { key: 'phone', title: '联系电话', visible: true, groupable: false },
            { key: 'priority', title: '优先级', visible: true, groupable: true },
            { key: 'serviceCategory', title: '事件类型', visible: true, groupable: true },
            { key: 'appointmentTime', title: '上报时间', visible: true, groupable: false },
            { key: 'description', title: '事件描述', visible: true, groupable: false },
            { key: 'visitStartTime', title: '响应开始时间', visible: true, groupable: false },
            { key: 'repairEndTime', title: '响应结束时间', visible: true, groupable: false },
            { key: 'completionImages', title: '附件', visible: true, groupable: false },
            { key: 'orderCloseTime', title: '关闭时间', visible: true, groupable: false }
          ])

          const filtersMap = reactive<Record<string, any>>({})
          const popVisible = reactive<Record<string, boolean>>({})

          function uniqueValuesFor(key: string) {
            const set = new Set<string>()
            for (const r of consultData.value) set.add(String(r[key] ?? ''))
            return Array.from(set).filter(v => v !== '')
          }

          function formatFilterSummary(key: string) {
            const cond = filtersMap[key]
            if (!cond) return h('div', { style: 'color:#888; font-size:12px' }, '未设置筛选')
            const parts: any[] = []
            if (cond.q) parts.push(h('a-tag', { color: 'default' }, () => `包含: ${String(cond.q)}`))
            if (cond.eq) parts.push(h('a-tag', { color: 'blue' }, () => `等于: ${String(cond.eq)}`))
            if (cond.present === true) parts.push(h('a-tag', { color: 'green' }, () => `已填写`))
            if (cond.present === false) parts.push(h('a-tag', { color: 'red' }, () => `未填写`))
            return h('div', { style: 'display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px' }, parts)
          }

          const fieldSettingsVisible = ref(false)
          const fieldSearch = ref('')
          const tableKey = ref(0)
          const sortState = reactive({ columnKey: '', order: '' })

          // sample data
          const consultData = ref<any[]>([])
          // emergency-specific statuses and sample data
          const _statuses = ['新建','已接警','出警中','处理中','已解决','已关闭']
          const _types = ['火警','医疗救援','治安事件','设备故障','其它']
          for (let i = 1; i <= 24; i++) {
            consultData.value.push({
              id: i,
              status: _statuses[i % _statuses.length],
              roomId: '楼栋' + ((i % 5) + 1) + ' - 单元' + ((i % 10) + 1),
              customerId: 'RPT' + (300 + i),
              customerName: '上报人' + i,
              phone: '1381000' + String(300 + i),
              priority: i % 3 === 0 ? '高' : (i % 3 === 1 ? '中' : '低'),
              serviceCategory: _types[i % _types.length],
              appointmentTime: new Date().toISOString(),
              description: i % 2 === 0 ? '现场烟雾报警，需立即处理' : '有人昏厥需医疗救援',
              visitStartTime: '',
              repairEndTime: '',
              completionImages: [],
              orderCloseTime: ''
            })
          }

          const filteredFields = computed(() => {
            const q = String(fieldSearch.value || '').trim().toLowerCase()
            return allFields.value.filter(f => f.title.toLowerCase().includes(q) || f.key.toLowerCase().includes(q))
          })

          function toggleField(key: string, visible: boolean) {
            const f = allFields.value.find(x => x.key === key)
            if (f) f.visible = !!visible
            tableKey.value++
          }

          function showAllFields() { allFields.value.forEach(f => f.visible = true); message.success('已显示全部字段') }
          function onFieldSwitchChange(key: string) { return (checked: boolean) => toggleField(key, checked) }

          // filters / drawers
          const filterVisible = ref(false)
          const columnFilterVisible = ref(false)
          const allFieldsVisible = computed(() => allFields.value.filter(f => f.visible))
          const colFilters = reactive<Record<string, any>>({})
          const colRange = reactive<Record<string, any>>({})

          function ensureColState(key: string) {
            if (!colFilters[key]) colFilters[key] = { ...(filtersMap[key] || {}) }
            if (!colRange[key] && filtersMap[key] && filtersMap[key].range) colRange[key] = [new Date(filtersMap[key].range.start), new Date(filtersMap[key].range.end)]
          }

          function applyColumnFromDrawer(key: string) {
            ensureColState(key)
            const cond = { ...(colFilters[key] || {}) }
            if (colRange[key]) cond.range = { start: colRange[key][0], end: colRange[key][1] }
            if (!Object.keys(cond).length) { delete filtersMap[key]; return }
            filtersMap[key] = cond
          }

          function clearColumnFromDrawer(key: string) { delete colFilters[key]; delete colRange[key]; delete filtersMap[key] }
          function clearAllColumnFilters() { for (const k of Object.keys(filtersMap)) delete filtersMap[k] }
          function applyAllColumnFilters() { for (const f of allFieldsVisible.value) { ensureColState(f.key); applyColumnFromDrawer(f.key) } columnFilterVisible.value = false }

          function onColInput(e: Event, key: string) { const target = e && (e as any).target; const v = target ? target.value : ''; colFilters[key] = colFilters[key] || {}; colFilters[key].q = v }
          function onColSelectChange(v: any, key: string) { colFilters[key] = colFilters[key] || {}; colFilters[key].eq = v }
          function onColSetPresent(key: string, val: boolean) { colFilters[key] = colFilters[key] || {}; colFilters[key].present = val }
          function onColRangeChange(dates: any, key: string) { if (!dates) { delete colRange[key]; return } const s = dates[0] ? (dates[0].toDate ? dates[0].toDate() : new Date(dates[0])) : null; const e = dates[1] ? (dates[1].toDate ? dates[1].toDate() : new Date(dates[1])) : null; colRange[key] = s && e ? [s, e] : undefined }

          const filterForm = reactive({ status: '', roomId: '', customerId: '', customerName: '', priority: '' })
          const debouncedFilter = reactive({ status: '', roomId: '', customerId: '', customerName: '', priority: '' })
          let _filterTimer: any = null
          watch(() => ({ ...filterForm }), (nv) => { if (_filterTimer) clearTimeout(_filterTimer); _filterTimer = setTimeout(() => { debouncedFilter.roomId = nv.roomId || ''; debouncedFilter.customerId = nv.customerId || ''; debouncedFilter.customerName = nv.customerName || ''; debouncedFilter.priority = nv.priority || '' }, 300) }, { deep: true })

          function applyFilter() { filterVisible.value = false }
          function resetFilter() { filterForm.status=''; filterForm.roomId = ''; filterForm.customerId = ''; filterForm.customerName = ''; filterForm.priority = ''; debouncedFilter.status=''; debouncedFilter.roomId=''; debouncedFilter.customerId=''; debouncedFilter.customerName=''; debouncedFilter.priority=''; }

          // grouping
          const groupVisible = ref(false)
          const groupField = ref('')
          const collapsedGroups = reactive({} as Record<string, boolean>)
          const groupableFields = computed(() => allFields.value.filter(f => f.groupable))
          const groupFieldLabel = computed(() => { const f = allFields.value.find(x => x.key === groupField.value); return f ? f.title : '' })
          function applyGroup() { groupVisible.value = false }
          function toggleGroupCollapse(g: string) { collapsedGroups[g] = !collapsedGroups[g] }
          function clearGroup() { groupField.value = '' }

          watch(allFields, () => { tableKey.value++ }, { deep: true })

          const groupedData = computed(() => {
            if (!groupField.value) return {}
            const map: Record<string, any[]> = {}
            for (const r of tableData.value) {
              const key = String(r[groupField.value] ?? '未关联')
              if (!map[key]) map[key] = []
              map[key].push(r)
            }
            return map
          })

          const roomsList = ref<string[]>(consultData.value.map(r => r.roomId))
          const roomMap = reactive<Record<string, any>>({})
          for (const r of consultData.value) roomMap[r.roomId] = { customerId: r.customerId, customerName: r.customerName, phone: r.phone }

          const serviceCategoryOptions = ref<string[]>(Array.from(new Set(consultData.value.map((r:any) => r.serviceCategory))).filter(Boolean))
          const manageServiceVisible = ref(false)
          const tmpServiceList = ref<string[]>([])
          function openManageService() { tmpServiceList.value = [...serviceCategoryOptions.value]; manageServiceVisible.value = true }
          function saveManageService() { serviceCategoryOptions.value = tmpServiceList.value.filter(Boolean); manageServiceVisible.value = false }
          function addServiceEmpty() { tmpServiceList.value.push('') }
          function removeServiceAt(i:number) { tmpServiceList.value.splice(i,1) }

          function onRoomSelectChange(val: string) { if (!editingRow.value) return; const m = roomMap[val]; if (m) { editingRow.value.customerId = m.customerId; editingRow.value.customerName = m.customerName; editingRow.value.phone = m.phone } }

          const statusOptions = ['新建','已接警','出警中','处理中','已解决','已关闭']
          function statusColor(s: string) { switch (s) { case '新建': return 'blue'; case '已接警': return 'purple'; case '出警中': return 'orange'; case '处理中': return 'gold'; case '已解决': return 'green'; case '已关闭': return 'gray'; default: return 'default' } }

          function rowsWithIndex(rows: any[]) { return rows.map((r, idx) => ({ ...r, rowIndex: idx + 1 })) }

          const antColumns = computed(() => {
            const cols: any[] = []
            cols.push({ title: '序号', dataIndex: 'rowIndex', key: '_serial', width: 70, align: 'center' })
            for (const f of allFields.value.filter(x => x.visible)) {
              let titleVNode: any = f.title
              const key = f.key
              if (key !== 'rowIndex') {
                const active = !!filtersMap[key]
                const onInput = (e: any) => { filtersMap[key] = filtersMap[key] || {}; filtersMap[key].q = e.target.value }
                const onInputKey = () => { applyColumnFromDrawer(key) }
                const popContent = h('div', { style: 'width:320px; padding:8px' }, [ formatFilterSummary(key), h('div', { style: 'margin-bottom:6px' }, [ h('a-input', { placeholder: '搜索', value: (filtersMap[key] && filtersMap[key].q) || '', onInput, onPressEnter: onInputKey }) ]), h('div', { style: 'display:flex; gap:8px; justify-content:flex-end; margin-top:8px' }, [ h('a-button', { size: 'small', onClick: () => { clearColumnFromDrawer(key) } }, '清除'), h('a-button', { type: 'primary', size: 'small', onClick: () => { applyColumnFromDrawer(key) } }, '应用') ]) ])
                if (popVisible[key] === undefined) popVisible[key] = false
                titleVNode = h('div', { style: 'display:flex; align-items:center; gap:6px; white-space:nowrap' }, [ h('span', f.title), h('a-popover', { content: popContent, trigger: 'click', placement: 'bottom', visible: popVisible[key], 'onUpdate:visible': (v: boolean) => { popVisible[key] = v } }, { default: () => h('a', { style: `cursor:pointer; font-size:12px; color:${active ? '#1890ff' : '#666'}` }, '筛选') }) ])
              }
              let renderFn: any = (text: any) => text
              if (f.key === 'completionImages') {
                renderFn = (_: any, record: any) => {
                  const imgs = Array.isArray(record.completionImages) ? record.completionImages : []
                  const nodes: any[] = imgs.slice(0, 3).map((u: string, i: number) => h('img', { src: u, style: 'width:40px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer;margin-right:6px', onClick: () => openPreview(u), key: `${record.id}-img-${i}` }))
                  if (imgs.length > 3) nodes.push(h('span', { style: 'font-size:12px;color:#888' }, `+${imgs.length - 3}`))
                  return h('div', { style: 'display:flex; align-items:center' }, nodes)
                }
              } else if (f.key === 'status') {
                renderFn = (_: any, record: any) => { const s = record.status || ''; return h('a-tag', { color: statusColor(s) }, () => s) }
              }
              const col: any = { title: titleVNode, dataIndex: f.key, key: f.key, sorter: true, render: renderFn }
              if (sortState.columnKey === f.key) col.sortOrder = sortState.order
              cols.push(col)
            }
            cols.push({ title: '操作', key: '_actions', fixed: 'right', width: 140, customRender: (_: any, record: any) => { return h('div', { style: 'display:flex; gap:8px; justify-content:flex-end' }, [ h('a-button', { size: 'small', onClick: () => openEditModal(record) }, '编辑'), h('a-button', { size: 'small', danger: true, onClick: () => onDeleteRow(record) }, '删除') ]) } })
            return cols
          })

          const scrollX = computed(() => { try { const cols = antColumns.value ? antColumns.value.length : 8; const w = Math.max(cols * 160, 800); return `${w}px` } catch (e) { return '1200px' } })

          const tableData = computed(() => {
            let list = consultData.value.filter(r => {
              if (debouncedFilter.roomId && !String(r.roomId).includes(debouncedFilter.roomId)) return false
              if (debouncedFilter.customerId && !String(r.customerId).includes(debouncedFilter.customerId)) return false
              if (debouncedFilter.customerName && !String(r.customerName).includes(debouncedFilter.customerName)) return false
              if (debouncedFilter.priority && String(r.priority) !== String(debouncedFilter.priority)) return false
              for (const k of Object.keys(filtersMap)) {
                const cond = filtersMap[k]
                if (!cond) continue
                const val = r[k]
                if (cond.q && String(val ?? '').toLowerCase().indexOf(String(cond.q).toLowerCase()) === -1) return false
                if (cond.eq && String(val) !== String(cond.eq)) return false
                if (cond.present === true && (val === null || val === undefined || val === '')) return false
                if (cond.present === false && (val !== null && val !== undefined && val !== '')) return false
                if (k === 'appointmentTime' && cond.range) {
                  const t = val ? new Date(val) : null
                  if (!t) return false
                  const s = new Date(cond.range.start)
                  const e = new Date(cond.range.end)
                  if (t < s || t > e) return false
                }
              }
              return true
            })

            if (sortState.columnKey) {
              const key = sortState.columnKey
              const order = sortState.order
              list = list.slice().sort((a: any, b: any) => {
                const va = a[key]
                const vb = b[key]
                const na = parseFloat(va); const nb = parseFloat(vb)
                let cmp = 0
                if (!isNaN(na) && !isNaN(nb)) cmp = na - nb
                else {
                  const da = va ? new Date(va) : null
                  const db = vb ? new Date(vb) : null
                  if (da && db && !isNaN(da.getTime()) && !isNaN(db.getTime())) cmp = da.getTime() - db.getTime()
                  else cmp = String(va ?? '').localeCompare(String(vb ?? ''))
                }
                return order === 'descend' ? -cmp : cmp
              })
            }

            return list.map((r, idx) => ({ ...r, rowIndex: idx + 1 }))
          })

          const previewVisible = ref(false)
          const previewSrc = ref('')
          function openPreview(src: string) { previewSrc.value = src; previewVisible.value = true }
          function closePreview() { previewVisible.value = false; previewSrc.value = '' }

          function onSort() { message.info('排序使用表头列的排序功能（点击列头）') }

          function onTableChange(pagination: any, filters: any, sorter: any) {
            try {
              if (!sorter) { sortState.columnKey = ''; sortState.order = ''; return }
              if (Array.isArray(sorter)) sorter = sorter[0]
              sortState.columnKey = sorter.columnKey || sorter.field || ''
              sortState.order = sorter.order || ''
              tableKey.value++
            } catch (e) { console.warn('onTableChange error', e) }
          }

          function onDeleteRow(row: any) { if (!confirm('确认删除该行吗？')) return; const idx = consultData.value.findIndex(r => r.id === row.id); if (idx >= 0) consultData.value.splice(idx, 1); tableKey.value++; message.success('已删除') }

          function exportCsv() { const headers = ['序号', ...allFields.value.filter(f => f.visible).map(f => f.title)]; const rows = tableData.value.map(r => allFields.value.filter(f => f.visible).map(f => r[f.key] ?? '')); const csv = [headers.join(','), ...rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', '紧急事件导出.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link) }
          function importCsv() { message.info('导入功能暂为占位') }

          const editModalVisible = ref(false)
          const editingRow = ref<any>(null)
          function openEditModal(row: any) { const clone = { ...row }; const dateFields = ['appointmentTime', 'visitStartTime', 'repairEndTime', 'orderCloseTime']; for (const df of dateFields) { const v = clone[df]; if (!v) clone[df] = undefined; else { try { clone[df] = new Date(v) } catch (e) { clone[df] = undefined } } } if (Array.isArray(clone.completionImages)) clone.completionImagesText = JSON.stringify(clone.completionImages); editingRow.value = clone; editModalVisible.value = true }
          function createNewConsult() { const newRow: any = { id: Date.now(), roomId: '', customerId: '', customerName: '', phone: '', priority: '', serviceCategory: '', appointmentTime: undefined, description: '', visitStartTime: undefined, repairEndTime: undefined, completionImages: [], orderCloseTime: undefined }; editingRow.value = newRow; editModalVisible.value = true }

          function saveEditModal() {
            if (!editingRow.value) return
            const payload: any = { ...(editingRow.value || {}) }
            const dateFields = ['appointmentTime', 'visitStartTime', 'repairEndTime', 'orderCloseTime']
            for (const df of dateFields) {
              const v = payload[df]
              if (v && v.toDate) { try { payload[df] = v.toDate().toISOString() } catch (e) { payload[df] = new Date(v).toISOString() } }
              else if (v instanceof Date) payload[df] = v.toISOString()
              else if (!v) payload[df] = ''
            }
            if (payload.completionImagesText) {
              try { const parsed = JSON.parse(payload.completionImagesText); if (Array.isArray(parsed)) payload.completionImages = parsed; else payload.completionImages = [] } catch (e) { payload.completionImages = [] }
              delete payload.completionImagesText
            }
            const idx = consultData.value.findIndex(r => r.id === payload.id)
            if (idx >= 0) consultData.value[idx] = { ...consultData.value[idx], ...payload }
            else consultData.value.push(payload)
            editModalVisible.value = false
            tableKey.value++
            message.success('已保存')
          }

          function closeEditModal() { editModalVisible.value = false }
          function onEditModalAfterClose() { editingRow.value = null; try { const masks = document.querySelectorAll('.ant-modal-mask'); masks.forEach(m => m.parentElement && m.parentElement.removeChild(m)); document.body.classList.remove('ant-modal-open') } catch (e) { console.warn('modal cleanup failed', e) } }

          async function fileToBase64(file: File) { return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) }) }
          async function handleUpload({ file, onSuccess }: any) { try { const b64 = await fileToBase64(file); if (!editingRow.value) return; if (!editingRow.value._fileList) editingRow.value._fileList = []; const item = { uid: Date.now() + '', name: file.name, url: b64 }; editingRow.value._fileList.push(item); editingRow.value.completionImages = (editingRow.value.completionImages || []).concat([b64]); if (onSuccess) onSuccess(null) } catch (e) { console.warn('upload failed', e) } }
          function handleRemove(file: any) { if (!editingRow.value) return; const uid = file.uid || file.url; editingRow.value._fileList = (editingRow.value._fileList || []).filter((f: any) => f.uid !== uid && f.url !== uid); editingRow.value.completionImages = (editingRow.value.completionImages || []).filter((u: any) => u !== file.url) }

          </script>

          <style scoped>
          .public-consult-page { padding: 12px }
          .toolbar { margin-bottom: 12px }
          .edit-form .ant-form-item-label > label { font-weight:600; color:#333 }
          .edit-form .ant-form-item { margin-bottom:8px }
          .ant-upload-list-picture-card .ant-upload-list-item { width:52px; height:52px }
          .ant-upload-list-picture-card .ant-upload-list-item img { width:52px; height:52px; object-fit:cover }
          </style>