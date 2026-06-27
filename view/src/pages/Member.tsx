import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Lock, Gift, Eye, EyeOff, LogOut, Loader2, Copy } from 'lucide-react'
import './Member.css'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'http://192.168.31.236:8080/api'

interface UserInfo { id: number; name: string; email: string; phone: string; role: string }

function Member() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPwd: '', promo: '',
  })

  // 页面加载时检查本地 token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchUser(token)
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const json = await res.json()
        setUser(json.data as unknown as UserInfo)
      } else {
        localStorage.removeItem('token')
      }
    } catch { /* 后端未启动时静默处理 */ }
  }

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [key]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 注册时校验密码
    if (mode === 'register' && form.password !== form.confirmPwd) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body: Record<string, string> = { email: form.email, password: form.password }
      if (mode === 'register') {
        body.name = form.name
        if (form.phone) body.phone = form.phone
        if (form.promo) body.promoCode = form.promo
      }

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (res.ok && json.code === 200) {
        localStorage.setItem('token', json.data.token)
        await fetchUser(json.data.token)
        // 注册成功时给个新 token，再查一次 me
        if (mode === 'register') {
          const meRes = await fetch(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${json.data.token}` }
          })
          if (meRes.ok) {
            const meJson = await meRes.json()
            setUser(meJson.data as unknown as UserInfo)
          }
        }
        setForm({ name: '', email: '', phone: '', password: '', confirmPwd: '', promo: '' })
      } else {
        setError(json.message || '操作失败')
      }
    } catch {
      setError('无法连接服务器，请确认后端已启动')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // ----- 已登录状态 -----
  if (user) {
    return (
      <main className="member">
        <section className="mem-hero">
          <div className="mem-hero__overlay" />
          <div className="container mem-hero__content">
            <Link to="/" className="mem-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
            <span className="mem-hero__tag">Member Center</span>
            <h1>欢迎回来，{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="mem-form-section">
          <div className="container">
            <div className="mem-form-wrapper">
              <div className="mem-profile">
                <div className="mem-profile__avatar">{user.name[0]}</div>
                <div className="mem-profile__info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  {user.phone && <p>{user.phone}</p>}
                  <span className="mem-profile__role">
                    {user.role === 'admin' ? '管理员' : '会员'}
                  </span>
                </div>
              </div>

              <div className="mem-benefits">
                <h3>会员专属权益</h3>
                <ul>
                  <li><Gift size={16} /> 首次注册即享设计咨询费 9 折优惠</li>
                  <li><Gift size={16} /> 推荐好友加入，双方各得 ¥2000 设计抵扣券</li>
                  <li><Gift size={16} /> 会员专享季度软装新品优先预览与折扣</li>
                  <li><Gift size={16} /> 生日当月享设计服务双倍积分</li>
                </ul>
              </div>

              <div className="mem-promo-section">
                <h3>我的优惠码</h3>
                <p className="mem-promo-section__desc">复制优惠码，在预约设计咨询时出示即可享受对应折扣</p>
                <div className="mem-promo-codes">
                  <div className="mem-promo-card">
                    <div className="mem-promo-card__left">
                      <span className="mem-promo-card__code">YASHE2024</span>
                      <span className="mem-promo-card__tag">新会员专享</span>
                    </div>
                    <div className="mem-promo-card__right">
                      <span className="mem-promo-card__discount">9 折</span>
                      <button className="mem-promo-card__copy" onClick={() => navigator.clipboard.writeText('YASHE2024')}>
                        <Copy size={14} /> 复制
                      </button>
                    </div>
                  </div>
                  <div className="mem-promo-card">
                    <div className="mem-promo-card__left">
                      <span className="mem-promo-card__code">WELCOME2000</span>
                      <span className="mem-promo-card__tag">设计抵扣券</span>
                    </div>
                    <div className="mem-promo-card__right">
                      <span className="mem-promo-card__discount">减 ¥2000</span>
                      <button className="mem-promo-card__copy" onClick={() => navigator.clipboard.writeText('WELCOME2000')}>
                        <Copy size={14} /> 复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button className="mem-logout" onClick={logout}>
                <LogOut size={16} /> 退出登录
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // ----- 登录 / 注册表单 -----
  return (
    <main className="member">
      <section className="mem-hero">
        <div className="mem-hero__overlay" />
        <div className="container mem-hero__content">
          <Link to="/" className="mem-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="mem-hero__tag">Member Center</span>
          <h1>会员中心</h1>
          <p>加入雅舍会员，享受专属优惠与个性化设计服务</p>
        </div>
      </section>

      <section className="mem-form-section">
        <div className="container">
          <div className="mem-form-wrapper">
            <div className="mem-tabs">
              <button className={`mem-tab ${mode === 'login' ? 'mem-tab--active' : ''}`} onClick={() => { setMode('login'); setError('') }}>
                会员登入
              </button>
              <button className={`mem-tab ${mode === 'register' ? 'mem-tab--active' : ''}`} onClick={() => { setMode('register'); setError('') }}>
                注册会员
              </button>
            </div>

            {error && <div className="mem-error">{error}</div>}

            <form className="mem-form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="mem-form__group">
                  <label><User size={16} /> 姓名</label>
                  <input type="text" value={form.name} onChange={update('name')} placeholder="请输入您的姓名" required={mode === 'register'} />
                </div>
              )}

              <div className="mem-form__group">
                <label><Mail size={16} /> 邮箱</label>
                <input type="email" value={form.email} onChange={update('email')} placeholder="请输入邮箱地址" required />
              </div>

              {mode === 'register' && (
                <div className="mem-form__group">
                  <label><Phone size={16} /> 手机号</label>
                  <input type="tel" value={form.phone} onChange={update('phone')} placeholder="请输入手机号码" />
                </div>
              )}

              <div className="mem-form__group">
                <label><Lock size={16} /> 密码</label>
                <div className="mem-form__pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="请输入密码" required />
                  <button type="button" className="mem-form__pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="mem-form__group">
                  <label><Lock size={16} /> 确认密码</label>
                  <input type="password" value={form.confirmPwd} onChange={update('confirmPwd')} placeholder="请再次输入密码" />
                </div>
              )}

              <button type="submit" className="mem-form__submit" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : (mode === 'login' ? '登入' : '注册会员')}
              </button>

              {mode === 'login' && (
                <p className="mem-form__switch">还没有账号？<button type="button" onClick={() => setMode('register')}>立即注册</button></p>
              )}
              {mode === 'register' && (
                <p className="mem-form__switch">已有账号？<button type="button" onClick={() => setMode('login')}>立即登入</button></p>
              )}
            </form>

            <div className="mem-benefits">
              <h3>会员专属权益</h3>
              <ul>
                <li><Gift size={16} /> 首次注册即享设计咨询费 9 折优惠</li>
                <li><Gift size={16} /> 推荐好友加入，双方各得 ¥2000 设计抵扣券</li>
                <li><Gift size={16} /> 会员专享季度软装新品优先预览与折扣</li>
                <li><Gift size={16} /> 生日当月享设计服务双倍积分</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Member
