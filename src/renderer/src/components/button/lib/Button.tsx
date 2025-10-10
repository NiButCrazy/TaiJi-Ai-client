import {useState} from "react";

const ipcHandle = (count: number, setCount: any): void => {
  window.electron.ipcRenderer.send('ping', count + 1)
  setCount(count + 1)
}

function Button() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => ipcHandle(count, setCount)}>
      {( count == 0 )?'发送 IPC': '点击次数：' + count}
    </button>
  )
}

export default Button
