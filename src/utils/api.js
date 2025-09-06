// API配置文件 - 设置axios默认配置和拦截器
import axios from 'axios';

// 设置基础URL
axios.defaults.baseURL = 'http://192.168.1.10:3000';

// 请求拦截器 - 自动添加认证头
axios.interceptors.request.use(
  (config) => {
    // 自动添加认证token
    config.headers['Authorization'] = 'mock-token';
    
    // 设置Content-Type
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('🚀 API请求:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应和错误
axios.interceptors.response.use(
  (response) => {
    console.log('✅ API响应:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API错误:', error.response?.status, error.config?.url, error.response?.data);
    
    // 统一错误处理
    if (error.response?.status === 401) {
      console.error('🔐 认证失败，请重新登录');
      // 可以在这里跳转到登录页面
    } else if (error.response?.status === 404) {
      console.error('🔍 API路径不存在:', error.config?.url);
    } else if (error.response?.status === 500) {
      console.error('🔥 服务器内部错误');
    }
    
    return Promise.reject(error);
  }
);

export default axios;
