import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Lock, Gift, Eye, EyeOff, LogOut, Loader2, Copy, Star, Bell } from 'lucide-react'
import './Member.css'
import { API_BASE_URL } from '../config/api'
const API = API_BASE_URL

interface UserInfo { id: number; name: string; email: string; phone: string; role: string }
interface NotificationItem { title: string; content: string; type: string; createdAt: string }

function Member() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPwd: '', promo: '',
  })

  // 评价
  const [reviews, setReviews] = useState<Array<{ id: number; project: string; rating: number; content: string; createdAt: string }>>([])
  const [reviewForm, setReviewForm] = useState({ project: '', rating: 5, content: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  const fetchReviews = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API}/reviews/my`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const json = await res.json()
        setReviews(json.data.list)
      }
    } catch {}
  }

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch(`${API}/notifications/latest?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data.list || [])
      }
    } catch {}
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewForm.content.length < 10) { setReviewMsg('评价内容至少10个字'); return }
    setReviewSubmitting(true)
    setReviewMsg('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm),
      })
      if (res.ok) {
        setReviewForm({ project: '', rating: 5, content: '' })
        fetchReviews()
        setReviewMsg('评价提交成功！')
      }
    } catch {
      setReviewMsg('提交失败，请稍后重试')
    } finally { setReviewSubmitting(false) }
  }

  // 页面加载时检查本地 token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) { fetchUser(token); fetchReviews(); fetchNotifications() }
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
        await Promise.all([fetchReviews(), fetchNotifications()])
        await Promise.all([fetchReviews(), fetchNotifications()])
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
            <div className="mem-form-wrapper mem-form-wrapper--member">
              <section className="mem-member-column">
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
                    <li><Gift size={16} /> 会员享家装全流程一对一专属管家全程跟进</li>
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
              </section>

              <section className="mem-reviews">
                <h3>我的评价</h3>
                {reviews.length > 0 && (
                  <div className="mem-reviews__list">
                    {reviews.map((r) => (
                      <div key={r.id} className="mem-reviews__card">
                        <div className="mem-reviews__card-header">
                          <span className="mem-reviews__project">{r.project}</span>
                          <span className="mem-reviews__stars">
                            {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="#c9a96e" color="#c9a96e" />)}
                          </span>
                        </div>
                        <p>{r.content}</p>
                        <span className="mem-reviews__date">{r.createdAt?.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <form className="mem-reviews__form" onSubmit={submitReview}>
                  <input type="text" value={reviewForm.project} onChange={(e) => setReviewForm({ ...reviewForm, project: e.target.value })} placeholder="项目名称" required />
                  <div className="mem-reviews__rating">
                    {[1,2,3,4,5].map((n) => (
                      <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className="mem-reviews__star-btn">
                        <Star size={18} fill={n <= reviewForm.rating ? '#c9a96e' : 'none'} color="#c9a96e" />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })} placeholder="分享您的设计体验..." rows={3} required />
                  {reviewMsg && <p className="mem-reviews__msg">{reviewMsg}</p>}
                  <button type="submit" disabled={reviewSubmitting} className="mem-reviews__submit">
                    {reviewSubmitting ? '提交中...' : '提交评价'}
                  </button>
                </form>
              </section>

              <section className="mem-notices">
                <h3><Bell size={16} /> 最新通知</h3>
                <div className="mem-notices__list">
                  {notifications.length > 0 ? notifications.map((item) => (
                    <article key={`${item.createdAt}-${item.title}`} className="mem-notice-card">
                      <div className="mem-notice-card__meta">
                        <span>{item.type}</span>
                        <span>{item.createdAt?.slice(0, 10)}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.content}</p>
                    </article>
                  )) : (
                    <article className="mem-notice-card mem-notice-card--empty">
                      <h4>暂无最新通知</h4>
                      <p>新的会员服务信息会在这里显示。</p>
                    </article>
                  )}
                </div>
              </section>
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
                  <input type="text" maxLength={60} value={form.name} onChange={update('name')} placeholder="请输入您的姓名" required={mode === 'register'} />
                </div>
              )}

              <div className="mem-form__group">
                <label><Mail size={16} /> 邮箱</label>
                <input type="email" maxLength={254} value={form.email} onChange={update('email')} placeholder="请输入邮箱地址" required autoComplete="username" />
              </div>

              {mode === 'register' && (
                <div className="mem-form__group">
                  <label><Phone size={16} /> 手机号</label>
                  <input type="tel" maxLength={30} value={form.phone} onChange={update('phone')} placeholder="请输入手机号码" />
                </div>
              )}

              <div className="mem-form__group">
                <label><Lock size={16} /> 密码</label>
                <div className="mem-form__pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} minLength={mode === 'register' ? 10 : undefined} maxLength={128} value={form.password} onChange={update('password')} placeholder="请输入密码" required autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
                  <button type="button" className="mem-form__pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="mem-form__group">
                  <label><Lock size={16} /> 确认密码</label>
                  <input type="password" value={form.confirmPwd} onChange={update('confirmPwd')} placeholder="请再次输入密码" autoComplete="new-password" />
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
                <li><Gift size={16} /> 会员享家装全流程一对一专属管家全程跟进</li>
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
