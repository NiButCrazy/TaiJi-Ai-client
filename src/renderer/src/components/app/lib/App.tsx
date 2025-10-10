import { Outlet } from 'react-router'
import s_ from '../styles/App.module.less'
import logo from '/logo.png'
import mini from '../assets/images/mini.svg'
import max from '../assets/images/max.svg'
import close from '../assets/images/close.svg'
import menu from '../assets/images/menu.svg'
import { useEffect, useRef, useState } from 'react'


function App(): React.JSX.Element {
  const [ appHeaderVisible, setAppHeaderVisible ] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <>
      <div className={ s_.appHeaderButton } onClick={ () => {setAppHeaderVisible(!appHeaderVisible)} }>
        <img src={ logo } alt={ 'logo' } />
      </div>
      <div className={ s_.appHeader + (appHeaderVisible ? ' ' + s_.show : '') }>
        <div className={ s_.appHeaderDrag }></div>
        <span className={ s_.menu } onClick={ () => {window.electron.ipcRenderer.send('menu')} }>
          <img src={ menu } alt={ 'menu' } /></span>
        <span onMouseEnter={ () => {ref.current!.classList.remove(s_.blur)} } ref={ ref } className={ s_.min }
              onClick={ () => {
                window.electron.ipcRenderer.send('min')
                ref.current!.classList.add(s_.blur)
              }
              }><img src={ mini } alt={ 'mini' } /></span>
        <span onClick={ () => {window.electron.ipcRenderer.send('max')} }>
          <img src={ max } alt={ 'max' } /></span>
        <span onClick={ () => {window.electron.ipcRenderer.send('close')} } className={ s_.close }>
          <img src={ close } alt={ 'close' } /></span>
      </div>
      <Outlet />
    </>
  )
}

export default App
