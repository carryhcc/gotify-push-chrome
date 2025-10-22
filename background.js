// background.js

// 1. 创建右键菜单
// 使用 chrome.i18n.getMessage 来获取本地化的菜单标题
const CONTEXT_MENU_ID = "SEND_TO_GOTIFY";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["selection"] // 只在选中文本时显示
  });
});

// 2. 监听右键菜单点击事件
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

// 3. 后台发送推送的函数
async function sendPushFromBackground(title, message) {
  // 从存储中获取配置
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens'], (result) => {
    const { gotifyUrl, gotifyTokens } = result;

    // 检查配置
    if (!gotifyUrl || !gotifyTokens || gotifyTokens.length === 0) {
      console.error('Gotify send failed: No URL or Tokens configured.');
      showNotification('Gotify 推送失败', '请先在插件设置中配置服务器和Token');
      return;
    }

    // 默认使用第一个Token
    const firstToken = gotifyTokens[0].token;
    const apiUrl = (gotifyUrl || '').replace(/\/$/, '') + '/message';

    // 准备数据
    const data = {
      title: title,
      message: message
    };

    // 发送 Fetch 请求
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gotify-Key': firstToken
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

// 4. 显示桌面通知的辅助函数
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}