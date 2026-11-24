import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppEnquiryUrl } from '../backend/academy-validators.ts';
import { submitAcademyEnquiry } from '../backend/firebase-client.ts';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { useFirebase } from '../context/FirebaseContext.tsx';
import { ACADEMY_INFO } from '../data/academyData.ts';

export function ContactPage() {
  const { siteSettings } = useFirebase();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(siteSettings.courseName);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState<{ id: string; waUrl: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      const trimmedMsg = message.trim();
      const { enquiryId } = await submitAcademyEnquiry({
        name: trimmedName,
        phone: trimmedPhone,
        course,
        interest: course,
        message: trimmedMsg,
        sourcePage: '/contact',
      });

      const waUrl = buildWhatsAppEnquiryUrl({
        enquiryId,
        name: trimmedName,
        phone: trimmedPhone,
        course,
        message: trimmedMsg,
      });

      setSavedResult({ id: enquiryId, waUrl });
      setName('');
      setPhone('');
      setCourse(siteSettings.courseName);
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save enquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Contact & Visit Amreen's Academy | Thanisandra, Bengaluru"
        description="Call, WhatsApp, or visit Amreen's Academy on Thanisandra Main Road, Bengaluru to book your seat in our 40-day Skin, Hair & Makeup beauty course."
      />

      <PageHero
        kicker="GET IN TOUCH"
        title="Visit or message us on WhatsApp."
        subtitle={`Book a studio visit in Thanisandra or ask about our next ${siteSettings.courseDays}-day Skin, Hair & Makeup batch (${siteSettings.courseFee}).`}
        image="/assets/academy-studio.jpg"
        imageAlt="Amreen's Academy beauty education and training visual"
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              CONTACT &amp; VISIT <span />
            </p>
            <h2>Reach the academy directly</h2>
          </div>

          <div className="contact-layout">
            <div className="contact-panel">
              <span className="mini-label">CALL OR WHATSAPP</span>
              <h3>{ACADEMY_INFO.phoneDisplay}</h3>
              <p>
                Speak with our counselor about batch timings, 3-instalment payments, or check our{' '}
                <Link to="/45-day-course" style={{ color: '#8c1539', textDecoration: 'underline' }}>
                  {siteSettings.courseDays}-day syllabus
                </Link>{' '}
                before visiting.
              </p>
              <div className="contact-actions">
                <a
                  className="button button-primary"
                  href={ACADEMY_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp the Academy <span>↗</span>
                </a>
                <a className="text-link" href={ACADEMY_INFO.phoneHref}>
                  Call now ↗
                </a>
              </div>
              <hr />
              <span className="mini-label">STUDIO ADDRESS</span>
              <p className="contact-address">{ACADEMY_INFO.address}</p>
              <a
                className="arrow-link"
                href={ACADEMY_INFO.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Google Maps <span>↗</span>
              </a>
            </div>

            <div className="map-panel">
              <div className="map-panel__top">
                <span className="map-pin">⌖</span>
                <div>
                  <strong>{ACADEMY_INFO.fullName}</strong>
                  <small>{ACADEMY_INFO.shortLocation}</small>
                </div>
              </div>
              <iframe
                title="Map showing Amreens Academy and Makeover Studio in Thanisandra, Bengaluru"
                src={ACADEMY_INFO.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a href={ACADEMY_INFO.mapsSearchUrl} target="_blank" rel="noopener noreferrer">
                Open listing and directions ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section surface-dark">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              LOCAL PRESENCE <span />
            </p>
            <h2>Trusted 5.0★ local reputation</h2>
          </div>

          <div className="review-snapshot">
            <div className="review-rating">
              <strong>5.0</strong>
              <span>★★★★★</span>
              <small>Google Business Profile</small>
            </div>
            <div>
              <h3>Verified reviews &amp; student feedback</h3>
              <p>
                Rated 5.0 on Google Business in Thanisandra. Read{' '}
                <Link to="/student-success" style={{ color: '#ff9eb9', textDecoration: 'underline' }}>
                  graduate testimonials
                </Link>{' '}
                or inspect live student reviews on Google Maps.
              </p>
              <a
                className="arrow-link"
                href={ACADEMY_INFO.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Google listing <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section surface-light" id="enquiry">
        <div className="page-container">
          <div className="section-intro">
            <p className="eyebrow">
              SEND AN ENQUIRY <span />
            </p>
            <h2>Book your seat or studio visit.</h2>
            <p className="section-lead">
              Your enquiry is logged in our admissions CRM and prepares a ready-to-send WhatsApp
              message to our counselor.
            </p>
          </div>

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </label>

            <label>
              Phone number
              <input
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                required
                minLength={7}
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
              />
            </label>

            <label>
              Course or focus area
              <select
                name="course"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value={siteSettings.courseName}>
                  {siteSettings.courseName} ({siteSettings.courseDays} Days · {siteSettings.courseFee})
                </option>
                <option value="Skin & Aesthetics focus (40-Day Course)">
                  Skin &amp; Aesthetics focus (inside 40-Day Course)
                </option>
                <option value="Hair Styling focus (40-Day Course)">
                  Hair Styling focus (inside 40-Day Course)
                </option>
                <option value="Makeup & Bridal focus (40-Day Course)">
                  Makeup &amp; Bridal focus (inside 40-Day Course)
                </option>
                <option value="Studio visit / Batch timing enquiry">
                  Studio visit / Batch timing enquiry
                </option>
              </select>
            </label>

            <label>
              Message
              <textarea
                name="message"
                rows={4}
                maxLength={600}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Preferred batch timing or questions"
              />
            </label>

            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving Enquiry...' : 'Save & Continue to WhatsApp'} <span>→</span>
            </button>

            <p className="form-status" role="status">
              {errorMsg && (
                <span style={{ color: '#8c1539', fontWeight: 700 }}>{errorMsg}</span>
              )}
              {savedResult && (
                <span style={{ color: '#071a37', fontWeight: 700 }}>
                  Enquiry saved (Ref: {savedResult.id}).{' '}
                  <a
                    href={savedResult.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#8c1539', textDecoration: 'underline' }}
                  >
                    Open WhatsApp with prepared message ↗
                  </a>
                </span>
              )}
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
