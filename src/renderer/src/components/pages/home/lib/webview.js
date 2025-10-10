function initChatFeatures(container, btn_container, input) {
  // 用事件委托监听点击事件（发送按钮）
  btn_container.addEventListener('click', function (event) {
    if (event.target.matches(
      'button.n-button.n-button--primary-type.n-button--small-type.n-button--secondary'
    )) {
      container.scrollTop = container.scrollHeight
    }
  })
  // 获取输入框的提示文本, 判断发送按键
  const enter_text = document.querySelector('.chat-input-box .input-tools .text-xs.text-gray').innerText

  // 用事件委托监听键盘事件（输入框）
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      if (!enter_text) return

      if (event.shiftKey) {
        if (enter_text === 'Shift+Enter发送 / Enter换行') {
          container.scrollTop = container.scrollHeight
        }
      } else {
        if (enter_text === 'Enter发送 / Shift+Enter换行') {
          container.scrollTop = container.scrollHeight
        }
      }
    }
  })

  console.log('[太极Ai] 事件委托已绑定')
}

function waitForChatContainer() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const container = node.querySelector('#chat-content .n-scrollbar-container')
          if (container) {
            const btn_container = node.querySelector('.chat-input-box .input-tools')
            const input = node.querySelector('.chat-input-box textarea.n-input__textarea-el')
            // 绑定事件委托
            initChatFeatures(container, btn_container, input)
            observer.disconnect() // 找到容器后停止监听
            console.log('[太极Ai] 容器已加载，停止全局观察器')
            return
          }
        }
      }
    }
  })

  // 监听整个 body，只在首次找到容器时启用事件委托
  observer.observe(document.body, { childList: true, subtree: true })
}

waitForChatContainer()
