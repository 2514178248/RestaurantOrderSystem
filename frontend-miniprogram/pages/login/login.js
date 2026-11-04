const API = require('../../utils/api');
const Storage = require('../../utils/storage');
const app = getApp();

const DEFAULT_AVATAR = '/images/default-avatar.png';

Page({
  data: {
    phone: '',
    errorMsg: '',
    checked: false,
    loading: false
  },

  onInput(e) {
    this.setData({
      phone: e.detail.value || '',
      errorMsg: ''
    });
  },

  onCheck() {
    this.setData({ checked: !this.data.checked });
  },

  async onLogin() {
    const telNumber = this.data.phone.trim();

    if (!/^\d{11}$/.test(telNumber)) {
      this.setData({ errorMsg: '请输入11位手机号' });
      return;
    }

    if (!this.data.checked) {
      this.setData({ errorMsg: '请先同意相关协议' });
      return;
    }

    if (this.data.loading) return;

    this.setData({ loading: true, errorMsg: '' });

    try {
      const openid = await this.getCurrentOpenid();
      const response = await API.user.login({ telNumber, openid });
      const data = response.data || {};
      const userInfo = {
        telNumber,
        openid: data.openid || openid,
        nickname: telNumber,
        avatar: data.avatar || DEFAULT_AVATAR
      };

      Storage.setUserInfo(userInfo);
      wx.setStorageSync('openid', userInfo.openid);
      app.globalData.userInfo = userInfo;
      app.globalData.openid = userInfo.openid;

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/user-center/user-center'
        });
      }, 800);
    } catch (error) {
      const message = error.message || error.msg || '登录失败，请重试';
      this.setData({ errorMsg: message });
      wx.showToast({
        title: message,
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  getCurrentOpenid() {
    const cachedOpenid = app.getOpenid();
    if (cachedOpenid) {
      return Promise.resolve(cachedOpenid);
    }

    if (app.loadOpenid) {
      return app.loadOpenid();
    }

    return Promise.reject(new Error('获取openid失败'));
  }
});
