import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import './Header.css'

const NAV_LINKS = [
  { label: '首页', path: '/' },
  { label: '关于我们', path: '/about' },
  { label: '设计作品', path: '#portfolio' },
  { label: '服务范围', path: '#services' },
  { label: '联络我们', path: '#contact' },
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

  const handleNavClick = (path: string) => {
    if (path.startsWith('#')) {
      const el = document.querySelector(path)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/雅舍室内设计.png" alt="雅舍 Atelier des Miyabi" className="header__logo-img" />
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="header__nav-item">
                {link.path.startsWith('/') && !link.path.startsWith('/#') ? (
                  <Link
                    to={link.path}
                    className={`header__nav-link ${location.pathname === link.path ? 'header__nav-link--active' : ''}`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.path}
                    className="header__nav-link"
                    onClick={(e) => {
                      if (link.path.startsWith('#')) {
                        e.preventDefault()
                        handleNavClick(link.path)
                      }
                    }}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button
          className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}

export default Header
