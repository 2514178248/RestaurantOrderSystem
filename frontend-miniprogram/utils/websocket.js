/**
 * WebSocket 实时推送模块（单例）
 * 用于接收订单推送：新下单、商家改状态后小程序端无需刷新即可同步更新
 *
 * 使用方式：
 *   const WS = require('../../utils/websocket');
 *   onShow()  { WS.subscribe(this.handleWsMessage); }
 *   onHide()  { WS.unsubscribe(this.handleWsMessage); }
 *   handleWsMessage(msg) { if (msg.type === 'status_change') { ... } }
 */
const config = require('./config');

// http://172.20.10.2:8080 → ws://172.20.10.2:8080/ws/orders（地址由 config 自动发现）
const WS_PATH = '/ws/orders';

const RECONNECT_DELAY = 5000; // 断线重连间隔（毫秒）

let socketTask = null;
let connecting = false;      // 正在探测后端地址
let listeners = new Set();   // 已订阅的页面回调
let reconnectTimer = null;

/**
 * 建立 WebSocket 连接（幂等：已连接/连接中则跳过）
 */
function connect() {
  if (socketTask || connecting) return;

  connecting = true;
  config.ensureServer().then((baseUrl) => {
    connecting = false;
    if (!baseUrl || socketTask) return;

    const wsUrl = baseUrl.replace(/^http/, 'ws') + WS_PATH;
    socketTask = wx.connectSocket({
      url: wsUrl,
      fail: (err) => {
        console.warn('[WS] 连接发起失败:', err);
        socketTask = null;
        scheduleReconnect();
      }
    });
    if (!socketTask) return;

    socketTask.onMessage((res) => {
      try {
        const msg = JSON.parse(res.data);
        listeners.forEach((fn) => {
          try { fn(msg); } catch (e) { console.error('[WS] 回调执行异常:', e); }
        });
      } catch (e) {
        // 非 JSON 消息忽略
      }
    });

    socketTask.onClose(() => {
      socketTask = null;
      scheduleReconnect();
    });

    socketTask.onError(() => {
      socketTask = null;
    });
  }).catch(() => {
    connecting = false;
    scheduleReconnect();
  });
}

/**
 * 断线自动重连
 */
function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (socketTask === null) {
      connect();
    }
  }, RECONNECT_DELAY);
}

/**
 * 订阅推送消息（首次订阅会自动建立连接）
 * @param {Function} fn 回调，参数为消息对象 { type, orderId, ... }
 */
function subscribe(fn) {
  listeners.add(fn);
  connect();
}

/**
 * 取消订阅
 */
function unsubscribe(fn) {
  listeners.delete(fn);
}

module.exports = {
  connect,
  subscribe,
  unsubscribe
};
