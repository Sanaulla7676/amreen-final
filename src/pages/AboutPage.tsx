import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { ACADEMY_INFO } from '../data/academyData.ts';

export function AboutPage() {
  const { openEnquiryModal, siteSettings } = useFirebase();

  return (
    <>
      <SeoHead
        title="About Amreen's Academy | 40-Day Skin, Hair & Makeup Training in Thanisandra"
        description={`Learn about Amreen's Academy in Thanisandra, Bengaluru — home to our single integrated ${siteSettings.courseDays}-day Skin, Hair & Makeup beauty course (${siteSettings.courseFee}).`}
      />

      <PageHero
        kicker="ABOUT THE ACADEMY"
        title="Where beauty skills become real salon careers."
        subtitle={`A focused studio in Thanisandra, Bengaluru teaching one practical ${siteSettings.courseDays}-day Skin, Hair, Makeup & Bridal course.`}
        image="/assets/academy-studio.jpg"
        imageAlt="Amreen's Academy training studio with illuminated makeup mirrors"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              ABOUT THE ACADEMY <span />
            </p>
            <h2>Hands-on beauty education centered on Skin &amp; Hair</h2>
          </div>

          <div className="split-feature">
            <div className="split-feature__image">
              <img
                src="/assets/academy-studio.jpg"
                alt="Beauty training studio with illuminated makeup mirrors"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="split-feature__copy">
              <h3>One clear {siteSettings.courseDays}-day course. Zero confusion.</h3>
              <p>
                Amreen&#39;s Academy runs one comprehensive {siteSettings.courseDays}-day program built
                primarily around practical{' '}
                <Link to="/skin-aesthetics" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
                  Skin &amp; Aesthetics
                </Link>{' '}
                and{' '}
                <Link to="/hair-styling" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
                  Hair Styling
                </Link>{' '}
                salon services — combined seamlessly with Makeup and Bridal finishing.
              </p>
              <p>
                Every student trains in small guided batches for {siteSettings.courseFee} ({siteSettings.instalmentNote}) and receives an official certificate verifiable on our{' '}
                <Link to="/verify" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
                  Certificate Registry
                </Link>
                .
              </p>
              <Link className="arrow-link" to="/45-day-course">
                Explore the {siteSettings.courseDays}-day course <span>→</span>
              </Link>
            </div>
          </div>

          <div className="value-grid">
            <article className="value-card">
              <span>01</span>
              <h3>Skin &amp; Hair First</h3>
              <p>Build daily commercial salon mastery in facials, clean-ups, scalp care, and hair setting.</p>
            </article>
            <article className="value-card">
              <span>02</span>
              <h3>Guided Practice</h3>
              <p>
                Learn through clear trainer demonstrations followed by daily hands-on repetition in studio lighting.
              </p>
            </article>
            <article className="value-card">
              <span>03</span>
              <h3>Career Ready</h3>
              <p>
                Graduate with a verifiable certificate and confidence for salons or freelance bookings. Read{' '}
                <Link to="/student-success" style={{ color: '#ff89a8', textDecoration: 'underline' }}>
                  student stories
                </Link>
                .
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="content-section surface-dark">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              FIND THE STUDIO <span />
            </p>
            <h2>Visit us on Thanisandra Main Road</h2>
          </div>

          <div className="contact-ribbon">
            <div>
              <span className="mini-label">THANISANDRA · BENGALURU</span>
              <h3>Visit Amreen&#39;s Academy</h3>
              <p>{ACADEMY_INFO.address}</p>
              <p>
                <a href={ACADEMY_INFO.phoneHref}>{ACADEMY_INFO.phoneDisplay}</a> ·{' '}
                <a href={ACADEMY_INFO.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram profile ↗
                </a>
              </p>
            </div>
            <a
              className="button button-primary"
              href={ACADEMY_INFO.mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">ONE COMPLETE COURSE</p>
          <h2>Start your {siteSettings.courseDays}-day Skin &amp; Hair journey.</h2>
          <p>
            Full course fee {siteSettings.courseFee} ({siteSettings.instalmentNote}). Book a studio visit or enquire today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEnquiryModal(siteSettings.courseName)}
          className="button button-primary"
        >
          Enquire Now <span>→</span>
        </button>
      </section>
    </>
  );
}
