import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { GripVertical, Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL, resolveImageUrl } from '../config/api'
import './Dashboard.css'

interface SocialMediaItem {
  id: number
  platform: string
  image: string
  caption: string
  url?: string | null
  sortOrder: number
  status: number
  createdAt: string
}

const PLATFORMS = [
  { key: 'douyin', label: '抖音' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'wechat-channel', label: '微信视频号' },
]

const EMPTY_FORM = { platform: 'douyin', image: '', caption: '', url: '', sortOrder: '', status: 1 }

function AdminContents() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token') || ''
  const headers = { Authorization: `Bearer ${token}` }
  const [items, setItems] = useState<SocialMediaItem[]>([])
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formFile, setFormFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [dragId, setDragId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)
  const [batchPlatform, setBatchPlatform] = useState('douyin')
  const [batchUploading, setBatchUploading] = useState(false)
  const [batchProgress, setBatchProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pending, setPending] = useState<{ file: File; previewUrl: string; caption: string; url: string; platform: string }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const batchFileRef = useRef<HTMLInputElement>(null)

  const formFilePreview = useMemo(() => (formFile ? URL.createObjectURL(formFile) : null), [formFile])
  useEffect(() => {
    return () => { if (formFilePreview) URL.revokeObjectURL(formFilePreview) }
  }, [formFilePreview])

  const invalidateSession = useCallback(() => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }, [navigate])

  const load = useCallback(async () => {
    try {
      const qs = filter ? `?platform=${filter}` : ''
      const response = await fetch(`${API_BASE_URL}/admin/social-media${qs}`, { headers })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '加载失败')
      setItems(body.data.list || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加载失败')
    }
  }, [token, filter, invalidateSession])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm({ ...EMPTY_FORM })
    setFormFile(null)
    setEditingId(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.caption.trim()) return setMessage('请填写说明文字')
    if (!formFile && !form.image.trim()) return setMessage('请上传或填写图片')
    setSaving(true)
    setMessage('')
    try {
      let imageValue = form.image
      if (formFile) {
        const data = new FormData()
        data.append('file', formFile)
        data.append('platform', form.platform)
        const upRes = await fetch(`${API_BASE_URL}/admin/social-media/upload`, { method: 'POST', headers, body: data })
        if (upRes.status === 401 || upRes.status === 403) return invalidateSession()
        const upBody = await upRes.json()
        if (!upRes.ok) throw new Error(upBody.message || '上传失败')
        imageValue = upBody.data.url
      }
      const url = editingId != null
        ? `${API_BASE_URL}/admin/social-media/${editingId}`
        : `${API_BASE_URL}/admin/social-media`
      const method = editingId != null ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: form.platform,
          image: imageValue,
          caption: form.caption,
          url: form.url || null,
          sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
          status: form.status,
        }),
      })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '保存失败')
      resetForm()
      setMessage(editingId != null ? '已更新' : '已添加')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '无法连接服务器')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item: SocialMediaItem) => {
    setEditingId(item.id)
    setForm({
      platform: item.platform,
      image: item.image,
      caption: item.caption,
      url: item.url || '',
      sortOrder: String(item.sortOrder),
      status: item.status,
    })
    setMessage('')
  }

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      setMessage('请选择 jpg/png/webp 图片')
      return
    }
    setPending((prev) => [...prev, ...list.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
      url: '',
      platform: batchPlatform,
    }))])
    setMessage(`已添加 ${list.length} 张，请补充说明与链接`)
  }

  const updatePending = (idx: number, patch: { caption?: string; url?: string }) => {
    setPending((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  const removePending = (idx: number) => {
    const item = pending[idx]
    if (item) URL.revokeObjectURL(item.previewUrl)
    setPending((prev) => prev.filter((_, i) => i !== idx))
  }

  const clearPending = () => {
    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    setPending([])
  }

  const savePending = async () => {
    if (pending.length === 0) return
    setBatchUploading(true)
    setMessage('')
    let ok = 0
    let fail = 0
    for (let i = 0; i < pending.length; i++) {
      const p = pending[i]
      setBatchProgress(`保存中 ${i + 1}/${pending.length}`)
      if (!p.caption.trim()) { fail++; continue }
      try {
        const data = new FormData()
        data.append('file', p.file)
        data.append('platform', p.platform)
        const upRes = await fetch(`${API_BASE_URL}/admin/social-media/upload`, { method: 'POST', headers, body: data })
        if (upRes.status === 401 || upRes.status === 403) { invalidateSession(); return }
        const upBody = await upRes.json()
        if (!upRes.ok) throw new Error(upBody.message || '上传失败')
        const imageUrl = upBody.data.url
        const res = await fetch(`${API_BASE_URL}/admin/social-media`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: p.platform, image: imageUrl, caption: p.caption.trim(), url: p.url.trim() || null, sortOrder: null, status: 1 }),
        })
        if (res.status === 401 || res.status === 403) { invalidateSession(); return }
        const body = await res.json()
        if (!res.ok) throw new Error(body.message || '创建失败')
        ok++
      } catch {
        fail++
      }
    }
    pending.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    setPending([])
    setBatchUploading(false)
    setBatchProgress('')
    setMessage(`已保存 ${ok} 条${fail > 0 ? `，失败 ${fail} 条` : ''}`)
    await load()
  }

  const toggle = async (item: SocialMediaItem) => {
    const response = await fetch(`${API_BASE_URL}/admin/social-media/${item.id}/status?status=${item.status === 1 ? 0 : 1}`, {
      method: 'PATCH', headers,
    })
    if (response.status === 401 || response.status === 403) return invalidateSession()
    if (response.ok) load()
  }

  const remove = async (id: number) => {
    if (!window.confirm('确定删除这条内容吗？')) return
    const response = await fetch(`${API_BASE_URL}/admin/social-media/${id}`, { method: 'DELETE', headers })
    if (response.status === 401 || response.status === 403) return invalidateSession()
    if (response.ok) {
      if (editingId === id) resetForm()
      load()
    }
  }

  const reorder = async (targetId: number) => {
    if (dragId == null || dragId === targetId) {
      setDragId(null); setOverId(null)
      return
    }
    const fromIdx = filtered.findIndex((i) => i.id === dragId)
    const toIdx = filtered.findIndex((i) => i.id === targetId)
    if (fromIdx < 0 || toIdx < 0) {
      setDragId(null); setOverId(null)
      return
    }
    const next = [...filtered]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    const ids = next.map((i) => i.id)
    setDragId(null)
    setOverId(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/social-media/reorder`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(ids),
      })
      if (response.status === 401 || response.status === 403) return invalidateSession()
      if (!response.ok) {
        const body = await response.json()
        setMessage(body.message || '排序保存失败')
        return
      }
      setMessage('排序已更新')
      await load()
    } catch {
      setMessage('排序保存失败')
    }
  }

  const filtered = filter ? items.filter((i) => i.platform === filter) : items

  return (
    <div className="dash-body">
      <div className="dash-body__inner">
        <section className="dash-panel dash-notice-panel">
          <div className="dash-panel__head">
            <div><span className="dash-panel__eyebrow">Content</span><h2><ImageIcon size={18} /> 内容管理</h2></div>
            <p>管理社交媒体图库的图片、说明与原文链接。</p>
          </div>

          <form className="dash-notice-form" onSubmit={submit}>
            <div className="dash-notice-form__row">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              <input type="number" min={1} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="排序（留空则排到末尾）" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                <option value={1}>显示</option><option value={0}>隐藏</option>
              </select>
            </div>
            <div className="dash-content-image">
              <input value={form.image} onChange={(e) => { setForm({ ...form, image: e.target.value }); if (formFile) setFormFile(null) }} placeholder="图片路径或完整 URL" />
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormFile(f) }} />
              <button type="button" onClick={() => fileRef.current?.click()}><Upload size={15} />上传图片</button>
              {(formFilePreview || form.image) && (
                <img className="dash-content-image__preview" src={formFilePreview || resolveImageUrl(form.image)} alt="预览" />
              )}
              {formFile && (
                <button type="button" className="dash-content-image__clear" onClick={() => setFormFile(null)} aria-label="移除已选图片"><X size={13} /></button>
              )}
            </div>
            <input value={form.caption} maxLength={255} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="说明文字" />
            <input value={form.url} maxLength={500} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="原文链接（可选）" />
            <div className="dash-notice-form__foot">
              <span role="status">{message}</span>
              <div className="dash-content-form__actions">
                {editingId != null && <button type="button" className="dash-content-form__cancel" onClick={resetForm}><X size={15} />取消</button>}
                <button type="submit" disabled={saving}><Plus size={15} />{saving ? '保存中…' : editingId != null ? '保存修改' : '添加内容'}</button>
              </div>
            </div>
          </form>

          <div
            className={`dash-dropzone${dragOver ? ' dash-dropzone--over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
          >
            <div className="dash-dropzone__inner">
              <Upload size={22} />
              <p>拖拽图片到这里，稍后统一保存</p>
              <div className="dash-dropzone__row">
                <select value={batchPlatform} onChange={(e) => setBatchPlatform(e.target.value)}>
                  {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
                <button type="button" onClick={() => batchFileRef.current?.click()}>
                  <Upload size={15} />选择多张图片
                </button>
                <input ref={batchFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { const f = e.target.files; if (f && f.length) addFiles(f) }} />
              </div>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="dash-pending">
              <div className="dash-pending__head">
                <h3>待保存（{pending.length}）</h3>
                <span>为每张图片补充说明与原文链接</span>
              </div>
              {pending.map((p, idx) => (
                <div key={idx} className="dash-pending__item">
                  <div className="dash-pending__thumb">
                    <img className="dash-content-item__thumb" src={p.previewUrl} alt={p.file.name} />
                    <span className="dash-pending__filename" title={p.file.name}>{p.file.name}</span>
                  </div>
                  <input value={p.caption} maxLength={255} placeholder="说明" onChange={(e) => updatePending(idx, { caption: e.target.value })} />
                  <input value={p.url} maxLength={500} placeholder="原文链接（可选）" onChange={(e) => updatePending(idx, { url: e.target.value })} />
                  <button type="button" onClick={() => removePending(idx)} aria-label="移除"><X size={14} /></button>
                </div>
              ))}
              <div className="dash-pending__foot">
                <button type="button" className="dash-content-form__cancel" onClick={clearPending}>取消</button>
                <button type="button" onClick={savePending} disabled={batchUploading}>{batchUploading ? batchProgress : `保存全部（${pending.length}）`}</button>
              </div>
            </div>
          )}

          <div className="dash-content-list">
            <div className="dash-content-filter">
              <button className={filter === '' ? 'dash-content-filter__active' : ''} onClick={() => setFilter('')}>全部</button>
              {PLATFORMS.map((p) => (
                <button key={p.key} className={filter === p.key ? 'dash-content-filter__active' : ''} onClick={() => setFilter(p.key)}>{p.label}</button>
              ))}
              <span className="dash-content-filter__hint">{filter === '' ? '选择平台后可拖拽排序' : '拖拽条目可排序'}</span>
            </div>
            {filtered.length === 0 ? <div className="dash-notice-empty">暂无内容</div> : filtered.map((item) => (
              <article
                key={item.id}
                className={`dash-notice-item ${item.status === 1 ? 'dash-notice-item--published' : ''}${overId === item.id ? ' dash-content-item--over' : ''}`}
                draggable={filter !== ''}
                onDragStart={() => setDragId(item.id)}
                onDragOver={(e) => { e.preventDefault(); if (overId !== item.id) setOverId(item.id) }}
                onDrop={(e) => { e.preventDefault(); reorder(item.id) }}
                onDragEnd={() => { setDragId(null); setOverId(null) }}
              >
                <div className="dash-notice-item__main dash-content-item__main">
                  {filter !== '' && <GripVertical size={16} className="dash-content-item__grip" />}
                  <img className="dash-content-item__thumb" src={resolveImageUrl(item.image)} alt={item.caption} loading="lazy" />
                  <div>
                    <div className="dash-notice-item__meta">
                      <span>{PLATFORMS.find((p) => p.key === item.platform)?.label || item.platform}</span>
                      <span>{item.status === 1 ? '显示' : '隐藏'}</span>
                      <span>排序 {item.sortOrder}</span>
                    </div>
                    <h3>{item.caption}</h3>
                    {item.url && <p className="dash-content-item__url">{item.url}</p>}
                  </div>
                </div>
                <div className="dash-notice-item__actions">
                  <button onClick={() => startEdit(item)}>编辑</button>
                  <button onClick={() => toggle(item)}>{item.status === 1 ? '隐藏' : '显示'}</button>
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

export default AdminContents
