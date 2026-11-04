/**
 * 购物车页面
 */
const Storage = require('../../utils/storage');

Page({
  data: {
    cartList: [],
    selectedAll: false,
    totalPrice: '0.00',
    totalCount: 0,
    minBuy: 1,
    checkoutThreshold: 30,
    deleteIndex: null,
    checkoutTip: '',
    canCheckout: false,
    hasSelected: false
  },

  onLoad() {
    this.loadCart();
  },

  onShow() {
    this.loadCart();
  },

  /**
   * 加载购物车并补齐必要字段
   */
  loadCart() {
    const cart = Storage.getCart() || [];
    cart.forEach((item, index) => {
      if (!item.cartId) {
        item.cartId = `cart_${Date.now()}_${index}_${Math.random()}`;
      }
      if (typeof item.selected === 'undefined') {
        item.selected = true;
      }
      if (!Object.prototype.hasOwnProperty.call(item, 'stock')) {
        item.stock = 99;
      }
      item.subtotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
    });

    this.setData({ cartList: cart, deleteIndex: null });
    this.calculateTotal();
  },

  /**
   * 计算金额、件数、结算状态
   */
  calculateTotal() {
    const { cartList, checkoutThreshold } = this.data;
    const selectedGoods = cartList.filter(item => item.selected);

    const totalPriceNum = selectedGoods.reduce((sum, item) => {
      return sum + Number(item.subtotal || (Number(item.price) * Number(item.quantity)));
    }, 0);

    const totalCount = selectedGoods.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);

    const selectedAll = cartList.length > 0 && cartList.every(item => item.selected);
    const hasSelected = selectedGoods.length > 0;
    const canCheckout = hasSelected && totalPriceNum >= checkoutThreshold;

    let checkoutTip = '';
    if (!hasSelected) {
      checkoutTip = '请选择商品';
    } else if (totalPriceNum < checkoutThreshold) {
      checkoutTip = `还差¥${(checkoutThreshold - totalPriceNum).toFixed(2)}起送`;
    }

    this.setData({
      totalPrice: totalPriceNum.toFixed(2),
      totalCount,
      selectedAll,
      hasSelected,
      canCheckout,
      checkoutTip
    });

    Storage.setCart(cartList);
  },

  /**
   * 单选商品
   */
  toggleGoodsSelected(e) {
    const cartId = e.currentTarget.dataset.id;
    const updatedList = this.data.cartList.map(item => {
      if (item.cartId === cartId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    this.setData({ cartList: updatedList });
    this.calculateTotal();
  },

  /**
   * 全选/取消全选
   */
  toggleSelectAll() {
    const targetState = !this.data.selectedAll;
    const updatedList = this.data.cartList.map(item => ({
      ...item,
      selected: targetState
    }));
    this.setData({ cartList: updatedList });
    this.calculateTotal();
  },

  /**
   * 增加数量
   */
  increaseQuantity(e) {
    const cartId = e.currentTarget.dataset.id;
    const updatedList = this.data.cartList.map(item => {
      if (item.cartId !== cartId) {
        return item;
      }
      if (Number(item.quantity) >= Number(item.stock || 99)) {
        wx.showToast({ title: '已达最大库存', icon: 'none' });
        return item;
      }
      const nextQty = Number(item.quantity) + 1;
      return {
        ...item,
        quantity: nextQty,
        subtotal: (Number(item.price) * nextQty).toFixed(2)
      };
    });

    this.setData({ cartList: updatedList });
    this.calculateTotal();
  },

  /**
   * 减少数量
   */
  decreaseQuantity(e) {
    const cartId = e.currentTarget.dataset.id;
    const target = this.data.cartList.find(item => item.cartId === cartId);
    if (!target) {
      return;
    }

    if (Number(target.quantity) > this.data.minBuy) {
      const updatedList = this.data.cartList.map(item => {
        if (item.cartId !== cartId) {
          return item;
        }
        const nextQty = Number(item.quantity) - 1;
        return {
          ...item,
          quantity: nextQty,
          subtotal: (Number(item.price) * nextQty).toFixed(2)
        };
      });
      this.setData({ cartList: updatedList });
      this.calculateTotal();
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '是否删除该商品？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        const updatedList = this.data.cartList.filter(item => item.cartId !== cartId);
        this.setData({ cartList: updatedList, deleteIndex: null });
        this.calculateTotal();
      }
    });
  },

  /**
   * 删除商品（左滑按钮）
   */
  deleteGoods(e) {
    const cartId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '是否删除该商品？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        const updatedList = this.data.cartList.filter(item => item.cartId !== cartId);
        this.setData({ cartList: updatedList, deleteIndex: null });
        this.calculateTotal();
      }
    });
  },

  /**
   * 清空购物车
   */
  clearCart() {
    wx.showModal({
      title: '确认清空购物车',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        this.setData({ cartList: [], deleteIndex: null });
        this.calculateTotal();
      }
    });
  },

  /**
   * 记录手势起点
   */
  onTouchStart(e) {
    if (!e.touches || !e.touches.length) {
      return;
    }
    const roleFromTarget = e.target && e.target.dataset ? e.target.dataset.role : '';
    this.touchFromQty = roleFromTarget === 'qtybtn';
    if (this.touchFromQty) {
      this.moving = false;
      return;
    }
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.moving = false;
  },

  /**
   * 手势移动，判断是否为有效左滑
   */
  onTouchMove(e) {
    if (!e.touches || !e.touches.length || this.touchFromQty) {
      return;
    }
    const dx = e.touches[0].clientX - this.touchStartX;
    const dy = e.touches[0].clientY - this.touchStartY;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 15) {
      return;
    }
    this.moving = true;
  },

  /**
   * 手势结束，决定是否显示删除按钮
   */
  onTouchEnd(e) {
    if (this.touchFromQty) {
      this.touchFromQty = false;
      this.moving = false;
      return;
    }
    if (!e.changedTouches || !e.changedTouches.length) {
      return;
    }
    if (!this.moving) {
      this.setData({ deleteIndex: null });
      return;
    }
    const cartId = e.currentTarget.dataset.id;
    const distance = this.touchStartX - e.changedTouches[0].clientX;
    this.setData({ deleteIndex: distance > 50 ? cartId : null });
    this.moving = false;
  },

  /**
   * 点击内容区时关闭左滑状态
   */
  closeSwiped() {
    if (this.moving) {
      return;
    }
    this.setData({ deleteIndex: null });
  },

  /**
   * 去首页
   */
  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  /**
   * 去结算
   */
  checkout() {
    if (!this.data.canCheckout) {
      return;
    }
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?totalPrice=${this.data.totalPrice}&totalCount=${this.data.totalCount}`
    });
  }
});
