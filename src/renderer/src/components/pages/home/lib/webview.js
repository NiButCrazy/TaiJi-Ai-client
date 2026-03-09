function _initChatFeatures(container, btn_container, input, scroll_btn) {
  // 用事件委托监听点击事件（发送按钮）
  btn_container.addEventListener('click', function (event) {
    if (event.target.matches(
      'button.n-button.n-button--primary-type.n-button--small-type.n-button--secondary'
    )) {
      // container.scrollTop = container.scrollHeight + 200
      scroll_btn.click()
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
          // container.scrollTop = container.scrollHeight + 200
          scroll_btn.click()
        }
      } else {
        if (inputMode === 'enter') {
          // container.scrollTop = container.scrollHeight + 200
          scroll_btn.click()
        }
      }
    }
  })
}

function _scroll_to_bottom() {
  if (!window._nbc_container) {return}
  const container = window._nbc_container
  const scroll_btn = window._nbc_scroll_btn
  if (window._nbc_observer2) {window._nbc_observer2.disconnect()}
  const observer2 = new MutationObserver(mutations => {

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList.contains('justify-center')) {
              setTimeout(() => {
                console.log('[太极Ai] 已执行自动滚动至底部')
                container.scrollTop = container.scrollHeight
                setTimeout(() => {scroll_btn.click()}, 1000)
              }, 500)
              return observer2.disconnect()
            }
          }
        }
      }
    }
  })
  window._nbc_observer2 = observer2
  observer2.observe(container.children[0], { childList: true })
}

function waitForChatContainer() {

  const path = window.location.pathname
  if (path !== '/chat') {
    window.isFirstLoad = false
    return
  }

  if (window.isFirstLoad) {return _scroll_to_bottom()}

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
            console.info('[太极Ai] 找到全局头部')
            window.hasFindHeader = true
          }
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const container = document.body.querySelector('#chat-content .n-scrollbar-container')

            if (container) {
              const scroll_btn = document.body.querySelector('._to-bottom button')
              window._nbc_container = container
              window._nbc_scroll_btn = scroll_btn
              _scroll_to_bottom()
              const btn_container = document.body.querySelector('.chat-input-box .input-tools')
              const input = document.body.querySelector('.chat-input-box textarea.n-input__textarea-el')
              _initChatFeatures(container, btn_container, input, scroll_btn)
              // 找到容器后停止监听
              observer.disconnect()
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

