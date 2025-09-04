

<template>
	<div class="building-page">
		<div class="building-layout">
			<div class="tree-panel" ref="treePanelRef" :style="{ width: sidebarWidth + 'px' }">
				<div style="padding:6px 8px; display:flex; gap:8px; align-items:center;">
					<a-input v-model:value="treeSearch" placeholder="搜索 管理区 / 楼宇 / 房间（按 Enter 或点击 查询）" allow-clear @input="onTreeSearchInput" @keyup.enter="onTreeSearchEnter" style="flex:1" />
					<a-button type="primary" @click="onTreeSearchEnter">查询</a-button>
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
				<div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
					<div>
						<a-space>
							<a-button type="primary" @click="onAdd">新增客户</a-button>
							<a-button type="text" @click="openFilter">高级筛选</a-button>
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
							<a-select v-model:value="filterForm.area" :options="areaOptions" show-search allow-clear placeholder="管理区" style="min-width:140px" @change="onAreaChange" />
						</a-form-item>
						<a-form-item>
							<a-select v-model:value="filterForm.buildingName" :options="buildingOptions" show-search allow-clear placeholder="楼宇" style="min-width:140px" @change="onBuildingChange" />
						</a-form-item>
						<a-form-item>
							<a-select v-model:value="filterForm.roomId" :options="roomOptions" show-search allow-clear placeholder="房间" style="min-width:180px" />
						</a-form-item>
						<a-form-item>
							<a-select v-model:value="filterForm.customerName" :options="customerNameOptions" show-search allow-clear placeholder="客户姓名" style="min-width:140px" />
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
					row-key="customerId"
					bordered
					:scroll="{ x: 1800, y: 420 }"
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

				<a-modal v-model:visible="editModalVisible" title="编辑 / 新增 客户" :footer="null" @cancel="handleEditCancel" width="700px">
					<a-config-provider :locale="zhCN">
					<a-card size="small">
						<!-- 可滚动的表单容器，限定最大高度，溢出显示垂直滚动条 -->
						<div class="modal-body-scroll">
							<a-form :model="editForm" layout="vertical">
								<a-row :gutter="12">
									<a-col :span="12">
										<a-form-item label="客户编号">
											<a-input v-model:value="editForm.customerId" placeholder="请输入客户编号" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="联系人">
											<a-input v-model:value="editForm.contact" placeholder="请输入联系人" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="客户名称">
											<a-input v-model:value="editForm.customerName" placeholder="请输入客户名称" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="房间编号">
											<div style="display:flex; gap:6px; align-items:center;">
												<a-input v-model:value="editForm.roomCode" placeholder="请输入房间编号" :disabled="readOnlyMode" />
												<a-button size="small" @click="openRoomPicker" :disabled="readOnlyMode">选择</a-button>
											</div>
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="客户类型">
											<a-select v-model:value="editForm.customerType" placeholder="请选择客户类型" allow-clear :disabled="readOnlyMode">
												<a-select-option value="个人">个人</a-select-option>
												<a-select-option value="企业">企业</a-select-option>
											</a-select>
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="手机号">
											<a-input v-model:value="editForm.phone" placeholder="请输入手机号" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="通讯地址">
											<a-input v-model:value="editForm.address" placeholder="请输入通讯地址" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="联系电话">
											<a-input v-model:value="editForm.tel" placeholder="请输入联系电话" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="传真">
											<a-input v-model:value="editForm.fax" placeholder="请输入传真" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="出生年月">
											<a-date-picker v-model:value="editForm.birthday" style="width:100%" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="证件类型">
											<a-select v-model:value="editForm.idType" placeholder="请选择证件类型" allow-clear :disabled="readOnlyMode">
												<a-select-option value="身份证">身份证</a-select-option>
												<a-select-option value="护照">护照</a-select-option>
												<a-select-option value="其他">其他</a-select-option>
											</a-select>
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="身份证号">
											<a-input v-model:value="editForm.idNumber" placeholder="请输入身份证号" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="收楼日期">
											<a-date-picker v-model:value="editForm.moveInDate" style="width:100%" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="装修日期">
											<a-date-picker v-model:value="editForm.decorationDate" style="width:100%" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="银行编号">
											<a-input v-model:value="editForm.bankId" placeholder="请输入银行编号" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="账户名称">
											<a-input v-model:value="editForm.accountName" placeholder="请输入账户名称" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
									<a-col :span="12">
										<a-form-item label="银行账号">
											<a-input v-model:value="editForm.bankAccount" placeholder="请输入银行账号" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="12">
										<a-form-item label="开户支行">
											<a-input v-model:value="editForm.bankBranch" placeholder="请输入开户支行" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>

									<a-col :span="24">
										<a-form-item label="备注">
											<a-input v-model:value="editForm.remark" placeholder="请输入备注" :disabled="readOnlyMode" />
										</a-form-item>
									</a-col>
								</a-row>
							</a-form>
						</div>
						<!-- 底部固定操作栏 -->
					</a-card>
					</a-config-provider>
										<div class="modal-footer-fixed">
												<a-button @click="handleEditCancel" style="margin-right: 12px">取消</a-button>
												<template v-if="!readOnlyMode">
													<a-button type="primary" @click="handleEditOk">确定</a-button>
												</template>
												<template v-else>
													<!-- 只读模式，仅显示关闭按钮 -->
													<a-button type="primary" @click="handleEditCancel">关闭</a-button>
												</template>
										</div>
				</a-modal>

				<a-drawer v-model:visible="filterModalVisible" title="高级筛选" placement="right" :width="360" @close="cancelFilter">
					<a-form :model="filterForm" layout="vertical">
						<a-form-item label="客户编号">
							<a-select v-model:value="filterForm.customerId" :options="customerIdOptions" show-search :filter-option="false" allow-clear placeholder="可下拉选择或输入" style="width:100%" @search="onSearchCustomerId" :loading="loadingCustomerId" />
						</a-form-item>
						<a-form-item label="客户名称">
							<a-select v-model:value="filterForm.customerName" :options="customerNameOptions" show-search :filter-option="false" allow-clear placeholder="可下拉选择或输入" style="width:100%" @search="onSearchCustomerName" :loading="loadingCustomerName" />
						</a-form-item>
						<a-form-item label="楼宇名称">
							<a-input v-model:value="filterForm.buildingName" placeholder="可部分匹配" />
						</a-form-item>
						<a-form-item style="text-align:right; margin-top:12px">
							<a-button style="margin-right:8px" @click="resetFilter">重置</a-button>
							<a-button type="primary" @click="applyFilter">查询</a-button>
						</a-form-item>
					</a-form>
				</a-drawer>

				<!-- 房间选择器 -->
				<a-modal v-model:visible="roomPickerVisible" title="选择房间" width="880px" :footer="null" @cancel="()=>roomPickerVisible=false">
					<a-table :columns="roomPickerColumns" :data-source="roomPickerData" size="small" row-key="id" :loading="roomPickerLoading" :pagination="{pageSize:8}" @row-dblclick="handleRoomDoubleClick">
						<template #bodyCell="{ column, record }">
							<!-- 可在此加入自定义显示 -->
						</template>
					</a-table>
					<div style="display:flex; justify-content:flex-end; margin-top:12px;">
						<a-button size="small" style="margin-right:8px" @click="roomPickerVisible=false">取消</a-button>
						<a-button size="small" type="primary" @click="confirmRoomSelect">确定</a-button>
					</div>
				</a-modal>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, h, computed, watch, nextTick } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 设置 dayjs 为中文，保证 DatePicker 月份/星期显示中文
