import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './App.css'
import App from './App.jsx'
import Maintenance from './Maintenance.jsx'

const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {MAINTENANCE_MODE ? <Maintenance /> : <App />}
  </StrictMode>,
)
