import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './Projects.css'

const PROJECTS = [
  /* 幼儿园项目 */
  { image: '/幼儿园/课室正面.jpeg', title: '蒙特梭利幼儿园', category: '教育空间', location: '广州 · 天河', area: '1200㎡', style: '自然成长', desc: '以儿童视角为设计原点，采用圆角、软包、天然木材，打造安全温暖的成长乐园。开放式课室布局促进互动与探索。' },
  { image: '/幼儿园/课室侧面.jpeg', title: '幼儿园活动区', category: '教育空间', location: '广州 · 天河', area: '180㎡', style: '趣味空间', desc: '灵活可变的模块化家具系统，让同一空间在课堂、游戏、午睡模式间自由切换。' },
  { image: '/幼儿园/閱讀室.jpeg', title: '幼儿园阅读室', category: '教育空间', location: '广州 · 天河', area: '80㎡', style: '趣味阅读', desc: '圆形下沉式阅读区搭配顶部天窗，自然光随时间变化在空间中流动，让阅读成为一种沉浸式体验。' },
  { image: '/幼儿园/书柜.jpeg', title: '幼儿园阅读角', category: '教育空间', location: '广州 · 天河', area: '40㎡', style: '自然原木', desc: '定制弧形书柜与阶梯式座位的结合，兼顾藏书功能与儿童攀爬、阅读的多元需求。' },
  { image: '/幼儿园/課室2.jpeg', title: '幼儿园教室', category: '教育空间', location: '广州 · 天河', area: '150㎡', style: '简约明亮', desc: '大面积落地窗引入自然光，配合柔和的间接照明，为儿童创建健康舒适的视觉环境。' },
  /* 中药铺项目 */
  { image: '/中药铺/中药铺3.jpeg', title: '同仁堂中药体验馆', category: '商业空间', location: '北京 · 前门', area: '350㎡', style: '新中式', desc: '将百年中医药文化与现代零售空间融合，以木格栅、铜件和黄铜灯光传递传统匠心与现代审美的平衡。' },
  { image: '/中药铺/中药铺4.jpeg', title: '中药铺全景', category: '商业空间', location: '北京 · 前门', area: '350㎡', style: '新中式', desc: '百子柜的现代演绎——保留了抓药仪式感的同时，通过开放式布局让顾客亲眼见证每一味药材的选取。' },
  { image: '/中药铺/中藥鋪1.jpeg', title: '中药铺接待区', category: '商业空间', location: '北京 · 前门', area: '60㎡', style: '新中式', desc: '以温暖木色与石材的碰撞营造沉稳专业的入口印象，让传统药铺形象焕发新的生命力。' },
  { image: '/中药铺/中藥鋪2.jpeg', title: '中药铺调剂台', category: '商业空间', location: '北京 · 前门', area: '45㎡', style: '新中式', desc: '定制铜质调剂台搭配暖光吊灯，将功能性抓药区域转化为空间的视觉焦点。' },
  /* Ice Bath 项目 */
  { image: '/ice bath/泳池正面.jpeg', title: 'Ice Bath 冷疗中心', category: '康体空间', location: '深圳 · 南山', area: '600㎡', style: '极简工业', desc: '以冷色调材质与暖光照明形成对比，为冷疗体验营造专业而不失温度的空间感受。' },
  { image: '/ice bath/泳池側面.jpeg', title: '泳池休闲区', category: '康体空间', location: '深圳 · 南山', area: '200㎡', style: '现代简约', desc: '室内恒温泳池与冷疗区的无缝衔接，形成完整的水疗体验闭环。' },
  { image: '/ice bath/咖啡厅.jpeg', title: 'Ice Bath 咖啡厅', category: '康体空间', location: '深圳 · 南山', area: '120㎡', style: '现代简约', desc: '冷疗后的温暖休憩空间，天然木材与柔软布艺的使用让身体和心灵同时得到放松。' },
  { image: '/ice bath/桑拿房正面.jpeg', title: '桑拿房', category: '康体空间', location: '深圳 · 南山', area: '50㎡', style: '北欧极简', desc: '芬兰云杉木墙面配合可控色温灯光系统，在高温中营造视觉与触觉的双重舒适。' },
  { image: '/ice bath/休息區1.jpeg', title: '冷疗休息区', category: '康体空间', location: '深圳 · 南山', area: '80㎡', style: '极简工业', desc: '冷暖材质的对比碰撞——冷峻的混凝土墙面搭配温暖的羊毛毯与皮质沙发，创造独特的停留体验。' },
  { image: '/ice bath/淋浴正面.jpeg', title: '淋浴更衣区', category: '康体空间', location: '深圳 · 南山', area: '90㎡', style: '极简工业', desc: '哑光黑不锈钢与无缝石材台面的结合，简洁利落的线条中暗藏人性化的细节设计。' },
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
