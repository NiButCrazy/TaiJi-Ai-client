import html from './assets/html/404.html?raw'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'


export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    const oh = document.querySelector('.circle.oh') as HTMLElement
    const button = document.querySelector('.button') as HTMLElement
    button.onclick = () => {
      navigate('/')
    }

    function mousemove(event: MouseEvent) {
      let domainX = [ 0, document.body.clientWidth ],
        domainY = [ 0, document.body.clientHeight ],
        range = [ -10, 10 ]

      let translate = {
        x: range[0] + (event.clientX - domainX[0]) * (range[1] - range[0]) / (domainX[1] - domainX[0]),
        y: range[0] + (event.clientY - domainY[0]) * (range[1] - range[0]) / (domainY[1] - domainY[0])
      }

      oh.style.animation = 'none'
      oh.style.transform = `translate(${ translate.x }px, ${ translate.y }px)`
    }

    function mouseleave() {
      oh.style.animation = 'floating 3s linear infinite'
    }
    
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseleave', mouseleave)

    return () => {
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseleave', mouseleave)
    }
  })
  return (
    <div dangerouslySetInnerHTML={ { __html: html } } />
  )
}
