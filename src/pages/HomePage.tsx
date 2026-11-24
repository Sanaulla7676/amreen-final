import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import {
  ACADEMY_INFO,
  COURSE_MODULES,
  INSTAGRAM_REELS,
  STUDENT_MOMENTS,
  STUDIO_FRAMES_REEL,
  WHY_CHOOSE_PILLARS,
} from '../data/academyData.ts';

const CONFETTI_PALETTE = [
  '#f7d68a',
  '#ef4f7c',
  '#ffffff',
  '#9fc8f4',
  '#b21a4a',
  '#f4a1ba',
  '#e8c18a',
];

const FRAME_CLASSES = Array.from({ length: 18 }, (_, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  return `frame-${num}`;
});

const WHY_ICONS = [
  <svg key="01" viewBox="0 0 48 48">
    <path d="M6 17 24 7l18 10-18 10L6 17Z M12 21v10c7 7 17 7 24 0V21 M42 18v14" />
  </svg>,
  <svg key="02" viewBox="0 0 48 48">
    <circle cx="24" cy="13" r="7" />
    <circle cx="9" cy="20" r="5" />
    <circle cx="39" cy="20" r="5" />
    <path d="M10 41v-4a14 14 0 0 1 28 0v4H10Z M2 40v-4a8 8 0 0 1 8-8 M46 40v-4a8 8 0 0 0-8-8" />
  </svg>,
  <svg key="03" viewBox="0 0 48 48">
    <path d="M24 5 29 17l13 2-9.5 9.2 2.2 13L24 35l-10.7 6.2 2.2-13L6 19l13-2 5-12Z" />
    <path d="M17 24h14" />
  </svg>,
  <svg key="04" viewBox="0 0 48 48">
    <path d="M8 9h32v25H8z M14 39h20 M24 34v5 M16 17h16 M16 23h12 M16 29h8" />
  </svg>,
  <svg key="05" viewBox="0 0 48 48">
    <path d="M12 7h19l7 7v27H12z M31 7v8h7 M18 23h14 M18 29h14 M18 35h9" />
  </svg>,
  <svg key="06" viewBox="0 0 48 48">
    <path d="M7 39V9 M7 39h35 M13 32l8-9 7 4 11-15 M34 12h5v5" />
  </svg>,
];

