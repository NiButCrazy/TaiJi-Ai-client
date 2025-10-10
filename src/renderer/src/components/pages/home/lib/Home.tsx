import s_ from '../styles/Home.module.less'
import { useEffect, useRef } from 'react'
import webviewJS from './webview.js?raw'
import webviewCSS from '../styles/webview.css?raw'


interface ElectronWebview extends HTMLWebViewElement {
  insertCSS(css: string): void
  executeJavaScript(js: string): void
  reload(): void
}


let useJS = (await window.AppEnv()).local_config.scrollToBottom

export default function Home() {
  const ref = useRef<HTMLWebViewElement>(null)

  useEffect(() => {

    window.electron.ipcRenderer.on('scroll-to-bottom', (_, bool: boolean) => {
      useJS = bool
      webview.reload()
    })

    // @ts-ignore
    const webview: ElectronWebview = ref.current!
    webview.addEventListener('context-menu', (e) => {
      window.electron.ipcRenderer.send('webview-context-menu', e)
      e.preventDefault()
    })
    webview.addEventListener('dom-ready', () => {

      webview.insertCSS(webviewCSS)

      if (useJS) {
        console.log('目前使用 JavaScript')
        webview.executeJavaScript(webviewJS)
      }

    })
    return () => {
      webview.removeEventListener('dom-ready', () => {})
    }
  })
  return (
    <webview ref={ ref } src="https://www.aiboss.chat/chat" className={ s_.iframe } />
  )
}
