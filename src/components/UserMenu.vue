<template>
  <div class="user-menu">
    <a-button v-if="!isLoggedIn" type="link" @click="showLogin">登录</a-button>

    <a-dropdown v-else trigger="click">
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
        <span class="username">{{ user.name }}</span>
        <DownOutlined class="chev" />
      </div>
    </a-dropdown>

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

interface User { name: string }

export default defineComponent({
  name: 'UserMenu',
  components: { IdcardOutlined, LoginOutlined, LogoutOutlined, DownOutlined },
  setup() {
    const router = useRouter()
    const loginVisible = ref(false)
    const loading = ref(false)
    const user = reactive<User>({ name: '' })

    const form = reactive({ username: '', password: '', remember: true })

    // load saved user
    const saved = localStorage.getItem('pm_user')
    if (saved) {
      try {
        const obj = JSON.parse(saved)
        if (obj?.name) user.name = obj.name
      } catch (e) {
        // ignore
      }
    }

    const isLoggedIn = computed(() => !!user.name)
    const userInitial = computed(() => (user.name ? user.name[0] : 'U'))

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
      await new Promise((r) => setTimeout(r, 700))
      user.name = form.username
      if (form.remember) localStorage.setItem('pm_user', JSON.stringify({ name: user.name }))
      loading.value = false
      loginVisible.value = false
      message.success(`欢迎，${user.name}`)
    }

    function onMenuClick({ key }: { key: string }) {
      if (key === 'logout') {
        user.name = ''
        localStorage.removeItem('pm_user')
        message.success('已退出')
      } else if (key === 'switch') {
        showLogin()
      } else if (key === 'profile') {
        router.push('/profile').catch(() => {})
      }
    }

    return { isLoggedIn, user, userInitial, loginVisible, loading, form, showLogin, handleSubmit, onMenuClick }
  }
})
</script>

<style scoped>
.user-trigger { display:flex; align-items:center; gap:8px; cursor:pointer }
.user-trigger .username { color: #333; font-weight:500 }
.user-trigger .chev { color: #666 }
</style>