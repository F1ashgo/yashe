import { ArrowRight } from 'lucide-react'
import './CompanyStory.css'

export default function CompanyStory() {
  return (
    <>
      <section className="company-background">
        <div className="container">
          <div className="company-section-heading company-section-heading--background">
            <span>Company Background</span>
            <h2>公司背景</h2>
            <p>从真实的工程实践出发，建立理性与感性并存的设计方法</p>
          </div>

          <article className="company-story company-story--origin">
            <header className="company-story__header">
              <span className="company-story__index">01</span>
              <div>
                <span className="company-story__en">Origin</span>
                <h3>原点 · 始于对真实的敬畏</h3>
              </div>
            </header>
            <div className="company-story__body company-story__body--origin">
              <p>
                雅舍设计（Atelier des Miyabi）作为 Chun King Limited 在内地的专业室内设计分部，
                两家公司皆由同一位创始人掌舵，共享着同一个美学灵魂与对品质的执着。
                正因承袭了这份对品质的底气，雅舍的故事并非始于一张完美无瑕的渲染图，
                而是源于我们在深耕工程营造的岁月里，无数次直面过被现实环境击碎的「设计理想」。
                基于以往累积的丰富经验，我们深刻意识到：如果设计失去了对在地环境的考量与现实痛点的洞察，
                任何华丽的视觉表达都只是一场短暂的幻梦。真正的美，必须根植于真实，不为毫无意义的形式而设计，
                让空间在时间的洗练下依然保有耐久与从容。这，是雅舍出发的原点。
              </p>
              <p>
                雅舍的故事，并非始于一张完美无瑕的渲染图，而是源于我们在深耕工程营造的岁月里，
                无数次面对过被现实环境击碎的「设计理想」。基于以往累积的丰富经验，我们深刻意识到，
                如果设计失去了对在地环境的考量与现实痛点的洞察，任何华丽的视觉表达都只是一场短暂的幻梦。
                真正的美，必须根植于真实，不为毫无意义的形式而设计，让空间在时间的洗练下依然保有耐久与从容。
                这，是雅舍出发的原点。
              </p>
            </div>
          </article>

          <div className="company-story__chapters">
            <article className="company-story">
              <header className="company-story__header">
                <span className="company-story__index">02</span>
                <div>
                  <span className="company-story__en">Symbiosis</span>
                  <h3>共生 · 理性构建与感性表达的交织</h3>
                </div>
              </header>
              <div className="company-story__body">
                <p>
                  漫长的空间实践，让我们学会了如何在理性的结构中寻找感性的诗意。
                  我们选择纯粹的设计者角色，将过往累积的实务经验，转化为理性的思维骨架。
                  我们乐意与您一同探索想象，但也始终保持着设计者的清醒与克制。
                  在隐蔽处考量、在细微处推敲，将每一处可能遇到的空间限制，温柔转化为精准的设计巧思。
                  对雅舍而言，这不仅仅是一份设计图纸的交付，更是一场关于生活细节的美学修行。
                </p>
              </div>
            </article>

            <article className="company-story">
              <header className="company-story__header">
                <span className="company-story__index">03</span>
                <div>
                  <span className="company-story__en">Mission</span>
                  <h3>使命 · 打造承载美好的时间容器</h3>
                </div>
              </header>
              <div className="company-story__body">
                <p>
                  将理性的严谨尺度融入感性的室内光影，雅舍始终留在纯粹的设计者定位。
                  我们以匠人心思，不只为您描绘空间的美学意境，更用细致的图纸为您的未来居所引路。
                  无论您未来将图纸交由哪一家优秀的施工单位，美学与想象都能顺畅、完整地融入您的真实生活之中。
                  雅舍愿与您一同出发，打破形式的束缚，用极致的专注，将每一处空间打造成一个不仅抵御岁月侵蚀，
                  更能容纳光影流转、故事发生与精神栖息的时间容器。
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="company-journey">
        <div className="container">
          <div className="company-section-heading">
            <span>Our Journey</span>
            <h2>发展历程</h2>
            <p>从工程现场的真实积累，到专业室内设计品牌的正式启航</p>
          </div>

          <div className="company-journey__line" aria-hidden="true" />
          <div className="company-journey__phases">
            <article className="journey-era">
              <div className="journey-era__year">
                <strong>2011</strong>
                <span>工程实践起点</span>
              </div>
              <span className="journey-era__index">01</span>
              <h3>工程实践阶段</h3>
              <p>
                创始团队于 2011 年进入工程营造领域，同年成立 Chun King Limited。
                长期的项目实践，使团队建立起对施工条件、材料特性、空间限制与设计落地的系统理解。
              </p>
            </article>
            <div className="journey-transition" aria-hidden="true">
              <span>工程经验沉淀</span>
              <ArrowRight size={24} />
            </div>
            <article className="journey-era journey-era--current">
              <div className="journey-era__year">
                <strong>2026</strong>
                <span>雅舍设计启航</span>
              </div>
              <span className="journey-era__index">02</span>
              <h3>设计品牌阶段</h3>
              <p>
                2026 年，雅舍设计正式成立并同步启动内地设计业务。
                我们将工程实践转化为设计判断，在美学表达、现实条件与落地精度之间建立清晰平衡。
              </p>
            </article>
          </div>
        </div>
      </section>

    </>
  )
}