dayjs.locale('zh-cn')
import { FullscreenOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/antd.css'
import { Modal, message } from 'ant-design-vue'

// 注入主布局提供的全屏切换函数（可选）与标签页请求全屏
const toggleFullscreen = inject('toggleFullscreen') as (() => void) | undefined
const requestTabFullscreen = inject('requestTabFullscreen') as ((component?: any) => void) | undefined

// 树与表格数据
const treeData = ref([{ title: '全部', key: 'all', level: 0 }])
const flatNodes = ref<any[]>([])
const treeContainerRef = ref<HTMLElement | null>(null)
const itemHeight = 32
const overscan = 6
const scrollTop = ref(0)
const startIndex = ref(0)

function flattenTree(nodes: any[], depth = 0, out: any[] = []) {
	for (const n of nodes) {
		out.push({ node: n, depth })
		if (n.expanded && n.children && n.children.length && !n.placeholder) {
			flattenTree(n.children, depth + 1, out)
		}
	}
	return out
}

function isVNodeTitle(t: any) {
	return t && (typeof t === 'object' || typeof t === 'function')
}

function extractVNodeText(t: any) {
	try {
		if (!t) return ''
		if (typeof t === 'object') {
			if (t.children) {
				if (typeof t.children === 'string') return t.children
				if (Array.isArray(t.children)) {
					for (const c of t.children) {
						if (typeof c === 'string') return c
						if (c && c.children && typeof c.children === 'string') return c.children
						if (c && c.children && Array.isArray(c.children)) {
							const found = c.children.find((x: any) => typeof x === 'string')
							if (found) return found
						}
					}
				}
			}
			if (t.props && t.props.children) {
				if (typeof t.props.children === 'string') return t.props.children
			}
		}
	} catch (e) { }
	return ''
}

const visibleList = computed(() => {
	const total = flatNodes.value.length
	const container = treeContainerRef.value
	const containerHeight = container ? container.clientHeight : 600
	const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
	startIndex.value = start
	const visibleCount = Math.ceil(containerHeight / itemHeight)
	const end = Math.min(total, start + visibleCount + overscan * 2)
	return flatNodes.value.slice(start, end)
})

function updateFlat() { flatNodes.value = flattenTree(treeData.value) }

function onScroll(e: Event) { const el = e.target as HTMLElement; scrollTop.value = el.scrollTop }

function toggleNode(n: any) {
	if (!n) return
	if (!n.expanded) {
		if (n.children && n.children.length && n.children[0] && n.children[0].placeholder) {
			loadTreeData(n).then(() => { n.expanded = true; updateFlat() })
		} else if ((!n.children || n.children.length === 0) && !n.isLeaf) {
			loadTreeData(n).then(() => { n.expanded = true; updateFlat() })
		} else { n.expanded = true; updateFlat() }
	} else { n.expanded = false; updateFlat() }
}

const treeSearch = ref('')
const expandedKeys = ref<string[]>([])

function collectMatchKeys(nodes: any[], q: string, matches: string[], parents: string[] = []) {
	for (const n of nodes) {
		const rawTitle = n.meta?.areaName || n.meta?.buildingName || n.meta?.roomId || extractVNodeText(n.title) || String(n.title || '')
		const title = String(rawTitle)
		const key = String(n.key || '')
		const path = [...parents, key]
		if (title.toLowerCase().includes(q.toLowerCase())) { matches.push(...path) }
		if (n.children && n.children.length) collectMatchKeys(n.children, q, matches, path)
	}
}

// 根据搜索构建展开 keys 的函数（防抖可加）
function doTreeSearch(val: string) {
	const q = String(val || '').trim()
	if (!q) { expandedKeys.value = []; return }
	const matches: string[] = []
	collectMatchKeys(treeData.value, q, matches)
	expandedKeys.value = Array.from(new Set(matches))
	if (matches.length) {
		const first = matches[matches.length - 1]
		selectedKeys.value = [first]
		function findNode(nodes: any[], k: string): any {
			for (const n of nodes) { if (String(n.key) === k) return n; if (n.children) { const r = findNode(n.children, k); if (r) return r } }
			return null
		}
		const node = findNode(treeData.value, first)
		if (node) { selectedNode.value = node; filterTableData() }
	}
}

function onTreeSearchInput(e: any) { treeSearch.value = e?.target?.value ?? (e || ''); doTreeSearch(treeSearch.value) }
function onTreeSearchEnter() { doTreeSearch(treeSearch.value) }

const selectedKeys = ref(['all'] as string[])
const selectedNode = ref(treeData.value[0] as any)

function onSelect(keys: any, info: any) {
	selectedKeys.value = keys
	const k = Array.isArray(keys) ? keys[0] : keys
	const node = findNodeByKey(treeData.value, k)
	selectedNode.value = node || info.node
	filterTableData()
}

function findNodeByKey(nodes: any[], key: string): any {
	for (const n of nodes) {
		if (String(n.key) === String(key)) return n
		if (n.children && n.children.length) {
			const r = findNodeByKey(n.children, key)
			if (r) return r
		}
	}
	return null
}

async function onTreeExpand(keys: string[]) {
	expandedKeys.value = keys
	for (const k of keys) {
		const n = findNodeByKey(treeData.value, k)
		if (n && !n.isLeaf && (!n.children || n.children.length === 0 || (n.children.length === 1 && n.children[0].placeholder))) {
			await loadTreeData(n)
		}
	}
	updateFlat()
}

// ------------------- 后端 API 基础 -------------------
let BASE_URL = 'http://127.0.0.1:4000'
const TOKEN = 'test-token'
let backendPortChecked = false
async function safeJson(r: Response){ try { return await r.json() } catch { return {} } }
async function detectPort(force=false){
	if(backendPortChecked && !force) return
	const ports = [4000,4001]
	for(const p of ports){
		const controller = new AbortController(); const timer=setTimeout(()=>controller.abort(), 1800)
		try {
			const url = `http://127.0.0.1:${p}/health`
			console.debug('[detectPort] probing', url)
			const resp = await fetch(url,{signal:controller.signal})
			if(resp.ok){ BASE_URL=`http://127.0.0.1:${p}`; backendPortChecked=true; clearTimeout(timer); console.info('[detectPort] using', BASE_URL); return }
			console.warn('[detectPort] non-ok', p, resp.status)
		} catch(e:any){ console.warn('[detectPort] fail', p, e?.name||e?.message||e) }
		clearTimeout(timer)
	}
	console.error('[detectPort] backend unreachable on 4000/4001')
}

const customersData = ref<any[]>([])

const areaBuildings: Record<string, string[]> = {
	'管理区A': ['楼宇A1', '楼宇A2'],
	'管理区B': ['楼宇B1']
}

function buildTreeFromCustomers() {
	const nodes: any[] = [{ title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, '全部') ]), key: 'all', level: 0 }]
	let areaIdx = 1
	for (const [areaName, buildings] of Object.entries(areaBuildings)) {
		const buildingNodes: any[] = buildings.map((bName: string, idx: number) => {
			const meta = { type: 'building', areaName, buildingName: bName }
			const cnt = customersData.value.filter(r => r.buildingName === bName).length
			const placeholderChild = { title: h('span', '展开以加载房屋'), key: `room-placeholder-${areaIdx}-${idx+1}`, isLeaf: true, placeholder: true }
			const titleVNode = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${cnt}室`) ])
			return { title: titleVNode, key: `building-${areaIdx}-${idx+1}`, isLeaf: false, meta, children: [placeholderChild] }
		})
		const areaNode: any = { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, areaName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${buildings.length}栋`) ]), key: `area-${areaIdx}`, level: 1, meta: { type: 'area', areaName }, children: buildingNodes }
		nodes.push(areaNode)
		areaIdx++
	}
	treeData.value = nodes
	flatNodes.value = flattenTree(treeData.value)
}

