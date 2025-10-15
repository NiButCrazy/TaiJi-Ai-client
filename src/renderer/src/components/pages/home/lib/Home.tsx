import s_ from '../styles/Home.module.less'
import React, { useEffect, useRef } from 'react'
import webviewJS from './webview.js?raw'
import webviewJSNotice from './notice.js?raw'
import webviewCSS from '../styles/webview.css?raw'
import { useOutletContext } from 'react-router'


export interface ElectronWebview extends HTMLWebViewElement {
  insertCSS(css: string): void
  executeJavaScript(js: string): void
  reload(): void
  openDevTools(): void
  findInPage(text: string, options?: { forward?: boolean, matchCase?: boolean }): number
  stopFindInPage(action: string): void
}


const localConfig = (await window.AppEnv()).local_config
let scrollToBottom = localConfig.scrollToBottom
let closeNotice = localConfig.closeNotice

export default function Home() {
  const ref = useRef<ElectronWebview>(null)
  const routerContext = useOutletContext<{
    webviewRef: React.RefObject<ElectronWebview | null>
    countRef: React.RefObject<HTMLSpanElement | null>
    setHeaderColor: (bool: boolean) => void
  }>()
  const countRef = routerContext.countRef

  useEffect(() => {

    window.electron.ipcRenderer.on('scroll-to-bottom', (_, bool: boolean) => {
      scrollToBottom = bool
      webview.reload()
    })

    window.electron.ipcRenderer.on('close-notice', (_, bool: boolean) => {
      closeNotice = bool
      if (closeNotice) {
        webview.executeJavaScript(webviewJSNotice)
      } else {
        webview.executeJavaScript(`
      (function () {
      const userStore = JSON.parse(localStorage.getItem('userStore'))
  userStore.sys.userNotifyClose = null
  localStorage.setItem('userStore', JSON.stringify(userStore))})()
      `)
      }

    })

    // @ts-ignore
    const webview = ref.current!
    routerContext.webviewRef.current = webview

    function foudInPage(e) {
      const { activeMatchOrdinal, matches }: { activeMatchOrdinal: number, matches: number } = e.result
      countRef.current!.innerText = activeMatchOrdinal + '/' + matches
    }

    function contextMenu(e) {
      window.electron.ipcRenderer.send('webview-context-menu', e)
      e.preventDefault()
    }

    function domReady() {

      webview.insertCSS(webviewCSS)

      if (scrollToBottom) {
        webview.executeJavaScript(webviewJS)
      }
      if (closeNotice) {
        webview.executeJavaScript(webviewJSNotice)
      }
    }

    function consoleMessage(e) {
      if (e.level === 1) {
        if (e.message === '[太极Ai] 找到全局头部，继续监听容器加载...') {
          webview.removeEventListener('console-message', consoleMessage)
          routerContext.setHeaderColor(true)
        }
      }
    }

    webview.addEventListener('dom-ready', domReady)
    webview.addEventListener('context-menu', contextMenu)
    webview.addEventListener('found-in-page', foudInPage)
    webview.addEventListener('console-message', consoleMessage)

    return () => {
      webview.removeEventListener('dom-ready', domReady)
      webview.removeEventListener('context-menu', contextMenu)
      webview.removeEventListener('found-in-page', foudInPage)
      webview.removeEventListener('console-message', consoleMessage)
      window.electron.ipcRenderer.removeAllListeners('close-notice')
      window.electron.ipcRenderer.removeAllListeners('scroll-to-bottom')
    }
  })

  return (
    // @ts-ignore*
    <webview allowpopups="true"
             ref={ ref } src="https://www.aiboss.chat/chat" className={ s_.iframe } />
  )
}
