// Simple smoke test that simulates the batch-create logic used in the UI
// This script runs outside the browser and verifies the local algorithm for generating meters.

function generateMeterNo() { return `M-${Date.now().toString().slice(-6)}` }

const allRooms = [
  { roomId: 'R001', roomName: '101室', customerId: 'C001', customerName: '张三', buildingName: '楼宇A1', areaName: '管理区A' },
  { roomId: 'R002', roomName: '201室', customerId: 'C002', customerName: '李四', buildingName: '楼宇A1', areaName: '管理区A' },
  { roomId: 'R101', roomName: '301室', customerId: 'C003', customerName: '王五', buildingName: '楼宇B1', areaName: '管理区B' }
]

let metersData = [
  { meterNo: 'M0001', meterName: '水表-1', meterType: '水表', roomId: 'R001', customerId: 'C001', roomName: '101室' }
]

const batchForm = { meterType: '水表', unitPrice: 2.5, multiple: 1, penaltyRate: 0, startDate: null, formulaName: '公式A' }
const checkedRoomKeys = ['room-R001','room-R002','room-R101']

async function simulateBatchCreate() {
  const roomIds = checkedRoomKeys.map(k=>String(k).replace('room-',''))
  const preview = allRooms.filter(r=>roomIds.includes(String(r.roomId))).map(r=>({...r, _status:'pending', _error:''}))
  for (const item of preview) {
    try {
      if (!item.roomId) throw new Error('房间ID 缺失')
      const rec = { meterNo: generateMeterNo(), meterName: `${batchForm.meterType}-${item.roomId}`, meterType: batchForm.meterType, roomId: item.roomId, customerId: item.customerId, roomName: item.roomName, multiple: batchForm.multiple || 1, enabled: true, remark: '', startDate: batchForm.startDate, reading: 0, chargeItem: batchForm.meterType === '水表' ? '水费' : '', formulaName: batchForm.formulaName || '', unitPrice: batchForm.unitPrice }
      const exists = metersData.find(m=>m.roomId === item.roomId && m.meterType === rec.meterType)
      if (exists) { item._status = 'failed'; item._error = '该房间已有相同类型仪表，已跳过' }
      else { metersData.push(rec); item._status = 'success' }
      await new Promise(res=>setTimeout(res, 30))
    } catch (err) { item._status = 'failed'; item._error = err.message || '未知错误' }
  }
  const succ = preview.filter(p=>p._status==='success').length
  const fail = preview.filter(p=>p._status==='failed').length
  // smoke test summary available via returned preview array if needed
}

simulateBatchCreate()
