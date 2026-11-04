/**
 * 订单列表页
 */
const Storage = require('../../utils/storage');
const HttpRequest = require('../../utils/http');

const PAY_STATUS_TO_STATUS = {
  0: 'pending',
  1: 'paid',
  2: 'completed',
  3: 'cancelled'
};

const STATUS_TO_PAY_STATUS = {
  pending: 0,
  paid: 1,
  completed: 2,
  cancelled: 3
};

Page({
  data: {
    status: 'all',
    orders: [],
    statusMap: {
      pending: '待支付',
      paid: '待完成',
      completed: '已完成',
      cancelled: '已取消',
      all: '全部订单'
    }
  },

  onLoad(options) {
    const status = options.status || 'all';
    this.setData({ status });
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    const { status } = this.data;
    const localOrders = Storage.getOrdersByStatus('all')
      .map(order => this.normalizeOrder(order))
      .filter(order => this.isValidOrderId(order.orderId));
    let backendOrders = [];
    const openid = wx.getStorageSync('openid') || '';

    if (openid) {
      try {
        const res = await HttpRequest.get('/order/list', { openid });
        const orderList = (res.data && res.data.orderList) || [];
        backendOrders = orderList
          .map(order => this.normalizeOrder(order))
          .filter(order => this.isValidOrderId(order.orderId));
      } catch (err) {
        console.warn('后端订单列表加载失败，使用本地缓存:', err);
      }
    }

    const orders = this.mergeOrders(localOrders, backendOrders)
      .filter(order => status === 'all' || order.status === status);

    this.setData({ orders });
  },

  mergeOrders(localOrders, backendOrders) {
    const orderMap = {};

    localOrders.forEach(order => {
      orderMap[String(order.orderId)] = order;
    });

    backendOrders.forEach(order => {
      const key = String(order.orderId);
      const localOrder = orderMap[key] || {};
      orderMap[key] = {
        ...localOrder,
        ...order,
        goods: (order.goods && order.goods.length) ? order.goods : (localOrder.goods || [])
      };
    });

    return Object.values(orderMap).sort((a, b) => (b.createTime || 0) - (a.createTime || 0));
  },

  normalizeOrder(orderData) {
    const orderId = Number(orderData.orderId);
    const totalAmount = this.toNumber(
      orderData.totalAmount !== undefined ? orderData.totalAmount : orderData.totalPrice
    );
    const payStatus = orderData.payStatus !== undefined
      ? Number(orderData.payStatus)
      : STATUS_TO_PAY_STATUS[orderData.status];
    const status = orderData.status || PAY_STATUS_TO_STATUS[payStatus] || 'pending';
    const createTime = this.parseTime(orderData.createTime || orderData.payTime || orderData.updateTime);

    return {
      ...orderData,
      orderId,
      orderNo: orderData.orderNo || '',
      totalPrice: totalAmount.toFixed(2),
      totalPriceFormatted: totalAmount.toFixed(2),
      payStatus,
      status,
      createTime,
      createTimeText: this.formatTime(createTime),
      goods: Array.isArray(orderData.goods) ? orderData.goods.map(item => this.normalizeGoods(item)) : []
    };
  },

  normalizeGoods(goods) {
    const price = this.toNumber(goods.goodsPrice !== undefined ? goods.goodsPrice : goods.price);
    const quantity = this.toNumber(goods.quantity);

    return {
      ...goods,
      id: goods.goodsId || goods.id,
      name: goods.goodsName || goods.name || '',
      price: price.toFixed(2),
      quantity,
      image: goods.imageUrl || goods.image || ''
    };
  },

  isValidOrderId(orderId) {
    return Number.isFinite(orderId) && orderId > 0;
  },

  viewOrderDetail(e) {
    const orderId = Number(e.currentTarget.dataset.orderId);
    if (!this.isValidOrderId(orderId)) {
      wx.showToast({ title: '订单ID无效', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    });
  },

  formatTime(value) {
    if (!value) return '';

    const timestamp = typeof value === 'number' ? value : this.parseTime(value);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  parseTime(value) {
    if (!value) return Date.now();
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) {
      const [year, month, day, hours = 0, minutes = 0, seconds = 0] = value;
      return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
    }

    const normalizedValue = typeof value === 'string'
      ? value.replace(/-/g, '/').replace('T', ' ')
      : value;
    const timestamp = new Date(normalizedValue).getTime();
    return Number.isFinite(timestamp) ? timestamp : Date.now();
  },

  toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  },

  reorder(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const order = Storage.getOrder(orderId);

    if (!order || !Array.isArray(order.goods) || order.goods.length === 0) {
      wx.showToast({ title: '暂无可复购商品', icon: 'none' });
      return;
    }

    const cart = Storage.getCart();
    order.goods.forEach(goods => {
      const existingIndex = cart.findIndex(item => item.id === goods.id);
      if (existingIndex > -1) {
        cart[existingIndex].quantity += goods.quantity;
      } else {
        cart.push({
          ...goods,
          quantity: goods.quantity,
          selected: false
        });
      }
    });
    Storage.setCart(cart);

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/cart/cart'
      });
    }, 1500);
  },

  navigateToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
