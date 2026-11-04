/**
 * 本地存储模块
 * 用于管理购物车、用户信息等本地数据
 */

const STATUS_TO_PAY_STATUS = {
  pending: 0,
  paid: 1,
  completed: 2,
  cancelled: 3
};

const sameOrderId = (left, right) => String(left) === String(right);

const normalizeOrderId = (orderId) => {
  const numericOrderId = Number(orderId);
  return Number.isFinite(numericOrderId) && numericOrderId > 0 ? numericOrderId : null;
};

const Storage = {
  // 购物车相关
  CART_KEY: 'cart_items',
  USER_INFO_KEY: 'user_info',
  MEAL_LOCATION_KEY: 'meal_location', // 取餐信息
  ORDER_HISTORY_KEY: 'order_history',

  /**
   * 获取购物车数据
   */
  getCart() {
    try {
      const cartData = wx.getStorageSync(this.CART_KEY);
      return cartData || [];
    } catch (e) {
      console.error('获取购物车失败:', e);
      return [];
    }
  },

  /**
   * 保存购物车数据
   */
  setCart(cartData) {
    try {
      wx.setStorageSync(this.CART_KEY, cartData);
      return true;
    } catch (e) {
      console.error('保存购物车失败:', e);
      return false;
    }
  },

  /**
   * 清空购物车
   */
  clearCart() {
    try {
      wx.removeStorageSync(this.CART_KEY);
      return true;
    } catch (e) {
      console.error('清空购物车失败:', e);
      return false;
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    try {
      const userInfo = wx.getStorageSync(this.USER_INFO_KEY);
      return userInfo || null;
    } catch (e) {
      console.error('获取用户信息失败:', e);
      return null;
    }
  },

  /**
   * 保存用户信息
   */
  setUserInfo(userInfo) {
    try {
      wx.setStorageSync(this.USER_INFO_KEY, userInfo);
      return true;
    } catch (e) {
      console.error('保存用户信息失败:', e);
      return false;
    }
  },

  /**
   * 清除用户信息（退出登录）
   */
  clearUserInfo() {
    try {
      wx.removeStorageSync(this.USER_INFO_KEY);
      return true;
    } catch (e) {
      console.error('清除用户信息失败:', e);
      return false;
    }
  },

  /**
   * 获取取餐信息
   */
  getMealLocation() {
    try {
      const location = wx.getStorageSync(this.MEAL_LOCATION_KEY);
      return location || { location: '食堂3楼取餐点', phone: '' };
    } catch (e) {
      console.error('获取取餐信息失败:', e);
      return { location: '食堂3楼取餐点', phone: '' };
    }
  },

  /**
   * 保存取餐信息
   */
  setMealLocation(location) {
    try {
      wx.setStorageSync(this.MEAL_LOCATION_KEY, location);
      return true;
    } catch (e) {
      console.error('保存取餐信息失败:', e);
      return false;
    }
  },

  /**
   * 获取订单历史
   */
  getOrderHistory() {
    try {
      const orders = wx.getStorageSync(this.ORDER_HISTORY_KEY);
      return orders || [];
    } catch (e) {
      console.error('获取订单历史失败:', e);
      return [];
    }
  },

  /**
   * 添加订单到历史
   */
  addOrder(orderData) {
    try {
      if (!orderData) {
        console.error('添加订单失败: 缺少订单数据');
        return null;
      }

      const orders = this.getOrderHistory();
      const orderId = normalizeOrderId(orderData.orderId);
      if (!orderId) {
        console.error('添加订单失败: orderId必须是后端返回的数字ID');
        return null;
      }

      const order = {
        ...orderData,
        orderId,
        orderNo: orderData.orderNo || '',
        createTime: orderData.createTime || new Date().getTime()
      };

      if (order.status && order.payStatus === undefined) {
        order.payStatus = STATUS_TO_PAY_STATUS[order.status];
      }

      const existingIndex = orders.findIndex(o => sameOrderId(o.orderId, orderId));
      if (existingIndex > -1) {
        orders.splice(existingIndex, 1);
      }

      orders.unshift(order);
      wx.setStorageSync(this.ORDER_HISTORY_KEY, orders);
      return order;
    } catch (e) {
      console.error('添加订单失败:', e);
      return null;
    }
  },

  /**
   * 更新订单状态
   */
  updateOrderStatus(orderId, status) {
    try {
      const orders = this.getOrderHistory();
      const order = orders.find(o => sameOrderId(o.orderId, orderId));
      if (order) {
        order.status = status;
        if (STATUS_TO_PAY_STATUS[status] !== undefined) {
          order.payStatus = STATUS_TO_PAY_STATUS[status];
        }
        order.updateTime = new Date().getTime();
        wx.setStorageSync(this.ORDER_HISTORY_KEY, orders);
        return true;
      }
      return false;
    } catch (e) {
      console.error('更新订单状态失败:', e);
      return false;
    }
  },

  /**
   * 获取订单详情
   */
  getOrder(orderId) {
    try {
      const orders = this.getOrderHistory();
      return orders.find(o => sameOrderId(o.orderId, orderId)) || null;
    } catch (e) {
      console.error('获取订单详情失败:', e);
      return null;
    }
  },

  /**
   * 根据订单编号获取订单
   */
  getOrderByNo(orderNo) {
    try {
      const orders = this.getOrderHistory();
      return orders.find(o => o.orderNo && String(o.orderNo) === String(orderNo)) || null;
    } catch (e) {
      console.error('根据订单编号获取订单失败:', e);
      return null;
    }
  },

  /**
   * 根据状态获取订单列表
   */
  getOrdersByStatus(status) {
    try {
      const orders = this.getOrderHistory();
      if (status === 'all') return orders;
      const targetPayStatus = STATUS_TO_PAY_STATUS[status];
      return orders.filter(o =>
        o.status === status ||
        o.payStatus === targetPayStatus ||
        STATUS_TO_PAY_STATUS[o.status] === targetPayStatus
      );
    } catch (e) {
      console.error('获取订单列表失败:', e);
      return [];
    }
  }
};

module.exports = Storage;
