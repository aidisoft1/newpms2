// 通用类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Building {
  id: number;
  name: string;
  address: string;
  totalFloors: number;
  totalRooms: number;
}

export interface Room {
  id: number;
  buildingId: number;
  roomNumber: string;
  floor: number;
  area: number;
  status: 'vacant' | 'occupied' | 'maintenance';
}

export interface Fee {
  id: number;
  roomId: number;
  type: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
