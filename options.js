// 加载已保存的配置
function loadOptions() {
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens'], function(result) {
    // 设置默认值
    const defaultUrl = 'http://127.0.0.1:8080';
    document.getElementById('gotifyUrl').value = result.gotifyUrl || defaultUrl;
    
    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = '';
    
    // gotifyTokens 现在应该是 [{remark: '...', token: '...'}, ...]
    if (result.gotifyTokens && result.gotifyTokens.length > 0) {
      result.gotifyTokens.forEach(tokenInfo => {
        addTokenToList(tokenInfo);
      });
    } else {
      // 如果没有保存的tokens，添加一个空的输入框
      addTokenToList({ remark: '', token: '' });
    }
  });
}

// 添加一个token输入框到列表
// tokenInfo 是一个对象 { remark: '...', token: '...' }
function addTokenToList(tokenInfo = { remark: '', token: '' }) {
  const tokenList = document.getElementById('tokenList');
  const tokenItem = document.createElement('div');
  tokenItem.className = 'token-item';
  
  tokenItem.innerHTML = `
    <input type="text" class="remark-input" placeholder="推送环境" value="${tokenInfo.remark || ''}">
    <input type="text" class="token-input" placeholder="输入Token..." value="${tokenInfo.token || ''}">
    <button class="delete-btn" onclick="deleteToken(this)">删除</button>
  `;
  
  tokenList.appendChild(tokenItem);
}

// 添加新的token输入框
function addToken() {
  addTokenToList();
}

// 删除token输入框
function deleteToken(button) {
  const tokenItem = button.parentElement;
  const tokenList = document.getElementById('tokenList');
  
  // 确保至少保留一个token输入框
  if (tokenList.children.length > 1) {
    tokenList.removeChild(tokenItem);
  } else {
    // 如果只剩一个，清空它而不是删除
    tokenItem.querySelector('.remark-input').value = '';
    tokenItem.querySelector('.token-input').value = '';
  }
}

// 保存配置
function saveOptions() {
  const gotifyUrl = document.getElementById('gotifyUrl').value.trim();
  const tokenItems = document.querySelectorAll('#tokenList .token-item');
  
  const gotifyTokens = Array.from(tokenItems)
    .map(item => {
      const remark = item.querySelector('.remark-input').value.trim();
      const token = item.querySelector('.token-input').value.trim();
      // 如果备注为空，但token有效，则使用token的前几位作为默认备注
      const finalRemark = remark || (token ? `Token (${token.substring(0, 6)}...)` : '');
      
      return {
        remark: finalRemark,
        token: token
      };
    })
    .filter(item => item.token !== ''); // 过滤掉token为空的项
  
  // 如果没有非空token，显示警告
  if (gotifyTokens.length === 0) {
    alert('请至少添加一个有效的Token');
    return;
  }
  
  // 保存到Chrome存储
  chrome.storage.sync.set({
    gotifyUrl: gotifyUrl,
    gotifyTokens: gotifyTokens
  }, function() {
    // 显示保存成功消息
    const status = document.getElementById('status');
    status.className = 'status success';
    status.textContent = '配置已保存';
    
    // 3秒后隐藏消息
    setTimeout(function() {
      status.className = 'status';
    }, 3000);
  });
}

// 页面加载时加载配置并绑定事件监听器
document.addEventListener('DOMContentLoaded', function() {
  loadOptions();
  
  // 绑定添加Token按钮事件
  document.querySelector('.add-btn').addEventListener('click', addToken);
  
  // 绑定保存配置按钮事件
  document.querySelector('.save-btn').addEventListener('click', saveOptions);
});

// 通过事件委托处理动态添加的删除按钮
document.getElementById('tokenList').addEventListener('click', function(event) {
  if (event.target.classList.contains('delete-btn')) {
    deleteToken(event.target);
  }
});