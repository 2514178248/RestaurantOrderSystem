/**
 * 订单确认页
 */
const Storage = require('../../utils/storage');
const HttpRequest = require('../../utils/http');
const app = getApp();

Page({
  data: {
    mealLocation: {},
    selectedGoods: [],
    totalPrice: 0,
    totalCount: 0,
    paying: false
  },

  onLoad(options) {
    this.loadOrderData(options);
  },

  loadOrderData(options) {
    const cart = Storage.getCart();
    const mealLocation = Storage.getMealLocation();
    const selectedGoods = cart.filter(item => item.selected);

    selectedGoods.forEach(item => {
      item.subtotal = (item.price * item.quantity).toFixed(2);
    });

    const totalPrice = parseFloat(options.totalPrice || 0).toFixed(2);
    const totalCount = parseInt(options.totalCount || 0, 10);

    this.setData({
      mealLocation,
      selectedGoods,
      totalPrice,
      totalCount
    });
  },

  editMealLocation() {
    wx.navigateTo({
      url: '/pages/meal-location/meal-location'
    });
  },

  submitOrder() {
    const { selectedGoods } = this.data;

    if (!selectedGoods || selectedGoods.length === 0) {
      wx.showToast({
        title: '订单数据异常',
        icon: 'none'
      });
      return;
    }

    this.setData({ paying: true });

    // 直接提交，不再模拟支付等待
    this.handleOrderSubmit();
  },

  async handleOrderSubmit() {
    const { selectedGoods, totalPrice, mealLocation } = this.data;
    const goodsList = selectedGoods.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity
    }));

    if (goodsList.length === 0) {
      wx.showToast({ title: '商品列表为空', icon: 'none' });
      this.setData({ paying: false });
      return;
    }

    try {
      const tableNum = mealLocation.location || '默认桌号';
      const openid = wx.getStorageSync('openid') || '';
      const res = await HttpRequest.post('/order/submit', {
        openid,
        goodsList,
        tableNum
      });

      const backendOrder = res.data || {};
      const orderId = Number(backendOrder.orderId);
      const orderNo = backendOrder.orderNo || '';

      if (!Number.isFinite(orderId) || orderId <= 0 || !orderNo) {
        throw new Error('后端未返回有效的orderId/orderNo');
      }

      // ✅ 订单保持"待支付"状态，不再立即标记已支付
      const savedOrder = Storage.addOrder({
        orderId,
        orderNo,
        goods: selectedGoods.map(item => ({ ...item })),
        totalPrice,
        totalCount: selectedGoods.reduce((sum, item) => sum + item.quantity, 0),
        mealLocation,
        status: 'pending',
        payStatus: 0
      });

      if (!savedOrder) {
        throw new Error('本地订单保存失败');
      }

      // 清空购物车中已提交的商品
      const cart = Storage.getCart();
      const newCart = cart.filter(item => !item.selected);
      Storage.setCart(newCart);
      app.globalData.cart = newCart;

      this.setData({ paying: false });

      // ✅ 跳转到订单详情页，用户可在此完成支付
      wx.redirectTo({
        url: `/pages/order-detail/order-detail?orderId=${orderId}`
      });
    } catch (err) {
      console.error('订单提交失败:', err);
      this.setData({ paying: false });
      wx.showToast({
        title: '订单提交失败',
        icon: 'none'
      });
    }
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消订单吗？',
      confirmText: '取消订单',
      cancelText: '继续购买',
      success: (res) => {
        if (res.confirm) {
          const cart = Storage.getCart();
          cart.forEach(item => {
            item.selected = false;
          });
          Storage.setCart(cart);

          wx.navigateBack();
        }
      }
    });
  }
});
