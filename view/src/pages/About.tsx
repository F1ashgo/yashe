import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home, Building2, Palmtree, PenTool, Star, Users, CheckCircle2 } from 'lucide-react'
import './About.css'

const SERVICE_SCOPES = [
  {
    icon: <Home size={28} />,
    title: '高端住宅设计',
    enTitle: 'Luxury Residential',
    items: ['别墅 / 大平层', '精品公寓', '樣板间设计', '旧宅改造翻新'],
  },
  {
    icon: <Building2 size={28} />,
    title: '商业空间设计',
    enTitle: 'Commercial Space',
    items: ['办公室设计', '零售店铺', '餐厅 / 咖啡厅', '酒店 / 民宿'],
  },
  {
    icon: <Palmtree size={28} />,
    title: '软装陈设设计',
    enTitle: 'Soft Furnishing',
    items: ['家具定制', '艺术品选配', '布艺窗帘', '灯光照明设计'],
  },
  {
    icon: <PenTool size={28} />,
    title: '设计顾问咨询',
    enTitle: 'Design Consulting',
    items: ['空间規划评估', '风格定位建议', '预算規划指导', '施工监理服务'],
  },
]

const ADVANTAGES = [
  { icon: <Star size={24} />, title: '国际化团队', desc: '核心设计师均毕业于国內外頂尖设计院校，拥有10年以上设计经验' },
  { icon: <Users size={24} />, title: '一对一专属服务', desc: '每位客戶配备专属设计师团队，全程跟进，确保设计理念完整落地' },
  { icon: <CheckCircle2 size={24} />, title: '严选供应链', desc: '与全球200+高端材料供应商建立长期合作，确保用材品质与供货稳定' },
]

function About() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    <main className="about">
      {/* Page Header */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="container about-hero__content">
          <Link to="/" className="about-hero__back">
            <ArrowLeft size={18} /> 返回首页
          </Link>
          <span className="about-hero__tag">ATELIER DES MIYABI</span>
          <h1 className="about-hero__title">关于雅舍</h1>
          <p className="about-hero__subtitle">
            依光而栖的艺术织者 — 一场横跨东西方的美学对话
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="about-story reveal" ref={setRef(0)}>
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__label">
              <span className="about-story__label-tag">Notre Histoire</span>
              <h2>品牌故事</h2>
            </div>
            <div className="about-story__content">
              <p className="about-story__lead">
                「雅舍」— <strong>依光而栖的艺术织者。</strong>
              </p>
              <p>
                其外文名称 Atelier des Miyabi，法文「Atelier」意指手作坊，
                日文「Miyabi（雅）」承载著平安时代的宫廷美学 — 一种对优雅、精致与细腻的极致追求。
                兩个词汇的交织，正如我们的设计哲学：
                <strong>一场橫跨东西方的美学对话，一处将设计升华为艺术的灵魂居所。</strong>
              </p>
              <p>
                我们始终专注于纯粹的空间设计与美学转译。像手作坊里的老匠人般，
                在感性与理性之间反覆推敲比例与材质，以设计本身为空间注入灵魂。
                不追求短暫的流行符号，而是捕捉光线的轨迹、时间的纹理，
                将日常生活的诗意温柔地编织进每一寸空间。
              </p>
              <p>
                在雅舍，设计不是风格的复制，而是一场与空间、与光影、与居住者的深层对话。
                我们相信，真正动人的空间，是那些能与时光共处、让生活在其间自然流淌的场所。
                从选材的触感到光影的层次，从尺度的推敲到氛围的营造，
                每一个细节都是我们对「雅」之精神的实践与致敬。
              </p>
              <p>
                如今，雅舍已发展成为拥有50余名专业设计师的综合性设计事务所，
                累计服务超过800个项目，涵盖高端住宅、商业空间、酒店民宿等多元领域。
                我们的作品多次获得国內外设计奖项认可，並被多家权威设计媒体收录报导。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Scope */}
      <section className="about-services reveal" ref={setRef(1)}>
        <div className="container">
          <div className="about-services__header">
            <span className="about-services__tag">Service Scope</span>
            <h2>服务范围</h2>
            <p>我们提供全方位、一站式的室內设计解决方案</p>
          </div>
          <div className="services-grid">
            {SERVICE_SCOPES.map((service) => (
              <div key={service.title} className="service-card">
                <div className="service-card__icon">{service.icon}</div>
                <h3 className="service-card__title">{service.title}</h3>
                <span className="service-card__en">{service.enTitle}</span>
                <ul className="service-card__list">
                  {service.items.map((item) => (
                    <li key={item}>
                      <span className="service-card__dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="about-advantages reveal" ref={setRef(2)}>
        <div className="container">
          <div className="about-advantages__header">
            <span className="about-advantages__tag">Why Choose Us</span>
            <h2>为什么选择雅舍</h2>
          </div>
          <div className="advantages-grid">
            {ADVANTAGES.map((adv) => (
              <div key={adv.title} className="advantage-card">
                <div className="advantage-card__icon">{adv.icon}</div>
                <h3>{adv.title}</h3>
                <p>{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta__card">
            <h2>准备好开始您的设计之旅了吗？</h2>
            <p>与我们的设计师预约一次免费咨询，让我们了解您的需求与愿景</p>
            <a href="#contact" className="about-cta__btn">
              预约咨询
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
