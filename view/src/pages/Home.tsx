import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Award, Target, Eye, Compass, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './Home.css'

/* Hero 背景图 — 轮播专用图 */
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
    title: '蒙特梭利幼儿园',
    category: '教育空间',
    style: '自然成长',
    desc: '以儿童视角为设计原点，打造安全、温暖、激发探索欲的成长乐园。',
  },
  {
    image: '/幼儿园/閱讀室.jpeg',
    title: '幼儿园阅读室',
    category: '教育空间',
    style: '趣味阅读',
    desc: '圆形下沉式阅读区与自然采光结合，让孩子爱上阅读的每个角落。',
  },
  {
    image: '/中药铺/中药铺3.jpeg',
    title: '同仁堂中药体验馆',
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
  {
    image: '/ice bath/休息區1.jpeg',
    title: 'Ice Bath 冷疗空间',
    category: '康体空间',
    style: '极简工业',
    desc: '冷暖材质的对比碰撞，为冷疗体验营造既专业又放松的空间氛围。',
  },
  {
    image: '/ice bath/咖啡厅.jpeg',
    title: 'Ice Bath 休闲咖啡厅',
    category: '康体空间',
    style: '现代简约',
    desc: '冷疗后的温暖休憩区，以柔和灯光与天然材质打造舒适的社交场景。',
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

/* 发展历程 — 三段式叙事 */
const JOURNEY_PHASES = [
  {
    num: '壹',
    numEn: '01',
    title: '原点',
    subtitle: '始于对真实的敬畏',
    enSubtitle: 'Origin · Reverence for the Authentic',
    paragraphs: [
      '雅舍的故事，并非始于一张完美无瑕的渲染图，而是源于我们在深耕工程营造的岁月里，无数次面对过被现实环境击碎的「设计理想」。',
      '基于以往累积的丰富经验，我们深刻意识到，如果设计失去了对在地环境的考量与现实痛点的洞察，任何华丽的视觉表达都只是一场短暂的幻梦。真正的美，必须根植于真实，不为毫无意义的形式而设计，让空间在时间的洗鍊下依然保有耐久与从容。这，是雅舍出发的原点。',
    ],
  },
  {
    num: '貳',
    numEn: '02',
    title: '共生',
    subtitle: '理性构建与感性表达的交织',
    enSubtitle: 'Symbiosis · Reason Woven with Emotion',
    paragraphs: [
      '漫长的空间实践，让我们学会了如何在理性的结构中寻找感性的诗意。我们选择纯粹的设计者角色，将过往累积的实务经验，转化为理性的思维骨架。我们乐意与您一同探索想像，但也始终保持着设计者的清醒与克制。',
      '在隐蔽处考量、在细微处推敲，将每一处可能遇到的空间限制，温柔转化为精准的设计巧思。对雅舍而言，这不仅仅是一份设计图纸的交付，更是一场关于生活细节的美学修行。',
    ],
  },
  {
    num: '叄',
    numEn: '03',
    title: '使命',
    subtitle: '打造承载美好的时间容器',
    enSubtitle: 'Mission · Vessels of Time that Carry Beauty',
    paragraphs: [
      '将理性的严谨尺度融入感性的室内光影，雅舍始终留在纯粹的设计者定位。我们以匠人心思，不只为您描绘空间的美学意境，更用细致的图纸为您的未来居所引路。无论您未来将图纸交由哪一家优秀的施工单位，美学与想像都能顺畅、完美地融入您的真实生活之中。',
      '雅舍愿与您一同出发，打破形式的束缚，用极致的专注，将每一处空间打造成一个不仅抵御岁月侵蚀，更能容纳光影流转、故事发生与精神栖息的完美容器。',
    ],
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
          <div className="intro-section__grid">
            <div className="intro-section__text">
              <p className="intro-section__lead">
                源于对现实的敬畏，忠于纯粹的设计。
              </p>
              <p>
                雅舍（<strong>Atelier des Miyabi</strong>）的故事，孕育于对「图纸与现实之间巨大落差」的深刻反思。
                几位联合创始人曾深耕于建筑工程与高端空间营造领域多年，在无数个施工现场，
                亲历了太多因脱离实际而无法落地的华丽图纸，也见证了太多因缺乏美学把控而失去灵魂的居住空间。
                出于对纯粹设计的渴望与对工程客观规律的敬畏，雅舍在这样的契机下应运而生。
              </p>
              <h4 className="intro-section__sub">剥离繁杂，回归工坊本质</h4>
              <p>
                为了打破行业内「设计与落地脱节」的壁垒，我们做出了一个果断的决定：剥离繁杂的施工业务，
                转型为一家只专注于「纯粹空间设计」的精品工作室。这不仅是一次商业模式的取舍，更是对匠人精神的回归。
                雅舍汇聚了拥有国际视野的美学设计师与具备深厚现场经验的图纸深化专家。我们将巴黎工坊（Atelier）的专注
                与日式风雅（Miyabi）的细腻相融合，致力于在「天马行空的艺术感」与「脚踏实地的工程性」之间找到完美的平衡点。
              </p>
              <h4 className="intro-section__sub">空间美学的严密把关人</h4>
              <p>
                如今的雅舍，已成为业内独树一帜的「空间美学把关人」。我们不追求工业化流水线的快速扩张，
                而是坚持以「慢工出细活」的工坊模式，严格把控每一位委托人的空间品质。我们交付的不仅仅是一幅幅渲染图，
                更是一套套经得起现场检验、极具执行力的严密图纸。雅舍以理性构建为骨架，以感性光影为灵魂，
                确保您的美学愿景能够无损、安全、精准地交由任何优秀的施工团队化为现实。
              </p>
            </div>
            <div className="intro-section__sidebar">
              <div className="intro-section__image">
                <img src="/ice bath/小泳池.jpeg" alt="雅舍设计作品" loading="lazy" />
              </div>
              <div className="intro-section__stats">
                <div className="stat-item">
                  <span className="stat-item__number">10+</span>
                  <span className="stat-item__label">年行业经验</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item__number">800+</span>
                  <span className="stat-item__label">完成项目</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item__number">50+</span>
                  <span className="stat-item__label">专业设计师</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item__number">3</span>
                  <span className="stat-item__label">城市设立分公司</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 发展历程 — 三段式叙事 ===== */}
      <section className="journey-section reveal" ref={setRef(1)}>
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">成长足迹</span>
            <h2 className="section-header__title">发展历程</h2>
            <p className="section-header__en">Notre Parcours</p>
          </div>
          <div className="journey-phases">
            {JOURNEY_PHASES.map((phase, i) => (
              <div
                key={phase.num}
                className={`journey-phase ${i % 2 === 0 ? 'journey-phase--odd' : 'journey-phase--even'}`}
              >
                <div className="journey-phase__header">
                  <div className="journey-phase__num-group">
                    <span className="journey-phase__num-cn">{phase.num}</span>
                    <span className="journey-phase__num-en">{phase.numEn}</span>
                  </div>
                  <div className="journey-phase__titles">
                    <h3 className="journey-phase__title">{phase.title}</h3>
                    <span className="journey-phase__subtitle">{phase.subtitle}</span>
                    <span className="journey-phase__en">{phase.enSubtitle}</span>
                  </div>
                </div>
                <div className="journey-phase__body">
                  {phase.paragraphs.map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 核心价值 ===== */}
      <section className="values-section reveal" ref={setRef(2)}>
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
      <section className="positioning-section reveal" ref={setRef(3)}>
        <div className="container">
          <div className="section-header">
            <span className="section-header__tag">品牌定位</span>
            <h2 className="section-header__title">市场定位</h2>
            <p className="section-header__en">Market Positioning</p>
          </div>
          <div className="positioning-section__grid">
            <div className="positioning-card">
              <div className="positioning-card__num">01</div>
              <h3>高端客群</h3>
              <p>
                服务于追求品质生活的精英阶层，涵盖企业家、高管、艺术收藏家等对空间美学有高标准要求的客戶群体。
              </p>
            </div>
            <div className="positioning-card">
              <div className="positioning-card__num">02</div>
              <h3>全案设计</h3>
              <p>
                提供从建筑規划、室內设计、软装陈设到园林景观的整体设计方案，确保空间的整体性与一致性。
              </p>
            </div>
            <div className="positioning-card">
              <div className="positioning-card__num">03</div>
              <h3>国际标准</h3>
              <p>
                以国际頂级设计标准为标杆，引进全球优质材料与工艺，确保每个项目的设计品质与落地效果达到国际水准。
              </p>
            </div>
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
