import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'About',        href: '#about' },
  { label: 'Prediction',   href: '#prediction' },
  { label: 'Services',     href: '#services' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact',      href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
        <div className="navbar__inner container">
          <a href="#home" className="navbar__logo" aria-label="Shree Ayush Saxena Vedic Astrologer">
            <svg className="navbar__logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="#c9a84c" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx="16" cy="16" r="11" stroke="#c9a84c" strokeWidth="1"/>
              <path d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z" fill="url(#logoGlow)"/>
              <circle cx="16" cy="16" r="4" fill="#0a0a1a" stroke="#c9a84c" strokeWidth="1"/>
              <defs>
                <radialGradient id="logoGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(14)">
                  <stop stopColor="#e8c97a" />
                  <stop offset="1" stopColor="#c9a84c" stopOpacity="0"/>
                </radialGradient>
              </defs>
            </svg>
            <span className="navbar__logo-text">
              Shree Ayush Saxena
              <small>Vedic Astrologer</small>
            </span>
          </a>

          <nav className={`navbar__nav${open ? ' navbar__nav--open' : ''}`} id="main-nav" role="navigation" aria-label="Main Navigation">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="navbar__link" onClick={close}>{l.label}</a>
            ))}
            <a href="#booking" className="btn-gold btn-gold-outline navbar__cta" onClick={close}>Book Session</a>
          </nav>

          <button
            className="navbar__hamburger"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Full-screen overlay on mobile */}
        {open && (
          <div className="navbar__overlay" onClick={close} aria-hidden="true" />
        )}
      </header>

      {/* Skip link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
    </>
  );
}
