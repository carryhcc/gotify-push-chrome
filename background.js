// background.js

const CONTEXT_MENU_ID = "SEND_TO_GOTIFY";

// 封装创建菜单的函数
function createContextMenu() {
  // *** 修复 ***
  // 1. 先尝试移除已存在的菜单，防止 'onInstalled' 或重载时出错
  // 2. 在移除的回调中（无论成功还是失败），再创建新菜单
  // 这种 "remove-then-create" 模式确保了操作的幂等性（Idempotency）
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    // 忽略 'lastError' (如果菜单不存在，移除会报错，这是正常的)
    void chrome.runtime.lastError;
    
    // 移除后，创建新的菜单
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["selection"] // 只在选中文本时显示
    });
  });
}

// 封装移除菜单的函数 (这个函数是正确的)
function removeContextMenu() {
  // 尝试移除，如果不存在会报错，我们忽略该错误
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    // void chrome.runtime.lastError 是一种忽略错误的常用技巧
    void chrome.runtime.lastError;
  });
}

// 1. 插件启动时(包括安装和更新)，根据存储的设置初始化菜单
// onInstalled 在安装/更新时触发，onStartup 在浏览器启动时触发
function initializeContextMenu() {
  chrome.storage.sync.get('contextMenuEnabled', (result) => {
    if (result.contextMenuEnabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
  });
}

chrome.runtime.onStartup.addListener(initializeContextMenu);
chrome.runtime.onInstalled.addListener(initializeContextMenu);


// 2. 监听来自 options.js 的消息，实时更新菜单
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_CONTEXT_MENU') {
    if (request.enabled) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
    // 响应消息，表示已处理
    sendResponse({status: "Context menu updated"});
  }
  // 返回 true 表示我们将异步发送响应（这是一个好习惯）
  return true; 
});


// 3. 监听右键菜单点击事件 (这段逻辑保持不变)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    // 获取选中的文本
    const selectedText = info.selectionText;
    // 获取当前标签页的标题
    const pageTitle = tab.title || '';

    // 发送推送
    sendPushFromBackground(pageTitle, selectedText);
  }
});

// 4. 后台发送推送的函数 (*** 此处已更新 ***)
async function sendPushFromBackground(title, message) {
  // 从存储中获取配置 (*** 新增 'contextMenuPriority' 和 'contextMenuToken' ***)
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens', 'contextMenuPriority', 'contextMenuToken'], (result) => {
    const { gotifyUrl, gotifyTokens, contextMenuPriority, contextMenuToken } = result;

    // 检查配置
    if (!gotifyUrl || !gotifyTokens || gotifyTokens.length === 0) {
      console.error('Gotify send failed: No URL or Tokens configured.');
      showNotification('Gotify 推送失败', '请先在插件设置中配置服务器和Token');
      return;
    }

    // --- 新增: 验证并设置优先级 ---
    let pushPriority = contextMenuPriority;
    if (typeof pushPriority !== 'number' || pushPriority < 0 || pushPriority > 10) {
      pushPriority = 5; // 验证失败或未设置，默认为 5
    }
    // --- 新增结束 ---

    // 使用配置的token，如果没有配置或找不到对应token，则使用第一个token
    let selectedToken = gotifyTokens[0].token;
    if (contextMenuToken) {
      const foundToken = gotifyTokens.find(tokenInfo => tokenInfo.token === contextMenuToken);
      if (foundToken) {
        selectedToken = foundToken.token;
      }
    }
    const apiUrl = (gotifyUrl || '').replace(/\/$/, '') + '/message';

    // 准备数据
    const data = {
      title: title,
      message: message,
      priority: pushPriority // <-- 新增: 包含优先级
    };

    // 发送 Fetch 请求
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

// 5. 显示桌面通知的辅助函数 (这段逻辑保持不变)
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}