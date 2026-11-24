import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { ENROLMENT_CHECKLIST, TEACHING_METHOD } from '../data/academyData.ts';

export function FacultyPage() {
  const { openEnquiryModal, siteSettings } = useFirebase();

  return (
    <>
      <SeoHead
        title="Faculty & Practical Teaching Method | Amreen's Academy Bengaluru"
        description="See how Amreen's Academy mentors students step-by-step in Skin Care, Hair Styling, Makeup & Bridal during the 40-day Bengaluru beauty course."
      />

      <PageHero
        kicker="FACULTY & MENTORSHIP"
        title="Step-by-step salon mentorship."
        subtitle="Learn Skin Care, Hair Styling, Makeup & Bridal through clear demonstrations, supervised daily practice, and personal feedback."
        image="/assets/career-mentor-folded-arms.png"
        imageAlt="Amreen's Academy mentor in studio uniform"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              HOW WE TEACH <span />
            </p>
            <h2>A 3-step method built around salon readiness</h2>
          </div>

          <div className="teaching-grid">
            {TEACHING_METHOD.map((step) => (
              <article key={step.step} className="teaching-card">
                <span className="teaching-icon">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>

          <div className="mentor-feature">
            <img
              src="/assets/career-mentor-folded-arms.png"
              alt="Amreen's Academy maroon-uniform character portrait"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="mini-label">GUIDANCE &amp; SUPPORT</span>
              <h3>Good technique grows with thoughtful guidance.</h3>
              <p>
                In small {siteSettings.courseDays}-day batches, mentors guide every student on skin
                consultation, hair sectioning, product safety, and bridal finishing before you
                graduate. See{' '}
                <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
                  full course details
                </Link>
                .
              </p>
              <Link className="arrow-link" to="/contact#enquiry">
                Ask about faculty and next batch <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section surface-dark">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              BEFORE YOU JOIN <span />
            </p>
            <h2>What every student receives in {siteSettings.courseDays} days</h2>
          </div>

          <div className="question-grid">
            {ENROLMENT_CHECKLIST.map((item) => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">NEXT BATCH ADMISSIONS</p>
          <h2>Meet our mentors at the Thanisandra studio.</h2>
          <p>
            Single {siteSettings.courseDays}-day course · {siteSettings.courseFee} (
            {siteSettings.instalmentNote}).
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
