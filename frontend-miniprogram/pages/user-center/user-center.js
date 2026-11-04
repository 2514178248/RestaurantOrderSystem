/**
 * 用户中心页面
 */
const Storage = require('../../utils/storage');
const HttpRequest = require('../../utils/http');
const app = getApp();

const DEFAULT_USER_INFO = {
  nickName: '用户',
  avatarUrl: '/images/default-avatar.png'
};

const PAY_STATUS_TO_STATUS = {
  0: 'pending',
  1: 'paid',
  2: 'completed',
  3: 'cancelled'
};

Page({
  data: {
    userInfo: { ...DEFAULT_USER_INFO },
    orders: {
      waitingPay: 0,
      waitingReceive: 0,
      completed: 0,
      cancelled: 0
    },
    searchOrderId: ''
  },

  onLoad() {
    this.getUserInfo();
    this.loadOrderStats();
  },

  onShow() {
    this.getUserInfo();
    this.loadOrderStats();
  },

  getUserInfo() {
    const userInfo = Storage.getUserInfo();

    if (!userInfo) {
      this.setData({ userInfo: { ...DEFAULT_USER_INFO } });
      return;
    }

    this.setData({
      userInfo: {
        nickName: userInfo.nickname || userInfo.telNumber || '用户',
        avatarUrl: userInfo.avatar || '/images/default-avatar.png'
      }
    });
  },

  async loadOrderStats() {
    const localOrders = Storage.getOrdersByStatus('all');
    let orders = localOrders;
    const openid = wx.getStorageSync('openid') || '';

    if (openid) {
      try {
        const res = await HttpRequest.get('/order/list', { openid });
        const backendOrders = (res.data && res.data.orderList) || [];
        orders = this.mergeOrders(localOrders, backendOrders);
      } catch (err) {
        console.warn('加载后端订单统计失败，使用本地缓存:', err);
      }
    }

    const stats = {
      waitingPay: orders.filter(o => this.getOrderStatus(o) === 'pending').length,
      waitingReceive: orders.filter(o => this.getOrderStatus(o) === 'paid').length,
      completed: orders.filter(o => this.getOrderStatus(o) === 'completed').length,
      cancelled: orders.filter(o => this.getOrderStatus(o) === 'cancelled').length
    };

    this.setData({ orders: stats });
  },

  mergeOrders(localOrders, backendOrders) {
    const orderMap = {};

    localOrders.forEach(order => {
      if (order && order.orderId) {
        orderMap[String(order.orderId)] = order;
      }
    });

    backendOrders.forEach(order => {
      if (order && order.orderId) {
        const localOrder = orderMap[String(order.orderId)] || {};
        orderMap[String(order.orderId)] = {
          ...localOrder,
          ...order,
          // 后端数据覆盖时，清除本地缓存的 status，以后端 payStatus 为准
          status: undefined,
          goods: (order.goods && order.goods.length) ? order.goods : (localOrder.goods || [])
        };
      }
    });

    return Object.values(orderMap);
  },

  getOrderStatus(order) {
    // payStatus 来自后端，是数据源，优先级高于本地缓存的 status
    if (order.payStatus !== undefined && order.payStatus !== null) {
      return PAY_STATUS_TO_STATUS[Number(order.payStatus)] || 'pending';
    }
    if (order.status) return order.status;
    return 'pending';
  },

  viewOrders(e) {
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/order-list/order-list?status=${status}`
    });
  },

  onOrderIdInput(e) {
    this.setData({
      searchOrderId: e.detail.value
    });
  },

  async searchOrder() {
    const keyword = this.data.searchOrderId.trim();

    if (!keyword) {
      wx.showToast({
        title: '请输入订单号',
        icon: 'none'
      });
      return;
    }

    const localOrder = this.findLocalOrder(keyword);
    if (localOrder) {
      this.navigateToOrder(localOrder.orderId);
      return;
    }

    const backendOrder = await this.findBackendOrder(keyword);
    if (backendOrder) {
      this.navigateToOrder(backendOrder.orderId);
      return;
    }

    wx.showToast({
      title: '未查询到该订单',
      icon: 'none',
      duration: 1500
    });
  },

  findLocalOrder(keyword) {
    const numericOrderId = Number(keyword);
    return Storage.getOrderByNo(keyword) ||
      (Number.isFinite(numericOrderId) ? Storage.getOrder(numericOrderId) : null);
  },

  async findBackendOrder(keyword) {
    const openid = wx.getStorageSync('openid') || '';

    if (openid) {
      try {
        const res = await HttpRequest.get('/order/list', { openid });
        const orderList = (res.data && res.data.orderList) || [];
        const order = orderList.find(item =>
          String(item.orderNo || '') === keyword || String(item.orderId) === keyword
        );
        if (order) return order;
      } catch (err) {
        console.warn('按订单编号查询后端订单失败:', err);
      }
    }

    const numericOrderId = Number(keyword);
    if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
      return null;
    }

    try {
      const res = await HttpRequest.get('/order/detail', { orderId: numericOrderId });
      return res.data && res.data.order ? res.data.order : null;
    } catch (err) {
      console.warn('按订单ID查询后端订单失败:', err);
      return null;
    }
  },

  navigateToOrder(orderId) {
    const numericOrderId = Number(orderId);
    if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
      wx.showToast({ title: '订单ID无效', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${numericOrderId}`
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Storage.clearUserInfo();
          wx.removeStorageSync('openid');
          app.globalData.userInfo = null;
          app.globalData.openid = '';
          this.setData({ userInfo: { ...DEFAULT_USER_INFO } });

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });

          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
        }
      }
    });
  }
});
