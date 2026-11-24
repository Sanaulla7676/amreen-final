import { Link } from 'react-router-dom';
import { ACADEMY_INFO } from '../data/academyData.ts';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner">
        <Link className="brand footer-brand" to="/" aria-label="Amreen's Academy home">
          <img
            className="brand-emblem"
            src={ACADEMY_INFO.emblemUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <span className="brand-copy">
            <span className="brand-word">AMREEN&#39;S</span>
            <span className="brand-sub">A C A D E M Y</span>
          </span>
        </Link>

        <span className="footer-divider" aria-hidden="true" />

        <p className="footer-tagline">
          PROFESSIONAL
          <br />
          BEAUTY &amp; MAKEUP
          <br />
          EDUCATION
        </p>

        <div className="footer-links">
          <strong>Quick Links</strong>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/courses">Courses</Link>
        </div>

        <div className="footer-links">
          <strong>&nbsp;</strong>
          <Link to="/faculty">Faculty</Link>
          <Link to="/student-success">Student Success</Link>
          <Link to="/blog">Blog</Link>
        </div>

        <div className="footer-links">
          <strong>&nbsp;</strong>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/verify">Verify Certificate</Link>
        </div>

        <div className="footer-social">
          <strong>Connect With Us</strong>
          <div className="footer-social-icons">
            <a
              href={ACADEMY_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              ◎
            </a>
            <a
              href={ACADEMY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              ◉
            </a>
          </div>
        </div>
      </div>

      <div className="home-contact-strip">
        <span>{ACADEMY_INFO.shortLocation}</span>
        <a href={ACADEMY_INFO.phoneHref}>{ACADEMY_INFO.phoneDisplay}</a>
        <a href={ACADEMY_INFO.mapsSearchUrl} target="_blank" rel="noopener noreferrer">
          Get directions ↗
        </a>
        <Link to="/admin">Admin CRM</Link>
      </div>

      <p className="footer-bottom">© {year} Amreen&#39;s Academy. All rights reserved.</p>
    </footer>
  );
}
