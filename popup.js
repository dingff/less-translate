const submitBtn = document.getElementById('submit-btn')
const emptyTip = document.getElementById('empty-tip')
const editTip = document.getElementById('edit-tip')
const editBtn = document.getElementById('edit-btn')
const appId = document.getElementById('app-id')
const secretKey = document.getElementById('secret-key')
const toggleOpen = document.getElementById('toggle-open');

const handleInputErr = (el) => {
  el.style.border = '1px solid red';
}
const handleInputNormal = (el) => {
  el.style.border = '1px solid #ccc';
}
appId.oninput = () => {
  handleInputNormal(appId)
}
secretKey.oninput = () => {
  handleInputNormal(secretKey)
}
const endEdit = () => {
  appId.disabled = true
  appId.style.background = '#eee'
  secretKey.disabled = true
  secretKey.style.background = '#eee'
  submitBtn.style.display = 'none'
  emptyTip.style.display = 'none'
  editTip.style.display = 'block'
}
const startEdit = () => {
  appId.disabled = false
  appId.style.background = 'rgb(247, 247, 247)'
  secretKey.disabled = false
  secretKey.style.background = 'rgb(247, 247, 247)'
  submitBtn.style.display = 'block'
  emptyTip.style.display = 'block'
  editTip.style.display = 'none'
}
submitBtn.onclick = () => {
  console.log(appId, secretKey);
  appId.value = appId.value.trim()
  secretKey.value = secretKey.value.trim()
  if (!appId.value) {
    handleInputErr(appId)
    return
  }
  if (!secretKey.value) {
    handleInputErr(secretKey)
    return
  }
  chrome.storage.sync.set({ user: {
    appId: appId.value,
    secretKey: secretKey.value
  }}, () => {
    endEdit()
  });
}
editBtn.onclick = () => {
  startEdit()
}
chrome.storage.sync.get('user', (res) => {
  const user = res.user
  if (user?.appId) {
    appId.value = user.appId
    secretKey.value = user.secretKey
    endEdit()
  } else {
    startEdit()
  }
})
chrome.storage.sync.get('isOpen', (res) => {
  if (res.isOpen) {
    toggleOpen.classList.add('open')
  } else {
    toggleOpen.classList.remove('open')
  }
})
toggleOpen.onclick = () => {
  toggleOpen.classList.toggle('open')
  const isOpen = toggleOpen.classList.contains('open');
  chrome.storage.sync.set({ isOpen }, () => {});
}