import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'statistics/trends',
        name: 'OrderTrends',
        component: () => import('../views/OrderTrends.vue'),
        meta: { title: '订单趋势' }
      },
      {
        path: 'statistics/sales',
        name: 'ProductSales',
        component: () => import('../views/ProductSales.vue'),
        meta: { title: '商品销量' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/ProductList.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/OrderList.vue'),
        meta: { title: '订单管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.name !== 'Login' && to.name !== 'Register' && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
