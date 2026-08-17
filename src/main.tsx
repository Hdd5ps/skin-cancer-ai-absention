import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AnalyticsService } from './lib/analytics'

// Initialize analytics on app start
AnalyticsService.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
