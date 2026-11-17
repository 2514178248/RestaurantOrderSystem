<template>
  <div class="order-container">
    <!-- Filters -->
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable @change="fetchOrders">
            <el-option label="待支付" value="pending"></el-option>
            <el-option label="待完成" value="processing"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            @change="fetchOrders"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchOrders">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Order Table -->
    <el-table :data="orderList" border style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column prop="orderNo" label="订单号" width="180">
        <template #default="scope">
          <el-link type="primary" @click="showDetail(scope.row)">{{ scope.row.orderNo }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="customerName" label="用户昵称"></el-table-column>
      <el-table-column prop="orderTime" label="下单时间" width="180"></el-table-column>
      <el-table-column prop="info" label="取餐信息"></el-table-column>
      <el-table-column prop="amount" label="总金额">
        <template #default="scope">¥{{ scope.row.amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 'processing'"
            size="small" 
            type="success" 
            @click="handleStatusChange(scope.row, 'completed')"
          >标记完成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchOrders"
      ></el-pagination>
    </div>

    <!-- Order Detail Dialog -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.openid }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ currentOrder.customerName }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.orderTime }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ currentOrder.amount }}</el-descriptions-item>
          <el-descriptions-item label="取餐信息" :span="2">{{ currentOrder.info }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin: 20px 0 10px">商品清单</h4>
        <el-table :data="currentOrder.items" border size="small">
          <el-table-column prop="name" label="商品名称"></el-table-column>
          <el-table-column prop="price" label="单价"></el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column label="小计">
            <template #default="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import axios from 'axios'

const orderList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentOrder = ref(null)

const searchForm = reactive({
  orderNo: '',
  status: '',
  dateRange: []
})

const getStatusType = (status) => {
  const map = {
    pending: 'danger',
    processing: 'warning',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    processing: '待完成',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status]
}

const tableRowClassName = ({ row }) => {
  if (row.isNew) {
    return 'new-order-row'
  }
  return ''
}

// 格式化为本地日期 YYYY-MM-DD，避免 toISOString() 的时区偏移问题
const formatLocalDate = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchOrders = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = formatLocalDate(searchForm.dateRange[0])
      params.endDate = formatLocalDate(searchForm.dateRange[1])
    }

    const response = await axios.get('/order/list', { params })
    if (response.data.code === 200 && response.data.data) {
      orderList.value = response.data.data.records || response.data.data.list || []
      total.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

const handleStatusChange = async (row, newStatus) => {
  // 防误触：弹窗确认后才执行，点击取消则不修改状态
  try {
    await ElMessageBox.confirm(
      `是否将订单 ${row.orderNo} 标记为已完成？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
  } catch (e) {
    return // 用户点击取消
  }
  try {
    const response = await axios.put(`/order/${row.id}/status`, { status: newStatus })
    if (response.data.code === 200 || response.data.success) {
      row.status = newStatus
      ElMessage.success('订单状态已更新')
    } else {
      ElMessage.error(response.data.message || '状态更新失败')
    }
  } catch (error) {
    console.error('订单状态更新失败:', error)
    ElMessage.error('订单状态更新失败')
  }
}

const showDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

// WebSocket 实时接收订单推送（新订单/状态变更）
let ws = null
let reconnectTimer = null

const connectWebSocket = () => {
  // 通过 Vite 代理连接后端，避免写死 IP
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  ws = new WebSocket(`${proto}://${window.location.host}/ws/orders`)

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'new_order') {
        ElNotification({
          title: '新订单提醒',
          message: `收到新订单 ${msg.orderNo || ''}，金额 ¥${msg.amount ?? '--'}，请及时处理`,
          type: 'warning',
          duration: 5000
        })
      }
      // 新订单 / 状态变更均刷新列表
      fetchOrders()
    } catch (e) {
      console.error('解析 WebSocket 消息失败:', e)
    }
  }

  ws.onclose = () => {
    // 断线 5 秒后自动重连
    reconnectTimer = setTimeout(connectWebSocket, 5000)
  }

  ws.onerror = () => {
    ws && ws.close()
  }
}

onMounted(() => {
  fetchOrders()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.onclose = null // 防止触发重连
    ws.close()
    ws = null
  }
  if (reconnectTimer) clearTimeout(reconnectTimer)
})
</script>

<style>
.new-order-row {
  background-color: #fdf6ec !important;
}
</style>

<style scoped>
.order-container {
  padding: 20px;
  background-color: white;
  border-radius: 4px;
}
.toolbar {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