function loadTreeData(node: any) {
	return new Promise<void>((resolve) => {
		const key = String(node.key || '')
		if (key.startsWith('area-')) {
			const areaName = node.meta?.areaName || extractVNodeText(node.title) || node.title
			const buildings = areaBuildings[areaName] || []
			const children = buildings.map((bName: string, idx: number) => {
				const meta = { type: 'building', areaName, buildingName: bName }
				return { title: h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-badge', { count: 0, style: { marginLeft: '8px' } }), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `0室`) ]), key: `building-${key.split('-')[1]}-${idx+1}`, isLeaf: false, meta }
			})
			node.children = children
			setTimeout(() => { flatNodes.value = flattenTree(treeData.value); resolve() }, 100)
			return
		}
		if (key.startsWith('building-')) {
			const buildingName = node.meta?.buildingName || extractVNodeText(node.title) || ''
			let customersForBuilding = customersData.value.filter(r => r.buildingName === buildingName)
			if (!customersForBuilding.length) {
				customersForBuilding = customersData.value.filter(r => (r.buildingName || '').includes(buildingName) || buildingName.includes(r.buildingName || ''))
			}
			let children: any[] = []
			if (customersForBuilding.length) {
				children = customersForBuilding.map((r: any) => {
					const roomMeta = { type: 'room', roomId: r.roomId, buildingName: r.buildingName }
					const titleVNode = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, `${r.roomId || ''} ${r.customerName || ''}`), r.isRented ? h('a-badge', { dot: true, style: { marginLeft: '8px', background: '#fa8c16' } }) : null ])
					return { title: titleVNode, key: `room-${r.roomId || ('r' + Math.random().toString(36).slice(2,7))}`, isLeaf: true, meta: roomMeta }
				})
			} else {
				children = [{ title: h('span', { class: 'tree-node-title' }, '(无房间)'), key: `room-empty-${key}`, isLeaf: true, meta: { type: 'placeholder' } }]
			}
			node.children = children
			const bName = node.meta?.buildingName || extractVNodeText(node.title) || ''
			node.title = h('span', { class: 'tree-node-title' }, [ h('span', { class: 'node-main' }, bName), h('a-tag', { color: 'default', style: { marginLeft: '6px', fontSize: '12px' } }, () => `${children.length}室`) ])
			setTimeout(() => { flatNodes.value = flattenTree(treeData.value); resolve() }, 100)
			return
		}
		resolve()
	})
}

