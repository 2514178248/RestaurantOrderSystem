/**
 * API 接口模块
 * 定义所有与后端的接口调用
 */

const HttpRequest = require('./http');

const API = {
  /**
   * 商品相关接口
   */
  goods: {
    /**
     * 获取商品列表
     */
    getList(categoryId = 0) {
      return HttpRequest.get('/goods/list', {
        params: { categoryId }
      });
    },

    /**
     * 获取商品详情
     */
    getDetail(goodsId) {
      return HttpRequest.get(`/goods/${goodsId}`);
    },

    /**
     * 搜索商品
     */
    search(keyword) {
      return HttpRequest.get('/goods/search', {
        params: { keyword }
      });
    }
  },

  /**
   * 订单相关接口
   */
  order: {
    /**
     * 创建订单
     */
    create(orderData) {
      return this.submit(orderData);
    },

    submit(orderData) {
      return HttpRequest.post('/order/submit', orderData);
    },

    /**
     * 获取订单列表
     */
    getList(openid) {
      return HttpRequest.get('/order/list', { openid });
    },

    /**
     * 获取订单详情
     */
    getDetail(orderId) {
      return HttpRequest.get('/order/detail', { orderId });
    },

    /**
     * 更新订单状态
     */
    updateStatus(orderId, status) {
      const statusMap = {
        pending: 0,
        paid: 1,
        completed: 2,
        cancelled: 3
      };
      const payStatus = typeof status === 'string' ? statusMap[status] : status;
      return HttpRequest.post('/order/updateStatus', { orderId, payStatus });
    },

    /**
     * 取消订单
     */
    cancel(orderId) {
      return this.updateStatus(orderId, 3);
    },

    /**
     * 支付订单
     */
    pay(orderId, paymentData) {
      return this.updateStatus(orderId, paymentData && paymentData.payStatus !== undefined ? paymentData.payStatus : 1);
    }
  },

  /**
   * 用户相关接口
   */
  user: {
    /**
     * 用户登录
     */
    login(userData) {
      return HttpRequest.post('/user/login', userData);
    },

    /**
     * 获取微信 openid
     */
    getOpenid(code) {
      return HttpRequest.post('/user/openid', { code });
    },

    /**
     * 获取用户信息
     */
    getInfo() {
      return HttpRequest.get('/user/info');
    },

    /**
     * 更新用户信息
     */
    updateInfo(userData) {
      return HttpRequest.put('/user/info', userData);
    }
  },

  /**
   * 支付相关接口
   */
  payment: {
    /**
     * 请求微信支付
     */
    requestWeChatPay(orderData) {
      return HttpRequest.post('/payment/wechat', orderData);
    },

    /**
     * 查询支付结果
     */
    queryPaymentStatus(orderId) {
      return HttpRequest.get(`/payment/${orderId}/status`);
    }
  },

  /**
   * 购物车相关接口（可选，如果需要服务器同步）
   */
  cart: {
    /**
     * 同步购物车到服务器
     */
    sync(cartData) {
      return HttpRequest.post('/cart/sync', { items: cartData });
    },

    /**
     * 从服务器获取购物车
     */
    get() {
      return HttpRequest.get('/cart');
    }
  }
};

module.exports = API;
