<template>
  <div class="login-page">
    <a-card title="用户登录123" style="max-width:360px;margin:80px auto;">
      <a-form :model="form" @submit.prevent="onSubmit">
        <a-form-item label="用户名1">
          <a-input v-model:value="form.username" placeholder="请输入用户名1" />
        </a-form-item>
        <a-form-item label="密码2">
          <a-input-password v-model:value="form.password" placeholder="请输入密码2" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>登录</a-button>
        </a-form-item>
  <a-alert v-if="error" type="error" :message="error" show-icon style="margin-bottom:0;" />
  <a-alert v-if="debug" type="info" :message="debug" show-icon style="margin-top:8px;" />
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const form = reactive({ username: '', password: '' })
    const loading = ref(false)
    const error = ref('')
    const debug = ref('')

    async function onSubmit() {
      console.log('onSubmit', form)
      error.value = ''
      debug.value = ''
      loading.value = true
      try {
        const res = await axios.post('/api/login', {
          number: form.username,
          password: form.password
        })
        if (res.data && res.data.code === 0) {
          localStorage.setItem('token', res.data.token)
          // 新增：保存用户名到本地，便于主界面显示
          if (res.data.user && res.data.user.number) {
            localStorage.setItem('username', res.data.user.number)
          }
          message.success('登录成功')
          setTimeout(() => {
            router.push('/')
          }, 500)
        } else {
          error.value = res.data?.msg || '登录失败，请检查用户名和密码'
          debug.value = res.data?.debug || res.data?.error || ''
        }
      } catch (e: any) {
        error.value = e?.response?.data?.msg || '网络错误或服务器异常'
        debug.value = e?.response?.data?.debug || e?.response?.data?.error || ''
      } finally {
        loading.value = false
      }
    }

    return { form, loading, error, debug, onSubmit }
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
