import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { ACADEMY_INFO, STUDENT_MOMENTS } from '../data/academyData.ts';

export function StudentSuccessPage() {
  const { openEnquiryModal, testimonials, siteSettings } = useFirebase();

  return (
    <>
      <SeoHead
        title="Student Success & Testimonials | Amreen's Academy Bengaluru"
        description="Read verified student testimonials and view graduation moments from Amreen's Academy 40-day Skin, Hair & Makeup course in Thanisandra, Bengaluru."
      />

      <PageHero
        kicker="STUDENT PROOF & TESTIMONIALS"
        title="Graduates trained for real salon careers."
        subtitle="Explore student practice moments, certificate graduations, and honest feedback from our 40-day batches."
        image="/assets/academy-frames/certificate-03.jpg"
        imageAlt="Amreen's Academy students celebrating on graduation certificate day"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              STUDENT REVIEWS <span />
            </p>
            <h2>What our beauty graduates say</h2>
          </div>

          <p className="section-lead">
            Hear directly from students who completed our{' '}
            <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              single {siteSettings.courseDays}-day Skin, Hair &amp; Makeup course
            </Link>
            . Every graduate receives an official ID that anyone can{' '}
            <Link to="/verify" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              verify online
            </Link>
            .
          </p>

          <div className="article-grid mb-12">
            {testimonials.map((item) => (
              <article key={item.id} className="article-card">
                <span className="article-category" style={{ color: '#8c1539' }}>
                  {'★'.repeat(Math.max(1, Math.min(5, item.rating)))} · {item.focusArea.toUpperCase()}
                </span>
                <h3 style={{ marginTop: 10 }}>{item.studentName}</h3>
                <p style={{ color: '#334155', fontSize: 13.5, lineHeight: 1.65 }}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                <h4 style={{ margin: '10px 0 0', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {item.batchLabel}
                </h4>
              </article>
            ))}
          </div>

          <div className="section-intro">
            <p className="eyebrow">
              PRACTICE &amp; GRADUATION MOMENTS <span />
            </p>
            <h2>Inside our Thanisandra batches</h2>
          </div>

          <div className="portfolio-grid">
            {STUDENT_MOMENTS.map((item) => (
              <figure key={item.src} className="portfolio-item">
                <img src={item.src} alt={item.alt} loading="lazy" referrerPolicy="no-referrer" />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className="social-follow">
            <div>
              <span className="mini-label">FOLLOW THE LATEST WORK</span>
              <h3>More looks, lessons and studio moments.</h3>
              <p>See our Instagram profile for current batch reels, student skin &amp; hair practice, and updates.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="button button-outline" to="/verify">
                Verify a Certificate <span>→</span>
              </Link>
              <a
                className="button button-primary"
                href={ACADEMY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Instagram <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">NEXT BATCH ADMISSIONS</p>
          <h2>Start your {siteSettings.courseDays}-day Skin &amp; Hair journey.</h2>
          <p>
            Fee {siteSettings.courseFee} ({siteSettings.instalmentNote}). Enquire for the next
            batch schedule.
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
