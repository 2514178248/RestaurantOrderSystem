import { createApp } from 'vue'
import 'normalize.css/normalize.css' // Import normalize.css first
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './style.css'
import axios from 'axios'

// 开发环境通过 Vite 代理转发到后端，避免浏览器跨域拦截
axios.defaults.baseURL = '/api'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
