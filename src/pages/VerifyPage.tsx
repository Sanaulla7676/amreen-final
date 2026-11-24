import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyCertificateByCode, type CertificateRecord } from '../backend/firebase-client.ts';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { ACADEMY_INFO } from '../data/academyData.ts';

export function VerifyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [codeInput, setCodeInput] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkedCode, setCheckedCode] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);

  async function lookupCode(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg(null);
    setCheckedCode(trimmed.toUpperCase());

    try {
      const record = await verifyCertificateByCode(trimmed);
      setCertificate(record);
    } catch (err) {
      setCertificate(null);
      setErrorMsg(err instanceof Error ? err.message : 'Unable to verify certificate.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) {
      void lookupCode(initialCode);
    }
  }, [initialCode]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = codeInput.trim().toUpperCase();
    if (!cleaned) return;
    setSearchParams({ code: cleaned });
    void lookupCode(cleaned);
  }

  return (
    <>
      <SeoHead
        title="Verify Graduate Certificate | Amreen's Academy Bengaluru"
        description="Verify an official Amreen's Academy 40-day Skin, Hair & Makeup graduation certificate using its unique certificate ID."
      />

      <PageHero
        kicker="OFFICIAL REGISTRY"
        title="Verify a certificate."
        subtitle="Employers, salon partners, and graduates can confirm the authenticity of an Amreen's Academy certificate using its unique registry ID."
        image="/assets/academy-frames/certificate-06.jpg"
        imageAlt="Amreen's Academy certificate presentation verification"
        footerTag="CERTIFICATE VERIFICATION"
        showActions={false}
      />

      <section className="content-section surface-light">
        <div className="page-container" style={{ maxWidth: 760 }}>
          <p className="mb-4 text-center text-sm text-slate-600">
            Graduates receive a registry code after completing the{' '}
            <Link to="/45-day-course" style={{ color: '#8c1539', fontWeight: 700, textDecoration: 'underline' }}>
              40-day Skin, Hair &amp; Makeup course
            </Link>
            .
          </p>
          <div className="backend-panel p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label
                style={{
                  display: 'grid',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#071a37',
                }}
              >
                Certificate Code
                <input
                  id="cert-code-input"
                  type="text"
                  name="certCode"
                  required
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="e.g. AA-2026-0001"
                  autoComplete="off"
                  className="backend-input"
                  style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700 }}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="button button-primary"
                style={{ minHeight: 42 }}
              >
                {loading ? 'Checking...' : 'Verify'} <span>→</span>
              </button>
            </form>

            <div className="mt-6" role="status" aria-live="polite">
              {!checkedCode && !errorMsg && (
                <p style={{ fontSize: 14, color: 'rgba(7,26,55,0.7)', margin: 0 }}>
                  Enter the certificate code printed on the graduate&#39;s certificate (for example{' '}
                  <strong style={{ fontFamily: 'monospace', color: '#07182f' }}>
                    AA-2026-0001
                  </strong>
                  ).
                </p>
              )}

              {errorMsg && (
                <div
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(140,21,57,0.28)',
                    background: '#fdf2f5',
                    padding: 20,
                    color: '#8c1539',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>
                    VERIFICATION ERROR
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 14 }}>{errorMsg}</p>
                </div>
              )}

              {!loading && !errorMsg && checkedCode && !certificate && (
                <div
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(140,21,57,0.25)',
                    background: '#fdf4f6',
                    padding: 22,
                    color: '#071a37',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#8c1539', letterSpacing: 1.5 }}>
                    STATUS: NOT FOUND
                  </p>
                  <h3 style={{ margin: '8px 0 6px', fontSize: 20, fontWeight: 800 }}>
                    No certificate found for &ldquo;{checkedCode}&rdquo;
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: 'rgba(7,26,55,0.72)' }}>
                    Check the spelling on your certificate or contact {ACADEMY_INFO.name} at{' '}
                    <span className="tabular-nums">{ACADEMY_INFO.phoneDisplay}</span> to confirm.
                  </p>
                </div>
              )}

              {!loading && !errorMsg && certificate && (
                <div
                  style={{
                    borderRadius: 14,
                    border:
                      certificate.status === 'valid'
                        ? '1px solid #86efac'
                        : '1px solid rgba(140,21,57,0.3)',
                    background: certificate.status === 'valid' ? '#f0fdf4' : '#fdf4f6',
                    padding: 22,
                    color: '#071a37',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      color: certificate.status === 'valid' ? '#166534' : '#8c1539',
                    }}
                  >
                    STATUS: {certificate.status === 'valid' ? 'VERIFIED AUTHENTIC' : 'REVOKED'}
                  </p>
                  <h3 style={{ margin: '8px 0 12px', fontSize: 24, fontWeight: 900 }}>
                    {certificate.studentName}
                  </h3>
                  <dl className="grid gap-4 sm:grid-cols-2" style={{ margin: 0 }}>
                    <div>
                      <dt style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                        CERTIFICATE ID
                      </dt>
                      <dd style={{ margin: '4px 0 0', fontFamily: 'monospace', fontWeight: 800 }}>
                        {certificate.certCode}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>PROGRAM</dt>
                      <dd style={{ margin: '4px 0 0', fontWeight: 700 }}>
                        {certificate.courseName}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                        COMPLETION DATE
                      </dt>
                      <dd style={{ margin: '4px 0 0', fontWeight: 700 }} className="tabular-nums">
                        {certificate.completionDate}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>STANDING</dt>
                      <dd style={{ margin: '4px 0 0', fontWeight: 700 }}>{certificate.grade}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
