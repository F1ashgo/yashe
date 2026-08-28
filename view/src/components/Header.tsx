import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Header.css'

const NAV_LINKS = [
  { label: '首页', path: '/' },
  { label: '关于我们', path: '/about' },
  { label: '服务范畴', path: '/services' },
  { label: '成功案例', path: '/projects' },
  { label: '会员中心', path: '/member' },
  { label: '社交媒体', path: '/social-media' },
  { label: '联络我们', path: '/contact' },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/雅舍室内设计.png" alt="雅舍 Atelier des Miyabi" className="header__logo-img" />
          <span className="header__logo-text">雅舍</span>
        </Link>
        {menuOpen && <button className="header__backdrop" aria-label="关闭导航" onClick={() => setMenuOpen(false)} />}
        <nav id="main-navigation" aria-label="主导航" className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="header__nav-item">
                <Link
                  to={link.path}
                  className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭导航' : '打开导航'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}

export default Header