buildTreeFromCustomers()

const tableColumns = [
	{ title: '客户编号', dataIndex: 'customerId', key: 'customerId', width: 120 },
	{ title: '联系人', dataIndex: 'contact', key: 'contact', width: 120 },
	{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 200 },
	{ title: '房间编号', dataIndex: 'roomCode', key: 'roomCode', width: 140 },
	{ title: '客户类型', dataIndex: 'customerType', key: 'customerType', width: 120 },
	{ title: '手机号', dataIndex: 'phone', key: 'phone', width: 140 },
	{ title: '通讯地址', dataIndex: 'address', key: 'address', width: 240 },
	{ title: '联系电话', dataIndex: 'tel', key: 'tel', width: 140 },
	{ title: '传真', dataIndex: 'fax', key: 'fax', width: 140 },
	{ title: '出生年月', dataIndex: 'birthday', key: 'birthday', width: 120 },
	{ title: '证件类型', dataIndex: 'idType', key: 'idType', width: 120 },
	{ title: '身份证号', dataIndex: 'idNumber', key: 'idNumber', width: 180 },
	{ title: '收楼日期', dataIndex: 'moveInDate', key: 'moveInDate', width: 120 },
	{ title: '装修日期', dataIndex: 'decorationDate', key: 'decorationDate', width: 120 },
	{ title: '银行编号', dataIndex: 'bankId', key: 'bankId', width: 120 },
	{ title: '账户名称', dataIndex: 'accountName', key: 'accountName', width: 160 },
	{ title: '银行账号', dataIndex: 'bankAccount', key: 'bankAccount', width: 200 },
	{ title: '开户支行', dataIndex: 'bankBranch', key: 'bankBranch', width: 200 },
	{ title: '备注', dataIndex: 'remark', key: 'remark', width: 240 },
	{ title: '操作', key: 'actions', width: 140, fixed: 'right' }
]

const tableData = ref<any[]>([])

const filterModalVisible = ref(false)
const filterForm = ref({ area: '', roomId: '', roomName: '', customerId: '', customerName: '', buildingName: '' })
const inlineFilterVisible = ref(false)

const areaOptions = ref(Object.keys(areaBuildings).map(a => ({ label: a, value: a }))) // TODO: 替换为真实管理区接口
const allBuildingList = Object.values(areaBuildings).flat()
const buildingOptions = ref<any[]>(allBuildingList.map(b => ({ label: b, value: b })))

