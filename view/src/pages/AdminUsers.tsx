import { Fragment, useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, RefreshCw, Search, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import './Dashboard.css'

interface Member {
  id: number
  name: string
  email: string
  phone: string | null
  promoCode: string | null
  role: string
  status: number
  createdAt: string
}

function AdminUsers() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token') || ''
  const headers = { Authorization: `Bearer ${token}` }
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [members, setMembers] = useState<Member[]>([])
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const invalidateSession = useCallback(() => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const loadStats = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers })
    if (response.status === 401 || response.status === 403) return invalidateSession()
    if (response.ok) {
      const body = await response.json()
      setStats(body.data)
    }
  }, [token, invalidateSession])

  const loadMembers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const query = new URLSearchParams({ keyword: keyword.trim(), page: String(page), size: '20' })
      const response = await fetch(`${API_BASE_URL}/admin/members?${query}`, { headers, signal })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '加载用户失败')
      const data = body.data.data || body.data
      setMembers(data.list || [])
      setTotal(data.total || 0)
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      setError(reason instanceof Error ? reason.message : '加载用户失败')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [keyword, page, token, invalidateSession])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => loadMembers(controller.signal), 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadMembers])

  const totalPages = Math.max(1, Math.ceil(total / 20))
  const toggle = (id: number) => setExpanded((current) => current === id ? null : id)

  return (
    <div className="dash-body">
      <div className="dash-body__inner">
        <div className="dash-stats">
          <div className="dash-stat"><Users size={28} /><div><span className="dash-stat__num">{stats.total}</span><span className="dash-stat__label">会员总数</span></div></div>
          <div className="dash-stat"><UserPlus size={28} /><div><span className="dash-stat__num">{stats.today}</span><span className="dash-stat__label">今日新增</span></div></div>
          <button className="dash-stat dash-stat--refresh" onClick={() => { loadStats(); loadMembers() }}><RefreshCw size={28} /><div><span className="dash-stat__num">刷新</span><span className="dash-stat__label">更新用户数据</span></div></button>
        </div>

        <div className="dash-search"><Search size={18} /><input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} placeholder="按邮箱搜索会员…" /></div>
        {error && <div className="dash-error" role="alert">{error}</div>}

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>ID</th><th>姓名</th><th>邮箱</th><th>手机号</th><th>注册时间</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="dash-table__empty">加载中…</td></tr> : members.length === 0 ? <tr><td colSpan={6} className="dash-table__empty">暂无数据</td></tr> : members.map((member) => (
                <Fragment key={member.id}>
                  <tr className={`dash-table__row ${expanded === member.id ? 'dash-table__row--expanded' : ''}`}>
                    <td className="dash-table__id">{member.id}</td><td>{member.name}</td><td>{member.email}</td><td>{member.phone || '—'}</td><td>{member.createdAt?.slice(0, 10)}</td>
                    <td className="dash-table__toggle"><button aria-expanded={expanded === member.id} onClick={() => toggle(member.id)}>{expanded === member.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>
                  </tr>
                  {expanded === member.id && <tr className="dash-table__detail"><td colSpan={6}><MemberDetails member={member} /></td></tr>}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dash-user-cards">
          {loading ? <div className="dash-table__empty">加载中…</div> : members.map((member) => (
            <article className="dash-user-card" key={member.id}>
              <button className="dash-user-card__head" aria-expanded={expanded === member.id} onClick={() => toggle(member.id)}>
                <span><strong>{member.name}</strong><small>{member.email}</small></span>
                {expanded === member.id ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expanded === member.id && <MemberDetails member={member} />}
            </article>
          ))}
        </div>

        {totalPages > 1 && <div className="dash-pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button></div>}
      </div>
    </div>
  )
}

function MemberDetails({ member }: { member: Member }) {
  return (
    <div className="dash-detail">
      <div className="dash-detail__item"><span>姓名</span><span>{member.name}</span></div>
      <div className="dash-detail__item"><span>邮箱</span><span>{member.email}</span></div>
      <div className="dash-detail__item"><span>手机</span><span>{member.phone || '未填写'}</span></div>
      <div className="dash-detail__item"><span>优惠码</span><span>{member.promoCode || '无'}</span></div>
      <div className="dash-detail__item"><span>角色</span><span>{member.role === 'admin' ? '管理员' : '会员'}</span></div>
      <div className="dash-detail__item"><span>注册时间</span><span>{member.createdAt?.replace('T', ' ').slice(0, 19)}</span></div>
    </div>
  )
}

export default AdminUsers
