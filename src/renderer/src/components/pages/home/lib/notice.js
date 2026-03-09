function close_notice() {
  const userStore = JSON.parse(localStorage.getItem('userStore'))
  userStore.sys.userNotifyClose = { ctime: 1772899199999 }
  localStorage.setItem('userStore', JSON.stringify(userStore))
}

close_notice()

