import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Search, LogOut, ChevronDown, ChevronUp, RefreshCw, Home, Bell, Send, Trash2 } from 'lucide-react'
import './Dashboard.css'
import { API_BASE_URL } from '../config/api'

const API = API_BASE_URL

interface Member {
  id: number; name: string; email: string; phone: string | null;
  promoCode: string | null; role: string; status: number; createdAt: string;
}

interface NotificationItem {
  id: number; title: string; content: string; type: string; status: number; createdAt: string;
}

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [members, setMembers] = useState<Member[]>([])
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [noticeSaving, setNoticeSaving] = useState(false)
  const [noticeMsg, setNoticeMsg] = useState('')
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: '公告', status: 1 })

  const headers = { Authorization: `Bearer ${token}` }

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers })
      if (res.ok) {
        const json = await res.json()
        setStats({ total: json.data.total, today: json.data.today })
      }
    } catch {}
  }, [token])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/members?keyword=${keyword}&page=${page}&size=20`, { headers })
      if (res.status === 403) { logout(); return }
      if (res.ok) {
        const json = await res.json()
        setMembers(json.data.data.list)
        setTotal(json.data.data.total)
      }
    } catch {} finally { setLoading(false) }
  }, [keyword, page, token])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/notifications`, { headers })
      if (res.status === 403) { logout(); return }
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data.list || [])
      }
    } catch {}
  }, [token])

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return }
    fetchStats()
    fetchNotifications()
  }, [token, fetchStats, fetchNotifications, navigate])

  useEffect(() => { if (token) fetchMembers() }, [keyword, page, token, fetchMembers])

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const submitNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      setNoticeMsg('请填写通知标题和内容')
      return
    }
    setNoticeSaving(true)
    setNoticeMsg('')
    try {
      const res = await fetch(`${API}/admin/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeForm),
      })
      if (res.ok) {
        setNoticeForm({ title: '', content: '', type: '公告', status: 1 })
        setNoticeMsg('通知已发布')
        fetchNotifications()
      } else {
        setNoticeMsg('发布失败，请稍后再试')
      }
    } catch {
      setNoticeMsg('无法连接服务器')
    } finally {
      setNoticeSaving(false)
    }
  }

  const toggleNotification = async (item: NotificationItem) => {
    try {
      const nextStatus = item.status === 1 ? 0 : 1
      const res = await fetch(`${API}/admin/notifications/${item.id}/status?status=${nextStatus}`, {
        method: 'PATCH',
        headers,
      })
      if (res.ok) fetchNotifications()
    } catch {}
  }

  const deleteNotification = async (id: number) => {
    if (!window.confirm('确定删除这条通知吗？')) return
    try {
      const res = await fetch(`${API}/admin/notifications/${id}`, { method: 'DELETE', headers })
      if (res.ok) fetchNotifications()
    } catch {}
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <main className="dashboard">
      <header className="dash-header">
        <div className="dash-header__left">
          <ShieldIcon />
          <h1>管理后台</h1>
          <span className="dash-header__brand">Atelier des Miyabi</span>
        </div>
        <div className="dash-header__right">
          <a href="/" className="dash-header__link"><Home size={16} /> 返回网站</a>
          <button onClick={logout} className="dash-header__link"><LogOut size={16} /> 退出</button>
        </div>
      </header>

      <div className="dash-body">
        <div className="dash-body__inner">
          <div className="dash-stats">
            <div className="dash-stat">
              <Users size={28} />
              <div>
                <span className="dash-stat__num">{stats.total}</span>
                <span className="dash-stat__label">会员总数</span>
              </div>
            </div>
            <div className="dash-stat">
              <UserPlus size={28} />
              <div>
                <span className="dash-stat__num">{stats.today}</span>
                <span className="dash-stat__label">今日新增</span>
              </div>
            </div>
            <div className="dash-stat dash-stat--refresh" onClick={() => { fetchStats(); fetchMembers(); fetchNotifications(); }}>
              <RefreshCw size={28} />
              <div>
                <span className="dash-stat__num">刷新</span>
                <span className="dash-stat__label">点击更新数据</span>
              </div>
            </div>
          </div>

          <section className="dash-panel dash-notice-panel">
            <div className="dash-panel__head">
              <div>
                <span className="dash-panel__eyebrow">Notification</span>
                <h2><Bell size={18} /> 推送通知</h2>
              </div>
              <p>发布后会显示在会员中心，适合用于优惠、活动和服务提醒。</p>
            </div>

            <form className="dash-notice-form" onSubmit={submitNotification}>
              <div className="dash-notice-form__row">
                <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="通知标题" />
                <select value={noticeForm.type} onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}>
                  <option value="公告">公告</option>
                  <option value="优惠">优惠</option>
                  <option value="设计提醒">设计提醒</option>
                  <option value="活动">活动</option>
                </select>
                <select value={noticeForm.status} onChange={(e) => setNoticeForm({ ...noticeForm, status: Number(e.target.value) })}>
                  <option value={1}>立即发布</option>
                  <option value={0}>保存草稿</option>
                </select>
              </div>
              <textarea value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} rows={3} placeholder="通知内容，例如：新会员预约设计咨询可享专属优惠。" />
              <div className="dash-notice-form__foot">
                {noticeMsg && <span>{noticeMsg}</span>}
                <button type="submit" disabled={noticeSaving}><Send size={15} /> {noticeSaving ? '发布中...' : '发布通知'}</button>
              </div>
            </form>

            <div className="dash-notice-list">
              {notifications.length === 0 ? (
                <div className="dash-notice-empty">暂无通知</div>
              ) : notifications.map((item) => (
                <article key={item.id} className={`dash-notice-item ${item.status === 1 ? 'dash-notice-item--published' : ''}`}>
                  <div className="dash-notice-item__main">
                    <div className="dash-notice-item__meta">
                      <span>{item.type}</span>
                      <span>{item.status === 1 ? '已发布' : '已隐藏'}</span>
                      <span>{item.createdAt?.slice(0, 10)}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                  <div className="dash-notice-item__actions">
                    <button onClick={() => toggleNotification(item)}>{item.status === 1 ? '隐藏' : '发布'}</button>
                    <button className="dash-notice-item__delete" onClick={() => deleteNotification(item.id)}><Trash2 size={14} /> 删除</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="dash-search">
            <Search size={18} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
              placeholder="按邮箱搜索会员..."
            />
          </div>

          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>姓名</th>
                  <th>邮箱</th>
                  <th>手机号</th>
                  <th>注册时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="dash-table__empty">加载中...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="dash-table__empty">暂无数据</td></tr>
                ) : (
                  members.map((m) => (
                    <>
                      <tr
                        key={m.id}
                        className={`dash-table__row ${expanded === m.id ? 'dash-table__row--expanded' : ''}`}
                        onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      >
                        <td className="dash-table__id">{m.id}</td>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.phone || '—'}</td>
                        <td>{m.createdAt?.slice(0, 10)}</td>
                        <td className="dash-table__toggle">
                          {expanded === m.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                      </tr>
                      {expanded === m.id && (
                        <tr key={`${m.id}-detail`} className="dash-table__detail">
                          <td colSpan={6}>
                            <div className="dash-detail">
                              <div className="dash-detail__item">
                                <span>姓名</span><span>{m.name}</span>
                              </div>
                              <div className="dash-detail__item">
                                <span>邮箱</span><span>{m.email}</span>
                              </div>
                              <div className="dash-detail__item">
                                <span>手机</span><span>{m.phone || '未填写'}</span>
                              </div>
                              <div className="dash-detail__item">
                                <span>优惠码</span><span>{m.promoCode || '无'}</span>
                              </div>
                              <div className="dash-detail__item">
                                <span>角色</span>
                                <span className={`dash-role dash-role--${m.role}`}>{m.role === 'admin' ? '管理员' : '会员'}</span>
                              </div>
                              <div className="dash-detail__item">
                                <span>注册时间</span><span>{m.createdAt?.replace('T', ' ').slice(0, 19)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="dash-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--color-gold)'}}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

export default Dashboard
