<template>
  <div class="product-container">
    <!-- Search & Toolbar -->
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="商品名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="上架" value="on_sale"></el-option>
            <el-option label="下架" value="off_shelf"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="success" @click="handleAddProduct">新增商品</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Product Table -->
    <el-table :data="displayProducts" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="image" label="图片" width="120">
        <template #default="scope">
          <el-image :src="scope.row.image" style="width: 100px; height: 100px" fit="cover"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称"></el-table-column>
      <el-table-column prop="categoryName" label="分类"></el-table-column>
      <el-table-column prop="price" label="单价">
        <template #default="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEditProduct(scope.row)">编辑</el-button>
          <el-button
            size="small"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteProduct(scope.row)">删除</el-button>
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
      ></el-pagination>
    </div>

    <!-- Product Dialog -->
    <el-dialog v-model="productDialogVisible" :title="productForm.id ? '编辑商品' : '新增商品'">
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name"></el-input>
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="productForm.price" :min="0" :precision="2"></el-input-number>
        </el-form-item>
        <el-form-item label="图片链接" prop="image">
          <el-input v-model="productForm.image" placeholder="输入图片URL"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="productForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const allProducts = ref([])
const categories = ref([
  { id: 1, name: '主食', sort: 1 },
  { id: 2, name: '饮品', sort: 2 },
  { id: 3, name: '小吃', sort: 3 }
])
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  keyword: '',
  category: '',
  status: ''
})

const filteredProducts = computed(() => {
  let list = allProducts.value
  if (searchForm.keyword) {
    const kw = searchForm.keyword.toLowerCase()
    list = list.filter(p => p.name && p.name.toLowerCase().includes(kw))
  }
  if (searchForm.category) {
    list = list.filter(p => p.categoryId === searchForm.category)
  }
  if (searchForm.status) {
    const statusVal = searchForm.status === 'on_sale' ? 1 : 0
    list = list.filter(p => p.status === statusVal)
  }
  return list
})

const total = computed(() => filteredProducts.value.length)

const displayProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredProducts.value.slice(start, start + pageSize.value)
})

// Product Form
const productDialogVisible = ref(false)
const productFormRef = ref(null)
const productForm = reactive({
  id: null,
  name: '',
  categoryId: null,
  price: 0,
  image: '',
  status: 1
})
const productRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

const buildProductPayload = () => ({
  name: String(productForm.name || '').trim(),
  categoryId: Number(productForm.categoryId),
  price: Number(productForm.price),
  image: String(productForm.image || '').trim(),
  status: Number(productForm.status) === 0 ? 0 : 1
})

// API base URL
const API_BASE_URL = ''

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dishes`)
    allProducts.value = response.data.map(dish => ({
      ...dish,
      categoryName: categories.value.find(cat => cat.id === dish.categoryId)?.name || '未知分类'
    }))
  } catch (error) {
    console.error('获取菜品数据失败:', error)
    ElMessage.error('获取菜品数据失败')
  }
}

const handleQuery = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleAddProduct = () => {
  Object.assign(productForm, { id: null, name: '', categoryId: null, price: 0, image: '', status: 1 })
  productDialogVisible.value = true
}

const handleEditProduct = (row) => {
  const rowCopy = { ...row }
  rowCopy.status = Number(rowCopy.status) === 0 ? 0 : 1
  Object.assign(productForm, rowCopy)
  productDialogVisible.value = true
}

const submitProduct = async () => {
  if (!productFormRef.value) return
  try {
    await productFormRef.value.validate(async (valid) => {
      if (!valid) return
      const payload = buildProductPayload()
      console.log('提交菜品payload:', payload)
      
      if (productForm.id) {
        // 更新菜品
        const response = await axios.put(`${API_BASE_URL}/dishes/${productForm.id}`, payload)
        if (response.data.success) {
          ElMessage.success('更新成功')
        } else {
          ElMessage.error(response.data.message || '更新失败')
          return
        }
      } else {
        // 新增菜品
        const response = await axios.post(`${API_BASE_URL}/dishes`, payload)
        if (response.data.success) {
          ElMessage.success('创建成功')
        } else {
          ElMessage.error(response.data.message || '创建失败')
          return
        }
      }
      
      productDialogVisible.value = false
      fetchProducts()
    })
  } catch (error) {
    console.error('操作失败:', error)
    const backendMsg = error?.response?.data?.message || error?.response?.data?.error
    ElMessage.error(backendMsg || '操作失败')
  }
}

const toggleStatus = async (row) => {
  try {
    // 根据当前状态决定新状态：1 -> 0, 0 -> 1
    const currentStatus = row.status;
    const newStatusValue = currentStatus === 1 ? 0 : 1;
    const newStatusStr = currentStatus === 1 ? 'off_shelf' : 'on_sale';
    
    const response = await axios.put(`${API_BASE_URL}/dishes/${row.id}/status`, { status: newStatusStr })
    if (response.data.success) {
      row.status = newStatusValue; // 更新为整数状态
      ElMessage.success('状态更新成功')
    } else {
      ElMessage.error(response.data.message || '状态更新失败')
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  }
}

const handleDeleteProduct = (row) => {
  ElMessageBox.confirm('确认删除该商品吗?', '提示', { type: 'warning' }).then(async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/dishes/${row.id}`)
      if (response.data.success) {
        ElMessage.success('删除成功')
        fetchProducts()
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-container {
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
