import Store from 'electron-store'


const config = {
  isCloseToTray: false,
  closeConfirm: false,
  scrollToBottom: true,
  autoUpdate: true,
}

const store = new Store({ defaults: config })
const local_config = store.store
export { store, local_config }
