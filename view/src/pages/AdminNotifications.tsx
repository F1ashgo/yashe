import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Send, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import './Dashboard.css'

interface NotificationItem {
  id: number
  title: string
  content: string
  type: string
  status: number
  createdAt: string
}

function AdminNotifications() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token') || ''
  const headers = { Authorization: `Bearer ${token}` }
  const [items, setItems] = useState<NotificationItem[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', content: '', type: '公告', status: 1 })

  const invalidateSession = useCallback(() => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, { headers })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '加载通知失败')
      setItems(body.data.list || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加载通知失败')
    }
  }, [token, invalidateSession])

  useEffect(() => { load() }, [load])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return setMessage('请填写通知标题和内容')
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '发布失败')
      setForm({ title: '', content: '', type: '公告', status: 1 })
      setMessage('通知已保存')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法连接服务器')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item: NotificationItem) => {
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${item.id}/status?status=${item.status === 1 ? 0 : 1}`, {
      method: 'PATCH', headers,
    })
    if (response.status === 401 || response.status === 403) return invalidateSession()
    if (response.ok) load()
  }

  const remove = async (id: number) => {
    if (!window.confirm('确定删除这条通知吗？')) return
    const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}`, { method: 'DELETE', headers })
    if (response.status === 401 || response.status === 403) return invalidateSession()
    if (response.ok) load()
  }

  return (
    <div className="dash-body">
      <div className="dash-body__inner">
        <section className="dash-panel dash-notice-panel">
          <div className="dash-panel__head">
            <div><span className="dash-panel__eyebrow">Notification</span><h2><Bell size={18} /> 通知推送</h2></div>
            <p>创建、发布或隐藏会员中心通知。</p>
          </div>
          <form className="dash-notice-form" onSubmit={submit}>
            <div className="dash-notice-form__row">
              <input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="通知标题" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['公告', '优惠', '设计提醒', '活动'].map((type) => <option key={type}>{type}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                <option value={1}>立即发布</option><option value={0}>保存草稿</option>
              </select>
            </div>
            <textarea value={form.content} maxLength={5000} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="通知内容" />
            <div className="dash-notice-form__foot">
              <span role="status">{message}</span>
              <button type="submit" disabled={saving}><Send size={15} />{saving ? '保存中…' : '保存通知'}</button>
            </div>
          </form>
          <div className="dash-notice-list">
            {items.length === 0 ? <div className="dash-notice-empty">暂无通知</div> : items.map((item) => (
              <article key={item.id} className={`dash-notice-item ${item.status === 1 ? 'dash-notice-item--published' : ''}`}>
                <div className="dash-notice-item__main">
                  <div className="dash-notice-item__meta"><span>{item.type}</span><span>{item.status === 1 ? '已发布' : '已隐藏'}</span><span>{item.createdAt?.slice(0, 10)}</span></div>
                  <h3>{item.title}</h3><p>{item.content}</p>
                </div>
                <div className="dash-notice-item__actions">
                  <button onClick={() => toggle(item)}>{item.status === 1 ? '隐藏' : '发布'}</button>
                  <button className="dash-notice-item__delete" onClick={() => remove(item.id)}><Trash2 size={14} />删除</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminNotifications
