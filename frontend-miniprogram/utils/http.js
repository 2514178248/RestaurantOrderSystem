/**
 * 网络请求工具模块
 * 用于处理所有的API请求
 */

const { apiBaseUrl: API_BASE_URL } = require('./config');

const HttpRequest = {
  /**
   * 发送 GET 请求
   * @param {string} endpoint - 接口路径（如 /api/order/list）
   * @param {object} data - GET参数（自动拼接到URL）
   * @param {object} options - 额外配置
   */
  get(endpoint, data = {}, options = {}) {
    // 修复2：GET请求参数拼接到URL
    const url = this.buildUrl(endpoint, data);
    return this.request('GET', url, null, options);
  },

  /**
   * 发送 POST 请求
   * @param {string} endpoint - 接口路径（如 /api/order/submit）
   * @param {object} data - 请求体数据
   * @param {object} options - 额外配置
   */
  post(endpoint, data = {}, options = {}) {
    return this.request('POST', endpoint, data, options);
  },

  /**
   * 发送 PUT 请求
   */
  put(endpoint, data = {}, options = {}) {
    return this.request('PUT', endpoint, data, options);
  },

  /**
   * 发送 DELETE 请求
   * @param {string} endpoint - 接口路径
   * @param {object} data - DELETE参数（自动拼接到URL）
   * @param {object} options - 额外配置
   */
  delete(endpoint, data = {}, options = {}) {
    const url = this.buildUrl(endpoint, data);
    return this.request('DELETE', url, null, options);
  },

  /**
   * 构建带参数的URL（GET/DELETE专用）
   */
  buildUrl(endpoint, data) {
    if (!data || Object.keys(data).length === 0) {
      return endpoint;
    }

    const params = [];
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            params.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
          }
        });
        return;
      }

      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    if (params.length === 0) {
      return endpoint;
    }

    return `${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}${params.join('&')}`;
  },

  /**
   * 通用请求方法
   */
  request(method, endpoint, data, options = {}) {
    return new Promise((resolve, reject) => {
      // 拼接完整URL（基础地址 + 接口路径）
      const url = API_BASE_URL + endpoint;
      const header = {
        'Content-Type': 'application/json',
        ...options.header
      };

      const requestConfig = {
        url,
        method,
        header,
        timeout: 10000, // 修复3：新增超时配置（10秒）
        success: (response) => {
          // 修复4：精准处理后端返回的业务码（而非HTTP状态码）
          if (response.statusCode >= 200 && response.statusCode < 300) {
            const resData = response.data;
            // 后端统一返回 code=200 表示业务成功
            if (resData.code === 200) {
              resolve(resData);
            } else {
              // 业务错误（如参数错误、订单不存在）
              reject({
                statusCode: response.statusCode,
                code: resData.code,
                message: resData.msg || '业务请求失败'
              });
            }
          } else {
            // HTTP状态码错误（404/500等）
            reject({
              statusCode: response.statusCode,
              message: `请求失败(${response.statusCode})`
            });
          }
        },
        fail: (error) => {
          console.error('网络请求失败:', error);
          reject({
            message: '网络连接失败，请检查后端服务是否启动或网络设置'
          });
        },
        complete: options.complete
      };

      // POST/PUT 请求添加请求体
      if ((method === 'POST' || method === 'PUT') && data) {
        requestConfig.data = data;
      }

      wx.request(requestConfig);
    });
  }
};

module.exports = HttpRequest;
