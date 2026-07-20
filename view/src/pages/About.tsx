import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ZoomIn, X } from 'lucide-react'
import CompanyStory from '../components/CompanyStory'
import './About.css'

type CertificateItem = {
  type: string
  title: string
  issuer: string
  image: string
  theme: 'dark' | 'light'
  layout?: 'portrait' | 'landscape'
}

const BUSINESS_LICENSE: CertificateItem = {
  type: '资质认证',
  title: '营业执照',
  issuer: '广州雅舍室内设计有限公司 · 统一社会信用代码 91440115MAKBG4HD6A',
  image: '/business-license.png',
  theme: 'light',
  layout: 'landscape',
}

const CERTIFICATES: CertificateItem[] = [
  {
    type: '荣誉奖项',
    title: '杰出承建商大奖 2024 · 嘉许证书',
    issuer: '香港建造业议会',
    image: '/IMG_5395.JPG',
    theme: 'dark',
  },
  {
    type: '资质认证',
    title: '注册专业行业承造商证书',
    issuer: '香港建造业议会 · 室内装修专业资质',
    image: '/IMG_5396.JPG',
    theme: 'light',
  },
]

function About() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
          }
        })
      },
      { threshold: 0.12 }
    )
    sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!selectedCertificate) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCertificate(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedCertificate])

  const setRef = (i: number) => (el: HTMLElement | null) => { sectionRefs.current[i] = el }

  return (
    <main className="about">
      {/* ===== Hero ===== */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="container about-hero__content">
          <Link to="/" className="about-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="about-hero__tag">ATELIER DES MIYABI</span>
          <h1 className="about-hero__title">关于雅舍</h1>
          <p className="about-hero__subtitle">依光而栖的艺术织者 — 一场横跨东西方的美学对话</p>
        </div>
      </section>

      <CompanyStory />

      {/* ===== 荣誉与资质 ===== */}
      <section className="about-cert reveal" ref={setRef(0)}>
        <div className="container">
          <div className="about-cert__header">
            <span>Honors & Qualifications</span>
            <h2>荣誉与资质</h2>
            <p>专业认可与行业资质，共同见证我们的品质标准</p>
          </div>
          <div className="cert-license">
            <article className={`cert-card cert-card--${BUSINESS_LICENSE.theme} cert-card--landscape`}>
              <button
                type="button"
                className="cert-card__image"
                onClick={() => setSelectedCertificate(BUSINESS_LICENSE)}
                aria-label={`放大查看${BUSINESS_LICENSE.title}`}
              >
                <img src={BUSINESS_LICENSE.image} alt={BUSINESS_LICENSE.title} loading="lazy" />
                <span className="cert-card__zoom"><ZoomIn size={18} /> 点击查看大图</span>
              </button>
              <div className="cert-card__content">
                <span className="cert-card__type">{BUSINESS_LICENSE.type}</span>
                <h3>{BUSINESS_LICENSE.title}</h3>
                <p>{BUSINESS_LICENSE.issuer}</p>
              </div>
            </article>
          </div>
          <div className="cert-grid">
            {CERTIFICATES.map((certificate) => (
              <article key={certificate.title} className={`cert-card cert-card--${certificate.theme}`}>
                <button
                  type="button"
                  className="cert-card__image"
                  onClick={() => setSelectedCertificate(certificate)}
                  aria-label={`放大查看${certificate.title}`}
                >
                  <img src={certificate.image} alt={certificate.title} loading="lazy" />
                  <span className="cert-card__zoom"><ZoomIn size={18} /> 点击查看大图</span>
                </button>
                <div className="cert-card__content">
                  <span className="cert-card__type">{certificate.type}</span>
                  <h3>{certificate.title}</h3>
                  <p>{certificate.issuer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedCertificate && (
        <div
          className="cert-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedCertificate.title}
          onClick={() => setSelectedCertificate(null)}
        >
          <button
            type="button"
            className="cert-lightbox__close"
            onClick={() => setSelectedCertificate(null)}
            aria-label="关闭证书大图"
          >
            <X size={24} />
          </button>
          <div
            className={`cert-lightbox__body${selectedCertificate.layout === 'landscape' ? ' cert-lightbox__body--landscape' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={selectedCertificate.image} alt={selectedCertificate.title} />
            <div className="cert-lightbox__caption">
              <span>{selectedCertificate.type}</span>
              <strong>{selectedCertificate.title}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA ===== */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta__card">
            <h2>准备好开始您的设计之旅了吗？</h2>
            <p>与我们的设计师预约一次免费咨询，让我们了解您的需求与愿景</p>
            <Link to="/contact" className="about-cta__btn">联络我们</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
