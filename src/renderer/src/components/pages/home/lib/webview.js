function initChatFeatures(container, btn_container, input) {
  // 用事件委托监听点击事件（发送按钮）
  btn_container.addEventListener('click', function (event) {
    if (event.target.matches(
      'button.n-button.n-button--primary-type.n-button--small-type.n-button--secondary'
    )) {
      container.scrollTop = container.scrollHeight + 200
    }
  })
  let isKeyDown = false

  // 用事件委托监听键盘事件（输入框）
  input.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      isKeyDown = false
      const inputMode = JSON.parse(localStorage.getItem('userStore')).localSet.sendKey

      if (event.shiftKey) {
        if (inputMode === 's-enter') {
          container.scrollTop = container.scrollHeight + 200
        }
      } else {
        if (inputMode === 'enter') {
          container.scrollTop = container.scrollHeight + 200
        }
      }
    }
  })

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (!isKeyDown) {
        isKeyDown = true
      } else {
        event.preventDefault()
      }
    }
  })

  console.log('[太极Ai] 事件委托已绑定')
}

function waitForChatContainer() {

  const path = window.location.pathname
  if (path !== '/chat') {
    window.isFirstLoad = false
    return
  }

  if (window.isFirstLoad) {return}

  window.isFirstLoad = true
  console.log('[太极Ai] 等待容器加载...')
  let isFindHeader = false
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        if (!isFindHeader && !window.hasFindHeader) {
          const header = document.body.querySelector('.global-header')
          if (header) {
            isFindHeader = true
            console.info('[太极Ai] 找到全局头部，继续监听容器加载...')
            window.hasFindHeader = true
          }
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const container = document.body.querySelector('#chat-content .n-scrollbar-container')
            if (container) {
              const btn_container = document.body.querySelector('.chat-input-box .input-tools')
              const input = document.body.querySelector('.chat-input-box textarea.n-input__textarea-el')
              // 绑定事件委托
              initChatFeatures(container, btn_container, input)
              observer.disconnect() // 找到容器后停止监听
              console.log('[太极Ai] 容器已加载，停止全局观察器')
              return
            }
          }
        }
      }
    }
  })

  // 监听整个 body，只在首次找到容器时启用事件委托
  observer.observe(document.body, { childList: true, subtree: true })
}

waitForChatContainer()
