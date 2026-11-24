import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { BLOG_ARTICLES } from '../data/academyData.ts';

export function BlogPage() {
  const { openEnquiryModal, siteSettings } = useFirebase();

  return (
    <>
      <SeoHead
        title="Skin, Hair & Makeup Learning Journal | Amreen's Academy"
        description="Practical beauty education notes covering skin analysis, hair sectioning, and bridal prep taught inside our 40-day Bengaluru course."
      />

      <PageHero
        kicker="THE JOURNAL"
        title="Practical beauty guides for skin & hair students."
        subtitle="Short learning notes from our 40-day Skin, Hair, Makeup & Bridal curriculum in Thanisandra, Bengaluru."
        image="https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/24f460b6-18cc-4d31-9490-ac461749bb91.png"
        imageAlt="Amreen's Academy bridal, skin and hair training showcase"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              THE ACADEMY JOURNAL <span />
            </p>
            <h2>Skin Care, Hair Services &amp; Makeup Notes</h2>
          </div>

          <p className="section-lead">
            Explore key concepts covered inside our single{' '}
            <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              {siteSettings.courseDays}-day beauty course
            </Link>
            —especially our core{' '}
            <Link to="/skin-aesthetics" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Skin &amp; Aesthetics
            </Link>{' '}
            and{' '}
            <Link to="/hair-styling" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              Hair Styling
            </Link>{' '}
            training modules.
          </p>

          <div className="article-grid">
            {BLOG_ARTICLES.map((article) => (
              <details key={article.number} className="article-card">
                <summary>
                  <span className="article-number">{article.number}</span>
                  <span className="article-category">{article.category.toUpperCase()}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <b>
                    Read note <span>＋</span>
                  </b>
                </summary>
                <div className="article-expanded">
                  <p>{article.content}</p>
                  <h4 style={{ margin: '10px 0 4px', fontSize: 12, fontWeight: 800, color: '#091b38' }}>
                    Key Practice Focus
                  </h4>
                  <small>{article.keywords}</small>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">ONE COMPLETE {siteSettings.courseDays}-DAY COURSE</p>
          <h2>Want to master Skin, Hair &amp; Makeup hands-on?</h2>
          <p>
            Full course fee is {siteSettings.courseFee} ({siteSettings.instalmentNote}). Reserve your
            seat in the upcoming batch.
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
