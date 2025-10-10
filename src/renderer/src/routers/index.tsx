import { createHashRouter } from 'react-router'
import App from '@components/app'
import { Home } from '@components/pages'


const index = createHashRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: Home }
    ]
  }
])

export default index