function onAreaChange(val: string) {
	if (!val) {
		buildingOptions.value = allBuildingList.map(b => ({ label: b, value: b }))
		roomOptions.value = roomIdOptions.value
		filterForm.value.buildingName = ''
		return
	}
	const blds = areaBuildings[val] || []
	buildingOptions.value = blds.map(b => ({ label: b, value: b }))
	filterForm.value.buildingName = ''
	filterForm.value.roomId = ''
	roomOptions.value = roomIdOptions.value
}

function onBuildingChange(val: string) {
	if (!val) { roomOptions.value = roomIdOptions.value; filterForm.value.roomId = ''; return }
	const rooms = customersData.value.filter(r => r.buildingName === val).map(r => ({ label: `${r.roomId || ''} ${r.customerName || ''}`, value: r.roomId }))
	roomOptions.value = rooms
	filterForm.value.roomId = ''
}

const roomIdSet = Array.from(new Set(customersData.value.map(b => b.roomId))).filter(Boolean)
const roomIdOptions = ref(roomIdSet.map(v => ({ label: v, value: v })))
const roomOptions = ref(roomIdOptions.value)
const customerIdSet = Array.from(new Set(customersData.value.map(b => b.customerId)))
const customerIdOptions = ref(customerIdSet.map(v => ({ label: v, value: v })))
const customerNameSet = Array.from(new Set(customersData.value.map(b => b.customerName)))
const customerNameOptions = ref(customerNameSet.map(v => ({ label: v, value: v })))

const loadingRoomId = ref(false)
const loadingCustomerId = ref(false)
const loadingCustomerName = ref(false)

function debounceFn(fn: (...args: any[]) => void, wait = 300) {
	let timer: any = null
	return (...args: any[]) => { if (timer) clearTimeout(timer); timer = setTimeout(() => fn(...args), wait) }
}

// 当行内筛选可见时，自动应用 filterForm 的变化（防抖）
const debouncedApplyInline = debounceFn(() => { filterTableData() }, 250)
watch(filterForm, () => {
	if (inlineFilterVisible.value) debouncedApplyInline()
}, { deep: true })

let reqIdRoom = 0
let reqIdCustId = 0
let reqIdCustName = 0

function remoteSearchCustomerIds(q: string, myId: number) {
	return new Promise<any>((resolve: any) => {
		const list = customersData.value
			.map(b => b.customerId)
			.filter((v, i, a) => v && a.indexOf(v) === i && v.toLowerCase().includes((q || '').toLowerCase()))
			.map(v => ({ label: v, value: v }))
		setTimeout(() => resolve({ id: myId, res: list }), 200)
	})
}
function remoteSearchCustomerNames(q: string, myId: number) {
	return new Promise<any>((resolve: any) => {
		const list = customersData.value
			.map(b => b.customerName)
			.filter((v, i, a) => v && a.indexOf(v) === i && v.toLowerCase().includes((q || '').toLowerCase()))
			.map(v => ({ label: v, value: v }))
		setTimeout(() => resolve({ id: myId, res: list }), 200)
	})
}

const onSearchCustomerId = debounceFn((val: string) => {
	reqIdCustId++
	const cur = reqIdCustId
	loadingCustomerId.value = true
	remoteSearchCustomerIds(val, cur).then(({ id, res }) => { if (id !== reqIdCustId) return; customerIdOptions.value = res }).finally(() => { if (cur === reqIdCustId) loadingCustomerId.value = false })
}, 300)

const onSearchCustomerName = debounceFn((val: string) => {
	reqIdCustName++
	const cur = reqIdCustName
	loadingCustomerName.value = true
	remoteSearchCustomerNames(val, cur).then(({ id, res }) => { if (id !== reqIdCustName) return; customerNameOptions.value = res }).finally(() => { if (cur === reqIdCustName) loadingCustomerName.value = false })
}, 300)

function toggleInlineFilter() { inlineFilterVisible.value = !inlineFilterVisible.value }
function openFilter() { filterModalVisible.value = true }
function cancelFilter() { filterModalVisible.value = false }
function resetFilter() { filterForm.value = { area: '', roomId: '', roomName: '', customerId: '', customerName: '', buildingName: '' }; buildingOptions.value = allBuildingList.map(b => ({ label: b, value: b })); roomOptions.value = roomIdOptions.value; filterTableData() }
function applyFilter() { filterModalVisible.value = false; filterTableData() }

