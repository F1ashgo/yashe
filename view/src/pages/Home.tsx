import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Award, Target, Eye, Compass } from 'lucide-react'
import './Home.css'

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

  return (
    <main className="home">
      {/* ===== Hero Section ===== */}
      <section className="hero-section">
        <div className="hero-section__overlay" />
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
              href="#intro"
              className="hero-section__btn hero-section__btn--primary"
            >
              探索更多
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
                「雅舍」— 一个将时间、光影与日常生活温柔编织的室內设计工作室。
                其外文名称 <strong>Atelier des Miyabi</strong>，不仅是一串名字，更是一场橫跨东西方的美学对话、
                一处将设计升华为艺术的灵魂居所。
              </p>
              <p>
                我们始终专注于纯粹的空间设计与美学转译，像手作坊里的老匠人般，
                在感性与理性之间反覆推敲比例与材质，以设计本身为空间注入灵魂。
                不追逐短暫的流行趋势，而是创造经得起时间考验的空间作品。
              </p>
              <p>
                从概念規划、方案深化到施工落地，雅舍建立了完整的设计服务体系。
                迄今已为超过<strong>800个</strong>高端住宅及商业项目提供设计服务，
                业务遍及广州、深圳、上海、北京、杭州等一线城市。
              </p>
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
