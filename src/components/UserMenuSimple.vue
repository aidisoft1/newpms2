<template>
  <div style="display:flex; align-items:center; gap:8px">
    <a-button v-if="!logged" type="link" @click="showLogin">登录</a-button>

    <a-dropdown v-else placement="bottomRight">
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item key="profile">个人中心</a-menu-item>
          <a-menu-item key="switch">切换用户</a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout">退出登录</a-menu-item>
        </a-menu>
      </template>
      <a style="display:flex; align-items:center; gap:8px; cursor:pointer">
        <a-avatar>{{ initial }}</a-avatar>
        <span style="font-weight:600">{{ name }}</span>
      </a>
    </a-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'UserMenuSimple',
  setup() {
    const logged = ref(false)
    const name = ref('')

    // load saved name
    try {
      const s = localStorage.getItem('pm_user')
      if (s) {
        const obj = JSON.parse(s)
        if (obj?.name) {
          name.value = obj.name
          logged.value = true
        }
      }
    } catch (e) {
      /* ignore */
    }

    const initial = computed(() => (name.value ? name.value[0] : 'U'))

    function showLogin() {
      const username = prompt('输入用户名用于模拟登录：') || ''
      if (!username) return
      name.value = username
      logged.value = true
      localStorage.setItem('pm_user', JSON.stringify({ name: username }))
      message.success(`欢迎，${username}`)
    }

    function onMenuClick({ key }: { key: string }) {
      if (key === 'logout') {
        name.value = ''
        logged.value = false
        localStorage.removeItem('pm_user')
        message.success('已登出')
      } else if (key === 'switch') {
        name.value = ''
        logged.value = false
        localStorage.removeItem('pm_user')
        showLogin()
      } else if (key === 'profile') {
        message.info('打开个人中心（占位）')
      }
    }

    return { logged, name, initial, showLogin, onMenuClick }
  }
})
</script>

<style scoped>
.ant-avatar { background: #2f54eb; color:#fff }
</style>
