import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './Projects.css'

const PROJECTS = [
  /* 幼儿园项目 */
  { image: '/幼儿园/课室正面.jpeg', title: '幼儿园', category: '教育空间', location: '香港 · 启德', area: '1200㎡', style: '自然成长', desc: '以儿童视角为设计原点，采用圆角、软包、天然木材，打造安全温暖的成长乐园。开放式课室布局促进互动与探索。' },
  { image: '/幼儿园/课室侧面.jpeg', title: '幼儿园活动区', category: '教育空间', location: '香港 · 启德', area: '180㎡', style: '趣味空间', desc: '灵活可变的模块化家具系统，让同一空间在课堂、游戏、午睡模式间自由切换。' },
  { image: '/幼儿园/閱讀室.jpeg', title: '幼儿园阅读室', category: '教育空间', location: '香港 · 启德', area: '80㎡', style: '趣味阅读', desc: '圆形下沉式阅读区搭配顶部天窗，自然光随时间变化在空间中流动，让阅读成为一种沉浸式体验。' },
  { image: '/幼儿园/书柜.jpeg', title: '幼儿园阅读角', category: '教育空间', location: '香港 · 启德', area: '40㎡', style: '自然原木', desc: '定制弧形书柜与阶梯式座位的结合，兼顾藏书功能与儿童攀爬、阅读的多元需求。' },
  { image: '/幼儿园/課室2.jpeg', title: '幼儿园教室', category: '教育空间', location: '香港 · 启德', area: '150㎡', style: '简约明亮', desc: '大面积落地窗引入自然光，配合柔和的间接照明，为儿童创建健康舒适的视觉环境。' },
  /* 中药铺项目 */
  { image: '/中药铺/中药铺3.jpeg', title: '中药铺', category: '商业空间', location: '香港 · 西环', area: '350㎡', style: '新中式', desc: '将百年中医药文化与现代零售空间融合，以木格栅、铜件和黄铜灯光传递传统匠心与现代审美的平衡。' },
  { image: '/中药铺/中药铺4.jpeg', title: '中药铺全景', category: '商业空间', location: '香港 · 西环', area: '350㎡', style: '新中式', desc: '百子柜的现代演绎——保留了抓药仪式感的同时，通过开放式布局让顾客亲眼见证每一味药材的选取。' },
  { image: '/中药铺/中藥鋪1.jpeg', title: '中药铺接待区', category: '商业空间', location: '香港 · 西环', area: '60㎡', style: '新中式', desc: '以温暖木色与石材的碰撞营造沉稳专业的入口印象，让传统药铺形象焕发新的生命力。' },
  { image: '/中药铺/中藥鋪2.jpeg', title: '中药铺调剂台', category: '商业空间', location: '香港 · 西环', area: '45㎡', style: '新中式', desc: '定制铜质调剂台搭配暖光吊灯，将功能性抓药区域转化为空间的视觉焦点。' },
  /* 教室项目 */
  { image: '/classroom/課室1.jpeg', title: '教室全景', category: '教育空间', location: '香港 · 九龙城', area: '200㎡', style: '童趣活泼', desc: '开阔通透的教室布局，让视线与动线自然流畅，兼顾讲授、讨论与自习的多元需求。' },
  { image: '/classroom/課室.jpeg', title: '培训教室', category: '教育空间', location: '香港 · 九龙城', area: '200㎡', style: '童趣活泼', desc: '以自然采光与柔和色系营造专注而舒适的课堂氛围，模块化布局支持多样化的教学场景。' },
  /* 家装项目 */
  { image: '/house/家裝.png', title: '住宅样', category: '住宅空间', location: '香港 · 半山', area: '180㎡', style: '轻奢雅致', desc: '以温暖的木色与柔和的灯光打造舒适的居家氛围，让日常生活回归放松与从容。' },
  { image: '/house/家裝2.jpeg', title: '住宅客厅', category: '住宅空间', location: '香港 · 半山', area: '60㎡', style: '轻奢雅致', desc: '开放式客厅布局串联起居、用餐与休闲，在功能与美感之间取得恰到好处的平衡。' },
  /* 实验室项目 */
  { image: '/lab/實驗室.jpeg', title: '实验室', category: '商业空间', location: '香港 · 九龙塘', area: '300㎡', style: '极简科研', desc: '以洁净明亮的材质与规范动线打造专业实验环境，兼顾安全、效率与视觉秩序。' },
  { image: '/lab/實驗室2.jpeg', title: '实验室全景', category: '商业空间', location: '香港 · 九龙塘', area: '300㎡', style: '极简科研', desc: '模块化台面与充足采光让实验流程一目了然，营造严谨而高效的工作氛围。' },
  /* 办公室项目 */
  { image: '/office/辦公室2.jpeg', title: '办公室', category: '办公空间', location: '香港 · 西营盘', area: '250㎡', style: '简约办公', desc: '温暖而专业的会客区域，以材质与光线的细腻处理塑造企业的品牌形象。' },
  { image: '/office/辦公室.jpeg', title: '办公室工位区', category: '办公空间', location: '香港 · 西营盘', area: '400㎡', style: '简约办公', desc: '以开放与半开放结合的布局促进协作，让办公空间既高效又充满活力。' },
]

function Projects() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const close = () => setLightbox(null)
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setLightbox((p) => (p! - 1 + PROJECTS.length) % PROJECTS.length) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setLightbox((p) => (p! + 1) % PROJECTS.length) }

  return (
    <main className="projects">
      <section className="proj-hero">
        <div className="proj-hero__overlay" />
        <div className="container proj-hero__content">
          <Link to="/" className="proj-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="proj-hero__tag">Portfolio</span>
          <h1>成功案例</h1>
          <p>每一个项目都是独一无二的作品，记录着我们对空间的理解与热爱</p>
        </div>
      </section>

      <section className="proj-grid-section">
        <div className="container">
          <div className="proj-grid">
            {PROJECTS.map((proj, i) => (
              <div key={proj.title} className="proj-card" onClick={() => setLightbox(i)}>
                <div className="proj-card__img">
                  <img src={proj.image} alt={proj.title} loading="lazy" />
                  <div className="proj-card__overlay"><span>查看详情</span></div>
                </div>
                <div className="proj-card__info">
                  <div className="proj-card__header">
                    <h3>{proj.title}</h3>
                    <span className="proj-card__cat">{proj.category}</span>
                  </div>
                  <div className="proj-card__meta">
                    <span>{proj.location}</span>
                    <span>{proj.area}</span>
                    <span>{proj.style}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="proj-lightbox" onClick={close}>
          <button className="proj-lightbox__close" onClick={close}><X size={28} /></button>
          <button className="proj-lightbox__prev" onClick={prev}><ChevronLeft size={40} /></button>
          <img src={PROJECTS[lightbox].image} alt={PROJECTS[lightbox].title} className="proj-lightbox__img" onClick={(e) => e.stopPropagation()} />
          <button className="proj-lightbox__next" onClick={next}><ChevronRight size={40} /></button>
          <div className="proj-lightbox__info">
            <h3>{PROJECTS[lightbox].title}</h3>
            <div className="proj-lightbox__tags">
              <span>{PROJECTS[lightbox].category}</span>
              <span>{PROJECTS[lightbox].location}</span>
              <span>{PROJECTS[lightbox].area}</span>
              <span>{PROJECTS[lightbox].style}</span>
            </div>
            <p>{PROJECTS[lightbox].desc}</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default Projects
