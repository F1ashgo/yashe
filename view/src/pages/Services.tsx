import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Home, Building2, Palette, Compass, Star, Quote } from 'lucide-react'
import './Services.css'

/* 服务范围数据 */
const SERVICES = [
  {
    id: 'residential',
    icon: <Home size={32} />,
    title: '高端住宅设计',
    enTitle: 'Luxury Residential',
    summary: '从独栋别墅到城市大平层，为私人居所注入灵魂与温度',
    detail: {
      intro: '住宅是生活的容器，承载着居住者的记忆、情感与日常。我们以「居住者」为设计的绝对中心，从空间动线、光影布局到材质触感，全方位打造只属于您的专属空间。',
      items: [
        { name: '独栋别墅设计', desc: '从建筑规划到室内设计一体化，打造完整的居住生态系统' },
        { name: '大平层豪宅', desc: '城市核心地段的高端公寓，兼顾社交与私密的双重需求' },
        { name: '样板间设计', desc: '为开发商提供具有市场号召力的展示空间方案' },
        { name: '旧宅改造翻新', desc: '尊重原有建筑脉络，注入现代生活功能与美学' },
      ],
      process: '需求沟通 → 概念方案 → 深化设计 → 软装配置 → 施工落地',
    },
  },
  {
    id: 'commercial',
    icon: <Building2 size={32} />,
    title: '商业空间设计',
    enTitle: 'Commercial Space',
    summary: '以设计驱动商业价值，让空间成为品牌的最佳表达',
    detail: {
      intro: '商业空间设计的核心在于平衡美学表达与商业逻辑。我们深入理解每个品牌的独特基因，将品牌故事转化为可感知的空间体验，帮助客户在竞争中脱颖而出。',
      items: [
        { name: '办公空间设计', desc: '提升员工幸福感与工作效率的现代办公环境' },
        { name: '零售店铺设计', desc: '创造沉浸式消费体验，强化品牌辨识度' },
        { name: '餐饮空间设计', desc: '从高端餐厅到精品咖啡厅，营造独特的用餐氛围' },
        { name: '酒店民宿设计', desc: '为旅人打造有温度、有故事的栖息之地' },
      ],
      process: '品牌分析 → 空间规划 → 方案设计 → 施工图 → 现场监理',
    },
  },
  {
    id: 'furnishing',
    icon: <Palette size={32} />,
    title: '软装陈设设计',
    enTitle: 'Soft Furnishing',
    summary: '从家具到艺术品，用细节雕琢空间的性格与气质',
    detail: {
      intro: '软装是空间的灵魂所在。一件恰当的家具、一幅契合的画作、一束恰到好处的灯光，都能让空间从"好看"升级为"动人"。我们提供从选品到摆场的全流程软装服务。',
      items: [
        { name: '家具定制与选配', desc: '根据空间尺度与风格，量身定制或精选品牌家具' },
        { name: '艺术品顾问', desc: '为空间匹配原创艺术品，提升空间文化底蕴' },
        { name: '布艺与窗帘', desc: '面料、色彩、质感的专业搭配，柔化空间氛围' },
        { name: '灯光照明设计', desc: '层次分明的灯光方案，塑造空间的情绪与节奏' },
      ],
      process: '风格定位 → 选品方案 → 定制生产 → 现场摆场 → 验收调整',
    },
  },
  {
    id: 'consulting',
    icon: <Compass size={32} />,
    title: '设计顾问咨询',
    enTitle: 'Design Consulting',
    summary: '以专业视角为您的项目保驾护航，让决策更从容',
    detail: {
      intro: '无论是项目前期的方向把控，还是施工阶段的技术支持，我们以丰富的实战经验为您提供专业的设计顾问服务，帮助您规避风险、优化方案、控制成本。',
      items: [
        { name: '空间规划评估', desc: '对现有方案进行专业评估，提出优化建议' },
        { name: '风格定位建议', desc: '帮助客户明确设计方向，建立风格参考体系' },
        { name: '预算规划指导', desc: '合理分配设计预算，确保每一分钱都花在刀刃上' },
        { name: '施工监理服务', desc: '全程跟进施工质量，确保设计方案的完美落地' },
      ],
      process: '初步诊断 → 方案评估 → 优化建议 → 实施监督 → 验收交付',
    },
  },
]

