import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router";
import '@global/styles.global.less'
import router from "@renderer/routers"


createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={ router }/>
    </StrictMode>
)