// app.js
const Storage = require('./utils/storage');
const API = require('./utils/api');

App({
  globalData: {
    userInfo: null,
    openid: '',
    cart: []
  },

  onLaunch() {
    // 初始化购物车数据
    const cart = Storage.getCart();
    if (cart && cart.length > 0) {
      this.globalData.cart = cart;
    }

    // 初始化用户信息
    const userInfo = Storage.getUserInfo();
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }

    this.globalData.openid = wx.getStorageSync('openid') || '';
    this.loadOpenid().catch(() => {});
  },

  loadOpenid() {
    return new Promise((resolve, reject) => {
      const cachedOpenid = this.getOpenid();
      if (cachedOpenid) {
        resolve(cachedOpenid);
        return;
      }

      wx.login({
        success: async (res) => {
          if (!res.code) {
            reject(new Error('获取微信登录凭证失败'));
            return;
          }

          try {
            const response = await API.user.getOpenid(res.code);
            const openid = response.data && response.data.openid;
            if (!openid) {
              reject(new Error('获取openid失败'));
              return;
            }

            this.globalData.openid = openid;
            wx.setStorageSync('openid', openid);
            resolve(openid);
          } catch (error) {
            reject(error);
          }
        },
        fail: reject
      });
    });
  },

  login() {
    return this.loadOpenid();
  },

  getOpenid() {
    return this.globalData.openid || wx.getStorageSync('openid') || '';
  }
})