function filterTableData() {
	let list = [...customersData.value]
	if (selectedNode.value && selectedNode.value.key !== 'all') {
		const key = String(selectedNode.value.key || '')
		if (key.startsWith('area-')) {
			const areaName = selectedNode.value.meta?.areaName || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
			const buildings = areaBuildings[areaName] || []
			list = list.filter(b => buildings.includes(b.buildingName))
		} else if (key.startsWith('building-')) {
			const buildingName = selectedNode.value.meta?.buildingName || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
			list = list.filter(b => b.buildingName === buildingName)
		} else if (key.startsWith('room-')) {
			const roomId = selectedNode.value.meta?.roomId || extractVNodeText(selectedNode.value.title) || selectedNode.value.title
			list = list.filter(b => b.roomId === roomId)
		}
	}
	const f = filterForm.value || {}
	if (f.area) {
		const buildings = areaBuildings[f.area] || []
		list = list.filter(b => buildings.includes(b.buildingName))
	}
	if (f.roomId) list = list.filter(b => String(b.roomId ?? '').includes(String(f.roomId)))
	if (f.customerId) list = list.filter(b => String(b.customerId ?? '').includes(String(f.customerId)))
	if (f.customerName) list = list.filter(b => String(b.customerName ?? '').includes(String(f.customerName)))
	if (f.buildingName) list = list.filter(b => String(b.buildingName ?? '').includes(String(f.buildingName)))
	tableData.value = list
}

const editModalVisible = ref(false)
const readOnlyMode = ref(false)
const editForm = ref<any>({})
// 可拖拽 modal 相关
const modalElRef = ref<HTMLElement | null>(null)
let headerMouseDownHandler: ((e: MouseEvent) => void) | null = null
let documentMouseMoveHandler: ((e: MouseEvent) => void) | null = null
let documentMouseUpHandler: ((e: MouseEvent) => void) | null = null
const modalDragging = ref(false)
let dragStartX = 0
let dragStartY = 0

function clamp(v: number, a: number, b: number) { return Math.min(Math.max(v, a), b) }

function attachModalDrag() {
	nextTick(() => {
		const modals = Array.from(document.querySelectorAll('.ant-modal')) as HTMLElement[]
		if (!modals.length) return
		const modalEl = modals[modals.length - 1]
		modalElRef.value = modalEl
		modalEl.style.margin = '0'
		modalEl.style.position = 'absolute'
		// ensure it's on top
		modalEl.style.zIndex = '1000'
		const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
		if (!header) return
		header.style.cursor = 'move'

		headerMouseDownHandler = (e: MouseEvent) => {
			const rect = modalEl.getBoundingClientRect()
			dragStartX = e.clientX - rect.left
			dragStartY = e.clientY - rect.top
			modalDragging.value = true
			// bind document move/up
					documentMouseMoveHandler = (ev: MouseEvent) => {
						if (!modalDragging.value || !modalElRef.value) return
				const left = clamp(ev.clientX - dragStartX, 0, window.innerWidth - modalElRef.value.offsetWidth)
				const top = clamp(ev.clientY - dragStartY, 0, window.innerHeight - modalElRef.value.offsetHeight)
				modalElRef.value.style.left = `${left}px`
				modalElRef.value.style.top = `${top}px`
			}
					documentMouseUpHandler = () => {
						modalDragging.value = false
				if (documentMouseMoveHandler) document.removeEventListener('mousemove', documentMouseMoveHandler)
				if (documentMouseUpHandler) document.removeEventListener('mouseup', documentMouseUpHandler)
			}
			document.addEventListener('mousemove', documentMouseMoveHandler)
			document.addEventListener('mouseup', documentMouseUpHandler)
		}

		header.addEventListener('mousedown', headerMouseDownHandler)
	})
}

function detachModalDrag() {
	try {
		const modals = Array.from(document.querySelectorAll('.ant-modal')) as HTMLElement[]
		const modalEl = modalElRef.value || (modals.length ? modals[modals.length - 1] : null)
		if (modalEl) {
			const header = modalEl.querySelector('.ant-modal-header') as HTMLElement | null
			if (header && headerMouseDownHandler) header.removeEventListener('mousedown', headerMouseDownHandler)
			// reset styles we changed
			modalEl.style.position = ''
			modalEl.style.left = ''
			modalEl.style.top = ''
			modalEl.style.margin = ''
			modalEl.style.zIndex = ''
		}
	} catch (e) { }
		if (documentMouseMoveHandler) { document.removeEventListener('mousemove', documentMouseMoveHandler); documentMouseMoveHandler = null }
		if (documentMouseUpHandler) { document.removeEventListener('mouseup', documentMouseUpHandler); documentMouseUpHandler = null }
		headerMouseDownHandler = null
		modalElRef.value = null
		modalDragging.value = false
}
function onAdd() { editForm.value = { id:null, customerCode: '', contact: '', customerName: '', roomCode:'', customerType: '', phone: '', address: '', tel: '', fax: '', birthday: '', idType: '', idNumber: '', moveInDate: '', decorationDate: '', bankId: '', accountName: '', bankAccount: '', bankBranch: '', remark: '', buildingName: '', roomId: '' }; editModalVisible.value = true }
function onEdit(record: any) { editForm.value = { ...record }; editModalVisible.value = true }
function onDelete(record: any) { Modal.confirm({ title: '确认删除该客户吗？', okText: '确定', cancelText: '取消', onOk: () => { customersData.value = customersData.value.filter(b => b.customerId !== record.customerId); buildTreeFromCustomers(); refreshOptions(); filterTableData(); message.success('删除成功') } }) }
async function handleEditOk() {
	if(!editForm.value.customerName){ message.error('客户名称必填'); return }
	try {
		const payload:any = {
			name: editForm.value.customerName,
			phone: editForm.value.phone||null,
			id_number: editForm.value.idNumber||null,
			room_code: editForm.value.roomCode||null,
			room_id: editForm.value.roomId ? Number(editForm.value.roomId) : null
		}
		let resp: Response
		if(editForm.value.id){
			resp = await fetch(`${BASE_URL}/api/customers/${editForm.value.id}`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}`}, body: JSON.stringify(payload) })
		} else {
			resp = await fetch(`${BASE_URL}/api/customers`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${TOKEN}`}, body: JSON.stringify(payload) })
		}
		if(!resp.ok){ const err = await safeJson(resp); message.error('保存失败 '+ (err.error||resp.status)); return }
		message.success('保存成功')
		editModalVisible.value=false
		await loadCustomers()
	} catch(e:any){ message.error('保存异常 '+ (e?.message||'')) }
}
function handleEditCancel() { editModalVisible.value = false }

