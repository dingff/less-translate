// 将js对象转换为url参数形式
const urlEncode = (params = {}) => {
  return Object.entries(params)
    .reduce(
      (acc, curr) => `${acc}${curr[0]}=${encodeURIComponent(curr[1] ?? '')}&`,
      '?',
    )
    .slice(0, -1);
};
const get = (url, params) => {
  return new Promise((resolve) => {
    fetch(`${url}${urlEncode(params)}`).then((response) => response.json()).then((res) => resolve(res))
  })
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTranslation') {
    get('https://fanyi-api.baidu.com/api/trans/vip/translate', message.data).then((res) => {
      sendResponse(res);
    })
  }
  return true;
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('isOpen', (res) => {
    if (res.isOpen == undefined) {
      // 安装扩展时初始化启用状态
      chrome.storage.sync.set({ isOpen: true }, () => {});
    }
  })
})
chrome.windows.onCreated.addListener(() => {
  // 在浏览器启动时更新图标
  chrome.storage.sync.get('isOpen', (res) => {
    chrome.action.setIcon({ path: res.isOpen ? './logo/logo.png': './logo/logo_gray.png' })
  })
})
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isOpen) {
    const isOpen = changes.isOpen.newValue
    chrome.action.setIcon({ path: isOpen ? './logo/logo.png': './logo/logo_gray.png' })
  } 
});