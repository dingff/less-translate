let isSelecting = false; // 是否正在选择文本
let transVisible = false;
let line
let content
let dic = new Map()
let user = {}
let isOpen = true // 扩展是否启用
chrome.storage.sync.get('user', (res) => {
  user = res.user
})
chrome.storage.sync.get('isOpen', (res) => {
  isOpen = res.isOpen
})
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.user) user = changes.user.newValue
  if (changes.isOpen) isOpen = changes.isOpen.newValue
});
const getNodes = (root) => {
  const nodes = []
  const excludeNodes = ['SCRIPT', 'NOSCRIPT', 'path', 'IMG', 'svg', 'I', 'STYLE', 'CODE', 'S'];
  const doNext = (next) => {
    if (!next) return;
    for (let i = 0; i < next.children.length; i++) {
      var node = next.children[i];
      if (node && !excludeNodes.includes(node.nodeName)) {
        nodes.push(node);
        if (node.children) doNext(node);
      }
    }
    return nodes
  }
  return doNext(root)
}
const replaceHtml = (root) => {
  const nodes = getNodes(root)
  if (!nodes || !nodes[0]) return
  nodes.forEach((item) => {
    item.childNodes.forEach((subItem) => {
      const textContent = subItem.textContent;
      if (subItem.nodeType === 3 && textContent.trim() !== '' && !textContent.includes('/')) {
        const newNode = document.createElement('s')
        newNode.style.all = 'unset';
        const html = textContent.replace(/[a-zA-Z]+/g, (m) => `<s class="less-translate" style="all: unset;">${m}</s>`)
        newNode.innerHTML = html
        item.insertBefore(newNode, subItem)
        item.removeChild(subItem)
      }
    })
  })
}
const createTrans = () => {
  line = document.createElement('s');
  line.id = 'et-line';
  document.body.appendChild(line)
  content = document.createElement('s')
  content.id = 'et-content';
  content.addEventListener('mousedown', (e) => {
    e.stopPropagation()
  })
  content.addEventListener('mouseup', (e) => {
    e.stopPropagation()
  })
  content.addEventListener('dblclick', (e) => {
    e.stopPropagation()
  })
  document.body.appendChild(content)
}
const updateTrans = ({ target, translation, type }) => {
  try {
    if (!content) createTrans();
    content = document.getElementById('et-content');
    line = document.getElementById('et-line');
    const targetRect = target.getBoundingClientRect();
    if (type === 'hover') line.style.cssText = `display: block; top: ${targetRect.bottom}px; left: ${targetRect.left}px; width: ${target.offsetWidth}px;`;
    content.innerText = translation;
    content.style.cssText = `display: block; left: ${targetRect.left}px;`;
    const dis = type === 'hover' ? 4 : 12
    content.style.top = `${targetRect.top - content.offsetHeight - dis}px`;
    if (content.getBoundingClientRect().top < 0) {
      content.style.top = `${targetRect.bottom + 10}px`
    }
    transVisible = true
  } catch (err) {}
}
const initParams = (q) => {
  const appid = user.appId
  const salt = Math.random()
  const secretKey = user.secretKey
  return {
    q,
    from: 'auto',
    to: 'zh',
    appid,
    salt,
    sign: MD5(`${appid}${q}${salt}${secretKey}`)
  }
}
const getTranslation = (q) => {
  return new Promise((resolve, reject) => {
    if (!user) {
      resolve('请先点击 Less Translate 扩展图标进行配置')
      return
    }
    if (dic.has(q)) {
      resolve(dic.get(q))
    } else {
      try {
        chrome.runtime.sendMessage({
          type: 'getTranslation',
          data: initParams(q)
        }, (res) => {
          const dst = res.trans_result?.reduce((acc,curr) => `${acc}${curr.dst}\n`, '')
          if (dst) {
            if (!q.includes(' ')) dic.set(q, dst); // 不缓存段落
            resolve(dst)
          } else {
            reject()
          }
        });
      } catch (err) {}
    }
  })
}
const hideTrans = () => {
  if (line) line.style.display = 'none';
  if (content) content.style.display = 'none';
  transVisible = false;
}
// hover时提示
document.addEventListener('mouseover', debounce((e) => {
  if (!isOpen || isSelecting) return
  const target = e.target
  replaceHtml(target.parentNode)
  if (target.className == 'less-translate') {
    let isHovering = true
    const hideFn = () => {
      isHovering = false
      if (line) {
        hideTrans()
      }
      target.removeEventListener('mouseout', hideFn)
    }
    target.addEventListener('mouseout', hideFn)
    getTranslation(target.innerText).then((v) => {
      if (isHovering) updateTrans({ target, translation: v, type: 'hover' })
    })
  }
}, 100))
let selectStartTime = 0; // 过滤掉click意外触发
document.addEventListener('mousedown', () => {
  selectStartTime = Date.now()
  isSelecting = true
  hideTrans()
})
// 处理选中文本
const handleSelection = () => {
  const selection = getSelection();
  const q = selection.toString();
  if (!q) return;
  // 判断是否是时间戳
  if (isTimestamp(q)) {
    updateTrans({ target: selection.getRangeAt(0), translation: timestampToDateTimeString(q) })
  } else {
    getTranslation(q).then((v) => {
      updateTrans({ target: selection.getRangeAt(0), translation: v })
    })
  }
}
// 选择文本后提示
document.addEventListener('mouseup', () => {
  if (!isOpen) return
  isSelecting = false
  if (Date.now() - selectStartTime < 500) return
  handleSelection()
})
// 双击选择文本
document.addEventListener('dblclick', (e) => {
  handleSelection()
});
window.addEventListener('scroll', () => {
  if (transVisible) hideTrans();
})