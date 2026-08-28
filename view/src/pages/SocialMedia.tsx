import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './SocialMedia.css'

interface GalleryItem { src: string; caption: string; url?: string }
interface CaptionEntry { file: string; caption?: string; url?: string }
interface Platform { key: string; label: string }

const PLATFORMS: Platform[] = [
  { key: 'douyin', label: '抖音' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'wechat-channel', label: '微信视频号' },
]

const SOCIAL_DIR = '/social-media/'
const captionsUrl = (key: string) => `${SOCIAL_DIR}${key}/captions.json`

function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, '')
}

function SocialMedia() {
  const [active, setActive] = useState(PLATFORMS[0].key)
  const [items, setItems] = useState<Record<string, GalleryItem[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    PLATFORMS.forEach((p) => { init[p.key] = true })
    return init
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    PLATFORMS.forEach((platform) => {
      void (async () => {
        try {
          const res = await fetch(captionsUrl(platform.key))
          if (!res.ok) throw new Error(`captions ${res.status}`)
          const parsed: unknown = await res.json()
          const order: CaptionEntry[] = Array.isArray(parsed) ? parsed : []

          const gallery: GalleryItem[] = order
            .filter((entry) => entry && entry.file)
            .map((entry) => ({
              src: `${SOCIAL_DIR}${platform.key}/${entry.file}`,
              caption: entry.caption || stripExt(entry.file),
              url: entry.url,
            }))

          if (!cancelled) setItems((prev) => ({ ...prev, [platform.key]: gallery }))
        } catch {
          if (!cancelled) setErrors((prev) => ({ ...prev, [platform.key]: '暂时无法加载图库，请稍后再试' }))
        } finally {
          if (!cancelled) setLoading((prev) => ({ ...prev, [platform.key]: false }))
        }
      })()
    })

    return () => { cancelled = true }
  }, [])

  const gallery = items[active] || []
  const isLoading = loading[active]
  const error = errors[active]

  const switchTab = (key: string) => {
    setActive(key)
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }
  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }
  const lightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((p) => (p! + 1) % gallery.length)
  }
  const lightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((p) => (p! - 1 + gallery.length) % gallery.length)
  }

  const lightboxItem = lightboxIndex !== null ? gallery[lightboxIndex] : null

  return (
    <main className="social">
      <section className="social-hero">
        <div className="social-hero__overlay" />
        <div className="container social-hero__content">
          <Link to="/" className="social-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="social-hero__tag">Gallery</span>
          <h1 className="social-hero__title">社交媒体</h1>
          <p className="social-hero__subtitle">雅舍作品与动态，记录设计与生活的光影</p>
        </div>
      </section>

      <section className="social-main">
        <div className="container">
          <div className="social-tabs" role="tablist" aria-label="平台切换">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.key}
                role="tab"
                id={`social-tab-${platform.key}`}
                aria-selected={active === platform.key}
                aria-controls={`social-panel-${platform.key}`}
                className={`social-tab${active === platform.key ? ' social-tab--active' : ''}`}
                onClick={() => switchTab(platform.key)}
              >
                {platform.label}
              </button>
            ))}
          </div>

          <div id={`social-panel-${active}`} role="tabpanel" aria-labelledby={`social-tab-${active}`}>
            {isLoading ? (
              <div className="social-state">
                <Loader2 size={28} className="spin" />
                <p>正在加载图库…</p>
              </div>
            ) : error ? (
              <div className="social-state social-state--error">
                <p>{error}</p>
              </div>
            ) : gallery.length === 0 ? (
              <div className="social-state">
                <p>暂无作品，敬请期待</p>
              </div>
            ) : (
              <div className="social-grid">
                {gallery.map((item, i) => (
                  <figure key={item.src} className="social-card">
                    <div className="social-card__media" onClick={() => openLightbox(i)}>
                      <img src={item.src} alt={item.caption} loading="lazy" />
                      <div className="social-card__overlay">
                        <span className="social-card__view">查看大图</span>
                      </div>
                    </div>
                    <figcaption className="social-card__caption">{item.caption}</figcaption>
                    {item.url && (
                      <a className="social-card__link" href={item.url} target="_blank" rel="noopener noreferrer">
                        查看原文 <ExternalLink size={14} />
                      </a>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {lightboxItem && (
        <div className="social-lightbox" onClick={closeLightbox}>
          <button className="social-lightbox__close" onClick={closeLightbox}><X size={28} /></button>
          <button className="social-lightbox__prev" onClick={lightboxPrev}><ChevronLeft size={40} /></button>
          <img
            src={lightboxItem.src}
            alt={lightboxItem.caption}
            className="social-lightbox__image"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="social-lightbox__next" onClick={lightboxNext}><ChevronRight size={40} /></button>
          <div className="social-lightbox__caption">
            <h3>{lightboxItem.caption}</h3>
            {lightboxItem.url && (
              <a className="social-lightbox__link" href={lightboxItem.url} target="_blank" rel="noopener noreferrer">
                查看原文 <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default SocialMedia
