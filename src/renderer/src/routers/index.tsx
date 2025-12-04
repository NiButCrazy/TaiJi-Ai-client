import { createHashRouter } from 'react-router'
import App from '@components/app'
import { Home, NotFound } from '@components/pages'


const index = createHashRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: '404', Component: NotFound }
    ]
  }
])

export default index
