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
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    // 忽略可能的错误（如菜单不存在）
    void chrome.runtime.lastError;
    
    // 创建新的上下文菜单
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["selection"]
    });
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
      showNotification('Gotify 推送失败', '请先在插件设置中配置服务器和Token');
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
      showNotification('Gotify 推送成功', `标题: ${title}`);
    })
    .catch(error => {
      console.error('Gotify push failed:', error);
      showNotification('Gotify 推送失败', `错误: ${error.message}. 请检查网络、URL或Token。`);
    });
  });
}

/**
 * 显示浏览器通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: title,
    message: message
  });
}

// 事件监听器 - 浏览器启动时初始化
chrome.runtime.onStartup.addListener(initializeContextMenu);

// 事件监听器 - 插件安装/更新时初始化
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