import Store from 'electron-store'
import { is } from '@electron-toolkit/utils'
import { app } from 'electron'

// 开发环境隔离用户数据
if (is.dev) {
  app.setPath('userData', app.getPath('userData') + '-dev')
  console.log('[太极Ai] 开发环境用户数据：', app.getPath('userData'))
}

type Config = {
  isCloseToTray: boolean
  closeConfirm: boolean
  scrollToBottom: boolean
  autoUpdate: boolean
  closeNotice: boolean
  theme: 'system' | 'light' | 'dark'
}

const config: Config = {
  isCloseToTray: false,
  closeConfirm: false,
  scrollToBottom: true,
  autoUpdate: true,
  closeNotice: true,
  theme: 'system'
}

const store = new Store({ defaults: config })
const local_config = store.store
export { store, local_config }
