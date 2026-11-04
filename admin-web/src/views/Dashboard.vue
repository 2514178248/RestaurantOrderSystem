<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>今日订单数</template>
          <div class="card-value">{{ stats.todayOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>今日销售额</template>
          <div class="card-value">¥{{ stats.todaySales }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>累计订单数</template>
          <div class="card-value">{{ stats.totalOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>累计销售额</template>
          <div class="card-value">¥{{ stats.totalSales }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <div class="welcome-text">
      <h2>欢迎进入商家后台管理系统</h2>
      <p>请从左侧菜单选择查看具体的统计数据。</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import axios from 'axios'

const stats = reactive({
  todayOrders: 0,
  todaySales: 0,
  totalOrders: 0,
  totalSales: 0
})

const fetchDashboardStats = async () => {
  try {
    const response = await axios.get('/order/dashboard')
    if (response.data.code === 200 && response.data.data) {
      const data = response.data.data
      stats.todayOrders = data.todayOrders ?? 0
      stats.todaySales = data.todaySales ?? 0
      stats.totalOrders = data.totalOrders ?? 0
      stats.totalSales = data.totalSales ?? 0
    }
  } catch (error) {
    console.error('获取Dashboard统计数据失败:', error)
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.card-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #303133;
}
.welcome-text {
  text-align: center;
  margin-top: 100px;
  color: #606266;
}
</style>
