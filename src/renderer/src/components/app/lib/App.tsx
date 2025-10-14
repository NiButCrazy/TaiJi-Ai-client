import { Outlet } from 'react-router'
import s_ from '../styles/App.module.less'
import logo from '/logo.png'
import mini from '../assets/images/mini.svg'
import max from '../assets/images/max.svg'
import close from '../assets/images/close.svg'
import menu from '../assets/images/menu.svg'
import search from '../assets/images/search.svg'
import next from '../assets/images/down.svg'
import prev from '../assets/images/up.svg'
import React, { useRef, useState } from 'react'
import { ElectronWebview } from '@components/pages/home/lib/Home.tsx'


function App(): React.JSX.Element {
  const [ appHeaderVisible, setAppHeaderVisible ] = useState(true)
  const [ searchVisible, setSearchVisible ] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const webviewRef = useRef<ElectronWebview>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  function searchText(action: string) {
    const text = inputRef.current?.value
    if (!text) {
      webviewRef.current?.stopFindInPage('clearSelection')
      countRef.current!.innerText = ''
    } else {
      switch (action) {
        case 'input':
          webviewRef.current?.findInPage(text)
          break
        case 'prev':
          webviewRef.current?.findInPage(text, { forward: false })
          break
        case 'next':
          webviewRef.current?.findInPage(text, { forward: true })
          break
      }

    }
  }

  function inputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        searchText('prev')
        return
      }
      searchText('next')
    }
  }

  return (
    <>
      <div className={ s_.appHeaderButton } onClick={ () => {setAppHeaderVisible(!appHeaderVisible)} }>
        <img src={ logo } alt={ 'logo' } />
      </div>
      <div className={ s_.appHeader + (appHeaderVisible ? ' ' + s_.show : '') }>
        <span className={ s_.placeholder }></span>
        <div className={ s_.appHeaderDrag }></div>
        <div className={ s_.searchContainer + (searchVisible ? '' : ' ' + s_.hidden) }>
          <span onClick={ () => {
            if (searchVisible) {webviewRef.current?.stopFindInPage('clearSelection')}
            setSearchVisible(!searchVisible)
          }
          }>
            <img className={ s_.searchIcon } src={ search } alt={ 'search' } />
          </span>
          <input ref={ inputRef } placeholder={ '页内查找' } spellCheck={ false }
                 onChange={ () => {searchText('input')} } onKeyUp={ inputKeyUp } />
          <span ref={ countRef } className={ s_.count }></span>
          <div className={ s_.searchButtonGroup }>
            <img src={ prev } alt={ 'prev' } onClick={ () => {searchText('prev')} } />
            <img src={ next } alt={ 'next' } onClick={ () => {searchText('next')} } />
          </div>
        </div>
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
      <Outlet context={ { webviewRef, countRef } } />
    </>
  )
}

export default App
