<template>
  <div class="chart-container">
    <el-card shadow="hover">
      <template #header>商品销量排行</template>
      <div v-loading="loading" element-loading-text="加载中...">
        <div ref="rankChartRef" class="chart"></div>
        <div v-if="error" class="error-message">
          <el-alert title="数据加载失败" :description="error" type="error" show-icon />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const rankChartRef = ref(null)
let rankChart = null
const loading = ref(true)
const error = ref('')

onMounted(() => {
  fetchProductSales()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (rankChart) rankChart.dispose()
})

const fetchProductSales = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('开始获取菜品销量数据...')
    const response = await axios.get('/order/productSales')
    console.log('菜品销量接口响应:', response.data)
    
    if (response.data.code === 200) {
      const productSales = response.data.data.productSales
      console.log('菜品销量数据:', productSales)
      
      if (!productSales || productSales.length === 0) {
        error.value = '暂无菜品销量数据'
        return
      }
      
      updateChart(productSales)
    } else {
      error.value = response.data.msg || '获取数据失败'
    }
  } catch (err) {
    console.error('获取菜品销量数据失败:', err)
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

const updateChart = (productSales) => {
  if (!rankChartRef.value) return
  
  // 初始化图表
  rankChart = echarts.init(rankChartRef.value)
  
  // 准备数据 - 确保数据格式正确
  const categories = productSales.map(item => {
    // 确保菜品名称格式正确
    const name = item.name || item.NAME || item.dishName
    return name ? name.toString() : '未知菜品'
  }).reverse()
  
  const data = productSales.map(item => {
    // 确保销量是数字
    const sales = item.sales || item.SALES || item.quantity
    return parseInt(sales) || 0
  }).reverse()
  
  console.log('图表数据 - 菜品名称:', categories)
  console.log('图表数据 - 销量:', data)
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>销量: ${data.value}份`
      }
    },
    xAxis: { 
      type: 'value',
      name: '销量（份）'
    },
    yAxis: { 
      type: 'category', 
      data: categories,
      name: '菜品名称'
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data,
        itemStyle: { color: '#409EFF' },
        label: {
          show: true,
          position: 'right',
          formatter: function(params) {
            return params.value + '份'
          }
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  rankChart.setOption(option)
}

const handleResize = () => {
  rankChart && rankChart.resize()
}
</script>

<style scoped>
.chart-container {
  padding: 20px;
}
.chart {
  height: 500px;
  width: 100%;
}
.error-message {
  margin-top: 20px;
}
</style>
