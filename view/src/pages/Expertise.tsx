import { Link } from 'react-router-dom'
import { ArrowLeft, Ruler, Lightbulb, Trees, PaintBucket, Cog, ShieldCheck } from 'lucide-react'
import './Expertise.css'

const CAPABILITIES = [
  {
    icon: <Ruler size={30} />,
    title: '空间规划与动线设计',
    en: 'Spatial Planning',
    desc: '基于人体工学与行为心理学，科学规划空间布局，优化功能动线，让每一平方米都发挥最大价值。',
    points: ['家庭生命周期空间预留', '动静分区与私密层级设计', '无障碍与适老化设计'],
  },
  {
    icon: <Lightbulb size={30} />,
    title: '光影系统设计',
    en: 'Lighting Design',
    desc: '自然光与人工照明的精密配合，以层次分明的灯光方案塑造空间的情绪、节奏与温度。',
    points: ['自然采光分析与优化', '场景化智能灯光编程', '重点照明与氛围光设计'],
  },
  {
    icon: <PaintBucket size={30} />,
    title: '材质与色彩体系',
    en: 'Material & Color',
    desc: '建立完整的材质与色彩逻辑体系，确保空间从硬装到软装的视觉连贯性与触感一致性。',
    points: ['材质触感与耐久性评估', '色彩心理学应用', '全球高端材料供应链'],
  },
  {
    icon: <Trees size={30} />,
    title: '室内景观融合',
    en: 'Indoor Landscape',
    desc: '将自然元素引入室内，打破建筑与自然的边界，创造会呼吸的健康居住环境。',
    points: ['室内垂直绿化系统', '室内外视觉延伸设计', '微气候调节与空气质量管理'],
  },
  {
    icon: <Cog size={30} />,
    title: '智能家居集成',
    en: 'Smart Home',
    desc: '将智能科技隐形于设计之中，在保持空间美感的同时，实现全屋智能化的便捷生活体验。',
    points: ['全屋智能系统规划', '隐蔽式设备安装方案', '未来技术扩展预留设计'],
  },
  {
    icon: <ShieldCheck size={30} />,
    title: '品质管控体系',
    en: 'Quality Control',
    desc: '从图纸到落地的全流程品质管控，确保设计方案与最终呈现的零偏差。',
    points: ['6级设计审核制度', '施工节点验收标准', '环保材料认证体系'],
  },
]

const PROCESS_STEPS = [
  { step: '01', title: '需求深访', desc: '深入了解您的生活习惯、审美偏好与功能需求，建立设计简报。' },
  { step: '02', title: '概念方案', desc: '提出 2-3 套概念方案，通过 mood board 确定空间风格与调性方向。' },
  { step: '03', title: '深化设计', desc: '全套施工图纸绘制，包含平面、立面、节点大样、机电点位等。' },
  { step: '04', title: '软装配置', desc: '家具、灯具、布艺、艺术品等软装选型与定制，出具软装清单。' },
  { step: '05', title: '施工监理', desc: '关键节点现场验收，确保施工质量与设计图纸严格一致。' },
  { step: '06', title: '交付验收', desc: '全面验收与细节调整，交付完整的空间使用手册与维护指南。' },
]

function Expertise() {
  return (
    <main className="expertise">
      <section className="exp-hero">
        <div className="exp-hero__overlay" />
        <div className="container exp-hero__content">
          <Link to="/" className="exp-hero__back"><ArrowLeft size={18} /> 返回首页</Link>
          <span className="exp-hero__tag">Professional Capabilities</span>
          <h1>专业能力</h1>
          <p>十年沉淀，六大核心能力，为每一个项目保驾护航</p>
        </div>
      </section>

      {/* 六大能力卡片 */}
      <section className="exp-capabilities">
        <div className="container">
          <div className="capabilities-grid">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="cap-card">
                <div className="cap-card__icon">{cap.icon}</div>
                <h3>{cap.title}</h3>
                <span className="cap-card__en">{cap.en}</span>
                <p className="cap-card__desc">{cap.desc}</p>
                <ul className="cap-card__points">
                  {cap.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 服务流程 */}
      <section className="exp-process">
        <div className="container">
          <div className="exp-process__header">
            <span>Workflow</span>
            <h2>服务流程</h2>
            <p>严谨的六步流程，确保每一个项目从构想到落地都精准可控</p>
          </div>
          <div className="process-steps">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="process-step">
                <span className="process-step__num">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Expertise
