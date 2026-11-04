<template>
  <div class="auth-page">
    <div class="auth-layout">
      <section class="auth-visual">
        <img :src="authKitchenImage" alt="厨房插画" class="auth-visual__image" />
      </section>

      <section class="auth-panel">
        <div class="auth-panel__content">
          <h1 class="auth-title">欢迎注册</h1>
          <p class="auth-subtitle">创建新账号后即可进入商家后台，管理你的门店业务。</p>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="rules"
            class="auth-form"
            status-icon
            @keyup.enter="handleRegister"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                :prefix-icon="User"
                size="large"
                clearable
                placeholder="请输入用户名"
              />
            </el-form-item>

            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                :prefix-icon="Phone"
                size="large"
                clearable
                placeholder="请输入手机号"
              />
            </el-form-item>

            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                :prefix-icon="Message"
                size="large"
                clearable
                placeholder="请输入邮箱"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                :prefix-icon="Lock"
                type="password"
                size="large"
                clearable
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                :prefix-icon="Lock"
                type="password"
                size="large"
                clearable
                show-password
                placeholder="请再次输入密码"
              />
            </el-form-item>

            <el-form-item class="auth-form__actions">
              <el-button
                type="primary"
                size="large"
                class="auth-submit"
                :loading="loading"
                @click="handleRegister"
              >
                立即注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="auth-switch">
            <span>已经有账号了？</span>
            <el-button link type="primary" @click="goToLogin">返回登录</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, Phone, User } from '@element-plus/icons-vue'
import axios from 'axios'
import authKitchenImage from '../assets/auth-kitchen.png'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }

  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }

  callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  const isValid = await registerFormRef.value.validate().catch(() => false)
  if (!isValid) return

  loading.value = true

  try {
    const response = await axios.post('/register', {
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone,
      email: registerForm.email,
      created_at: new Date().toISOString()
    })

    if (response.data.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(response.data.message || '注册失败')
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message)
      return
    }

    ElMessage.error('注册失败，请稍后重试')
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  height: 100vh;
  padding: 18px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 8% 6%, rgba(255, 225, 220, 0.86) 0%, rgba(255, 225, 220, 0) 30%),
    radial-gradient(circle at 92% 90%, rgba(255, 214, 206, 0.7) 0%, rgba(255, 214, 206, 0) 36%),
    linear-gradient(135deg, #f8f8f8 0%, #fdf6f3 45%, #fff1eb 100%);
}

.auth-layout {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 18px;
}

.auth-visual {
  flex: 0 0 65%;
  width: 65%;
  min-width: 0;
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 22px 54px rgba(235, 191, 184, 0.28);
  background: #f8c7ca;
}

.auth-visual__image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: inherit;
}

.auth-panel {
  flex: 0 0 35%;
  width: 35%;
  height: 100%;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.93);
  box-shadow: 0 24px 56px rgba(210, 190, 183, 0.24);
  padding: 42px 38px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-panel__content {
  width: 100%;
  max-width: 420px;
}

.auth-title {
  margin: 0;
  color: #312d2c;
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
}

.auth-subtitle {
  margin: 10px 0 24px;
  color: #b3a5a0;
  font-size: 14px;
  line-height: 1.7;
}

.auth-form {
  width: 100%;
}

:deep(.auth-form .el-form-item) {
  margin-bottom: 16px;
}

:deep(.auth-form .el-input__wrapper) {
  min-height: 52px;
  border-radius: 15px;
  box-shadow: 0 0 0 1px #efe5e1;
  transition: box-shadow 0.22s ease;
}

:deep(.auth-form .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #ffb8b0;
}

:deep(.auth-form .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px #ff8f85;
}

:deep(.auth-form .el-input__prefix-inner) {
  color: #ff8f85;
}

:deep(.auth-form__actions .el-form-item__content) {
  display: block;
}

.auth-submit {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff958c 0%, #ff746d 100%);
  box-shadow: 0 14px 26px rgba(255, 124, 116, 0.28);
  font-weight: 600;
}

.auth-switch {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #948784;
  font-size: 14px;
}

:deep(.auth-switch .el-button) {
  padding: 0;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .auth-page {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .auth-layout {
    height: auto;
    min-height: calc(100vh - 36px);
    flex-direction: column;
  }

  .auth-visual,
  .auth-panel {
    width: 100%;
    flex: none;
  }

  .auth-visual {
    height: 44vh;
    min-height: 280px;
  }

  .auth-panel {
    min-height: 620px;
    height: auto;
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: 14px;
  }

  .auth-layout {
    gap: 14px;
  }

  .auth-visual,
  .auth-panel {
    border-radius: 24px;
  }

  .auth-panel {
    padding: 32px 22px;
  }

  .auth-title {
    font-size: 30px;
  }

  .auth-switch {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
