import { Home, LogOut, Shield } from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../pages/Dashboard.css'

function AdminLayout() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  if (!token) return <Navigate to="/admin/login" replace />

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="dashboard">
      <header className="dash-header">
        <div className="dash-header__left">
          <Shield size={24} aria-hidden="true" />
          <div className="dash-header__title">
            <span className="dash-header__company">广州雅舍室内设计有限公司</span>
            <h1>管理后台</h1>
          </div>
        </div>
        <div className="dash-header__right">
          <a href="/" className="dash-header__link"><Home size={16} /> 返回网站</a>
          <button onClick={logout} className="dash-header__link"><LogOut size={16} /> 退出</button>
        </div>
      </header>

      <nav className="dash-tabs" aria-label="后台功能">
        <NavLink to="/admin/notifications" className={({ isActive }) => `dash-tab${isActive ? ' dash-tab--active' : ''}`}>
          通知推送
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `dash-tab${isActive ? ' dash-tab--active' : ''}`}>
          用户管理
        </NavLink>
      </nav>

      <Outlet />
    </main>
  )
}

export default AdminLayout
