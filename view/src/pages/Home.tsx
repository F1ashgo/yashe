import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Award, Target, Eye, Compass, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './Home.css'

/* Hero 轮播图 */
const HERO_IMAGES = [
  '/lunbotu/小泳池.jpeg',
  '/lunbotu/泳池2.JPG',
  '/lunbotu/泳池側面.jpeg',
  '/lunbotu/课室侧面.jpeg',
  '/lunbotu/閱讀室-帶白板.jpeg',
]

/* 精选作品 — 每个项目2张 */
const FEATURED_PROJECTS = [
  {
    image: '/幼儿园/课室正面.jpeg',
    title: '幼儿园',
    category: '教育空间',
    style: '自然成长',
    desc: '以儿童视角为设计原点，打造安全、温暖、激发探索欲的成长乐园。',
  },
  {
    image: '/幼儿园/閱讀室.jpeg',
    title: '幼儿园图书阁',
    category: '教育空间',
    style: '趣味阅读',
    desc: '圆形下沉式阅读区与自然采光结合，让孩子爱上阅读的每个角落。',
  },
  {
    image: '/中药铺/中药铺3.jpeg',
    title: '中药铺百子柜',
    category: '商业空间',
    style: '新中式',
    desc: '将传统中医药文化与现代零售体验融合，以木作与铜件传递匠心温度。',
  },
  {
    image: '/中药铺/中藥鋪2.jpeg',
    title: '中药铺调剂区',
    category: '商业空间',
    style: '新中式',
    desc: '开放式调剂台与百子柜的现代演绎，让抓药成为一种可视化的文化体验。',
  },
]

/* 核心价值卡片數据 */
const CORE_VALUES = [
  {
    icon: <Award size={36} />,
    title: '匠心品质',
    enTitle: 'Craftsmanship',
    desc: '我们坚持以极致工艺对待每一个项目，从选材到施工，从细节到整体，精益求精，追求卓越品质。',
  },
  {
    icon: <Target size={36} />,
    title: '以人为本',
    enTitle: 'Human-Centered',
    desc: '设计服务于生活。我们深入理解每位客戶的需求与生活方式，量身定制最契合的空间方案。',
  },
  {
    icon: <Eye size={36} />,
    title: '美学创新',
    enTitle: 'Aesthetic Innovation',
    desc: '融合东方美学与国际视野，不斷突破设计邊界，创造兼具艺术性与时代感的空间作品。',
  },
  {
    icon: <Compass size={36} />,
    title: '诚信务实',
    enTitle: 'Integrity & Pragmatism',
    desc: '以诚信为基石，以专业为导向，确保每个项目按时、按质、按预算交付，让客戶安心、放心。',
  },
]

