import { Link } from 'react-router-dom'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__col footer__col--brand">
              <Link to="/" className="footer__logo">
                <img src="/雅舍室内设计.png" alt="雅舍 Atelier des Miyabi" className="footer__logo-img" />
              </Link>
              <p className="footer__desc">
                依光而栖的艺术织者。<br />
                将时间、光影与日常生活温柔编织，<br />
                一场横跨东西方的美学对话。
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer__col">
              <h3 className="footer__heading">快速导航</h3>
              <ul className="footer__links">
                <li><Link to="/">首页</Link></li>
                <li><Link to="/about">关于我们</Link></li>
                <li><a href="#portfolio">设计作品</a></li>
                <li><a href="#services">服务范围</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer__col">
              <h3 className="footer__heading">联络我们</h3>
              <ul className="footer__contact-list">
                <li>
                  <Phone size={16} />
                  <span>400-000-0000</span>
                </li>
                <li>
                  <Mail size={16} />
                  <span>contact@yashe.design</span>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>广州市天河区珠江新城</span>
                </li>
              </ul>
            </div>

            {/* WeChat QR */}
            <div className="footer__col footer__col--qr">
              <h3 className="footer__heading">企业微信</h3>
              <div className="footer__qr-wrapper">
                <div className="footer__qr-placeholder">
                  <MessageCircle size={40} />
                </div>
                <span className="footer__qr-text">扫码咨询</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} Atelier des Miyabi 雅舍. All Rights Reserved.
          </p>
          <div className="footer__social-row">
            <a href="https://www.xiaohongshu.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="小红书">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5h-7v-7h7v7zm-3.5-9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
              </svg>
            </a>
            <a href="https://www.douyin.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="抖音">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.89a2.89 2.89 0 0 1-2.88 2.57 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.31 0 .61.05.89.14v-3.5a6.33 6.33 0 0 0-.89-.06A6.34 6.34 0 0 0 3 15.62a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.79a8.25 8.25 0 0 0 4.82 1.54v-3.5a4.78 4.78 0 0 1-.91-.14z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
