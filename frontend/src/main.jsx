import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/events/:eventSlug" element={<App />} />
        <Route path="/events/:eventSlug/albums/:albumSlug" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
