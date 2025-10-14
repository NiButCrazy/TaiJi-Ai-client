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

    webview.addEventListener('found-in-page', (e: any) => {
      const { activeMatchOrdinal, matches }: { activeMatchOrdinal: number, matches: number } = e.result
      countRef.current!.innerText = activeMatchOrdinal + '/' + matches
    })

    webview.addEventListener('context-menu', (e) => {
      window.electron.ipcRenderer.send('webview-context-menu', e)
      e.preventDefault()
    })

    webview.addEventListener('dom-ready', () => {
      webview.insertCSS(webviewCSS)

      if (scrollToBottom) {
        webview.executeJavaScript(webviewJS)
      }
      if (closeNotice) {
        webview.executeJavaScript(webviewJSNotice)
      }
    })

    return () => {
      webview.removeEventListener('dom-ready', () => {})
      webview.removeEventListener('context-menu', () => {})
      webview.removeEventListener('found-in-page', () => {})
    }
  })

  return (
    // @ts-ignore*
    <webview allowpopups="true"
             ref={ ref } src="https://www.aiboss.chat/chat" className={ s_.iframe } />
  )
}