export function HomePage() {
  const { siteSettings, testimonials } = useFirebase();
  const targetDays = Number(siteSettings.courseDays) || 40;
  const courseGridRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const hasCountedRef = useRef(false);

  const [displayCount, setDisplayCount] = useState(targetDays);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    setDisplayCount(targetDays);
  }, [targetDays]);

  const homeJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: ACADEMY_INFO.name,
      alternateName: ACADEMY_INFO.fullName,
      description: `Single integrated ${targetDays}-day beauty course focused mainly on Skin & Aesthetics and Hair Styling services, plus Makeup and Bridal finishing, in Thanisandra, Bengaluru.`,
      telephone: ACADEMY_INFO.phoneDisplay,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '#23, Bharath Nagar, Ashwath Nagar, 2nd Stage, Thanisandra Main Road',
        addressLocality: 'Bengaluru',
        addressRegion: 'Karnataka',
        postalCode: '560077',
        addressCountry: 'IN',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: siteSettings.courseName,
        itemListElement: [
          {
            '@type': 'Course',
            name: siteSettings.courseName,
            description: `One ${targetDays}-day hands-on salon beauty course focused mainly on Skin Care and Hair Styling services alongside Makeup & Bridal Artistry.`,
            offers: {
              '@type': 'Offer',
              price: '30000',
              priceCurrency: 'INR',
            },
          },
        ],
      },
    }),
    [siteSettings.courseName, targetDays]
  );

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 34 + (i % 4) * 0.11;
        const distance = 55 + (i % 7) * 13;
        const spin = `${180 + (i % 5) * 120}deg`;
        return {
          '--start-x': `${35 + (i % 5) * 7}%`,
          '--start-y': `${34 + (i % 4) * 6}%`,
          '--w': `${5 + (i % 4) * 2}px`,
          '--h': `${7 + (i % 3) * 3}px`,
          '--confetti': CONFETTI_PALETTE[i % CONFETTI_PALETTE.length],
          '--dx': `${Math.cos(angle) * distance}px`,
          '--dy': `${Math.sin(angle) * distance - 28}px`,
          '--spin': spin,
          '--rot': spin,
          '--delay': `${(i % 9) * 22}ms`,
        } as CSSProperties;
      }),
    []
  );

  function runCountUp(replay = false) {
    if (hasCountedRef.current && !replay) return;
    hasCountedRef.current = true;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplayCount(targetDays);
      return;
    }

    setCelebrating(false);
    setDisplayCount(0);
    const duration = replay ? 1250 : 1950;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayCount(Math.min(targetDays, Math.round(targetDays * eased)));
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        setDisplayCount(targetDays);
        setCelebrating(true);
        window.setTimeout(() => setCelebrating(false), 2600);
      }
    };

    window.requestAnimationFrame(tick);
  }

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || typeof IntersectionObserver === 'undefined') {
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runCountUp();
          observer.disconnect();
        }
      },
      { threshold: 0.32 }
    );

    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  function scrollCourseCards(direction: -1 | 1) {
    const grid = courseGridRef.current;
    if (!grid) return;
    const distance = Math.max(250, grid.clientWidth * 0.78) * direction;
    grid.scrollBy({ left: distance, behavior: 'smooth' });
  }

  function handleCardPointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tilt-x', `${(-y * 3.2).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(x * 3.2).toFixed(2)}deg`);
  }

  function handleCardPointerLeave(event: React.PointerEvent<HTMLAnchorElement>) {
    const el = event.currentTarget;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }

  const featuredReviews = testimonials.slice(0, 2);

  return (
    <>
      <SeoHead
        title={`Amreen's Academy | ${targetDays}-Day Skin, Hair & Makeup Course in Bengaluru`}
        description={`One single ${targetDays}-day beauty course focused mainly on Skin & Hair salon services plus Makeup & Bridal finishing in Thanisandra, Bengaluru. Fee ${siteSettings.courseFee} (${siteSettings.instalmentNote}).`}
        jsonLd={homeJsonLd}
      />

      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="hero-inner">
          <p className="hero-kicker">{siteSettings.announcementBanner}</p>
          <h1 id="hero-title" aria-label="Amreen's Academy">
            <span className="hero-title-mask">
              <span className="hero-title-word">AMREEN&#39;S</span>
            </span>
            <span className="hero-title-academy">ACADEMY</span>
          </h1>

          <img
            className="hero-figure"
            src="/assets/hero-seated-face-swapped.png"
            alt="Amreen's Academy hero portrait: a woman seated in a charcoal leather chair"
            referrerPolicy="no-referrer"
          />

          <div className="hero-copy">
            <span className="copy-rule" />
            <h2>{siteSettings.heroHeadline}</h2>
            <p>{siteSettings.heroSubheadline}</p>
            <div className="hero-stats" aria-label="Academy highlights">
              <div>
                <strong>{targetDays} Days</strong>
                <span>1 Single Course</span>
              </div>
              <i />
              <div>
                <strong>Skin &amp; Hair</strong>
                <span>Core Salon Focus</span>
              </div>
              <i />
              <div>
                <strong>{siteSettings.courseFee}</strong>
                <span>3 Instalments</span>
              </div>
            </div>
          </div>

          <p className="mobile-hero-phrase mobile-only" aria-label="Be you, be creative, be an artist">
            <span className="pill-endpoint" />
            Be you, be creative, be an artist
            <span className="pill-endpoint" />
          </p>
          <p className="mobile-hero-quote mobile-only">Creativity is intelligence having fun.</p>
          <div className="mobile-hero-pagination mobile-only" aria-hidden="true">
            <i className="is-active" />
            <i />
            <i />
          </div>
        </div>

        <div className="hero-bottom-swoosh" aria-hidden="true" />
      </section>

      <section className="courses-section light-section" id="courses" aria-labelledby="courses-title">
        <div className="section-container">
          <div className="section-heading courses-heading">
            <div>
              <p className="eyebrow">
                ONE SINGLE {targetDays}-DAY INTEGRATED COURSE <span />
              </p>
              <h2 id="courses-title">
                Skin &amp; Hair First. <em>One Complete Course.</em>
              </h2>
              <p className="courses-intro">
                We teach one complete {targetDays}-day course focused mainly on everyday salon Skin
                Care &amp; Hair Styling services, with Makeup and Bridal finishing included — not
                four separate paid courses.
              </p>
            </div>
            <Link className="courses-heading-link" to="/45-day-course">
              View the {targetDays}-day syllabus <span aria-hidden="true">↗</span>
            </Link>
            <div className="mobile-course-controls mobile-only" aria-label="Course carousel controls">
              <button
                type="button"
                aria-label="Scroll courses left"
                onClick={() => scrollCourseCards(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Scroll courses right"
                onClick={() => scrollCourseCards(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="course-grid course-grid-expanded" id="course-grid" ref={courseGridRef}>
            {COURSE_MODULES.map((course) => (
              <Link
                key={course.slug}
                className="course-card course-card-expanded"
                to={`/${course.slug}`}
                aria-label={`Explore ${course.title}, included in the ${targetDays}-day course`}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                <div className={`course-card-media course-card-photo ${course.mediaClass}`}>
                  <img
                    src={course.image}
                    alt={course.imageAlt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <span className="course-card-index">{course.index}</span>
                  <span className="course-card-media-caption">{course.kicker}</span>
                </div>
                <div className="course-card-body">
                  <span className="course-card-kicker">MODULE {course.index} · INCLUDED</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <ul>
                    {course.themes.map((theme) => (
                      <li key={theme}>{theme}</li>
                    ))}
                  </ul>
                  <span className="course-card-link">
                    Explore module syllabus <b aria-hidden="true">↗</b>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="course-program-note">
            <div className="course-program-note-copy">
              <span className="course-program-note-kicker">ALL 4 AREAS IN 1 ENROLMENT</span>
              <h3>{siteSettings.courseName}</h3>
              <h4
                style={{
                  margin: '4px 0 6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#f3a9bf',
                  letterSpacing: '0.02em',
                }}
              >
                Main focus: Skin &amp; Aesthetics + Hair Styling · Makeup &amp; Bridal included
              </h4>
              <p>
                Every student completes all four practical modules in {targetDays} days — no extra
                fees or upsells.{' '}
                <Link to="/verify" style={{ color: '#ffb4c8', textDecoration: 'underline' }}>
                  Certificate verifiable online
                </Link>
                .
              </p>
            </div>
            <div className="course-program-note-metrics">
              <div>
                <strong>{targetDays}</strong>
                <span>DAYS</span>
              </div>
              <div>
                <strong>{siteSettings.courseFee}</strong>
                <span>FULL COURSE FEE</span>
              </div>
              <div>
                <strong>3</strong>
                <span>{siteSettings.instalmentNote.toUpperCase()}</span>
              </div>
            </div>
            <Link className="button button-primary course-program-note-cta" to="/45-day-course">
              View full {targetDays}-day details <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="fine-wave" aria-hidden="true" />
      </section>

      <section className="career-section" id="career" aria-labelledby="career-title">
        <div className="career-inner">
          <div className="career-heading">
            <p>
              Turn Your Passion for
              <br />
              Beauty into a
            </p>
            <h2 id="career-title">
              PROFESSIONAL
              <br />
              CAREER
            </h2>
            <span className="pink-swipe" aria-hidden="true" />
          </div>

          <div className="career-description">
            <span className="vertical-rule" aria-hidden="true" />
            <p>
              Industry-focused training that builds real skills, confidence and a successful career
              in the beauty &amp; makeup industry.
            </p>
          </div>

          <div className="benefit-list">
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="m8.1 8.1 12 12M8.1 15.9l12-12" />
                </svg>
              </span>
              <div>
                <strong>Hands-on Practice</strong>
                <small>Train with real tools &amp; techniques</small>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="m2 9 10-5 10 5-10 5L2 9Z" />
                  <path d="M6 11v5c4 3 8 3 12 0v-5M22 9v6" />
                </svg>
              </span>
              <div>
                <strong>Expert Mentorship</strong>
                <small>Learn from industry professionals</small>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <rect x="3" y="8" width="18" height="13" rx="2" />
                  <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 13h18M9 14l2 2 4-4" />
                </svg>
              </span>
              <div>
                <strong>Career Support</strong>
                <small>Guidance to grow and get placed</small>
              </div>
            </div>
          </div>

          <div className="mobile-benefit-strip mobile-only" aria-label="Academy benefits">
            <div className="mobile-benefit-item">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="M24 4 44 18 24 44 4 18 24 4Z M4 18h40 M15 18l9 26 9-26 M15 18l9-14 9 14" />
              </svg>
              <span>
                Hands-on
                <br />
                Training
              </span>
            </div>
            <div className="mobile-benefit-item">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="13" r="7" />
                <circle cx="9" cy="19" r="5" />
                <circle cx="39" cy="19" r="5" />
                <path d="M10 41v-4a14 14 0 0 1 28 0v4H10Z M2 40v-4a8 8 0 0 1 8-8 M46 40v-4a8 8 0 0 0-8-8" />
              </svg>
              <span>
                Experienced
                <br />
                Trainers
              </span>
            </div>
            <div className="mobile-benefit-item">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="m24 5 19 9-19 9-19-9 19-9Z M5 24l19 9 19-9 M5 34l19 9 19-9" />
              </svg>
              <span>
                Industry-Relevant
                <br />
                Curriculum
              </span>
            </div>
            <div className="mobile-benefit-item">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="m24 4 6 13 14 2-10 10 2 15-12-7-12 7 2-15L4 19l14-2 6-13Z" />
              </svg>
              <span>
                Professional Skill
                <br />
                Development
              </span>
            </div>
          </div>

          <img
            className="career-mentor"
            src="/assets/career-mentor-folded-arms.png"
            alt="Smiling Amreen's Academy team member in the academy maroon uniform"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <section className="academy-section light-section" id="academy" aria-labelledby="academy-title">
        <div className="academy-row section-container">
          <div className="academy-photo-wrap">
            <img
              src="/assets/academy-studio.jpg"
              alt="Amreen's Academy beauty training studio with illuminated makeup mirrors"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="academy-copy">
            <span className="copy-accent" aria-hidden="true" />
            <h2 id="academy-title">
              A Creative Space
              <br />
              for Beauty Education
            </h2>
            <p>
              A professional learning environment designed to nurture your creativity, enhance your
              skills and prepare you for a successful career.
            </p>
          </div>
        </div>
      </section>

      <section className="why-section light-section" id="why-choose" aria-labelledby="why-title">
        <div className="section-container">
          <div className="why-heading">
            <p className="eyebrow">
              THE AMREEN&#39;S ACADEMY APPROACH <span />
            </p>
            <h2 id="why-title">
              Why Choose <em>Amreen&#39;s Academy?</em>
            </h2>
            <p>
              Learn with a focus on practical technique, thoughtful service and the four connected
              areas of the integrated Beauty &amp; Makeup program.
            </p>
          </div>

          <div className="why-grid">
            {WHY_CHOOSE_PILLARS.map((item, idx) => (
              <article key={item.number} className="why-item">
                <span className="why-item-icon" aria-hidden="true">
                  {WHY_ICONS[idx % WHY_ICONS.length]}
                </span>
                <span className="why-item-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
        <span className="why-motion-orb why-motion-orb-one" aria-hidden="true" />
        <span className="why-motion-orb why-motion-orb-two" aria-hidden="true" />
      </section>

      <section className="student-section light-section" id="student-work" aria-labelledby="student-title">
        <div className="section-container">
          <div className="student-heading">
            <h2 id="student-title">
              Student Learning Moments <span />
            </h2>
            <Link to="/student-success">
              View More <b aria-hidden="true">→</b>
            </Link>
          </div>

          <div className="student-grid">
            {STUDENT_MOMENTS.map((item) => (
              <figure key={item.src}>
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="review-strip" aria-labelledby="review-title">
        <div className="review-strip__inner">
          <div className="review-strip__lead">
            <p className="mini-label">STUDENT TESTIMONIALS &amp; GOOGLE RATING</p>
            <h2 id="review-title">Real student proof, close to home.</h2>
            <div className="google-score">
              <strong>5.0</strong>
              <span>★★★★★</span>
              <small>Verified 5★ Google reviews · Thanisandra</small>
            </div>
            <h6
              style={{
                margin: '10px 0 0',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <Link to="/student-success" style={{ color: '#ffb4c8', textDecoration: 'underline' }}>
                See all testimonials
              </Link>{' '}
              ·{' '}
              <Link to="/verify" style={{ color: '#ffb4c8', textDecoration: 'underline' }}>
                Verify certificate
              </Link>
            </h6>
          </div>

          <div className="review-quote-grid">
            {featuredReviews.map((review) => (
              <blockquote key={review.id}>
                <span>“</span>
                <p>{review.quote}</p>
                <h5
                  style={{
                    margin: '6px 0 2px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#ffb4c8',
                  }}
                >
                  {review.studentName} · {review.focusArea}
                </h5>
                <cite>{review.batchLabel}</cite>
              </blockquote>
            ))}
          </div>

          <a
            className="review-map-link"
            href={ACADEMY_INFO.mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View live Google listing ↗
          </a>
        </div>
      </section>

      <section className="program-section" id="course-program" aria-labelledby="program-title">
        <div
          ref={bannerRef}
          className={`program-banner${celebrating ? ' is-celebrating' : ''}`}
        >
          <div className="program-copy">
            <span className="program-mark" aria-hidden="true" />
            <h2 id="program-title">
              Single {targetDays}-Day
              <br />
              Skin, Hair &amp; Makeup Course
            </h2>
            <p>
              One integrated {targetDays}-day batch focused primarily on Skin &amp; Aesthetics and
              Hair Styling services, plus Makeup and Bridal finishing.
            </p>
            <div className="program-facts">
              <span>✓ Skin &amp; Hair core focus</span>
              <span>✓ Verified graduation certificate</span>
            </div>
            <div className="program-price-line">
              <strong>{siteSettings.courseFee}</strong>
              <span>Full course fee</span>
              <span>{siteSettings.instalmentNote}</span>
            </div>
            <Link className="button button-primary" to="/45-day-course">
              Explore the {targetDays}-Day Course <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="program-ribbon" aria-hidden="true" />

          <div className="program-presenter-wrap">
            <img
              className="program-presenter"
              src="/assets/45-days-presenter.png"
              alt="Amreen's Academy team member holding the 40 Days sign"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <button
              className="animated-number-panel"
              type="button"
              aria-label="Replay the 40-day number animation"
              onClick={() => runCountUp(true)}
            >
              <span className="program-count" aria-live="off">
                {displayCount}
              </span>
            </button>
            <span className="celebration-emoji" aria-hidden="true">
              🎉
            </span>
          </div>

          <div className="confetti-burst" aria-hidden="true">
            {confettiPieces.map((style, idx) => (
              <span key={idx} className="confetti-bit" style={style} />
            ))}
          </div>
        </div>
      </section>

      <section className="academy-films" id="inside-academy" aria-labelledby="films-title">
        <div className="films-orb films-orb-one" aria-hidden="true" />
        <div className="films-shell">
          <div className="films-heading">
            <p className="film-kicker">
              BEHIND THE SKILLS <span /> INSIDE THE ACADEMY
            </p>
            <h2 id="films-title">
              Real learning. <em>Real moments.</em>
            </h2>
            <p>
              A frame-by-frame look inside certificate celebrations and hands-on classroom learning
              at the academy.
            </p>
          </div>

          <div className="academy-scatter" aria-label="Scattered carousel of frames from academy videos">
            <span className="scatter-motion-orbit scatter-motion-orbit-one" aria-hidden="true" />
            <span className="scatter-motion-orbit scatter-motion-orbit-two" aria-hidden="true" />
            <span className="scatter-motion-spark scatter-motion-spark-one" aria-hidden="true" />
            <span className="scatter-motion-spark scatter-motion-spark-two" aria-hidden="true" />

            <div className="academy-scatter-viewport">
              <div className="academy-scatter-track">
                <div className="academy-scatter-group">
                  {STUDIO_FRAMES_REEL.map((frame, i) => (
                    <a
                      key={frame.src}
                      className={`academy-scatter-frame ${FRAME_CLASSES[i]}`}
                      href={frame.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open full-size image: ${frame.alt}`}
                    >
                      <img
                        src={frame.src}
                        alt={frame.alt}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <span className="academy-frame-glint" aria-hidden="true" />
                    </a>
                  ))}
                </div>

                <div className="academy-scatter-group" aria-hidden="true">
                  {STUDIO_FRAMES_REEL.map((frame, i) => (
                    <a
                      key={`dup-${frame.src}`}
                      className={`academy-scatter-frame ${FRAME_CLASSES[i]}`}
                      href={frame.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open full-size image: ${frame.alt}`}
                      tabIndex={-1}
                    >
                      <img
                        src={frame.src}
                        alt={frame.alt}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <span className="academy-frame-glint" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="films-footer">
            <span>MORE FROM THE STUDIO</span>
            <a href={ACADEMY_INFO.instagramUrl} target="_blank" rel="noopener noreferrer">
              Follow {ACADEMY_INFO.instagramHandle} <b>↗</b>
            </a>
          </div>

          <div className="instagram-reels-panel" id="instagram-reels">
            <div className="instagram-reels-copy">
              <span className="mini-label">LATEST FROM INSTAGRAM</span>
              <h3>Recent Reels from Amreen.</h3>
              <p>
                Amreen&#39;s latest Instagram videos, moving continuously from left to right. Click
                any video to open that Reel on Instagram.
              </p>
              <a
                className="instagram-profile-link"
                href={ACADEMY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Instagram Profile ↗
              </a>
            </div>
          </div>

          <div
            className="instagram-marquee"
            role="region"
            aria-label="Continuously moving recent Instagram videos"
          >
            <div className="instagram-marquee-track">
              <div className="instagram-marquee-group">
                {INSTAGRAM_REELS.map((reel) => (
                  <a
                    key={reel.id}
                    className="instagram-marquee-item"
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open Amreen's Instagram Reel from ${reel.date}`}
                  >
                    <iframe
                      src={reel.embedUrl}
                      title={reel.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      scrolling="no"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
              <div className="instagram-marquee-group" aria-hidden="true">
                {INSTAGRAM_REELS.map((reel) => (
                  <a
                    key={`dup-${reel.id}`}
                    className="instagram-marquee-item"
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open Amreen's Instagram Reel from ${reel.date}`}
                    tabIndex={-1}
                  >
                    <iframe
                      src={reel.embedUrl}
                      title={reel.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      scrolling="no"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <p className="instagram-reels-note">
            Select any moving video to watch the original Reel on Instagram.
          </p>
        </div>
      </section>
    </>
  );
}
