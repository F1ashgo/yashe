import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Projects from './pages/Projects'
import Member from './pages/Member'
import Contact from './pages/Contact'
import './App.css'

const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="admin-loading">管理后台加载中…</div>}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/notifications" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin/notifications" replace />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/*" element={<Navigate to="/admin/notifications" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/member" element={<Member />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </div>
  )
}

export default App
