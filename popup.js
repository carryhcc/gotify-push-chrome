// popup.js

// 全局变量，用于存储当前语言的翻译
let i18nStrings = {};

// 加载配置并更新界面
function loadConfig() {
  // gotifyTokens 预期为 [{remark: '...', token: '...'}, ...]
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens'], function(result) {
    const gotifyTokens = result.gotifyTokens || [];
    
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
    }
  });
}

// 发送消息到Gotify服务器
function sendMessage() {
  // 清空之前的状态消息
  const status = document.getElementById('status');
  status.className = 'status';
  status.textContent = '';
  
  // 获取输入值
  const tokenSelect = document.getElementById('tokenSelect');
  const selectedToken = tokenSelect.value;
  const title = document.getElementById('titleInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();
  
  // 验证输入
  if (!selectedToken) {
    showStatus(i18nStrings.statusNoToken, 'error');
    return;
  }
  
  if (!title) {
    showStatus(i18nStrings.statusNoTitle, 'error');
    return;
  }
  
  if (!message) {
    showStatus(i18nStrings.statusNoMessage, 'error');
    return;
  }
  
  // 显示正在发送
  showStatus(i18nStrings.statusSending, 'success');
  
  // 获取服务器地址
  chrome.storage.sync.get('gotifyUrl', function(result) {
    const gotifyUrl = (result.gotifyUrl || 'http://127.0.0.1:8080').replace(/\/$/, ''); // 移除尾部斜杠
    const apiUrl = `${gotifyUrl}/message`;
    
    // 准备请求数据
    const data = {
      title: title,
      message: message
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
            // 尝试解析JSON格式的错误
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
    .then(data => {
      showStatus(i18nStrings.statusSuccess, 'success');
      // 清空消息内容，保留标题
      document.getElementById('messageInput').value = '';
    })
    .catch(error => {
      console.error('Gotify请求失败:', error); // 保留关键错误日志
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

// 显示状态消息
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  // 如果不是错误消息，3秒后自动隐藏
  if (type !== 'error') {
    setTimeout(() => {
      if (status.textContent === message) {
         status.className = 'status';
         status.textContent = '';
      }
    }, 3000);
  }
}

// 打开选项页面
function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

// 页面加载时加载配置并绑定事件监听器
document.addEventListener('DOMContentLoaded', async function() {
  // 1. 初始化 i18n 并获取翻译
  const { strings } = await initI18n();
  i18nStrings = strings; // 存储翻译
  
  // 2. 加载配置
  loadConfig();
  
  // 3. 绑定发送按钮事件
  document.querySelector('.send-btn').addEventListener('click', sendMessage);
  
  // 4. 绑定设置按钮事件
  document.querySelector('.options-btn').addEventListener('click', openOptions);
  
  // 5. 绑定配置链接事件
  document.getElementById('configLink').addEventListener('click', function(e) {
    e.preventDefault();
    openOptions();
  });
});