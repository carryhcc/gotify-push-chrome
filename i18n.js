// i18n.js
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
    'statusError403': 'Failed to send: 403 Forbidden. Invalid Token or insufficient permissions.',
    'statusError404': 'Failed to send: 404 Not Found. Check if the server URL is correct.',
    'statusErrorPrefix': 'Failed to send: ',
    'defaultTitle': 'default',
    'contextMenuLabel': 'Enable Right-Click Send' // <-- 新增
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
    'statusError403': '发送失败：403 Forbidden，Token无效或权限不足。',
    'statusError404': '发送失败：404 Not Found，请检查服务器URL地址是否正确。',
    'statusErrorPrefix': '发送失败：',
    'defaultTitle': '默认',
    'contextMenuLabel': '开启右键发送' // <-- 新增
  }
};

// ... (applyTranslations 和 initI18n 函数保持不变) ...
/**
 * Applies translations to the current document based on the selected language.
 * @param {string} lang - The language code (e.g., 'en', 'zh_CN').
 * @returns {object} The translation object for the applied language.
 */
function applyTranslations(lang) {
  const langStrings = translations[lang] || translations['en'];
  
  // Set document language
  document.documentElement.lang = lang === 'zh_CN' ? 'zh-CN' : 'en';

  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langStrings[key]) {
      el.textContent = langStrings[key];
    }
  });
  
  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (langStrings[key]) {
      el.setAttribute('placeholder', langStrings[key]);
    }
  });

  return langStrings;
}

/**
 * Initializes internationalization by loading the user's preferred language
 * (or detecting it) and applying the translations.
 * @returns {Promise<{lang: string, strings: object}>} A promise that resolves with the language code and the translation strings.
 */
async function initI18n() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('userLang', (result) => {
      let lang = result.userLang;
      if (!lang) {
        // Guess from browser language
        const browserLang = navigator.language;
        if (browserLang.startsWith('zh')) {
          lang = 'zh_CN';
        } else {
          lang = 'en';
        }
      }
      const strings = applyTranslations(lang);
      resolve({ lang: lang, strings: strings });
    });
  });
}