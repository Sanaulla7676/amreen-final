import { Link } from 'react-router-dom';
import { LiveBatchesPanel } from '../components/LiveBatchesPanel.tsx';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { COURSE_MODULES } from '../data/academyData.ts';

type CourseMode =
  | '40-day'
  | 'professional-makeup'
  | 'skin-aesthetics'
  | 'hair-styling'
  | 'bridal-artistry';

export function CourseDetailPage({ mode }: { mode: CourseMode }) {
  const { openEnquiryModal, siteSettings } = useFirebase();

  if (mode === '40-day') {
    const courseJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: siteSettings.courseName,
      description: `Single ${siteSettings.courseDays}-day integrated beauty course focused mainly on Skin & Aesthetics and Hair Styling services, with Makeup and Bridal finishing included.`,
      provider: {
        '@type': 'EducationalOrganization',
        name: "Amreen's Academy",
      },
      offers: {
        '@type': 'Offer',
        price: '30000',
        priceCurrency: 'INR',
      },
    };

    return (
      <>
        <SeoHead
          title={`${siteSettings.courseDays}-Day Skin, Hair & Makeup Course | Amreen's Academy`}
          description={`Complete ${siteSettings.courseDays}-day beauty training in Thanisandra, Bengaluru focused primarily on Skin & Hair salon services plus Makeup & Bridal. Fee ${siteSettings.courseFee} (${siteSettings.instalmentNote}).`}
          jsonLd={courseJsonLd}
        />

        <PageHero
          kicker={`SINGLE ${siteSettings.courseDays}-DAY INTEGRATED COURSE`}
          title={`${siteSettings.courseDays} days to master Skin, Hair & Makeup.`}
          subtitle={`One all-inclusive course focused mainly on salon Skin & Hair services, plus Makeup and Bridal finishing — ${siteSettings.courseFee} (${siteSettings.instalmentNote}).`}
          image="/assets/45-days-presenter.png"
          imageAlt={`Amreen's Academy ${siteSettings.courseDays} Days course presenter`}
        />

        <section className="content-section surface-light">
          <div className="page-container">
            <div className="section-intro">
              <p className="eyebrow">
                {siteSettings.courseDays}-DAY SKIN, HAIR &amp; MAKEUP SYLLABUS <span />
              </p>
              <h2>One single course covering all salon essentials</h2>
            </div>

            <div className="program-detail">
              <div className="program-detail__copy">
                <span className="mini-label">
                  ONE INTEGRATED COURSE · {siteSettings.courseDays} DAYS
                </span>
                <h3>{siteSettings.courseName}</h3>
                <p>
                  Our single {siteSettings.courseDays}-day curriculum prioritizes hands-on{' '}
                  <Link to="/skin-aesthetics" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                    Skin &amp; Aesthetics
                  </Link>{' '}
                  and{' '}
                  <Link to="/hair-styling" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                    Hair Styling &amp; Services
                  </Link>
                  —the highest-demand daily salon services—paired with{' '}
                  <Link to="/professional-makeup" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                    Makeup Artistry
                  </Link>{' '}
                  and{' '}
                  <Link to="/bridal-artistry" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                    Bridal Finishing
                  </Link>
                  .
                </p>
                <p>
                  Full course fee: {siteSettings.courseFee} ({siteSettings.instalmentNote}).
                  Graduates earn an official academy certificate searchable via{' '}
                  <Link to="/verify" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                    Verify Certificate
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => openEnquiryModal(siteSettings.courseName)}
                  className="button button-primary"
                >
                  Enquire &amp; Book Seat <span>→</span>
                </button>
              </div>
              <img
                src="/assets/45-days-presenter.png"
                alt={`Amreen's Academy ${siteSettings.courseDays} Days course presenter`}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="course-investment">
              <div>
                <span className="mini-label">FULL COURSE FEE</span>
                <strong>{siteSettings.courseFee}</strong>
                <p>
                  1 single course · Skin, Hair, Makeup &amp; Bridal · Online-verifiable certificate
                  on graduation
                </p>
              </div>
              <div className="installment-plan">
                <span>FLEXIBLE PAYMENT</span>
                <strong>{siteSettings.instalmentNote}</strong>
                <small>
                  Total {siteSettings.courseFee} · Confirm instalment milestone dates directly with our
                  counselor.
                </small>
              </div>
            </div>

            <div className="three-points">
              <div>
                <span>01</span>
                <h4>Master Skin &amp; Hair First</h4>
                <p>
                  Spend daily practical hours on facials, skin analysis, scalp prep, sectioning, and
                  salon hair styling.
                </p>
              </div>
              <div>
                <span>02</span>
                <h4>Add Makeup &amp; Bridal Finishing</h4>
                <p>
                  Combine clean skin prep and hairstyle architecture with studio &amp; bridal looks.
                </p>
              </div>
              <div>
                <span>03</span>
                <h4>Graduate Certified</h4>
                <p>
                  Complete assessment, collect your certificate, and verify it online for salon
                  employers.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <LiveBatchesPanel />
            </div>
          </div>
        </section>

        <section className="page-cta">
          <div>
            <p className="eyebrow">NEXT BATCH ADMISSIONS</p>
            <h2>Ready to join the {siteSettings.courseDays}-day batch?</h2>
            <p>
              Save your enquiry and chat with us directly on WhatsApp or review{' '}
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

  const course = COURSE_MODULES.find((item) => item.slug === mode) ?? COURSE_MODULES[0];

  return (
    <>
      <SeoHead
        title={`${course.title} Module (${siteSettings.courseDays}-Day Course) | Amreen's Academy`}
        description={`${course.tagline} Included inside Amreen's Academy single ${siteSettings.courseDays}-day beauty course (${siteSettings.courseFee}) in Thanisandra, Bengaluru.`}
      />

      <PageHero
        kicker={course.kicker}
        title={`${course.title}.`}
        subtitle={course.tagline}
        image={course.image}
        imageAlt={course.imageAlt}
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              MODULE OVERVIEW <span />
            </p>
            <h2>What you practise in {course.shortTitle}</h2>
          </div>

          <div className="course-detail-layout">
            <div>
              <h3>{course.tagline}</h3>
              <p>{course.detailParagraph}</p>
              <p className="quiet-note">
                This module is included inside our single {siteSettings.courseDays}-day{' '}
                <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
                  {siteSettings.courseName}
                </Link>{' '}
                — not a separate paid enrolment. Full fee is {siteSettings.courseFee} (
                {siteSettings.instalmentNote}).
              </p>
            </div>
            <div className="topic-panel">
              <span className="mini-label">INCLUDED TOPICS</span>
              <ul>
                {course.themes.map((theme) => (
                  <li key={theme}>
                    <span>✦</span>
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
            <Link className="button button-primary module-cta" to="/45-day-course">
              View the full {siteSettings.courseDays}-day course <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section surface-dark">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              EXPLORE THE OTHER MODULES <span />
            </p>
            <h2>Also included in the same {siteSettings.courseDays} days</h2>
          </div>
          <div className="question-grid">
            {COURSE_MODULES.filter((m) => m.slug !== course.slug).map((other) => (
              <div key={other.slug}>
                <h3>{other.title}</h3>
                <p>{other.tagline}</p>
                <Link
                  to={`/${other.slug}`}
                  style={{ display: 'inline-block', marginTop: 10, color: '#ff9eb9', fontWeight: 700, fontSize: 13 }}
                >
                  Open {other.shortTitle} module →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">ONE COMPLETE COURSE</p>
          <h2>Want to learn {course.shortTitle} in the next batch?</h2>
          <p>
            Talk to our counselor about timings, hands-on practice, and 3-instalment registration.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEnquiryModal(`${siteSettings.courseName} — ${course.shortTitle} focus`)}
          className="button button-primary"
        >
          Enquire Now <span>→</span>
        </button>
      </section>
    </>
  );
}
