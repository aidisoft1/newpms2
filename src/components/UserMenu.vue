<template>
  <div class="user-menu">
    <div class="logo-area">
      <img src="/logo.png" alt="logo" class="logo" />
      <span class="brand">艾迪物业</span>
    </div>
    <a-dropdown v-if="isLoggedIn" trigger="click">
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item key="profile"><IdcardOutlined /> <span>个人中心</span></a-menu-item>
          <a-menu-item key="switch"><LoginOutlined /> <span>切换用户</span></a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout"><LogoutOutlined /> <span>退出登录</span></a-menu-item>
        </a-menu>
      </template>
      <div class="user-trigger">
        <a-avatar :style="{ backgroundColor: '#2f54eb', color: '#fff' }">{{ userInitial }}</a-avatar>
        <span class="username">{{ userDisplay }}</span>
        <DownOutlined class="chev" />
      </div>
    </a-dropdown>
    <a-button v-else type="link" @click="showLogin">登录</a-button>
    <a-modal v-model:visible="loginVisible" title="用户登录" @ok="handleSubmit" :ok-loading="loading" ok-text="确定" cancel-text="取消">
      <a-form :model="form">
        <a-form-item label="用户名">
          <a-input v-model:value="form.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="form.remember">记住我</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">

import { defineComponent, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { IdcardOutlined, LoginOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons-vue'
import axios from 'axios'

export default defineComponent({
  name: 'UserMenu',
  components: { IdcardOutlined, LoginOutlined, LogoutOutlined, DownOutlined },
  setup() {
    const router = useRouter()
    const loginVisible = ref(false)
    const loading = ref(false)

    // 用户信息
    const user = reactive<{ name: string, number?: string }>({ name: '', number: '' })
    const form = reactive({ username: '', password: '', remember: true })
    // 登录状态
    const isLoggedIn = computed(() => !!localStorage.getItem('token'))
    // 显示用户名
    const userDisplay = computed(() => user.name || localStorage.getItem('username') || '用户')
    const userInitial = computed(() => userDisplay.value ? userDisplay.value[0] : 'U')

    // 初始化用户信息
    function loadUser() {
      const name = localStorage.getItem('username')
      if (name) user.name = name
    }
    loadUser()

    function showLogin() {
      form.username = ''
      form.password = ''
      form.remember = true
      loginVisible.value = true
    }


    async function handleSubmit() {
      if (!form.username || !form.password) {
        message.error('请输入用户名和密码')
        return
      }
      loading.value = true
      try {
        const res = await axios.post('/api/login', {
          number: form.username,
          password: form.password
        })
        if (res.data && res.data.code === 0) {
          localStorage.setItem('token', res.data.token)
          if (res.data.user && res.data.user.number) {
            localStorage.setItem('username', res.data.user.number)
            user.name = res.data.user.number
          } else if (res.data.user && res.data.user.name) {
            localStorage.setItem('username', res.data.user.name)
            user.name = res.data.user.name
          }
          message.success('欢迎，' + user.name)
          loginVisible.value = false
          setTimeout(() => {
            window.location.reload()
          }, 500)
        } else {
          message.error(res.data?.msg || '登录失败')
        }
      } catch (e: any) {
        message.error(e?.response?.data?.msg || '网络错误或服务器异常')
      } finally {
        loading.value = false
      }
    }


    function onMenuClick({ key }: { key: string }) {
      if (key === 'logout') {
        user.name = ''
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        message.success('已退出')
        setTimeout(() => {
          window.location.href = '/login'
        }, 300)
      } else if (key === 'switch') {
        user.name = ''
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        showLogin()
        setTimeout(() => {
          window.location.href = '/login'
        }, 300)
      } else if (key === 'profile') {
        router.push('/profile').catch(() => {})
      }
    }

  return { isLoggedIn, user, userInitial, userDisplay, loginVisible, loading, form, showLogin, handleSubmit, onMenuClick }
  }
})
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}
.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
.brand {
  font-weight: bold;
  color: #2f54eb;
  font-size: 18px;
}
.user-trigger { display:flex; align-items:center; gap:8px; cursor:pointer }
.user-trigger .username { color: #333; font-weight:500 }
.user-trigger .chev { color: #666 }
</style>