function Home() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideChanging, setSlideChanging] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  /* Hero 轮播 */
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideChanging(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        setSlideChanging(false)
      }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    if (index === currentSlide) return
    setSlideChanging(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setSlideChanging(false)
    }, 600)
  }

  /* Scroll reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
          }
        })
      },
      { threshold: 0.15 }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el
  }

  /* Lightbox */
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }
  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }
  const lightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % FEATURED_PROJECTS.length)
  }
  const lightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + FEATURED_PROJECTS.length) % FEATURED_PROJECTS.length)
  }

  return (
    <main className="home">
      {/* ===== Hero Section with Background Carousel ===== */}
      <section className="hero-section">
        {/* Background slides */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`hero-carousel__slide ${i === currentSlide ? 'hero-carousel__slide--active' : ''} ${slideChanging && i === currentSlide ? 'hero-carousel__slide--fading' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-section__overlay" />

        {/* Slide indicators */}
        <div className="hero-carousel__dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`hero-carousel__dot ${i === currentSlide ? 'hero-carousel__dot--active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="hero-section__content">
          <p className="hero-section__subtitle">ATELIER DES MIYABI</p>
          <h1 className="hero-section__title hero-section__title--quote">
            <span className="hero-quote__line">
              <span className="hero-quote__char">「雅」</span>
              <span className="hero-quote__divider" />
              <span>是懂得收放的平衡</span>
            </span>
            <span className="hero-quote__line">
              <span className="hero-quote__char">「舍」</span>
              <span className="hero-quote__divider" />
              <span>是承载美好的场所</span>
            </span>
            <span className="hero-quote__line hero-quote__line--closing">
              亦是敢于把关的取舍。
            </span>
          </h1>
          <p className="hero-section__desc">
            Atelier des Miyabi — 将时间、光影与日常生活温柔编织的室内设计工作室
          </p>
          <div className="hero-section__actions">
            <a
              href="#portfolio"
              className="hero-section__btn hero-section__btn--primary"
            >
              精选作品
            </a>
            <Link
              to="/about"
              className="hero-section__btn hero-section__btn--outline"
            >
              了解更多
            </Link>
          </div>
        </div>
        <div className="hero-section__scroll">
          <span>SCROLL</span>
          <ArrowDown size={16} />
        </div>
      </section>

      {/* ===== 精选作品 ===== */}
      <section id="portfolio" className="portfolio-section">
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">Selected Works</span>
            <h2 className="section-header__title">精选作品</h2>
            <p className="section-header__en">Projets Sélectionnés</p>
          </div>
          <div className="portfolio-grid">
            {FEATURED_PROJECTS.map((project, i) => (
              <div
                key={project.title}
                className="portfolio-card"
                onClick={() => openLightbox(i)}
              >
                <div className="portfolio-card__image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <div className="portfolio-card__overlay">
                    <span className="portfolio-card__view">查看大图</span>
                  </div>
                </div>
                <div className="portfolio-card__info">
                  <span className="portfolio-card__category">{project.category}</span>
                  <h3 className="portfolio-card__title">{project.title}</h3>
                  <span className="portfolio-card__style">{project.style}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Lightbox ===== */}
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox__close" onClick={closeLightbox}><X size={28} /></button>
          <button className="lightbox__prev" onClick={lightboxPrev}><ChevronLeft size={40} /></button>
          <img
            src={FEATURED_PROJECTS[lightboxIndex].image}
            alt={FEATURED_PROJECTS[lightboxIndex].title}
            className="lightbox__image"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox__next" onClick={lightboxNext}><ChevronRight size={40} /></button>
          <div className="lightbox__caption">
            <h3>{FEATURED_PROJECTS[lightboxIndex].title}</h3>
            <span>{FEATURED_PROJECTS[lightboxIndex].style} · {FEATURED_PROJECTS[lightboxIndex].category}</span>
          </div>
        </div>
      )}

      {/* ===== 公司背景 ===== */}
      <section
        id="intro"
        className="intro-section reveal"
        ref={setRef(0)}
      >
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">关于我们</span>
            <h2 className="section-header__title">公司背景</h2>
            <p className="section-header__en">Notre Histoire</p>
          </div>
          {/* 宽幅品牌视频 */}
          <div className="intro-section__video-wrap">
            <video src="/introduction.mp4" autoPlay muted loop playsInline className="intro-section__video" />
          </div>

          <div className="intro-section__summary">
            <div className="intro-section__summary-title">
              <span>Rooted in Reality</span>
              <h3>从工程现实出发，回到纯粹设计</h3>
            </div>
            <div className="intro-section__summary-copy">
              <p>
                雅舍设计（Atelier des Miyabi）作为 Chun King Limited 在内地的专业室内设计分部，
                由同一位创始人掌舵，共享对品质与空间美学的坚持。
              </p>
              <p>
                多年的工程营造经验，让我们看见图纸与现实之间的距离，也确立了雅舍的设计原点：
                美必须根植于真实，在理性构建与感性表达之间寻找平衡，让空间经得起时间。
              </p>
              <Link to="/about" className="intro-section__more">了解雅舍 <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 核心价值 ===== */}
      <section className="values-section reveal" ref={setRef(1)}>
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">品牌理念</span>
            <h2 className="section-header__title">核心价值</h2>
            <p className="section-header__en">Core Values</p>
          </div>
          <div className="values-grid">
            {CORE_VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <div className="value-card__icon">{v.icon}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <span className="value-card__en">{v.enTitle}</span>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 市场定位 ===== */}
      <section className="positioning-section reveal" ref={setRef(2)}>
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">品牌定位</span>
            <h2 className="section-header__title">市场定位</h2>
            <p className="section-header__en">Market Positioning</p>
          </div>

          <div className="positioning-content">
            <p className="positioning-content__statement">
              面向内地市场，雅舍专注于兼顾
              <strong>美学表达、现实条件与落地精度</strong>
              的专业室内设计服务，为住宅与商业空间提供从概念构想到完整设计图纸的系统解决方案。
            </p>

            <div className="positioning-directions" aria-label="服务方向">
              <div className="positioning-direction">
                <h3>住宅空间</h3>
                <span>Residential</span>
              </div>
              <div className="positioning-direction">
                <h3>商业空间</h3>
                <span>Commercial</span>
              </div>
              <div className="positioning-direction">
                <h3>软装陈设</h3>
                <span>Soft Furnishing</span>
              </div>
              <div className="positioning-direction">
                <h3>设计顾问</h3>
                <span>Design Consulting</span>
              </div>
            </div>

            <Link to="/services" className="positioning-content__link">
              查看服务范畴 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 「了解更多」 CTA ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-section__card">
            <h2 className="cta-section__title">
              想了解更多关于雅舍的故事与服务？
            </h2>
            <p className="cta-section__desc">
              探索我们如何将时间与光影编织入空间，让设计升华为艺术
            </p>
            <Link to="/about" className="cta-section__btn">
              了解更多 <ArrowDown size={18} style={{ transform: 'rotate(-90deg)' }} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
