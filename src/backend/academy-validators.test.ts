import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildBatchPayload,
  buildCertificatePayload,
  buildEnquiryPayload,
  buildSiteSettingsPayload,
  buildTestimonialPayload,
  buildWhatsAppEnquiryUrl,
  buildWhatsAppFollowupUrl,
  isValidFirestoreId,
  leadsToCsv,
  normalizeCertificateCode,
} from './academy-validators';

test('enquiry validator enforces blueprint bounds and rejects invalid phone/name', () => {
  const valid = buildEnquiryPayload({
    name: '  Ayesha Khan  ',
    phone: '+91 98765 43210',
    course: '40-Day Integrated Beauty & Makeup Program',
    interest: 'Bridal Artistry',
    message: 'Looking for morning batch details',
    sourcePage: 'index.html',
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.name, 'Ayesha Khan');
    assert.equal(valid.data.status, 'new');
  }

  const badPhone = buildEnquiryPayload({
    name: 'Ayesha',
    phone: 'abc',
    course: 'Makeup',
  });
  assert.equal(badPhone.ok, false);

  const hugeName = buildEnquiryPayload({
    name: 'A'.repeat(500),
    phone: '9876543210',
    course: 'Makeup',
  });
  assert.equal(hugeName.ok, true);
  if (hugeName.ok) {
    assert.equal(hugeName.data.name.length, 100);
  }
});

test('batch validator prevents enrolledCount exceeding seatLimit', () => {
  const overCapacity = buildBatchPayload({
    title: 'December Batch',
    startDate: '2026-12-01',
    timing: '10:30 AM – 1:30 PM',
    feeInr: 30000,
    instalmentNote: '3 instalments of ₹10,000',
    seatLimit: 12,
    enrolledCount: 15,
    status: 'open',
  });
  assert.equal(overCapacity.ok, false);

  const okBatch = buildBatchPayload({
    title: 'December Batch',
    startDate: '2026-12-01',
    timing: '10:30 AM – 1:30 PM',
    feeInr: 30000,
    instalmentNote: '3 instalments of ₹10,000',
    seatLimit: 12,
    enrolledCount: 4,
    status: 'open',
  });
  assert.equal(okBatch.ok, true);
});

test('certificate validator normalizes codes and rejects traversal/invalid IDs', () => {
  assert.equal(normalizeCertificateCode(' aa-2026-0001 '), 'AA-2026-0001');
  assert.equal(isValidFirestoreId('../evil'), false);
  assert.equal(isValidFirestoreId('AA-2026-0001'), true);

  const cert = buildCertificatePayload({
    certCode: 'aa-2026-0001',
    studentName: 'Zoya Fatima',
    courseName: '40-Day Integrated Beauty & Makeup Program',
    completionDate: '2026-11-15',
    grade: 'Distinction',
    status: 'valid',
  });
  assert.equal(cert.ok, true);
  if (cert.ok) {
    assert.equal(cert.data.certCode, 'AA-2026-0001');
  }
});

test('WhatsApp URLs include enquiry reference, follow-up templates, and CSV escaping', () => {
  const url = buildWhatsAppEnquiryUrl({
    enquiryId: 'enq_12345',
    name: 'Ayesha',
    phone: '9876543210',
    course: '40-Day Integrated Skin, Hair & Makeup Course',
  });
  assert.ok(url.startsWith('https://wa.me/918123410118?text='));
  assert.ok(decodeURIComponent(url).includes('Enquiry Ref: enq_12345'));

  const followup = buildWhatsAppFollowupUrl({
    studentName: 'Sana',
    phone: '9876543210',
    template: 'details',
  });
  assert.ok(followup.startsWith('https://wa.me/919876543210?text='));
  assert.ok(decodeURIComponent(followup).includes('40-Day Skin, Hair & Makeup'));

  const csv = leadsToCsv([
    {
      id: 'enq_1',
      name: 'Nida "A"',
      phone: '9876543210',
      course: '40-Day Course',
      interest: 'Skin & Hair',
      status: 'new',
      sourcePage: '/contact',
      message: 'Hello',
    },
  ]);
  assert.ok(csv.includes('"Nida ""A"""'));
});

test('siteSettings and testimonial validators enforce schema rules', () => {
  const settings = buildSiteSettingsPayload({
    heroHeadline: '40-DAY SKIN, HAIR & MAKEUP COURSE',
    heroSubheadline: 'One complete practical course focused on Skin Care & Hair Services.',
    courseName: '40-Day Skin, Hair & Beauty Diploma',
    courseDays: 40,
    courseFee: '₹30,000',
    instalmentNote: '3 instalments available',
    announcementBanner: 'New Thanisandra morning batch open',
  });
  assert.equal(settings.ok, true);

  const badTestimonial = buildTestimonialPayload({
    studentName: 'R',
    batchLabel: 'Batch',
    focusArea: 'Skin',
    quote: 'Good',
    rating: 6,
    published: true,
  });
  assert.equal(badTestimonial.ok, false);
});

test('firestore.rules contains Eight Pillars guards and matches all blueprint collections', () => {
  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
  const blueprint = JSON.parse(fs.readFileSync(path.resolve('firebase-blueprint.json'), 'utf8'));

  assert.ok(rules.includes("rules_version = '2';"));
  assert.ok(rules.includes('allow read, write: if false;'));
  assert.ok(rules.includes('request.auth.token.email_verified == true'));
  assert.ok(rules.includes('isValidEnquiry'));
  assert.ok(rules.includes('isValidBatch'));
  assert.ok(rules.includes('isValidEnrollment'));
  assert.ok(rules.includes('isValidCertificate'));
  assert.ok(rules.includes('isValidSiteSettings'));
  assert.ok(rules.includes('isValidTestimonial'));
  assert.ok(rules.includes('affectedKeys().hasOnly'));

  for (const collectionPath of Object.keys(blueprint.firestore)) {
    const topLevel = collectionPath.split('/')[1];
    assert.ok(rules.includes(`match /${topLevel}/`), `Missing rules match block for ${topLevel}`);
  }
});
