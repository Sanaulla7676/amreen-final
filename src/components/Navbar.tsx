import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { ACADEMY_INFO } from '../data/academyData.ts';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/student-success', label: 'Student Success' },
  { to: '/blog', label: 'Blog' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const { openEnquiryModal } = useFirebase();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let rafId = 0;
    const updateScroll = () => {
      rafId = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setScrollPct(Number((pct * 100).toFixed(2)));
      setScrolled(window.scrollY > 24);
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${scrollPct}%` }} />
      </div>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="Amreen's Academy home">
            <img
              className="brand-emblem"
              src={ACADEMY_INFO.emblemUrl}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
            />
            <span className="brand-copy">
              <span className="brand-word">AMREEN&#39;S</span>
              <span className="brand-sub">A C A D E M Y</span>
            </span>
          </Link>

          <span className="brand-divider" aria-hidden="true" />

          <p className="brand-tagline">
            PROFESSIONAL
            <br />
            BEAUTY &amp; MAKEUP
            <br />
            EDUCATION
          </p>

          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="primary-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            className={`primary-nav${mobileOpen ? ' is-open' : ''}`}
            id="primary-nav"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-socials" aria-label="Social links">
            <a
              href={ACADEMY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r=".8" className="solid" />
              </svg>
            </a>
            <a
              href={ACADEMY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.9a8.2 8.2 0 1 1 16-3.4Z" />
                <path d="M8.1 7.9c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.5.6c-.2.2-.2.4 0 .6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.3.4.5 0 .4-.2 1.1-.6 1.4-.4.4-1 .6-1.6.5-1-.1-2.4-.7-3.7-1.9-1.1-1-2-2.3-2.2-3.3-.2-.8.1-1.5.5-2.1Z" />
              </svg>
            </a>
          </div>

          <button
            type="button"
            onClick={() => openEnquiryModal()}
            className="button button-primary header-cta"
          >
            Enquire Now <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>
    </>
  );
}
