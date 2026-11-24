import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { FAQ_ITEMS } from '../data/academyData.ts';

export function FaqsPage() {
  const { openEnquiryModal, siteSettings } = useFirebase();

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),
    []
  );

  return (
    <>
      <SeoHead
        title="FAQs: 40-Day Skin, Hair & Makeup Course Fee & Schedule | Amreen's Academy"
        description="Answers about Amreen's Academy single 40-day beauty course (focused mainly on Skin & Hair services), ₹30,000 fee in 3 instalments, certification, and Thanisandra location."
        jsonLd={faqJsonLd}
      />

      <PageHero
        kicker="HELP & GUIDANCE"
        title="Questions & clear answers."
        subtitle={`Everything you need to know about our single ${siteSettings.courseDays}-day Skin, Hair & Makeup course before visiting our Thanisandra studio.`}
        image="/assets/academy-studio.jpg"
        imageAlt="Amreen's Academy beauty education and training visual"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              FREQUENTLY ASKED QUESTIONS <span />
            </p>
            <h2>Clear answers about fee, Skin &amp; Hair focus &amp; certification</h2>
          </div>

          <p className="section-lead">
            Looking for batch dates? View the{' '}
            <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              {siteSettings.courseDays}-day course syllabus
            </Link>{' '}
            or check{' '}
            <Link to="/verify" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              certificate verification
            </Link>
            .
          </p>

          <div className="faq-list">
            {FAQ_ITEMS.map((faq) => (
              <details key={faq.question} className="faq-item">
                <summary>
                  {faq.question}
                  <span>＋</span>
                </summary>
                <div>
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-cta">
        <div>
          <p className="eyebrow">ONE COMPLETE COURSE</p>
          <h2>Still deciding? Ask on WhatsApp.</h2>
          <p>
            Full course fee {siteSettings.courseFee} ({siteSettings.instalmentNote}). Our team will
            share exact batch dates right away.
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
