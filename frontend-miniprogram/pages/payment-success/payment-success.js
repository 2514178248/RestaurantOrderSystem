/**
 * 支付成功页
 */
const Storage = require('../../utils/storage');

Page({
  data: {
    orderId: null,
    orderNo: '',
    countdown: 3
  },

  onLoad(options) {
    const orderId = Number(options.orderId);
    const localOrder = Number.isFinite(orderId) ? Storage.getOrder(orderId) : null;
    const orderNo = options.orderNo
      ? decodeURIComponent(options.orderNo)
      : (localOrder && localOrder.orderNo) || '';

    this.setData({
      orderId: Number.isFinite(orderId) ? orderId : null,
      orderNo
    });

    let countdown = 3;
    const interval = setInterval(() => {
      countdown--;
      this.setData({ countdown });

      if (countdown === 0) {
        clearInterval(interval);
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    }, 1000);
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  viewOrderDetail() {
    const { orderId } = this.data;
    if (!orderId) {
      wx.showToast({ title: '订单ID无效', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    });
  }
});
