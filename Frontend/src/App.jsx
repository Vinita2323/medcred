import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import UserRoutes from './modules/user/routes/UserRoutes'
import ScrollToTop from './modules/user/components/Navigation/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <UserRoutes />
    </BrowserRouter>
  )
}

export default App
