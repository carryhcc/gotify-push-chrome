// options.js

// 全局变量，用于存储当前语言的翻译
let i18nStrings = {};

// 加载已保存的配置
function loadOptions() {
  // 增加 'contextMenuEnabled' 和 'contextMenuPriority'
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens', 'contextMenuEnabled', 'contextMenuPriority'], function(result) {
    // 设置默认值
    const defaultUrl = 'http://127.0.0.1:8080';
    document.getElementById('gotifyUrl').value = result.gotifyUrl || defaultUrl;
    
    // 加载右键菜单开关状态，默认为 false (关闭)
    document.getElementById('contextMenuEnabled').checked = result.contextMenuEnabled || false;

    // --- 加载右键优先级 ---
    // 如果值未定义(undefined)或为null，则默认为5。允许值为0。
    document.getElementById('contextMenuPriority').value = (result.contextMenuPriority !== undefined && result.contextMenuPriority !== null) ? result.contextMenuPriority : 5;
    // --- 加载结束 ---

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

// addTokenToList 函数保持不变
// ... (addTokenToList 函数代码) ...
function addTokenToList(tokenInfo = { remark: '', token: '' }) {
  const tokenList = document.getElementById('tokenList');
  const tokenItem = document.createElement('div');
  tokenItem.className = 'token-item';
  
  // 使用 i18nStrings 获取占位符和按钮文本
  const remarkPlaceholder = i18nStrings.tokenRemarkPlaceholder || 'Environment';
  const tokenPlaceholder = i18nStrings.tokenTokenPlaceholder || 'Enter Token...';
  const deleteText = i18nStrings.deleteBtnText || 'Delete';
  
  tokenItem.innerHTML = `
    <input type="text" class="remark-input" placeholder="${remarkPlaceholder}" value="${tokenInfo.remark || ''}">
    <input type="text" class="token-input" placeholder="${tokenPlaceholder}" value="${tokenInfo.token || ''}">
    <button class="btn delete-btn">${deleteText}</button>
  `;
  
  tokenList.appendChild(tokenItem);
}


// addToken 函数保持不变
// ... (addToken 函数代码) ...
function addToken() {
  addTokenToList();
}


// deleteToken 函数保持不变
// ... (deleteToken 函数代码) ...
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
  // 获取开关状态
  const contextMenuEnabled = document.getElementById('contextMenuEnabled').checked;

  // --- 获取优先级 ---
  // 下拉框已经限制了值的范围，直接获取即可
  const contextMenuPriority = parseInt(document.getElementById('contextMenuPriority').value, 10);
  // --- 获取结束 ---

  const defaultRemarkPrefix = i18nStrings.defaultRemarkPrefix || 'Token';
  
  const gotifyTokens = Array.from(tokenItems)
    .map(item => {
      const remark = item.querySelector('.remark-input').value.trim();
      const token = item.querySelector('.token-input').value.trim();
      // 如果备注为空，但token有效，则使用token的前几位作为默认备注
      const finalRemark = remark || (token ? `${defaultRemarkPrefix} (${token.substring(0, 6)}...)` : '');
      
      return {
        remark: finalRemark,
        token: token
      };
    })
    .filter(item => item.token !== ''); // 过滤掉token为空的项
  
  // 如果没有非空token，显示警告
  if (gotifyTokens.length === 0) {
    alert(i18nStrings.alertMinOneToken || 'Please add at least one valid Token');
    return;
  }
  
  // 保存到Chrome存储
  chrome.storage.sync.set({
    gotifyUrl: gotifyUrl,
    gotifyTokens: gotifyTokens,
    contextMenuEnabled: contextMenuEnabled, // <-- 保存开关状态
    contextMenuPriority: contextMenuPriority // <-- 新增: 保存优先级
  }, function() {
    // 显示保存成功消息
    const status = document.getElementById('status');
    status.className = 'status success';
    // 使用翻译
    status.textContent = i18nStrings.saveSuccessMsg || 'Settings saved';

    // *** 新增：通知 background.js 更新右键菜单 ***
    chrome.runtime.sendMessage({
      type: 'UPDATE_CONTEXT_MENU',
      enabled: contextMenuEnabled
    });
    
    // 3秒后隐藏消息
    setTimeout(function() {
      status.className = 'status';
    }, 3000);
  });
}

// 页面加载时加载配置并绑定事件监听器
document.addEventListener('DOMContentLoaded', async function() {
  // 1. 初始化 i18n 并获取当前语言和翻译
  const { lang, strings } = await initI18n();
  i18nStrings = strings; // 将翻译存储在全局变量中
  
  // 2. 设置语言切换器的当前值
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    langSwitcher.value = lang;
    
    // 3. 绑定语言切换器事件
    langSwitcher.addEventListener('change', (e) => {
      const newLang = e.target.value;
      chrome.storage.sync.set({ userLang: newLang }, () => {
        // 语言保存后，重新应用翻译
        i18nStrings = applyTranslations(newLang);
        // 重新加载选项，以更新动态添加的元素（如token行）的占位符
        loadOptions();
      });
    });
  }

  // 4. 加载其他配置
  loadOptions();
  
  // 5. 绑定添加Token按钮事件
  document.querySelector('.add-btn').addEventListener('click', addToken);
  
  // 6. 绑定保存配置按钮事件
  document.querySelector('.save-btn').addEventListener('click', saveOptions);
});

// 通过事件委托处理动态添加的删除按钮
document.getElementById('tokenList').addEventListener('click', function(event) {
  if (event.target.classList.contains('delete-btn')) {
    deleteToken(event.target);
  }
});