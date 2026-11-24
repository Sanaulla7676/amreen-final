import React, { useEffect, useRef, useState } from 'react';
import { buildWhatsAppEnquiryUrl } from '../backend/academy-validators.ts';
import { submitAcademyEnquiry } from '../backend/firebase-client.ts';
import { useFirebase } from '../context/FirebaseContext.tsx';

export function EnquiryDialog() {
  const { enquiryModalOpen, enquiryDefaultCourse, closeEnquiryModal, siteSettings } = useFirebase();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(siteSettings.courseName);
  const [interest, setInterest] = useState('Skin & Hair + Complete 40-Day Course');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState<{ id: string; waUrl: string } | null>(null);

  useEffect(() => {
    setCourse(enquiryDefaultCourse || siteSettings.courseName);
  }, [enquiryDefaultCourse, siteSettings.courseName]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (enquiryModalOpen && !dialog.open) {
      setErrorMsg(null);
      setSavedResult(null);
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', 'open');
      }
    } else if (!enquiryModalOpen && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [enquiryModalOpen]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      const { enquiryId } = await submitAcademyEnquiry({
        name: trimmedName,
        phone: trimmedPhone,
        course,
        interest,
        message: '',
        sourcePage: window.location.pathname || '/',
      });

      const waUrl = buildWhatsAppEnquiryUrl({
        enquiryId,
        name: trimmedName,
        phone: trimmedPhone,
        course,
        interest,
      });

      setSavedResult({ id: enquiryId, waUrl });
      setName('');
      setPhone('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to save enquiry. Please check your details.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="enquiry-dialog"
      id="enquiry-dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        closeEnquiryModal();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          closeEnquiryModal();
        }
      }}
    >
      <div className="dialog-close-form">
        <button
          type="button"
          className="dialog-close"
          aria-label="Close enquiry form"
          onClick={closeEnquiryModal}
        >
          ×
        </button>
      </div>

      <div className="dialog-content">
        <p className="eyebrow">ONE SINGLE {siteSettings.courseDays}-DAY COURSE</p>
        <h2 id="dialog-title">Enquire Now</h2>
        <p className="dialog-intro">
          Book a seat or studio visit for our {siteSettings.courseDays}-day Skin, Hair &amp; Makeup
          course ({siteSettings.courseFee} · {siteSettings.instalmentNote}).
        </p>

        <form id="enquiry-form" onSubmit={handleSubmit}>
          <label>
            Your name
            <input
              name="name"
              type="text"
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
              type="tel"
              autoComplete="tel"
              required
              minLength={7}
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
          </label>

          <label>
            Course Enrolment
            <select
              name="course"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              <option value={siteSettings.courseName}>
                {siteSettings.courseName} ({siteSettings.courseDays} Days · {siteSettings.courseFee})
              </option>
              <option value={`${siteSettings.courseName} — Skin & Aesthetics focus`}>
                40-Day Course (Primary focus: Skin &amp; Aesthetics)
              </option>
              <option value={`${siteSettings.courseName} — Hair Styling focus`}>
                40-Day Course (Primary focus: Hair Styling)
              </option>
              <option value={`${siteSettings.courseName} — Makeup & Bridal focus`}>
                40-Day Course (Primary focus: Makeup &amp; Bridal)
              </option>
            </select>
          </label>

          <label>
            Focus area you want to ask about
            <select
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option>Skin &amp; Hair + Complete 40-Day Course</option>
              <option>Skin &amp; Aesthetics (Facials, Clean-ups, Hygiene)</option>
              <option>Hair Styling &amp; Salon Services</option>
              <option>Professional Makeup &amp; Bridal Artistry</option>
            </select>
          </label>

          {errorMsg && (
            <p className="form-note" role="alert" style={{ color: '#ffb4c8', marginTop: 0 }}>
              {errorMsg}
            </p>
          )}

          <button
            className="button button-primary form-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Saving Enquiry...' : 'Save & Continue to WhatsApp'}{' '}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        {savedResult ? (
          <p className="form-note" id="form-note" role="status" style={{ color: '#f7c5d3' }}>
            Enquiry saved (Ref: <strong style={{ color: '#ffffff' }}>{savedResult.id}</strong>).{' '}
            <a
              href={savedResult.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#ff8aa8', textDecoration: 'underline', fontWeight: 700 }}
            >
              Open WhatsApp ↗
            </a>
          </p>
        ) : (
          <p className="form-note" id="form-note" role="status">
            Submitting saves your enquiry and prepares your WhatsApp message to the academy.
          </p>
        )}
      </div>
    </dialog>
  );
}
