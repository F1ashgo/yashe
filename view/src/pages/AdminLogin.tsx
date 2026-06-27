import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Loader2 } from 'lucide-react'
import './AdminLogin.css'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'http://192.168.31.236:8080/api'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (res.ok && json.code === 200) {
        const token = json.data.token
        // 验 role
        const meRes = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const meJson = await meRes.json()
        if (meJson.data.role !== 'admin') {
          setError('非管理员账号，无法登录后台')
          setLoading(false)
          return
        }
        localStorage.setItem('admin_token', token)
        navigate('/admin/dashboard')
      } else {
        setError(json.message || '登录失败')
      }
    } catch {
      setError('无法连接服务器')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <Shield size={36} />
          <h1>管理后台</h1>
          <p>Atelier des Miyabi</p>
        </div>
        {error && <div className="admin-login__error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="admin-login__group">
            <label><Mail size={16} /> 管理员邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yashe.design" required />
          </div>
          <div className="admin-login__group">
            <label><Lock size={16} /> 密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" required />
          </div>
          <button type="submit" className="admin-login__btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : '登入后台'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminLogin
