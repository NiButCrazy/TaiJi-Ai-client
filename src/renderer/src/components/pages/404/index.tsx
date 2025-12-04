import html from './assets/html/404.html?raw'


export default function NotFound() {

  return (
    <div dangerouslySetInnerHTML={ { __html: html } } />
  )
}
