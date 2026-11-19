/**
 * 后端地址自动发现
 *
 * 背景：真机调试时小程序要连电脑的局域网 IP（ipconfig 查到的 IPv4），
 * 而电脑换网络（家里 WiFi / 手机热点 / 学校网络）后分到的 IP 都会变，
 * 写死 IP 就得每次手动改代码。
 *
 * 方案：小程序拿不到电脑的 IP，只能拿到自己的局域网 IP，
 * 但两者必然同网段，所以：手机 IP → 推出网段 → 并发探测该网段的主机，
 * 谁在 8080 端口响应 /api/ping 且返回本项目标记，谁就是后端。
 * 命中后写入本地缓存，下次启动只需一次探测。
 *
 * 注意：真机调试需在开发者工具中勾选「不校验合法域名、web-view（业务域名）、
 * TLS 版本以及 HTTPS 证书」。
 */

const PORT = 8080;
const STORAGE_KEY = 'server_base_url';
const PROBE_TIMEOUT = 300;   // 单个候选地址探测超时（毫秒）
const POOL_SIZE = 8;         // 并发探测数（小程序 wx.request 并发上限为 10）
const MAX_SCAN_WAIT = 10000; // 全网段扫描的最长等待时间

let baseUrl = '';
let resolving = null;

// 切换网络后旧地址必然失效，清空内存缓存，下次请求重新发现
if (typeof wx.onNetworkStatusChange === 'function') {
  wx.onNetworkStatusChange(() => {
    baseUrl = '';
  });
}

/**
 * 探测某个地址是否为本项目的后端
 * @param {string} url 形如 http://172.20.10.2:8080
 * @returns {Promise<boolean>}
 */
function ping(url) {
  return new Promise((resolve) => {
    wx.request({
      url: `${url}/api/ping`,
      method: 'GET',
      timeout: PROBE_TIMEOUT,
      success: (res) => resolve(
        res.statusCode === 200 && res.data && res.data.service === 'canyingdiandan'
      ),
      fail: () => resolve(false)
    });
  });
}

/**
 * 获取手机自身的局域网 IP（如 172.20.10.3）
 * @returns {Promise<string>}
 */
function getLocalIp() {
  return new Promise((resolve) => {
    if (typeof wx.getLocalIPAddress !== 'function') {
      resolve('');
      return;
    }
    wx.getLocalIPAddress({
      success: (res) => resolve(res.localip || ''),
      fail: () => resolve('')
    });
  });
}

/**
 * 按命中概率排序生成候选地址
 * @param {string} localIp 手机自身的局域网 IP
 * @returns {string[]}
 */
function buildCandidates(localIp) {
  const list = [];
  const add = (ip) => {
    const url = `http://${ip}:${PORT}`;
    if (list.indexOf(url) === -1) list.push(url);
  };

  // 开发者工具里请求从电脑发出，本机地址可直接命中
  add('127.0.0.1');

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(localIp)) {
    const parts = localIp.split('.');
    const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;
    const self = Number(parts[3]);

    // 热点/家用路由器下电脑通常拿到靠前的地址，优先探测
    [2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach((n) => {
      if (n !== self) add(`${prefix}${n}`);
    });
    // 剩下的地址兜底扫描（动态分配 IP 时电脑可能落在任意位置）
    for (let n = 1; n <= 254; n++) {
      if (n !== self) add(`${prefix}${n}`);
    }
  }

  // 拿不到手机 IP 时，常见网段的兜底
  ['192.168.1.2', '192.168.0.2', '192.168.1.1', '192.168.0.1', '10.0.0.2'].forEach(add);

  return list;
}

/**
 * 并发扫描候选地址，命中即返回
 * @param {string[]} candidates
 * @returns {Promise<string>} 命中的地址，未找到返回空串
 */
function scan(candidates) {
  return new Promise((resolve) => {
    let nextIndex = 0;
    let active = 0;
    let settled = false;

    const finish = (url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(url);
    };
    const timer = setTimeout(() => finish(''), MAX_SCAN_WAIT);

    const launch = () => {
      while (!settled && active < POOL_SIZE && nextIndex < candidates.length) {
        const target = candidates[nextIndex++];
        active++;
        ping(target).then((ok) => {
          active--;
          if (settled) return;
          if (ok) {
            finish(target);
            return;
          }
          if (nextIndex >= candidates.length && active === 0) {
            finish('');
            return;
          }
          launch();
        });
      }
      if (!settled && active === 0 && nextIndex >= candidates.length) finish('');
    };

    launch();
  });
}

/**
 * 完整发现流程：缓存优先 → 扫描网段
 * @returns {Promise<string>}
 */
async function discover() {
  const cached = wx.getStorageSync(STORAGE_KEY);
  if (cached && await ping(cached)) {
    baseUrl = cached;
    return baseUrl;
  }

  const localIp = await getLocalIp();
  const found = await scan(buildCandidates(localIp));
  if (found) {
    baseUrl = found;
    wx.setStorageSync(STORAGE_KEY, found);
  }
  return baseUrl;
}

/**
 * 确保后端地址可用（幂等，并发调用共享同一个探测过程）
 * @returns {Promise<string>} 可用地址，未找到返回空串
 */
function ensureServer() {
  if (baseUrl) return Promise.resolve(baseUrl);
  if (!resolving) {
    resolving = discover()
      .catch(() => '')
      .then((url) => {
        resolving = null;
        return url;
      });
  }
  return resolving;
}

/**
 * 获取后端根地址（如 http://172.20.10.2:8080）
 */
function getBaseUrl() {
  return baseUrl || wx.getStorageSync(STORAGE_KEY) || '';
}

/**
 * 获取接口前缀（如 http://172.20.10.2:8080/api）
 */
function getApiBaseUrl() {
  return `${getBaseUrl()}/api`;
}

module.exports = {
  ensureServer,
  getBaseUrl,
  getApiBaseUrl
};
