// index.js
const Storage = require('../../utils/storage');
const { apiBaseUrl } = require('../../utils/config');
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
  },

  onShow() {
    // 页面显示时刷新购物车数据
    this.updateCartBadge();
  },

  // 加载商品列表
  loadGoodsList() {
    this.setData({ loading: true });
    // 调用后端接口获取菜品列表
    wx.request({
      url: `${apiBaseUrl}/dishes`,
      method: 'GET',
      success: res => {
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
      },
      fail: () => {
        wx.showToast({ title: '获取菜品失败', icon: 'none' });
        this.setData({ loading: false });
      }
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

    // 保存到本地存储
    Storage.setCart(cart);

    // 更新全局数据
    app.globalData.cart = cart;

    // 更新购物车角标
    this.updateCartBadge();

    // 显示提示
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    });
  },

  // 更新购物车角标
  updateCartBadge() {
    const cart = Storage.getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalCount > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: totalCount.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 1
      });
    }
  }
});
