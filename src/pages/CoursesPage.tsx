import { Link } from 'react-router-dom';
import { LiveBatchesPanel } from '../components/LiveBatchesPanel.tsx';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { COURSE_MODULES } from '../data/academyData.ts';

export function CoursesPage() {
  const { openEnquiryModal, siteSettings } = useFirebase();

  return (
    <>
      <SeoHead
        title={`Our ${siteSettings.courseDays}-Day Beauty Course (Skin, Hair & Makeup) | Amreen's Academy`}
        description={`One single ${siteSettings.courseDays}-day integrated beauty course focused mainly on Skin & Hair salon services plus Makeup & Bridal in Thanisandra, Bengaluru. Fee ${siteSettings.courseFee}.`}
      />

      <PageHero
        kicker={`ONE COMPLETE ${siteSettings.courseDays}-DAY COURSE`}
        title="One course. Skin, Hair, Makeup & Bridal."
        subtitle={`Focused mainly on practical salon Skin Care & Hair Styling services, plus Makeup and Bridal finishing — all in ${siteSettings.courseDays} days for ${siteSettings.courseFee}.`}
        image="https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/e8289e98-47af-4259-8215-5284a5caf398.png"
        imageAlt="Amreen's Academy trainer working on a beauty client"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              INCLUDED SYLLABUS MODULES <span />
            </p>
            <h2>Four modules taught inside one {siteSettings.courseDays}-day batch</h2>
          </div>

          <p className="section-lead">
            Amreen&#39;s Academy runs <strong>one single integrated {siteSettings.courseDays}-day course</strong>{' '}
            led by core daily salon{' '}
            <Link to="/skin-aesthetics" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Skin &amp; Aesthetics
            </Link>{' '}
            and{' '}
            <Link to="/hair-styling" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Hair Services
            </Link>{' '}
            training, alongside{' '}
            <Link to="/professional-makeup" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Makeup
            </Link>{' '}
            and{' '}
            <Link to="/bridal-artistry" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Bridal Artistry
            </Link>
            . Full fee: {siteSettings.courseFee} ({siteSettings.instalmentNote}).
          </p>

          <div className="page-course-grid">
            {COURSE_MODULES.map((course) => (
              <Link key={course.slug} className="page-course-card" to={`/${course.slug}`}>
                <div className="page-course-card__image">
                  <img
                    src={course.image}
                    alt={course.imageAlt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <span>{course.index}</span>
                </div>
                <div className="page-course-card__copy">
                  <span className="module-included">{course.kicker}</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <b>
                    View module topics <span>→</span>
                  </b>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <LiveBatchesPanel />
          </div>
        </div>
      </section>

      <section className="content-section surface-dark">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              SINGLE ALL-INCLUSIVE ENROLMENT <span />
            </p>
            <h2>Everything you need in {siteSettings.courseDays} days</h2>
          </div>

          <div className="featured-course">
            <div className="featured-course__copy">
              <span className="mini-label">NO SEPARATE COURSE FEES</span>
              <h3>{siteSettings.courseName}</h3>
              <p>
                Learn Skin &amp; Aesthetics, Hair Styling, Professional Makeup, and Bridal Artistry
                in one structured {siteSettings.courseDays}-day batch. Receive an official graduation
                certificate verifiable anytime on our{' '}
                <Link to="/verify" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                  Certificate Verification
                </Link>{' '}
                portal.
              </p>
              <div className="course-price-emphasis">
                <strong>{siteSettings.courseFee}</strong>
                <span>All-inclusive course fee</span>
                <b>{siteSettings.instalmentNote}</b>
              </div>
              <Link className="button button-primary" to="/45-day-course">
                View {siteSettings.courseDays}-day curriculum <span>→</span>
              </Link>
            </div>
            <img
              src="/assets/45-days-presenter.png"
              alt="Amreen's Academy presenter holding the 40 Days sign"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>Reserve your seat in the next {siteSettings.courseDays}-day batch.</h2>
          <p>
            Speak directly with our admissions counselor or inspect{' '}
            <Link to="/student-success" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
              student testimonials
            </Link>
            .
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
