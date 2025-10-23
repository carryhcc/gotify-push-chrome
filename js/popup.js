/**
 * popup.js - Gotify通知扩展的弹窗页面脚本
 */

import { initI18n } from './i18n.js';

// 模块作用域变量，用于存储当前语言的翻译
let i18nStrings = {};

/**
 * 加载配置并更新界面
 * 从存储中获取Gotify服务器配置和令牌信息，并据此更新UI显示
 */
function loadConfig() {
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens', 'lastSelectedToken'], function(result) {
    const gotifyTokens = result.gotifyTokens || [];
    const lastSelectedToken = result.lastSelectedToken;
    
    // 根据是否有配置显示不同的界面
    if (gotifyTokens.length === 0) {
      document.getElementById('configForm').style.display = 'none';
      document.getElementById('noConfig').style.display = 'block';
    } else {
      document.getElementById('configForm').style.display = 'block';
      document.getElementById('noConfig').style.display = 'none';
      
      // 填充token选择列表
      const tokenSelect = document.getElementById('tokenSelect');
      tokenSelect.innerHTML = '';
      
      gotifyTokens.forEach((tokenInfo) => {
        const option = document.createElement('option');
        option.value = tokenInfo.token; // 值是Token
        option.textContent = tokenInfo.remark; // 显示的是备注
        tokenSelect.appendChild(option);
      });

      // 如果有上次选择的token，则设置为选中状态
      if (lastSelectedToken && gotifyTokens.some(token => token.token === lastSelectedToken)) {
        tokenSelect.value = lastSelectedToken;
      }
    }
  });
}

/**
 * 发送消息到Gotify服务器
 * 获取表单数据，验证输入，然后向Gotify服务器发送POST请求
 */
function sendMessage() {
  // 清空之前的状态消息
  const status = document.getElementById('status');
  status.className = 'status';
  status.textContent = '';
  
  // 获取输入值
  const tokenSelect = document.getElementById('tokenSelect');
  const selectedToken = tokenSelect.value;
  let title = document.getElementById('titleInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();
  const priority = parseInt(document.getElementById('priorityInput').value, 10);
  
  // 验证输入
  if (!selectedToken) {
    showStatus(i18nStrings.statusNoToken, 'error');
    return;
  }
  
  if (!message) {
    showStatus(i18nStrings.statusNoMessage, 'error');
    return;
  }
  
  // 如果标题为空，设置默认值
  if (!title) {
    title = i18nStrings.defaultTitle || 'default';
  }
  
  // 显示正在发送
  showStatus(i18nStrings.statusSending, 'success');
  
  // 获取服务器地址并发送请求
  chrome.storage.sync.get('gotifyUrl', function(result) {
  const defaultUrl = i18nStrings.serverAddressPlaceholder || 'http://127.0.0.1:8080';
  const gotifyUrl = (result.gotifyUrl || defaultUrl).replace(/\/$/, '');
    const apiUrl = `${gotifyUrl}/message`;
    
    // 准备请求数据
    const data = {
      title: title,
      message: message,
      priority: priority
    };
    
    // 发送请求
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
        // 尝试解析错误信息
        return response.text().then(text => {
          let errorDetail = text;
          try {
            const errorJson = JSON.parse(text);
            errorDetail = errorJson.error_description || errorJson.error || text;
          } catch (e) {
            // 非JSON格式，直接使用text
          }
          throw new Error(`HTTP ${response.status}: ${errorDetail}`);
        });
      }
      return response.json();
    })
    .then(_data => {
      showStatus(i18nStrings.statusSuccess, 'success');
      // 保存当前选择的token
      const selectedToken = document.getElementById('tokenSelect').value;
      chrome.storage.sync.set({ lastSelectedToken: selectedToken });
      // 清空消息内容，保留标题和优先级
      document.getElementById('messageInput').value = '';
    })
    .catch(error => {
      console.error('Gotify请求失败:', error);
      let errorMsg = i18nStrings.statusErrorGeneric;
      
      if (error.message) {
        if (error.message.includes('Failed to fetch')) {
          errorMsg = i18nStrings.statusErrorFetch;
        } else if (error.message.includes('403')) {
          errorMsg = i18nStrings.statusError403;
        } else if (error.message.includes('404')) {
          errorMsg = i18nStrings.statusError404;
        } else {
          errorMsg = `${i18nStrings.statusErrorPrefix} ${error.message}`;
        }
      }
      
      showStatus(errorMsg, 'error');
    });
  });
}

/**
 * 显示状态消息
 * @param {string} message - 要显示的消息内容
 * @param {string} type - 消息类型（'success' 或 'error'）
 */
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.innerHTML = message;
  status.className = `status ${type}`;
  
  // 如果不是错误消息，3秒后自动隐藏
  if (type !== 'error') {
    setTimeout(() => {
      if (status.innerHTML === message) {
         status.className = 'status';
         status.innerHTML = '';
      }
    }, 3000);
  }
}

/**
 * 打开选项页面
 * 使用Chrome API打开扩展的选项页面
 */
function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

/**
 * 页面初始化函数
 * 初始化国际化、加载配置并绑定事件监听器
 */
async function initPage() {
  // 初始化 i18n 并获取翻译
  const { strings } = await initI18n();
  i18nStrings = strings;
  
  // 加载配置
  loadConfig();
  
  // 绑定事件
  document.querySelector('.send-btn').addEventListener('click', sendMessage);
  document.querySelector('.options-btn').addEventListener('click', openOptions);
  document.getElementById('configLink').addEventListener('click', function(e) {
    e.preventDefault();
    openOptions();
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);