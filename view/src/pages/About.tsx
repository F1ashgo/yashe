import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Award, Trophy, Medal, Building2, Users, Briefcase, Clock, Star } from 'lucide-react'
import './About.css'

/* 荣誉奖项 */
const HONORS = [
  {
    year: '2024',
    title: 'APIDA 亚太室内设计大奖',
    category: '住宅空间 · 金奖',
    icon: <Trophy size={28} />,
    desc: '获奖项目「湖滨别墅」— 以对光影与材质的极致把控获得评审团一致认可。',
  },
  {
    year: '2023',
    title: '中国室内设计年度评选',
    category: '年度最佳设计机构',
    icon: <Award size={28} />,
    desc: '从全国 300+ 参选机构中脱颖而出，获评年度最具影响力设计品牌。',
  },
  {
    year: '2022',
    title: 'iF Design Award',
    category: '室内设计类别',
    icon: <Medal size={28} />,
    desc: '作品「西湖茶室」凭借东西方美学的融合表达，赢得国际评审团肯定。',
  },

  {
    year: '2020',
    title: '中国建筑装饰协会',
    category: '设计影响力人物',
    icon: <Award size={28} />,
    desc: '雅舍创始人获中国建筑装饰协会颁发「设计影响力人物」称号。',
  },
  {
    year: '2019',
    title: '国际空间设计大奖',
    category: '艾特奖 · 最佳住宅空间',
    icon: <Trophy size={28} />,
    desc: '获奖项目「番禺别墅」以人文关怀为核心，打造三代同堂的理想居所。',
  },
]

/* 公司数据 */
const COMPANY_STATS = [
  { icon: <Building2 size={22} />, num: '3', label: '城市分公司' },
  { icon: <Users size={22} />, num: '50+', label: '资深设计师' },
  { icon: <Briefcase size={22} />, num: '800+', label: '完成项目' },
  { icon: <Clock size={22} />, num: '10+', label: '年行业深耕' },
]

function About() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

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

      {/* ===== 公司介绍 ===== */}
      <section className="about-intro reveal" ref={setRef(0)}>
        <div className="container">
          <div className="about-intro__grid">
            <div className="about-intro__text">
              <h3 className="about-intro__subtitle">品牌起源</h3>
              <p className="about-intro__lead">
                「雅舍」— <strong>依光而栖的艺术织者。</strong>其外文名称 Atelier des Miyabi，
                法文「Atelier」意指手作坊，日文「Miyabi（雅）」承载平安时代的宫廷美学——
                一种对优雅、精致与细腻的极致追求。两个词汇的交织，正如我们的设计哲学：一场横跨东西方的美学对话。
              </p>
              <p>
                我们始终专注于纯粹的空间设计与美学转译。像手作坊里的老匠人般，
                在感性与理性之间反复推敲比例与材质，以设计本身为空间注入灵魂。
                不追逐短暂的流行符号，而是捕捉光线的轨迹、时间的纹理，
                将日常生活的诗意温柔地编织进每一寸空间。
              </p>
              <p>
                在雅舍，设计不是风格的复制，而是一场与空间、与光影、与居住者的深层对话。
                我们相信，真正动人的空间，是那些能与时光共处、让生活在其间自然流淌的场所。
                从选材的触感到光影的层次，从尺度的推敲到氛围的营造，
                每一个细节都是我们对「雅」之精神的实践与致敬。
              </p>

              <div className="about-intro__stats">
                {COMPANY_STATS.map((s) => (
                  <div key={s.label} className="about-intro__stat">
                    <span className="about-intro__stat-icon">{s.icon}</span>
                    <span className="about-intro__stat-num">{s.num}</span>
                    <span className="about-intro__stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-intro__sidebar">
              <div className="about-intro__info-card">
                <h4>公司信息</h4>
                <dl>
                  <dt>公司全称</dt>
                  <dd>雅舍室内设计有限公司</dd>
                  <dt>外文名称</dt>
                  <dd>Atelier des Miyabi</dd>
                  <dt>成立时间</dt>
                  <dd>2015年</dd>
                  <dt>总部地址</dt>
                  <dd>广州市南沙区凯翔路1号1702</dd>
                  <dt>服务城市</dt>
                  <dd>广州 · 深圳 · 上海 · 北京 · 杭州</dd>
                  <dt>业务类型</dt>
                  <dd>高端住宅 / 商业空间 / 酒店民宿 / 软装陈设</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 荣誉奖项 ===== */}
      <section className="about-honors reveal" ref={setRef(1)}>
        <div className="container">
          <div className="about-honors__header">
            <span className="about-honors__tag">Honors & Awards</span>
            <h2>荣誉奖项</h2>
            <p>每一份认可，都是对设计初心的坚守与回应</p>
          </div>

          {/* 获奖时间轴 */}
          <div className="honors-timeline">
            <div className="honors-timeline__line" />
            {HONORS.map((h, i) => (
              <div
                key={h.title}
                className={`honors-item honors-item--${i % 2 === 0 ? 'left' : 'right'}`}
              >
                <div className="honors-item__dot">
                  <span className="honors-item__year">{h.year}</span>
                </div>
                <div className="honors-item__card">
                  <div className="honors-item__icon">{h.icon}</div>
                  <div className="honors-item__content">
                    <span className="honors-item__category">{h.category}</span>
                    <h3 className="honors-item__title">{h.title}</h3>
                    <p className="honors-item__desc">{h.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 奖杯展示条 */}
          <div className="honors-banner">
            <div className="honors-banner__inner">
              {HONORS.slice(0, 4).map((h) => (
                <div key={h.title} className="honors-banner__item">
                  <div className="honors-banner__icon">{h.icon}</div>
                  <span className="honors-banner__year">{h.year}</span>
                  <span className="honors-banner__name">{h.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 资质认证 ===== */}
      <section className="about-cert reveal" ref={setRef(2)}>
        <div className="container">
          <div className="about-honors__header">
            <span className="about-honors__tag">Certifications</span>
            <h2>资质认证</h2>
            <p>国家认证，品质保障</p>
          </div>
          <div className="cert-grid">
            <div className="cert-card">
              <img src="/IMG_5395.JPG" alt="资质证书" loading="lazy" />
            </div>
            <div className="cert-card">
              <img src="/IMG_5396.JPG" alt="资质证书" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta__card">
            <h2>准备好开始您的设计之旅了吗？</h2>
            <p>与我们的设计师预约一次免费咨询，让我们了解您的需求与愿景</p>
            <a href="#contact" className="about-cta__btn">预约咨询</a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
