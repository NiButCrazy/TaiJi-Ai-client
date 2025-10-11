import { store, local_config } from '../main/config.ts'
import { app, shell, BrowserWindow, ipcMain, nativeTheme, Menu, dialog, Tray } from 'electron'
import { updateElectronApp } from 'update-electron-app'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { devtools_custom_font, load_extensions } from './devtools'
import { join } from 'path'
import icon from '@static/icon.ico?asset'


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果没获取到锁，说明已经有实例运行，直接退出
  app.quit()
}

// 开发环境隔离用户数据
if (is.dev) {
  app.setPath('userData', app.getPath('userData') + '-dev')
  console.log('[太极Ai] 开发环境：', app.getPath('userData'))
}

let mainWindow: BrowserWindow

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1d273b' : '#F1F5F9',
    // backgroundMaterial: 'auto',
    ...(process.platform === 'linux' ? {} : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      webviewTag: true
    }
  })

  createTray(mainWindow)

  nativeTheme.on('updated', () => {
    mainWindow.setBackgroundColor(nativeTheme.shouldUseDarkColors ? '#1d273b' : '#F1F5F9')
  })

  // 自定义开发者工具字体
  devtools_custom_font(mainWindow, 14)

  var first_start = true
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    updateElectronApp()

    // 这里是第一次启动刷新重载是为了正确加载react开发工具扩展，否则需要手动刷新
    if (is.dev) {
      if (first_start) {
        first_start = false
        mainWindow.reload()
        mainWindow.webContents.openDevTools()
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染器 HMR
  // 加载远程 URL 进行开发，或加载本地 html 文件进行生产。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/index.html`))
  }

}

// 当 Electron 完成初始化并准备好创建浏览器窗口时，将调用此方法
// 某些 API 只能在此事件发生后使用
app.whenReady().then(() => {
  // 为 Windows 设置应用用户模型 ID
  electronApp.setAppUserModelId('com.TaiJiAi')

  ipcMain.handle('AppEnv', () => {return { local_config }})

  // 只在开发环境加载扩展
  if (is.dev) load_extensions()

  // 开发中 F12 的默认打开或关闭 DevTools
  // 并在生产环境中忽略 CommandOrControl + R
  // 参考 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 如果获取到锁，监听第二个实例的触发事件
  app.on('second-instance', () => {
    // 有人尝试运行第二个实例 -> 激活第一个实例窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    }
  })

  // 窗口控制

  // 最小化
  ipcMain.on('min', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.minimize()
    }
  })
  // 最大化
  ipcMain.on('max', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  // 关闭确认框
  async function showConfirm(window: BrowserWindow) {
    const result = await dialog.showMessageBox(window, {
      type: 'info',             // 样式：question 、info 、warning ...
      title: '确认操作',
      message: '确定要退出吗？',
      buttons: [ '取消', '确定' ],      // 按钮文本
      defaultId: 1,                  // 默认选中“确定”按钮
      cancelId: 0                    // 点击 ESC 或关闭时返回这个 id
    })

    if (result.response === 1) {
      window.close()
    }
  }

  // 关闭
  ipcMain.on('close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (local_config.isCloseToTray) {
        win.hide()
        return
      }
      if (local_config.closeConfirm) {
        showConfirm(win)
      } else {
        win.close()
      }
    }
  })
  ipcMain.on('webview-context-menu', (_, e) => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'copy', label: '复制', visible: e.params.editFlags.canCopy },
      { role: 'cut', label: '剪切', visible: e.params.editFlags.canCut },
      { role: 'paste', label: '粘贴', visible: e.params.editFlags.canPaste },
      { role: 'undo', label: '撤销', visible: e.params.editFlags.canUndo && e.params.isEditable },
      { role: 'reload', label: '刷新', visible: !e.params.isEditable && !e.params.selectionText }
    ])
    contextMenu.popup()
  })

  // 右上角菜单
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: '关闭至托盘',
      type: 'checkbox',
      checked: local_config.isCloseToTray,
      click: () => {
        local_config.isCloseToTray = !local_config.isCloseToTray
        store.set('isCloseToTray', local_config.isCloseToTray)
      }
    },
    {
      label: '退出前确认',
      type: 'checkbox',
      checked: local_config.closeConfirm,
      click: () => {
        local_config.closeConfirm = !local_config.closeConfirm
        store.set('closeConfirm', local_config.closeConfirm)
      }
    },
    {
      label: '自动滚至底部',
      type: 'checkbox',
      checked: local_config.scrollToBottom,
      click: () => {
        local_config.scrollToBottom = !local_config.scrollToBottom
        store.set('scrollToBottom', local_config.scrollToBottom)
        BrowserWindow.getFocusedWindow()?.webContents.send('scroll-to-bottom', local_config.scrollToBottom)
      }
    },
    { role: 'viewMenu', label: '高级' },
    {
      label: '关于',
      submenu: [
        {
          label: '软件版本: ' + app.getVersion(),
          enabled: false
        },
        {
          label: '开源仓库地址',
          click: () => {shell.openExternal('https://github.com/NiButCrazy/TaiJi-Ai-client')}
        },
        { type: 'separator' },
        {
          label: 'By: Ni But Crazy',
          enabled: false
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  ipcMain.on('menu', () => {
    menu.popup()
  })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当单击 Dock 图标并且没有打开其他窗口时，通常会在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都关闭时退出，macOS 除外：
// 在那里，应用程序及其菜单栏通常会保持活动状态，直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createTray(mainWindow: BrowserWindow) {
  // 图标路径（推荐 PNG 或 ICO，尺寸一般 16x16、32x32）

  const tray = new Tray(icon)
  // 鼠标悬停提示
  tray.setToolTip('太极AI')
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => mainWindow.show() },
    { label: '退出', click: () => app.quit() }
  ])
  tray.setContextMenu(contextMenu)
  // 点击托盘图标事件
  tray.on('click', () => {
    // 这里可以控制窗口显示/隐藏
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
}
