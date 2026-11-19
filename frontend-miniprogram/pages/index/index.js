// index.js
const Storage = require('../../utils/storage');
const config = require('../../utils/config');
const WS = require('../../utils/websocket');
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    categories: [
      { id: 0, name: '全部', active: true },
      { id: 1, name: '主食', active: false },
      { id: 2, name: '饮品', active: false },
      { id: 3, name: '小吃', active: false }
    ],
    currentCategoryId: 0,
    goodsList: [], // 所有商品列表
    filteredGoodsList: [], // 过滤后的商品列表
    loading: false
  },

  onLoad() {
    // 页面加载时直接加载菜品列表
    this.loadGoodsList();
    // 绑定 this 后再交给 WS 模块，保证回调里能访问页面实例
    this._wsHandler = this.handleWsMessage.bind(this);
  },

  onShow() {
    // 页面显示时同步一次角标（兜底冷启动恢复购物车的场景）
    Storage.syncCartBadge(Storage.getCart());
    // 订阅推送：商家上下架菜品后本页自动刷新
    WS.subscribe(this._wsHandler);
  },

  onHide() {
    WS.unsubscribe(this._wsHandler);
  },

  onUnload() {
    WS.unsubscribe(this._wsHandler);
  },

  /**
   * WebSocket 推送回调：菜品上下架变更时自动刷新菜品列表
   */
  handleWsMessage(msg) {
    if (msg.type !== 'dish_change') return;
    this.loadGoodsList();
  },

  // 加载商品列表
  loadGoodsList() {
    this.setData({ loading: true });
    // 先确保后端地址已发现（换网络后自动重新探测），再请求菜品列表
    config.ensureServer()
      .then((baseUrl) => {
        if (!baseUrl) {
          return Promise.reject(new Error('未找到后端服务'));
        }
        return new Promise((resolve, reject) => {
          wx.request({
            url: `${baseUrl}/api/dishes`,
            method: 'GET',
            success: resolve,
            fail: reject
          });
        });
      })
      .then(res => {
        const goodsList = res.data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          categoryId: item.categoryId,
          status: item.status
        })).filter(item => Number(item.status) === 1);
        this.setData({
          goodsList,
          filteredGoodsList: goodsList,
          loading: false
        });
      })
      .catch(() => {
        wx.showToast({ title: '获取菜品失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    this.filterGoods();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchKeyword: '' });
    this.filterGoods();
  },

  // 切换分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categories = this.data.categories.map(item => ({
      ...item,
      active: item.id === categoryId
    }));

    this.setData({
      currentCategoryId: categoryId,
      categories
    });
    this.filterGoods();
  },

  // 过滤商品
  filterGoods() {
    const { goodsList, currentCategoryId, searchKeyword } = this.data;
    let filteredList = goodsList;

    // 按分类过滤
    if (currentCategoryId !== 0) {
      filteredList = filteredList.filter(item => item.categoryId === currentCategoryId);
    }

    // 按关键词搜索过滤
    if (searchKeyword) {
      filteredList = filteredList.filter(item =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    this.setData({ filteredGoodsList: filteredList });
  },

  // 添加商品到购物车
  addToCart(e) {
    const goods = e.currentTarget.dataset.goods;
    const cart = Storage.getCart();

    // 检查购物车中是否已有该商品
    const existingIndex = cart.findIndex(item => item.id === goods.id);

    if (existingIndex > -1) {
      // 如果已存在，数量+1
      cart[existingIndex].quantity += 1;
    } else {
      // 如果不存在，添加新商品
      cart.push({
        ...goods,
        quantity: 1,
        selected: true
      });
    }

    // 保存到本地存储（setCart 内部已同步刷新 tabBar 角标）
    Storage.setCart(cart);

    // 更新全局数据
    app.globalData.cart = cart;

    // 显示提示
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    });
  }
});
