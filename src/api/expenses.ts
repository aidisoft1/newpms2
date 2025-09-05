import axios from 'axios'

export interface Expense {
  Id: number
  Room_ID: string
  Customer_ID: string
  ExpItem_ID: string
  FDate: string
  Amount: number
  ZnjAmount: number
  ZnjBeginDate: string
  ZnjEndDate: string
  EndAmount: number
  Note: string
}

// 获取费用列表
export function fetchExpenses(params?: any) {
  return axios.get<Expense[]>('/api/expenses', { params })
}

// 新增费用
export function createExpense(data: Partial<Expense>) {
  return axios.post('/api/expenses', data)
}

// 更新费用
export function updateExpense(id: number, data: Partial<Expense>) {
  return axios.put(`/api/expenses/${id}`, data)
}

// 删除费用
export function deleteExpense(id: number) {
  return axios.delete(`/api/expenses/${id}`)
}
