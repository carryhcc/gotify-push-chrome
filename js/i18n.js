/**
 * i18n.js - 国际化支持模块
 */
const translations = {
  'en': {
    'langName': 'English',
    'optionsTitle': 'Gotify Push Tool - Settings',
    'langLabel': 'Language:',
    'serverAddressLabel': 'Gotify Server URL:',
    'serverAddressPlaceholder': 'http://127.0.0.1:8080',
    'tokenListLabel': 'Gotify Token List:',
    'tokenHeaderRemark': 'Environment',
    'tokenHeaderToken': 'Token (Required)',
    'tokenHeaderAction': 'Action',
    'tokenRemarkPlaceholder': 'Environment',
    'tokenTokenPlaceholder': 'Enter Token...',
    'deleteBtnText': 'Delete',
    'addTokenBtn': 'Add Token',
    'saveBtn': 'Save Settings',
    'saveSuccessMsg': 'Settings saved',
    'alertMinOneToken': 'Please add at least one valid Token',
    'defaultRemarkPrefix': 'Token',
    'popupTitle': 'Send Gotify Push',
    'envLabel': 'Environment:',
    'titleLabel': 'Title:',
    'titlePlaceholder': 'Enter push title... (Optional)',
    'messageLabel': 'Content:',
    'messagePlaceholder': 'Enter push content...',
    'sendBtn': 'Send',
    'optionsBtn': 'Settings',
    'noConfigMsg': 'Please ',
    'noConfigLink': 'configure',
    'noConfigMsg2': ' your Gotify server URL and Token first',
    'statusNoToken': 'No Token found. Please check settings',
    'statusNoTitle': 'Please enter a title',
    'statusNoMessage': 'Please enter content',
    'statusSending': 'Sending...',
    'statusSuccess': 'Message sent successfully!',
    'statusErrorGeneric': 'Failed to send. Check network, URL, or Token.',
    'statusErrorFetch': 'Failed to send: Cannot connect to server. Check URL or CORS policy.',
    'statusError403': 'Failed to send: 403 Forbidden. Invalid Token, insufficient permissions or CORS settings. Please visit <a href="https://gotify.net/docs/config" target="_blank">https://gotify.net/docs/config</a> to check GOTIFY_SERVER_CORS_ALLOWORIGINS settings and restart the server.',
    'statusError404': 'Failed to send: 404 Not Found. Check if the server URL is correct.',
    'statusErrorPrefix': 'Failed to send: ',
    'defaultTitle': 'default',
    'contextMenuLabel': 'Enable Right-Click Send',
    'contextMenuTokenLabel': 'Right-Click Environment:',
    'contextMenuPriorityLabel': 'Right-Click Priority:',
    'priorityPlaceholder': 'Priority (0-10, default 5)',
    'popupPriorityLabel': 'Priority:',
    'priorityLowest': 'Lowest',
    'priorityDefault': 'Default',
    'priorityHighest': 'Highest',
    'priorityOption0': '0 (Lowest)',
    'priorityOption5': '5 (Default)',
    'priorityOption10': '10 (Highest)',
    'notificationPushSuccess': 'Gotify Push Successful',
    'notificationPushFailed': 'Gotify Push Failed',
    'notificationNoConfig': 'Please configure server and Token in plugin settings first',
    'notificationErrorPrefix': 'Error: ',
    'notificationErrorSuffix': '. Please check network, URL, or Token.',
    'notificationTitlePrefix': 'Title: '
  },
  'zh_CN': {
    'langName': '简体中文',
    'optionsTitle': 'Gotify推送工具 - 配置',
    'langLabel': '语言:',
    'serverAddressLabel': 'Gotify服务器地址:',
    'serverAddressPlaceholder': 'http://127.0.0.1:8080',
    'tokenListLabel': 'Gotify Token列表:',
    'tokenHeaderRemark': '推送环境',
    'tokenHeaderToken': 'Token (必填)',
    'tokenHeaderAction': '操作',
    'tokenRemarkPlaceholder': '推送环境',
    'tokenTokenPlaceholder': '输入Token...',
    'deleteBtnText': '删除',
    'addTokenBtn': '添加Token',
    'saveBtn': '保存配置',
    'saveSuccessMsg': '配置已保存',
    'alertMinOneToken': '请至少添加一个有效的Token',
    'defaultRemarkPrefix': 'Token',
    'popupTitle': '发送Gotify推送',
    'envLabel': '推送环境:',
    'titleLabel': '标题:',
    'titlePlaceholder': '输入推送标题... (可选)',
    'messageLabel': '内容:',
    'messagePlaceholder': '输入推送内容...',
    'sendBtn': '发送',
    'optionsBtn': '设置',
    'noConfigMsg': '请先',
    'noConfigLink': '配置',
    'noConfigMsg2': 'Gotify服务器地址和Token',
    'statusNoToken': '未找到Token，请检查配置',
    'statusNoTitle': '请输入标题',
    'statusNoMessage': '请输入内容',
    'statusSending': '正在发送...',
    'statusSuccess': '消息发送成功!',
    'statusErrorGeneric': '发送失败，请检查网络、URL或Token。',
    'statusErrorFetch': '发送失败：无法连接到服务器。请检查URL配置或CORS策略。',
    'statusError403': '发送失败：403 Forbidden，Token无效、权限不足或CORS配置问题。请访问 <a href="https://gotify.net/docs/config" target="_blank">https://gotify.net/docs/config</a> 查看 GOTIFY_SERVER_CORS_ALLOWORIGINS 配置项并重启服务端。',
    'statusError404': '发送失败：404 Not Found，请检查服务器URL地址是否正确。',
    'statusErrorPrefix': '发送失败：',
    'defaultTitle': '默认',
    'contextMenuLabel': '开启右键发送',
    'contextMenuTokenLabel': '右键推送环境选择:',
    'contextMenuPriorityLabel': '右键推送优先级:',
    'priorityPlaceholder': '优先级 (0-10, 默认 5)',
    'popupPriorityLabel': '优先级:',
    'priorityLowest': '最低',
    'priorityDefault': '默认',
    'priorityHighest': '最高',
    'priorityOption0': '0 (最低)',
    'priorityOption5': '5 (默认)',
    'priorityOption10': '10 (最高)',
    'notificationPushSuccess': 'Gotify 推送成功',
    'notificationPushFailed': 'Gotify 推送失败',
    'notificationNoConfig': '请先在插件设置中配置服务器和Token',
    'notificationErrorPrefix': '错误: ',
    'notificationErrorSuffix': '. 请检查网络、URL或Token。',
    'notificationTitlePrefix': '标题: '
  }
};

/**
 * 将翻译应用到当前文档
 * @param {string} lang - 语言代码 (例如: 'en', 'zh_CN')
 * @returns {object} 应用的语言翻译对象
 */
function applyTranslations(lang) {
  const langStrings = translations[lang] || translations['en'];
  
  // 设置文档语言
  document.documentElement.lang = lang === 'zh_CN' ? 'zh-CN' : 'en';

  // 翻译文本内容
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langStrings[key]) {
      el.textContent = langStrings[key];
    }
  });
  
  // 翻译占位符
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (langStrings[key]) {
      el.setAttribute('placeholder', langStrings[key]);
    }
  });

  return langStrings;
}

/**
 * 初始化国际化，加载用户首选语言或自动检测
 * @returns {Promise<{lang: string, strings: object}>} 包含语言代码和翻译字符串的Promise
 */
async function initI18n() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('userLang', (result) => {
      let lang = result.userLang;
      if (!lang) {
        // 从浏览器语言猜测
        const browserLang = navigator.language;
        lang = browserLang.startsWith('zh') ? 'zh_CN' : 'en';
      }
      const strings = applyTranslations(lang);
      resolve({ lang: lang, strings: strings });
    });
  });
}