/* 客户评价数据 — 故事化 */
const REVIEWS = [
  {
    name: '陈先生',
    project: '广州珠江新城 · 380㎡ 大平层',
    avatar: '陈',
    story: '我们是一对退休夫妻，孩子都出国了，想把住了十几年的家重新改造。找了好几家设计公司，最后选了雅舍——因为只有他们坐下来认真听我们讲了一个下午的生活习惯。设计师问了我们很多问题：早上几点起床？喜欢在哪个角落看书？孙子回来住几天东西怎么收纳？这些细节之前从没人问过。最终的设计方案不是最"惊艳"的，但住进来之后才发现，每个日常动作都变得顺手了、舒服了。这就是我们想要的。',
    highlight: '设计师真正理解了我们的生活，而不是套用模板',
  },
  {
    name: '李女士',
    project: '深圳湾 · 连锁咖啡品牌概念店',
    avatar: '李',
    story: '作为品牌创始人，我对第一家概念店有很高的期待，但说不清楚到底想要什么。雅舍的团队花了三天时间蹲在我们的老店里，观察顾客的动线、拍照、记录。他们给出的方案完全超出了预期——把品牌"慢生活"的理念通过空间动线自然呈现出来，顾客进店后的行为路径都被精心设计过。开业后客流量翻了1.5倍，社交媒体上全是打卡照片。已经约了他们做第二家店。',
    highlight: '他们不是在做装修，是在帮我们讲品牌故事',
  },
  {
    name: '王总',
    project: '杭州西湖 · 精品民宿',
    avatar: '王',
    story: '老房子改民宿，限制特别多。很多设计师一看就说"这个做不了，那个要拆掉"。雅舍的设计师来了之后，反而对那些老墙、旧楼梯特别感兴趣。最后的设计把这些"限制"变成了民宿最大的特色——100年的老木梁留下来了，原来的天井改成了玻璃茶室，每个房间都保留了老建筑的一个记忆点。客人留言本上写得最多的就是"有温度"，我觉得这就是最好的评价。',
    highlight: '他们懂得尊重建筑本身的历史，把限制变成了特色',
  },
  {
    name: 'Sophia',
    project: '上海陆家嘴 · 科技公司总部办公室',
    avatar: 'S',
    story: '我们需要一个能吸引顶尖人才、又不像传统办公室的空间。雅舍提出了"城市客厅"的概念——把办公室设计成一个既有高效工作区、又有轻松社交区的复合空间。最让我意外的是他们对细节的执着：知道我们有20%的同事是左撇子，在公共区域专门设计了左手友好工位；观察到大家喜欢站着开短会，就在茶水间旁边做了可升降的讨论台。这些小细节让同事们真的愿意来办公室了。',
    highlight: '细节到左撇子同事的使用习惯都考虑到了',
  },
  {
    name: '周先生夫妇',
    project: '广州番禺 · 独栋别墅全案设计',
    avatar: '周',
    story: '这是我们第三次装修，前两次都不满意。这次找到雅舍，最大的不同是——他们给了我们一份"生活调研报告"，十几页，全是关于我们家庭生活习惯的分析。然后才出设计方案。整个过程很透明，每个阶段都有清晰的图纸和沟通，不像之前的设计师丢几张效果图就完事了。搬进来一年了，还是经常收到朋友羡慕的评论。最满意的是地下室——他们把采光井改成了一个下沉庭院，完美解决了地下室阴暗的问题。',
    highlight: '设计之前先做"生活调研报告"，而不仅仅是出效果图',
  },
]