watch(editModalVisible, (val) => {
	if (val) attachModalDrag()
	else detachModalDrag()
})

function onExport() {
	const headers = ['客户编号','联系人','客户名称','房间编号','客户类型','手机号','通讯地址','联系电话','传真','出生年月','证件类型','身份证号','收楼日期','装修日期','银行编号','账户名称','银行账号','开户支行','备注']
	const rows = tableData.value.map(row => [row.customerId, row.contact, row.customerName, row.roomCode, row.customerType, row.phone, row.address, row.tel, row.fax, row.birthday, row.idType, row.idNumber, row.moveInDate, row.decorationDate, row.bankId, row.accountName, row.bankAccount, row.bankBranch, row.remark])
	const csvContent = headers.join(',') + '\n' + rows.map(r => r.map(x => '"'+(x??'')+'"').join(',')).join('\n')
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.setAttribute('download', '客户信息.csv')
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}
function onImport() {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
	input.onchange = () => { const file = input.files && input.files[0]; if (!file) return; alert('已选择文件：' + file.name) }
	input.click()
}

function refreshOptions() {
	const roomIdSet2 = Array.from(new Set(customersData.value.map(b => b.roomId))).filter(Boolean)
	roomIdOptions.value = roomIdSet2.map(v => ({ label: v, value: v }))
	const customerIdSet2 = Array.from(new Set(customersData.value.map(b => b.id)))
	customerIdOptions.value = customerIdSet2.map(v => ({ label: v, value: v }))
	const customerNameSet2 = Array.from(new Set(customersData.value.map(b => b.customerName)))
	customerNameOptions.value = customerNameSet2.map(v => ({ label: v, value: v }))
}

async function loadCustomers(){
	await detectPort()
	try {
		const r = await fetch(`${BASE_URL}/api/customers`, { headers:{ Authorization:`Bearer ${TOKEN}` }})
		if(!r.ok){ message.error('加载客户失败 '+r.status); return }
		const data = await r.json()
		// 服务器字段 => 前端字段映射
		customersData.value = Array.isArray(data) ? data.map((c:any)=>({
			id: c.id,
			customerId: c.id, // 旧列复用 id
			customerName: c.name,
			contact: c.contact || '',
			roomCode: c.roomCode || '',
			roomId: c.roomId || '',
			phone: c.phone || '',
			idNumber: c.idNumber || '',
			remark: c.remark || '',
			customerType: c.type || '',
			address: c.address || '',
			tel: c.tel || '',
			fax: c.fax || '',
			birthday: c.birthday || '',
			moveInDate: c.moveInDate || '',
			decorationDate: c.decorationDate || '',
			bankId: c.bankId || '',
			accountName: c.accountName || '',
			bankAccount: c.bankAccount || '',
			bankBranch: c.bankBranch || ''
		})) : []
		tableData.value = [...customersData.value]
		refreshOptions()
		filterTableData()
	} catch(e:any){ message.error('加载客户异常 '+ (e?.message||'')) }
}

// ------------------- 房间选择器 -------------------
const roomPickerVisible = ref(false)
const roomPickerLoading = ref(false)
const roomPickerData = ref<any[]>([])
const roomPickerColumns = [
	{ title:'ID', dataIndex:'id', key:'id', width:70 },
	{ title:'房间编号', dataIndex:'code', key:'code', width:120 },
	{ title:'楼宇ID', dataIndex:'buildingId', key:'buildingId', width:90 },
	{ title:'面积', dataIndex:'size', key:'size', width:90 },
	{ title:'用途', dataIndex:'purpose', key:'purpose', width:100 },
	{ title:'状态', dataIndex:'status', key:'status', width:90 }
]
async function loadRoomsForPicker(retry=0){
	roomPickerLoading.value=true
	try {
		await detectPort()
		const controller = new AbortController(); const t=setTimeout(()=>controller.abort(), 6000)
		const url = `${BASE_URL}/api/rooms`
		console.debug('[rooms] GET', url)
		const r = await fetch(url,{ headers:{ Authorization:`Bearer ${TOKEN}` }, signal:controller.signal })
		clearTimeout(t)
		if(r.ok){
			const data = await r.json()
			roomPickerData.value = Array.isArray(data)?data:[]
		} else {
			message.error('加载房间失败 '+r.status)
			if(r.status>=500 && retry<1){ return loadRoomsForPicker(retry+1) }
		}
	} catch(e:any){
		console.error('[rooms] error', e)
		if(retry<1){ console.warn('[rooms] retry once'); return loadRoomsForPicker(retry+1) }
		message.error('加载房间异常 '+ (e?.message||'网络'))
	} finally { roomPickerLoading.value=false }
}
function openRoomPicker(){ roomPickerVisible.value=true; loadRoomsForPicker() }
function handleRoomDoubleClick(record:any){
	editForm.value.roomCode = record.code
	editForm.value.roomId = record.id
	roomPickerVisible.value=false
}
function confirmRoomSelect(){ roomPickerVisible.value=false }

