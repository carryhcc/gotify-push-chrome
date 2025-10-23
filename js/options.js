/**
 * options.js - 选项页面的JavaScript逻辑
 */

import { initI18n, applyTranslations } from './i18n.js';

// 模块作用域变量，用于存储当前语言的翻译字符串
let i18nStrings = {};

/**
 * 更新右键菜单相关控件的显示状态
 * @param {boolean} enabled - 是否启用右键菜单
 */
function updateContextMenuControlsVisibility(enabled) {
  const priorityElement = document.querySelector('.priority-item');
  const tokenElement = document.getElementById('contextMenuTokenContainer');
  
  if (priorityElement) {
    priorityElement.style.display = enabled ? 'block' : 'none';
  }
  
  if (tokenElement) {
    tokenElement.style.display = enabled ? 'block' : 'none';
  }
}

/**
 * 填充右键推送环境选择下拉框
 * @param {Array} tokens - Token配置列表
 * @param {string} selectedToken - 当前选中的Token
 */
function populateContextMenuTokenSelect(tokens, selectedToken) {
  const tokenSelect = document.getElementById('contextMenuToken');
  if (!tokenSelect) return;
  
  tokenSelect.innerHTML = '';
  
  if (tokens && tokens.length > 0) {
    tokens.forEach(tokenInfo => {
      const option = document.createElement('option');
      option.value = tokenInfo.token;
      option.textContent = tokenInfo.remark;
      if (selectedToken === tokenInfo.token) {
        option.selected = true;
      }
      tokenSelect.appendChild(option);
    });
  }
}

/**
 * 将Token信息添加到列表中
 * @param {Object} tokenInfo - Token信息对象，包含remark和token字段
 */
function addTokenToList(tokenInfo = { remark: '', token: '' }) {
  const tokenList = document.getElementById('tokenList');
  const tokenItem = document.createElement('div');
  tokenItem.className = 'token-item';
  
  // 使用国际化文本获取占位符和按钮文本
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

/**
 * 添加新的Token输入行
 */
function addToken() {
  addTokenToList();
}

/**
 * 删除Token输入行
 * @param {HTMLElement} button - 删除按钮元素
 */
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

/**
 * 加载已保存的配置
 */
function loadOptions() {
  chrome.storage.sync.get(['gotifyUrl', 'gotifyTokens', 'contextMenuEnabled', 'contextMenuPriority', 'contextMenuToken'], function(result) {
      // 设置默认值，使用 i18n 中的 placeholder 值作为默认地址提示
      const defaultUrl = i18nStrings.serverAddressPlaceholder || 'http://127.0.0.1:8080';
      document.getElementById('gotifyUrl').value = result.gotifyUrl || defaultUrl;
    
    // 加载右键菜单开关状态，默认为false
    const contextMenuEnabled = result.contextMenuEnabled || false;
    document.getElementById('contextMenuEnabled').checked = contextMenuEnabled;

    // 更新右键控件显示状态
    updateContextMenuControlsVisibility(contextMenuEnabled);

    // 加载右键优先级，默认值为5
    document.getElementById('contextMenuPriority').value = (result.contextMenuPriority !== undefined && result.contextMenuPriority !== null) ? result.contextMenuPriority : 5;

    // 加载Token列表
    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = '';
    
    const gotifyTokens = result.gotifyTokens || [];
    
    if (gotifyTokens.length > 0) {
      gotifyTokens.forEach(tokenInfo => {
        addTokenToList(tokenInfo);
      });
      
      // 填充右键推送环境选择下拉框
      populateContextMenuTokenSelect(gotifyTokens, result.contextMenuToken);
    } else {
      // 如果没有保存的tokens，添加一个空的输入框
      addTokenToList({ remark: '', token: '' });
    }
  });
}

/**
 * 保存配置到Chrome存储
 */
function saveOptions() {
  // 获取表单数据
  const gotifyUrl = document.getElementById('gotifyUrl').value.trim();
  const tokenItems = document.querySelectorAll('#tokenList .token-item');
  const contextMenuEnabled = document.getElementById('contextMenuEnabled').checked;
  const contextMenuPriority = parseInt(document.getElementById('contextMenuPriority').value, 10);
  
  // 处理Token列表
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
  
  // 验证至少有一个有效的Token
  if (gotifyTokens.length === 0) {
    alert(i18nStrings.alertMinOneToken || chrome.i18n.getMessage('alertMinOneToken') || 'Please add at least one valid Token');
    return;
  }
  
  // 获取右键推送环境选择
  const contextMenuToken = document.getElementById('contextMenuToken')?.value;
  
  // 保存到Chrome存储
  chrome.storage.sync.set({
    gotifyUrl: gotifyUrl,
    gotifyTokens: gotifyTokens,
    contextMenuEnabled: contextMenuEnabled,
    contextMenuPriority: contextMenuPriority,
    contextMenuToken: contextMenuToken
  }, function() {
  // 显示保存成功消息
  const status = document.getElementById('status');
  status.className = 'status success';
  status.textContent = i18nStrings.saveSuccessMsg || chrome.i18n.getMessage('saveSuccessMsg') || 'Settings saved';

    // 通知background.js更新右键菜单
    chrome.runtime.sendMessage({
      type: 'UPDATE_CONTEXT_MENU',
      enabled: contextMenuEnabled,
      priority: contextMenuPriority,
      token: contextMenuToken
    });
    
    // 保存后刷新右键推送环境选择下拉框
    const tokenSelect = document.getElementById('contextMenuToken');
    let selectedToken = tokenSelect?.value;
    
    // 检查当前选择的token是否仍然有效
    const tokenStillExists = gotifyTokens.some(token => token.token === selectedToken);
    if (!tokenStillExists && gotifyTokens.length > 0) {
      // 如果之前选择的token不存在了，使用第一个token
      selectedToken = gotifyTokens[0].token;
    }
    
    // 重新填充下拉框
    populateContextMenuTokenSelect(gotifyTokens, selectedToken);
    
    // 3秒后隐藏消息
    setTimeout(function() {
      status.className = 'status';
    }, 3000);
  });
}

/**
 * 页面初始化函数
 */
async function initPage() {
  // 初始化国际化并获取当前语言和翻译
  const { lang, strings } = await initI18n();
  i18nStrings = strings;
  
  // 设置语言切换器的当前值并绑定事件
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    langSwitcher.value = lang;
    
    langSwitcher.addEventListener('change', (e) => {
      const newLang = e.target.value;
      chrome.storage.sync.set({ userLang: newLang }, () => {
        // 语言保存后，重新应用翻译
        i18nStrings = applyTranslations(newLang);
        // 重新加载选项，以更新动态添加的元素的占位符
        loadOptions();
      });
    });
  }

  // 加载配置
  loadOptions();
  
  // 绑定事件
  document.querySelector('.add-btn').addEventListener('click', addToken);
  document.querySelector('.save-btn').addEventListener('click', saveOptions);
  
  // 绑定右键菜单开关事件
  const contextMenuToggle = document.getElementById('contextMenuEnabled');
  if (contextMenuToggle) {
    contextMenuToggle.addEventListener('change', function() {
      updateContextMenuControlsVisibility(this.checked);
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 通过事件委托处理动态添加的删除按钮
document.getElementById('tokenList').addEventListener('click', function(event) {
  if (event.target.classList.contains('delete-btn')) {
    deleteToken(event.target);
  }
});