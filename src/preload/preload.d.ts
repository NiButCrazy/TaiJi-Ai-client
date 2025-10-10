import { ElectronAPI } from '@electron-toolkit/preload'


interface AppEnv {
  local_config: {
    isCloseToTray: boolean
    closeConfirm: boolean
    scrollToBottom: boolean
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    AppEnv:()=>Promise<AppEnv>
  }
}
