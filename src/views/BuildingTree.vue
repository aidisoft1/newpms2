<template>
  <div>
    <h1>Building Tree</h1>
    <div style="margin:12px 0">
      <a-space>
        <a-button type="primary" @click="exportTemplate">导出模板 (CSV)</a-button>
        <a-button @click="exportExample">导出示例数据</a-button>
      </a-space>
    </div>
    <div style="color:#666">提示：模板包含列：管理区,楼宇编号,楼宇名称,地址。导出后用 Excel 打开。</div>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

function escapeCsv(v: any) {
  if (v == null) return ''
  const s = String(v)
  return '"' + s.replace(/"/g, '""') + '"'
}

function downloadCsv(filename: string, headers: string[], rows: any[][]) {
  const headerLine = headers.map(h => escapeCsv(h)).join(',')
  const body = rows.map(r => r.map(c => escapeCsv(c)).join(',')).join('\n')
  const csv = headerLine + '\n' + body
  const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(()=> URL.revokeObjectURL(url), 5000)
}

function exportTemplate() {
  const headers = ['管理区', '楼宇编号', '楼宇名称', '地址']
  const rows: any[][] = [ ['管理区A', 'A1', '楼宇A1', '地址A1'] ]
  try {
    downloadCsv('楼宇导入模板.csv', headers, rows)
    message.success('模板导出已开始')
  } catch (err:any) {
    message.error('导出失败：' + (err?.message || '未知错误'))
  }
}

function exportExample() {
  const headers = ['管理区', '楼宇编号', '楼宇名称', '地址']
  const rows = [
    ['管理区A', 'A1', '楼宇A1', '地址A1'],
    ['管理区A', 'A2', '楼宇A2', '地址A2'],
    ['管理区B', 'B1', '楼宇B1', '地址B1']
  ]
  try {
    downloadCsv('楼宇示例数据.csv', headers, rows)
    message.success('示例数据导出已开始')
  } catch (err:any) {
    message.error('导出失败：' + (err?.message || '未知错误'))
  }
}
</script>

<style scoped>
/* 可自定义样式 */
</style>
