<template>
  <div class="auth-page">
    <div class="auth-layout">
      <section class="auth-visual">
        <img
          v-if="isPasswordFocused"
          :src="authVisualImage"
          alt="厨房插画"
          class="auth-visual__image"
        />
        <transition v-else name="auth-visual-fade" mode="out-in">
          <img :key="authVisualImage" :src="authVisualImage" alt="厨房插画" class="auth-visual__image" />
        </transition>
      </section>

      <section class="auth-panel">
        <div class="auth-panel__content">
          <h1 class="auth-title">欢迎登录</h1>
          <p class="auth-subtitle">沉浸式管理菜品、订单与经营节奏，让后台页面也保留温暖细腻的品牌质感。</p>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            class="auth-form"
            status-icon
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                :prefix-icon="User"
                size="large"
                clearable
                placeholder="请输入用户名"
                @focus="handleUsernameFocus"
                @blur="handleUsernameBlur"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                :prefix-icon="Lock"
                type="password"
                size="large"
                clearable
                show-password
                placeholder="请输入密码"
                @focus="startFrameAnimation"
                @blur="stopFrameAnimation"
              />
            </el-form-item>

            <el-form-item class="auth-form__actions">
              <el-button
                type="primary"
                size="large"
                class="auth-submit"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <div class="auth-helper">请使用已注册的账号登录</div>

          <div class="auth-switch">
            <span>还没有账号？</span>
            <el-button link type="primary" @click="handleRegister">立即注册</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import axios from 'axios'
import authKitchenImage from '../assets/auth-kitchen.png'
import authKitchenLookImage from '../assets/auth-kitchen-look.png'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)
const currentFrameIndex = ref(0)
const animationTimer = ref(null)

const animationFrames = Array.from({ length: 21 }, (_, index) => {
  const frameNumber = String(index + 1).padStart(3, '0')
  return new URL(`../assets/frame_${frameNumber}.png`, import.meta.url).href
})

const authVisualImage = computed(() => {
  if (isPasswordFocused.value) {
    return animationFrames[currentFrameIndex.value]
  }
  return isUsernameFocused.value ? authKitchenLookImage : authKitchenImage
})

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const stopFrameAnimation = () => {
  if (animationTimer.value !== null) {
    window.clearInterval(animationTimer.value)
    animationTimer.value = null
  }
  isPasswordFocused.value = false
  currentFrameIndex.value = 0
}

const startFrameAnimation = () => {
  if (animationTimer.value !== null) return

  isPasswordFocused.value = true
  currentFrameIndex.value = 0

  animationTimer.value = window.setInterval(() => {
    currentFrameIndex.value = (currentFrameIndex.value + 1) % animationFrames.length
  }, 70)
}

const handleUsernameFocus = () => {
  isUsernameFocused.value = true
}

const handleUsernameBlur = () => {
  isUsernameFocused.value = false
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  const isValid = await loginFormRef.value.validate().catch(() => false)
  if (!isValid) return

  loading.value = true

  try {
    const response = await axios.post('/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    if (response.data.code === 200) {
      localStorage.setItem('token', 'auth-token-' + Date.now())
      localStorage.setItem('username', response.data.data.username)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(response.data.message || '用户名或密码错误')
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('登录失败，请检查网络连接')
    }
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}

onBeforeUnmount(() => {
  stopFrameAnimation()
})
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

.auth-visual-fade-enter-active,
.auth-visual-fade-leave-active {
  transition: opacity 0.35s ease;
}

.auth-visual-fade-enter-from,
.auth-visual-fade-leave-to {
  opacity: 0;
}

.auth-panel {
  flex: 0 0 35%;
  width: 35%;
  height: 100%;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.93);
  box-shadow: 0 24px 56px rgba(210, 190, 183, 0.24);
  padding: 56px 38px;
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
  margin: 10px 0 26px;
  color: #b3a5a0;
  font-size: 14px;
  line-height: 1.7;
}

.auth-form {
  width: 100%;
}

:deep(.auth-form .el-form-item) {
  margin-bottom: 18px;
}

:deep(.auth-form .el-input__wrapper) {
  min-height: 54px;
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

.auth-helper {
  margin-top: 2px;
  color: #b7a8a2;
  font-size: 13px;
}

.auth-switch {
  margin-top: 16px;
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
    min-height: 500px;
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
    padding: 34px 22px;
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
