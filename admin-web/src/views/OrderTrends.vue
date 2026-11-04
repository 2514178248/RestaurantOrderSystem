<template>
  <div class="chart-container">
    <el-card shadow="hover">
      <template #header>
        <div class="chart-header">
          <span>月度营业额统计</span>
        </div>
      </template>
      <div v-loading="loading" element-loading-text="加载中...">
        <div ref="trendChartRef" class="chart"></div>
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

const trendChartRef = ref(null)
let trendChart = null
const loading = ref(true)
const error = ref('')

onMounted(() => {
  fetchMonthlyRevenue()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) trendChart.dispose()
})

const fetchMonthlyRevenue = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('开始获取月度营业额数据...')
    const response = await axios.get('/order/monthlyRevenue')
    console.log('月度营业额接口响应:', response.data)
    
    if (response.data.code === 200) {
      const monthlyRevenue = response.data.data.monthlyRevenue
      console.log('月度营业额数据:', monthlyRevenue)
      
      if (!monthlyRevenue || monthlyRevenue.length === 0) {
        error.value = '暂无月度营业额数据'
        return
      }
      
      updateChart(monthlyRevenue)
    } else {
      error.value = response.data.msg || '获取数据失败'
    }
  } catch (err) {
    console.error('获取月度营业额数据失败:', err)
    error.value = err.message || '网络请求失败'
  } finally {
    loading.value = false
  }
}

const updateChart = (monthlyRevenue) => {
  if (!trendChartRef.value) return
  
  // 初始化图表
  trendChart = echarts.init(trendChartRef.value)
  
  // 准备数据 - 确保数据格式正确
  const months = monthlyRevenue.map(item => {
    // 确保月份格式正确
    const month = item.month || item.MONTH || item.monthStr
    return month ? month.toString() : '未知月份'
  })
  
  const revenues = monthlyRevenue.map(item => {
    // 确保营业额是数字
    const revenue = item.revenue || item.REVENUE || item.revenueNum
    return parseFloat(revenue) || 0
  })
  
  console.log('图表数据 - 月份:', months)
  console.log('图表数据 - 营业额:', revenues)
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>营业额: ￥${data.value}`
      }
    },
    xAxis: { 
      type: 'category', 
      data: months,
      name: '月份'
    },
    yAxis: { 
      type: 'value',
      name: '营业额（元）',
      axisLabel: {
        formatter: '￥{value}'
      }
    },
    series: [
      {
        name: '营业额',
        data: revenues,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(64, 158, 255, 0.7)'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0.1)'
            }]
          }
        },
        itemStyle: { color: '#409EFF' },
        lineStyle: {
          width: 3
        },
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            return '￥' + params.value
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
  
  trendChart.setOption(option)
}

const handleResize = () => {
  trendChart && trendChart.resize()
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
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message {
  margin-top: 20px;
}
</style>