function Services() {
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const [expandedReview, setExpandedReview] = useState<number | null>(null)

  const toggleService = (id: string) => {
    setExpandedService(expandedService === id ? null : id)
  }

  return (
    <main className="services-page">
      {/* Page Header */}
      <section className="svc-hero">
        <div className="svc-hero__overlay" />
        <div className="container svc-hero__content">
          <Link to="/" className="svc-hero__back">
            <ArrowLeft size={18} /> 返回首页
          </Link>
          <span className="svc-hero__tag">Services & Stories</span>
          <h1 className="svc-hero__title">服务与口碑</h1>
          <p className="svc-hero__subtitle">
            以专业服务创造价值，用真实口碑见证品质
          </p>
        </div>
      </section>

      {/* ===== 服务范围 ===== */}
      <section className="svc-services">
        <div className="container">
          <div className="svc-section-header">
            <span className="svc-section-header__tag">What We Do</span>
            <h2>服务范围</h2>
            <p>点击展开，了解每项服务的详细内容</p>
          </div>

          <div className="svc-accordion">
            {SERVICES.map((service) => {
              const isOpen = expandedService === service.id
              return (
                <div
                  key={service.id}
                  className={`svc-accordion__item ${isOpen ? 'svc-accordion__item--open' : ''}`}
                >
                  <button
                    className="svc-accordion__trigger"
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="svc-accordion__trigger-left">
                      <span className="svc-accordion__icon">{service.icon}</span>
                      <div className="svc-accordion__titles">
                        <h3>{service.title}</h3>
                        <span className="svc-accordion__en">{service.enTitle}</span>
                      </div>
                    </div>
                    <div className="svc-accordion__trigger-right">
                      <span className="svc-accordion__summary">{service.summary}</span>
                      <ChevronDown
                        size={20}
                        className={`svc-accordion__arrow ${isOpen ? 'svc-accordion__arrow--open' : ''}`}
                      />
                    </div>
                  </button>

                  <div className="svc-accordion__panel">
                    <p className="svc-accordion__intro">{service.detail.intro}</p>
                    <div className="svc-accordion__grid">
                      {service.detail.items.map((item) => (
                        <div key={item.name} className="svc-accordion__card">
                          <h4>{item.name}</h4>
                          <p>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="svc-accordion__process">
                      <span className="svc-accordion__process-label">服务流程</span>
                      <span className="svc-accordion__process-steps">{service.detail.process}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== 客户评价 ===== */}
      <section className="svc-reviews">
        <div className="container">
          <div className="svc-section-header">
            <span className="svc-section-header__tag">Testimonials</span>
            <h2>客户心声</h2>
            <p>每一个项目背后，都是一个被用心对待的故事</p>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((review, i) => {
              const isExpanded = expandedReview === i
              const storyPreview = review.story.length > 120
                ? review.story.slice(0, 120) + '...'
                : review.story

              return (
                <div
                  key={review.name}
                  className={`review-card ${isExpanded ? 'review-card--expanded' : ''}`}
                >
                  <div className="review-card__header">
                    <div className="review-card__avatar">{review.avatar}</div>
                    <div className="review-card__meta">
                      <h3>{review.name}</h3>
                      <span>{review.project}</span>
                    </div>
                    <Quote size={32} className="review-card__quote-icon" />
                  </div>

                  <div className="review-card__body">
                    <div className="review-card__stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#c9a96e" color="#c9a96e" />
                      ))}
                    </div>
                    <p className="review-card__story">
                      {isExpanded ? review.story : storyPreview}
                    </p>
                    {review.story.length > 120 && (
                      <button
                        className="review-card__toggle"
                        onClick={() => setExpandedReview(isExpanded ? null : i)}
                      >
                        {isExpanded ? '收起' : '阅读完整故事'}
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="review-card__highlight">
                      <span className="review-card__highlight-label">客户心声</span>
                      <p>"{review.highlight}"</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="svc-cta">
        <div className="container">
          <div className="svc-cta__card">
            <h2>准备好开启您的设计之旅了吗？</h2>
            <p>联系我们，预约一次免费的设计咨询</p>
            <Link to="/contact" className="svc-cta__btn">联络我们</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Services
