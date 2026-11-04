/**
 * 订单详情页
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
    order: null,
    orderId: null,
    loading: true
  },

  onLoad(options) {
    const orderId = Number(options.orderId);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      wx.showToast({ title: '订单ID无效', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ orderId });
    this.loadOrderDetail();
  },

  async loadOrderDetail() {
    const { orderId } = this.data;
    this.setData({ loading: true });

    try {
      const res = await HttpRequest.get('/order/detail', { orderId });
      const backendOrder = res.data && res.data.order;

      if (!backendOrder || !backendOrder.orderId) {
        throw new Error('订单不存在');
      }

      const order = this.normalizeOrder(backendOrder);
      await this.loadOrderItems(order);
    } catch (err) {
      console.warn('后端订单详情加载失败，尝试使用本地缓存:', err);
      this.loadLocalOrder(orderId);
    }
  },

  async loadOrderItems(order) {
    try {
      const res = await HttpRequest.get('/order/items', { orderId: order.orderId });
      const itemList = (res.data && res.data.itemList) || [];
      order.goods = itemList.map(item => this.normalizeOrderItem(item));
    } catch (err) {
      console.warn('后端订单项加载失败，使用本地订单商品');
      const localOrder = Storage.getOrder(order.orderId);
      order.goods = localOrder && Array.isArray(localOrder.goods)
        ? localOrder.goods.map(item => this.normalizeOrderItem(item))
        : [];
    }

    this.setData({ order, loading: false });
  },

  loadLocalOrder(orderId) {
    const localOrder = Storage.getOrder(orderId);
    if (!localOrder) {
      wx.showToast({ title: '订单不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      this.setData({ loading: false });
      return;
    }

    const order = this.normalizeOrder(localOrder);
    // ✅ 关键：从本地缓存拿商品列表
    order.goods = localOrder.goods ? localOrder.goods.map(i => this.normalizeOrderItem(i)) : [];

    this.setData({ order, loading: false });
  },

  normalizeOrder(orderData) {
    const orderId = Number(orderData.orderId);
    const totalAmount = this.toNumber(
      orderData.totalAmount ?? orderData.totalPrice
    );
    const payStatus = orderData.payStatus ?? STATUS_TO_PAY_STATUS[orderData.status];
    const status = orderData.status || this.mapOrderStatus(payStatus);
    const createTime = this.parseTime(orderData.createTime || orderData.payTime || orderData.updateTime);

    return {
      ...orderData,
      orderId,
      orderNo: orderData.orderNo || '',
      totalAmount,
      totalPrice: totalAmount,
      totalPriceFormatted: totalAmount.toFixed(2),
      payStatus,
      status,
      createTime,
      createTimeText: this.formatTime(createTime),
      paymentMethod: orderData.paymentMethod || 'weixin',
      mealLocation: orderData.mealLocation || {
        location: orderData.tableNum || '',
        phone: ''
      }
    };
  },

normalizeOrderItem(item) {
  const price = this.toNumber(item.goodsPrice);
  const quantity = this.toNumber(item.quantity);
  return {
    ...item,
    id: item.goodsId,
    name: item.goodsName,
    price: price,
    quantity: quantity,
    amount: (price * quantity).toFixed(2),
    image: item.imageUrl || '/images/default-goods.jpg'
  };
},

  toNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  },

  parseTime(value) {
    if (!value) return Date.now();
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) {
      const [year, month, day, hours = 0, minutes = 0, seconds = 0] = value;
      return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
    }
    const str = String(value).replace(/-/g, '/').replace('T', ' ');
    const ts = new Date(str).getTime();
    return Number.isFinite(ts) ? ts : Date.now();
  },

  formatTime(value) {
    if (!value) return '';
    const d = new Date(this.parseTime(value));
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  },

  mapOrderStatus(payStatus) {
    return PAY_STATUS_TO_STATUS[payStatus] || 'pending';
  },

  copyOrderId() {
    const { order } = this.data;
    if (!order) return;
    wx.setClipboardData({
      data: String(order.orderNo || order.orderId),
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  contactShop() {
    wx.showToast({ title: '商家电话: 0571-12345678', icon: 'none' });
  },

  cancelOrder() {
    const { order } = this.data;
    if (!order || order.status !== 'pending') {
      wx.showToast({ title: '无法取消', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消订单',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '取消中' });
        try {
          await HttpRequest.post('/order/updateStatus', { orderId: order.orderId, payStatus: 3 });
          Storage.updateOrderStatus(order.orderId, 'cancelled');
          await this.loadOrderDetail();
          wx.showToast({ title: '已取消', icon: 'success' });
        } catch (e) {
          wx.showToast({ title: '取消失败', icon: 'none' });
        }
        wx.hideLoading();
      }
    });
  },

  payNow() {
    const { order } = this.data;
    if (!order || order.status !== 'pending') {
      wx.showToast({ title: '无需支付', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '支付中' });
    setTimeout(async () => {
      try {
        await HttpRequest.post('/order/updateStatus', { orderId: order.orderId, payStatus: 1 });
        Storage.updateOrderStatus(order.orderId, 'paid');
        wx.hideLoading();
        // 跳转支付成功页
        wx.redirectTo({
          url: `/pages/payment-success/payment-success?orderId=${order.orderId}&orderNo=${encodeURIComponent(order.orderNo || '')}`
        });
      } catch (e) {
        wx.hideLoading();
        wx.showToast({ title: '支付失败', icon: 'none' });
      }
    }, 1500);
  }
});