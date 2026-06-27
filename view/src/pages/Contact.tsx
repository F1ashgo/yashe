import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Send, MessageCircle, Loader2 } from 'lucide-react'
import './Contact.css'

const API = window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'http://192.168.31.236:8080/api'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setError('发送失败，请稍后再试')
      }
    } catch {
      setError('无法连接服务器，请确保后端已启动')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="contact">
      <section className="con-hero">
        <div className="con-hero__overlay" />
        <div className="container con-hero__content">
          <Link to="/" className="con-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="con-hero__tag">Get in Touch</span>
          <h1>联络我们</h1>
          <p>期待与您开启一段美好的设计之旅</p>
        </div>
      </section>

      <section className="con-main">
        <div className="container">
          <div className="con-grid">
            {/* 联络表单 */}
            <div className="con-form-card">
              <h2>发送讯息</h2>
              <p className="con-form-card__sub">填写以下表单，我们将在 24 小时内与您联系</p>

              {error && <div className="con-error">{error}</div>}
              {submitted ? (
                <div className="con-success">
                  <Send size={40} />
                  <h3>感谢您的来信！</h3>
                  <p>我们已收到您的讯息，将在 24 小时内与您联系。</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}>
                    发送新讯息
                  </button>
                </div>
              ) : (
                <form className="con-form" onSubmit={handleSubmit}>
                  <div className="con-form__row">
                    <div className="con-form__group">
                      <label>姓名 *</label>
                      <input type="text" value={form.name} onChange={update('name')} placeholder="您的姓名" required />
                    </div>
                    <div className="con-form__group">
                      <label>邮箱 *</label>
                      <input type="email" value={form.email} onChange={update('email')} placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className="con-form__row">
                    <div className="con-form__group">
                      <label>电话</label>
                      <input type="tel" value={form.phone} onChange={update('phone')} placeholder="您的联系电话" />
                    </div>
                    <div className="con-form__group">
                      <label>主题</label>
                      <input type="text" value={form.subject} onChange={update('subject')} placeholder="咨询类型" />
                    </div>
                  </div>
                  <div className="con-form__group">
                    <label>留言内容 *</label>
                    <textarea value={form.message} onChange={update('message')} placeholder="请描述您的项目需求、预算范围及期望风格..." rows={5} required />
                  </div>
                  <button type="submit" className="con-form__submit" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                    {loading ? '发送中...' : '发送讯息'}
                  </button>
                </form>
              )}
            </div>

            {/* 联系信息 + 社媒 */}
            <div className="con-info">
              <div className="con-info__card">
                <h3>联系方式</h3>
                <ul>
                  <li><Phone size={18} /><div><span>电话</span><a href="tel:400-000-0000">400-000-0000</a></div></li>
                  <li><Mail size={18} /><div><span>邮箱</span><a href="mailto:contact@yashe.design">contact@yashe.design</a></div></li>
                  <li><MapPin size={18} /><div><span>地址</span><span>广州市南沙区凯翔路1号1702</span></div></li>
                  <li><Clock size={18} /><div><span>工作时间</span><span>周一至周五 9:00 - 18:00<br />周六 10:00 - 16:00（预约制）</span></div></li>
                </ul>
              </div>

              <div className="con-info__card">
                <h3>关注我们</h3>
                <div className="con-social">
                  <a href="https://www.xiaohongshu.com" target="_blank" rel="noopener noreferrer" className="con-social__link">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5h-7v-7h7v7zm-3.5-9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
                    <span>小红书</span>
                  </a>
                  <a href="https://www.douyin.com" target="_blank" rel="noopener noreferrer" className="con-social__link">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.89a2.89 2.89 0 0 1-2.88 2.57 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.31 0 .61.05.89.14v-3.5a6.33 6.33 0 0 0-.89-.06A6.34 6.34 0 0 0 3 15.62a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.79a8.25 8.25 0 0 0 4.82 1.54v-3.5a4.78 4.78 0 0 1-.91-.14z"/></svg>
                    <span>抖音</span>
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="con-social__link">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>

              <div className="con-info__card con-info__card--qr">
                <h3>企业微信</h3>
                <div className="con-qr">
                  <div className="con-qr__placeholder">
                    <MessageCircle size={36} />
                  </div>
                  <span>扫码添加企业微信</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contact
