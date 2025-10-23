/**
 * background.js - 后台服务工作线程
 * 管理上下文菜单和通知功能
 */

// 上下文菜单ID常量
const CONTEXT_MENU_ID = "SEND_TO_GOTIFY";

/**
 * 创建右键菜单
 */
function createContextMenu() {
  // 首先尝试 update（如果已存在则更新），如果不存在再创建。
  chrome.contextMenus.update(CONTEXT_MENU_ID, {
    id: CONTEXT_MENU_ID,
    title: chrome.i18n.getMessage('contextMenuTitle'),
    contexts: ['selection']
  }, () => {
    // 如果 update 失败（通常表示不存在），则尝试创建
    if (chrome.runtime.lastError) {
      // 最常见的错误是 item not found; 在这种情况下创建新菜单
      chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: chrome.i18n.getMessage('contextMenuTitle'),
        contexts: ['selection']
      }, () => {
        // 在 create 回调中检查错误；如果是 duplicate id，安全忽略（可能并发创建）
        if (chrome.runtime.lastError) {
          const msg = String(chrome.runtime.lastError.message || '').toLowerCase();
          if (!msg.includes('duplicate') && !msg.includes('already exists')) {
            console.error('Failed to create context menu:', chrome.runtime.lastError);
          }
        }
      });
    }
  });
}

/**
 * 移除右键菜单
 */
function removeContextMenu() {
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    // 忽略可能的错误（如菜单不存在）
    void chrome.runtime.lastError;
  });
}

/**
 * 初始化上下文菜单
 * 根据用户设置决定是否创建右键菜单
 */
function initializeContextMenu() {
  chrome.storage.sync.get('contextMenuEnabled', (result) => {
    if (result.contextMenuEnabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
  });
}

/**
 * 从后台发送推送通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
async function sendPushFromBackground(title, message) {
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens', 'contextMenuPriority', 'contextMenuToken'], (result) => {
    const { gotifyUrl, gotifyTokens, contextMenuPriority, contextMenuToken } = result;

    // 验证配置是否完整
    if (!gotifyUrl || !gotifyTokens || gotifyTokens.length === 0) {
      console.error('Gotify send failed: No URL or Tokens configured.');
      // 使用 i18n 文本
      const noConfigTitle = chrome.i18n.getMessage('notificationPushFailed') || 'Gotify Push Failed';
      const noConfigMsg = chrome.i18n.getMessage('notificationNoConfig') || 'Please configure server and Token in plugin settings first';
      showNotification(noConfigTitle, noConfigMsg);
      return;
    }

    // 验证并设置优先级
    let pushPriority = contextMenuPriority;
    if (typeof pushPriority !== 'number' || pushPriority < 0 || pushPriority > 10) {
      pushPriority = 5; // 默认优先级
    }

    // 选择要使用的Token
    let selectedToken = gotifyTokens[0].token;
    if (contextMenuToken) {
      const foundToken = gotifyTokens.find(tokenInfo => tokenInfo.token === contextMenuToken);
      if (foundToken) {
        selectedToken = foundToken.token;
      }
    }

    // 构建API URL
    const apiUrl = (gotifyUrl || '').replace(/\/$/, '') + '/message';

    // 准备推送数据
    const data = {
      title: title,
      message: message,
      priority: pushPriority
    };

    // 发送请求到Gotify服务器
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gotify-Key': selectedToken
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Gotify push success:', data);
      const successTitle = chrome.i18n.getMessage('notificationPushSuccess') || 'Gotify Push Successful';
      const message = chrome.i18n.getMessage('notificationWithTitle', [title]) || (`Title: ${title}`);
      showNotification(successTitle, message);
    })
    .catch(error => {
      console.error('Gotify push failed:', error);
      const failTitle = chrome.i18n.getMessage('notificationPushFailed') || 'Gotify Push Failed';
      const message = chrome.i18n.getMessage('notificationError', [error.message]) || (`Error: ${error.message}. Please check network, URL, or Token.`);
      showNotification(failTitle, message);
    });
  });
}

/**
 * 显示浏览器通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
function showNotification(title, message) {
  const iconUrl = chrome.runtime.getURL('icons/icon128.png');
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message
  });
}

// 事件监听器 - 浏览器启动时初始化
// 在 service worker 的生命周期阶段初始化上下文菜单以确保在 MV3 中生效
self.addEventListener('install', (_event) => {
  // 在安装阶段尽快激活 service worker
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  // 激活后初始化上下文菜单
  initializeContextMenu();
});

// 同时监听 runtime.onInstalled 以处理扩展更新场景
chrome.runtime.onInstalled.addListener(initializeContextMenu);

// 事件监听器 - 处理来自options页面的菜单更新消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_CONTEXT_MENU') {
    if (request.enabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
    sendResponse({status: "Context menu updated"});
  }
  return true; // 保持消息通道开放
});

// 事件监听器 - 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    const selectedText = info.selectionText;
    const pageTitle = tab.title || '';
    sendPushFromBackground(pageTitle, selectedText);
  }
});