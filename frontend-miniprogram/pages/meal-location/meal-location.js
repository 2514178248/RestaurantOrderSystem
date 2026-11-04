/**
 * 取餐信息编辑页面
 */
const Storage = require('../../utils/storage');

Page({
  data: {
    location: '',
    phone: '',
    locationOptions: [
      { id: 1, name: '食堂1楼取餐点' },
      { id: 2, name: '食堂2楼取餐点' },
      { id: 3, name: '食堂3楼取餐点' },
      { id: 4, name: '食堂4楼取餐点' }
    ],
    selectedLocationId: 3
  },

  onLoad() {
    const mealLocation = Storage.getMealLocation();
    const selectedLocationId = this.data.locationOptions.findIndex(
      item => item.name === mealLocation.location
    );

    this.setData({
      location: mealLocation.location || '食堂3楼取餐点',
      phone: mealLocation.phone || '',
      selectedLocationId: selectedLocationId >= 0 ? selectedLocationId : 2
    });
  },

  /**
   * 选择取餐地点
   */
  selectLocation(e) {
    const index = e.currentTarget.dataset.index;
    const location = this.data.locationOptions[index].name;

    this.setData({
      location,
      selectedLocationId: index
    });
  },

  /**
   * 输入电话号码
   */
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 保存取餐信息
   */
  saveMealLocation() {
    const { location, phone } = this.data;

    if (!location) {
      wx.showToast({
        title: '请选择取餐地点',
        icon: 'none'
      });
      return;
    }

    const mealLocation = {
      location,
      phone: phone.trim()
    };

    Storage.setMealLocation(mealLocation);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  /**
   * 取消
   */
  cancel() {
    wx.navigateBack();
  }
});