function onNodeAdd(meta: any) {
	if (!meta) return
	if (meta.type === 'building') {
		editForm.value = { customerId: '', contact: '', customerName: '', customerType: '', phone: '', address: '', tel: '', fax: '', birthday: '', idType: '', idNumber: '', moveInDate: '', decorationDate: '', bankId: '', accountName: '', bankAccount: '', bankBranch: '', remark: '', buildingName: meta.buildingName, roomId: '' }
		editModalVisible.value = true
	} else if (meta.type === 'room') {
		editForm.value = { customerId: '', contact: '', customerName: '', customerType: '', phone: '', address: '', tel: '', fax: '', birthday: '', idType: '', idNumber: '', moveInDate: '', decorationDate: '', bankId: '', accountName: '', bankAccount: '', bankBranch: '', remark: '', buildingName: meta.buildingName || '', roomId: meta.roomId || '' }
		editModalVisible.value = true
	}
}

function onNodeEdit(meta: any) {
	if (!meta) return
	if (meta.type === 'room') {
		const rec = customersData.value.find(r => r.roomId === meta.roomId)
		if (rec) onEdit(rec)
	} else if (meta.type === 'building') {
		filterForm.value.buildingName = meta.buildingName || ''
		filterModalVisible.value = true
	}
}

const treePanelRef = ref<any>(null)
const sidebarWidth = ref<number>(260)
const dragging = ref(false)
function onSplitterDown(e: MouseEvent) { dragging.value = true; e.preventDefault() }
function onMouseMove(e: MouseEvent) { if (!dragging.value) return; const parentRect = treePanelRef.value?.parentElement?.getBoundingClientRect(); const left = parentRect ? parentRect.left : 0; const newWidth = Math.min(560, Math.max(180, e.clientX - left)); sidebarWidth.value = newWidth }
function onMouseUp() { dragging.value = false }
onMounted(() => { window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp); loadCustomers() })
onUnmounted(() => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) })
onUnmounted(() => { detachModalDrag() })

// 允许其他页面通过 window 事件打开本页面的编辑模态
function handleGlobalOpenEdit(e: any) {
	try {
		const detail = e?.detail || null
		if (!detail) return
	// detail expected to be either a record object or { record, readOnly }
	const rec = detail.record || detail
	const ro = Boolean(detail.readOnly)
	editForm.value = { ...rec }
	readOnlyMode.value = ro
	editModalVisible.value = true
	nextTick(() => attachModalDrag())
	} catch (err) { /* ignore */ }
}

onMounted(() => {
	window.addEventListener('open-customer-edit', handleGlobalOpenEdit as EventListener)
})
onUnmounted(() => {
	window.removeEventListener('open-customer-edit', handleGlobalOpenEdit as EventListener)
})

function doRequestFullscreen() { if (requestTabFullscreen) requestTabFullscreen(); else if (toggleFullscreen) toggleFullscreen() }

</script>

<style scoped>
.building-page { padding: 0 }
.building-layout { display:flex; height:100vh; }
.tree-panel { width:260px; border-right:1px solid #eee; padding:16px 8px; background:#fff; height:100vh; box-sizing:border-box; overflow:auto }
.splitter { width:6px; cursor:col-resize; background:linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0)); }
.data-panel { flex:1; padding:16px; height:100vh; overflow:auto }
.dense-row .ant-table-cell { padding:6px 8px; font-size:13px }
.dense-row .ant-table-cell { padding:2px 6px; font-size:11px; line-height:1.1 }
.ant-table-cell { white-space:nowrap }
.dense-row .ant-table-cell, .ant-table-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
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
.modal-footer-fixed { position: sticky; bottom: 0; right: 0; width: 100%; background: #fff; display: flex; justify-content: flex-end; align-items: center; padding: 16px 24px 8px 24px; z-index: 10; border-top: 1px solid #f0f0f0; box-shadow: 0 -2px 8px rgba(0,0,0,0.03); }

/* 可滚动的 modal 表单体，限定最大高度并启用竖向滚动 */
.modal-body-scroll { max-height: calc(70vh); overflow-y: auto; padding-right: 8px; }
.modal-body-scroll .ant-row { padding-bottom: 8px }
</style>
