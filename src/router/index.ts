import { createRouter, createWebHistory } from 'vue-router'
// RepairsDaily moved to lazy load to avoid parsing errors during dev HMR

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/finance', name: 'Finance', component: () => import('../views/finance.vue') },

  // 楼宇页面：提供两个路径别名，/building 与 /resources/building 都指向同一组件
  { path: '/building', name: 'Building', component: () => import('../views/building.vue') },

  // 物业资源
  { path: '/resources/manage', name: 'ResourcesManage', component: () => import('../views/resources.manage.vue') },
  { path: '/resources/managementArea', name: 'ManagementArea', component: () => import('../views/ManagementArea.vue') },
  { path: '/resources/building', name: 'ResourcesBuilding', component: () => import('../views/building.vue') },
  { path: '/resources/building-analytics', name: 'ResourcesBuildingAnalytics', component: () => import('../views/building.analytics.vue') },
  { path: '/resources/building-tree', name: 'BuildingTree', component: () => import('../views/BuildingTree.vue') },
  { path: '/resources/room', name: 'ResourcesRoom', component: () => import('../views/resources.room.vue') },

  // 客户管理
  { path: '/customers/info', name: 'CustomersInfo', component: () => import('../views/customers.info.vue') },
  { path: '/customers/cert', name: 'CustomersCert', component: () => import('../views/customers.cert.vue') },
  { path: '/customers/analytics', name: 'CustomersAnalytics', component: () => import('../views/customers.analytics.vue') },

  // 客户服务
  { path: '/service/repair', name: 'ServiceRepair', component: () => import('../views/service.repair.vue') },
  { path: '/service/repairs/daily', name: 'ServiceRepairsDaily', component: () => import('../views/repairs.daily.vue') },
  { path: '/service/public', name: 'ServicePublic', component: () => import('../views/public.consult.vue') },
  { path: '/service/emergency', name: 'ServiceEmergency', component: () => import('../views/service.emergency.vue') },

  // 微信管理（未创建的视图指向占位）
  { path: '/wechat/main', name: 'WechatMain', component: () => import('../views/Placeholder.vue') },
  { path: '/wechat/bind', name: 'WechatBind', component: () => import('../views/Placeholder.vue') },

  // 招商租赁
  { path: '/leasing/contract', name: 'LeasingContract', component: () => import('../views/leasing/contract.vue') },
  { path: '/leasing/fee', name: 'LeasingFee', component: () => import('../views/Placeholder.vue') },
  { path: '/leasing/terminate', name: 'LeasingTerminate', component: () => import('../views/Placeholder.vue') },

  // 物业管理
  // 物业管理 -> 房间仪表设置：复用财务收费里的仪表设置页面
  { path: '/property/meter', name: 'PropertyRoomMeterSettings', component: () => import('../views/finance/charging/meterSettings.vue') },
  { path: '/property/settings', name: 'PropertySettings', component: () => import('../views/Placeholder.vue') },
  { path: '/property/meterFee', name: 'PropertyMeterFee', component: () => import('../views/Placeholder.vue') },
  { path: '/property/readings', name: 'PropertyReadings', component: () => import('../views/Placeholder.vue') },

  // 人力资源
  { path: '/hr/staff', name: 'HRStaff', component: () => import('../views/Placeholder.vue') },
  { path: '/hr/attendance', name: 'HRAttendance', component: () => import('../views/Placeholder.vue') },
  { path: '/hr/performance', name: 'HRPerformance', component: () => import('../views/Placeholder.vue') },

  // 数据中枢
  { path: '/datahub/roomStatus', name: 'DatahubRoomStatus', component: () => import('../views/datahub.roomStatus.vue') },
  { path: '/datahub/feeStatus', name: 'DatahubFeeStatus', component: () => import('../views/datahub.feeStatus.vue') },
  { path: '/datahub/analytics', name: 'DatahubAnalytics', component: () => import('../views/Placeholder.vue') },

  // 系统管理
  { path: '/system/settings', name: 'SystemSettings', component: () => import('../views/Placeholder.vue') },
  { path: '/system/permissions', name: 'SystemPermissions', component: () => import('../views/Placeholder.vue') },
  { path: '/system/sms', name: 'SystemSMS', component: () => import('../views/Placeholder.vue') },

  // App 管理
  { path: '/app/service', name: 'AppService', component: () => import('../views/Placeholder.vue') },
  { path: '/app/finance', name: 'AppFinance', component: () => import('../views/Placeholder.vue') },
  { path: '/app/iot', name: 'AppIoT', component: () => import('../views/Placeholder.vue') },
  { path: '/app/leasing', name: 'AppLeasing', component: () => import('../views/Placeholder.vue') },
  { path: '/app/operation', name: 'AppOperation', component: () => import('../views/Placeholder.vue') },
  { path: '/app/inspection', name: 'AppInspection', component: () => import('../views/Placeholder.vue') },
  { path: '/app/staff', name: 'AppStaff', component: () => import('../views/Placeholder.vue') }
  ,

  // 财务管理 - 收费管理
  { path: '/finance/charging/meterSettings', name: 'FinanceChargingMeterSettings', component: () => import('../views/finance/charging/meterSettings.vue') },
  { path: '/finance/charging/periodFeeSettings', name: 'FinanceChargingPeriodFeeSettings', component: () => import('../views/finance/charging/periodicFees.vue') },
  { path: '/finance/charging/readingsEntry', name: 'FinanceChargingReadingsEntry', component: () => import('../views/finance/charging/readingsEntry.vue') },
  { path: '/finance/charging/periodicFeeEntry', name: 'FinanceChargingPeriodicFeeEntry', component: () => import('../views/finance/charging/periodicFeeEntry.vue') },
  { path: '/finance/charging/temporaryFeeEntry', name: 'FinanceChargingTemporaryFeeEntry', component: () => import('../views/finance/charging/temporaryFeesEntry.vue') },
  { path: '/finance/charging/prepaidDeduction', name: 'FinanceChargingPrepaidDeduction', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/charging/feeAdjust', name: 'FinanceChargingFeeAdjust', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/charging/notice', name: 'FinanceChargingNotice', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/charging/collectFee', name: 'FinanceChargingCollectFee', component: () => import('../views/finance/charging/collectFee.vue') },
  { path: '/finance/charging/temporaryCollection', name: 'FinanceChargingTemporaryCollection', component: () => import('../views/finance/charging/temporaryCollection.vue') },

  // 财务管理 - 预算管理
  { path: '/finance/budget/income', name: 'FinanceBudgetIncome', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/budget/expense', name: 'FinanceBudgetExpense', component: () => import('../views/Placeholder.vue') },

  // 财务管理 - 银行托收
  { path: '/finance/bankCollection/plan', name: 'FinanceBankPlan', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/bankCollection/report', name: 'FinanceBankReport', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/bankCollection/return', name: 'FinanceBankReturn', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/bankCollection/list', name: 'FinanceBankList', component: () => import('../views/Placeholder.vue') },

  // 财务管理 - 出纳管理
  { path: '/finance/cashier/journal', name: 'FinanceCashierJournal', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/cashier/reports', name: 'FinanceCashierReports', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/cashier/bankAccounts', name: 'FinanceCashierBankAccounts', component: () => import('../views/Placeholder.vue') },

  // 财务管理 - 财务报表
  { path: '/finance/reports/feeReport', name: 'FinanceReportsFeeReport', component: () => import('../views/finance/reports/feeReport.vue') },
  { path: '/finance/reports/collectionReport', name: 'FinanceReportsCollectionReport', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/reports/feeStats', name: 'FinanceReportsFeeStats', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/reports/collectionStats', name: 'FinanceReportsCollectionStats', component: () => import('../views/Placeholder.vue') },
  { path: '/finance/reports/feeCollection', name: 'FinanceReportsFeeCollection', component: () => import('../views/Placeholder.vue') },

  // TODO 面板单独页面
  { path: '/todo', name: 'TodoPanelPage', component: () => import('../views/TodoPanelPage.vue') },

  // 测试页面
  { path: '/test', name: 'TestPage', component: () => import('../views/TestPage.vue') }
]

// Ensure all route paths start with '/' — some runtime HMR or code generation
// may accidentally create routes without a leading slash which breaks router creation.
function normalizeRoutePaths(list: any[]) {
  if (!Array.isArray(list)) return
  for (const r of list) {
    if (r && typeof r.path === 'string') {
      if (!r.path.startsWith('/')) r.path = '/' + r.path
    }
    if (r && Array.isArray(r.children)) normalizeRoutePaths(r.children)
  }
}

normalizeRoutePaths(routes)

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
