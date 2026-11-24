export const BLUEPRINT_LIMITS = {
  idPattern: /^[a-zA-Z0-9_-]+$/,
  idMax: 128,
  nameMin: 2,
  nameMax: 100,
  phoneMin: 7,
  phoneMax: 20,
  phonePattern: /^[0-9+\-\s()]{7,20}$/,
  courseMin: 2,
  courseMax: 120,
  interestMax: 120,
  messageMax: 1000,
  sourcePageMax: 80,
  counselorNotesMax: 1000,
  batchTitleMin: 3,
  batchTitleMax: 120,
  startDateMax: 40,
  timingMax: 80,
  instalmentNoteMax: 160,
  certCodeMin: 4,
  certCodeMax: 64,
  courseNameMax: 140,
  gradeMax: 40,
} as const;

export type EnquiryStatus = 'new' | 'contacted' | 'visited' | 'enrolled' | 'closed';
export type BatchStatus = 'open' | 'full' | 'completed';
export type FeePlan = 'full' | 'instalments_3';
export type EnrollmentStatus = 'reserved' | 'active' | 'completed' | 'cancelled';
export type CertificateStatus = 'valid' | 'revoked';

export interface EnquiryInput {
  name: string;
  phone: string;
  course: string;
  interest?: string;
  message?: string;
  sourcePage?: string;
}

export interface BatchInput {
  title: string;
  startDate: string;
  timing: string;
  feeInr: number;
  instalmentNote: string;
  seatLimit: number;
  enrolledCount: number;
  status: BatchStatus;
}

export interface CertificateInput {
  certCode: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  grade: string;
  status: CertificateStatus;
}

export function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function isValidFirestoreId(id: string): boolean {
  return id.length >= 1 && id.length <= BLUEPRINT_LIMITS.idMax && BLUEPRINT_LIMITS.idPattern.test(id);
}

export function normalizeCertificateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

export function buildEnquiryPayload(input: EnquiryInput): {
  ok: true;
  data: {
    name: string;
    phone: string;
    course: string;
    interest: string;
    message: string;
    sourcePage: string;
    status: 'new';
  };
} | { ok: false; error: string } {
  const name = sanitizeText(input.name, BLUEPRINT_LIMITS.nameMax);
  const phone = sanitizeText(input.phone, BLUEPRINT_LIMITS.phoneMax);
  const course = sanitizeText(input.course, BLUEPRINT_LIMITS.courseMax);
  const interest = sanitizeText(input.interest ?? 'Not specified', BLUEPRINT_LIMITS.interestMax);
  const message = sanitizeText(input.message ?? '', BLUEPRINT_LIMITS.messageMax);
  const sourcePage = sanitizeText(input.sourcePage ?? 'website', BLUEPRINT_LIMITS.sourcePageMax) || 'website';

  if (name.length < BLUEPRINT_LIMITS.nameMin) {
    return { ok: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!BLUEPRINT_LIMITS.phonePattern.test(phone)) {
    return { ok: false, error: 'Please enter a valid mobile number (7 to 20 digits).' };
  }
  if (course.length < BLUEPRINT_LIMITS.courseMin) {
    return { ok: false, error: 'Please select a course or area of interest.' };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      course,
      interest,
      message,
      sourcePage,
      status: 'new',
    },
  };
}

export function buildBatchPayload(input: BatchInput): { ok: true; data: BatchInput } | { ok: false; error: string } {
  const title = sanitizeText(input.title, BLUEPRINT_LIMITS.batchTitleMax);
  const startDate = sanitizeText(input.startDate, BLUEPRINT_LIMITS.startDateMax);
  const timing = sanitizeText(input.timing, BLUEPRINT_LIMITS.timingMax);
  const instalmentNote = sanitizeText(input.instalmentNote, BLUEPRINT_LIMITS.instalmentNoteMax);
  const feeInr = Number(input.feeInr);
  const seatLimit = Number(input.seatLimit);
  const enrolledCount = Number(input.enrolledCount);

  if (title.length < BLUEPRINT_LIMITS.batchTitleMin) {
    return { ok: false, error: 'Batch title must be at least 3 characters.' };
  }
  if (startDate.length < 4 || timing.length < 3) {
    return { ok: false, error: 'Start date and timing are required.' };
  }
  if (!Number.isFinite(feeInr) || feeInr < 0 || feeInr > 500000) {
    return { ok: false, error: 'Fee must be between ₹0 and ₹5,00,000.' };
  }
  if (!Number.isFinite(seatLimit) || seatLimit < 1 || seatLimit > 500) {
    return { ok: false, error: 'Seat limit must be between 1 and 500.' };
  }
  if (!Number.isFinite(enrolledCount) || enrolledCount < 0 || enrolledCount > seatLimit) {
    return { ok: false, error: 'Enrolled count cannot exceed seat limit.' };
  }
  if (!['open', 'full', 'completed'].includes(input.status)) {
    return { ok: false, error: 'Invalid batch status.' };
  }

  return {
    ok: true,
    data: {
      title,
      startDate,
      timing,
      feeInr,
      instalmentNote,
      seatLimit,
      enrolledCount,
      status: input.status,
    },
  };
}

export function buildCertificatePayload(input: CertificateInput): { ok: true; data: CertificateInput } | { ok: false; error: string } {
  const certCode = normalizeCertificateCode(input.certCode).slice(0, BLUEPRINT_LIMITS.certCodeMax);
  const studentName = sanitizeText(input.studentName, BLUEPRINT_LIMITS.nameMax);
  const courseName = sanitizeText(input.courseName, BLUEPRINT_LIMITS.courseNameMax);
  const completionDate = sanitizeText(input.completionDate, BLUEPRINT_LIMITS.startDateMax);
  const grade = sanitizeText(input.grade, BLUEPRINT_LIMITS.gradeMax);

  if (certCode.length < BLUEPRINT_LIMITS.certCodeMin || !isValidFirestoreId(certCode)) {
    return { ok: false, error: 'Certificate code must be 4–64 alphanumeric/hyphen characters.' };
  }
  if (studentName.length < BLUEPRINT_LIMITS.nameMin) {
    return { ok: false, error: 'Student name must be at least 2 characters.' };
  }
  if (courseName.length < 3 || completionDate.length < 4 || grade.length < 1) {
    return { ok: false, error: 'Course name, completion date, and grade are required.' };
  }
  if (!['valid', 'revoked'].includes(input.status)) {
    return { ok: false, error: 'Invalid certificate status.' };
  }

  return {
    ok: true,
    data: {
      certCode,
      studentName,
      courseName,
      completionDate,
      grade,
      status: input.status,
    },
  };
}

export function buildWhatsAppEnquiryUrl(enquiry: {
  enquiryId?: string;
  name: string;
  phone: string;
  course: string;
  interest?: string;
  message?: string;
}): string {
  const lines = [
    "Hello Amreen's Academy, I would like to enquire about the 40-Day Skin, Hair & Makeup Course.",
    enquiry.enquiryId ? `Enquiry Ref: ${enquiry.enquiryId}` : '',
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Course: ${enquiry.course}`,
    enquiry.interest ? `Main Focus: ${enquiry.interest}` : '',
    enquiry.message ? `Message: ${enquiry.message}` : 'Please share the upcoming batch dates, timings, and 3-instalment schedule.',
  ].filter(Boolean);
  return `https://wa.me/918123410118?text=${encodeURIComponent(lines.join('\n'))}`;
}

export interface SiteSettingsInput {
  heroHeadline: string;
  heroSubheadline: string;
  courseName: string;
  courseDays: number;
  courseFee: string;
  instalmentNote: string;
  announcementBanner: string;
}

export function buildSiteSettingsPayload(
  input: SiteSettingsInput
): { ok: true; data: SiteSettingsInput } | { ok: false; error: string } {
  const heroHeadline = sanitizeText(input.heroHeadline, 120);
  const heroSubheadline = sanitizeText(input.heroSubheadline, 260);
  const courseName = sanitizeText(input.courseName, 120);
  const courseDays = Number(input.courseDays);
  const courseFee = sanitizeText(input.courseFee, 40);
  const instalmentNote = sanitizeText(input.instalmentNote, 120);
  const announcementBanner = sanitizeText(input.announcementBanner, 200);

  if (heroHeadline.length < 3 || heroSubheadline.length < 5 || courseName.length < 3) {
    return { ok: false, error: 'Headline, subheadline, and course name are required.' };
  }
  if (!Number.isFinite(courseDays) || courseDays < 1 || courseDays > 365) {
    return { ok: false, error: 'Course days must be between 1 and 365.' };
  }
  if (courseFee.length < 2 || instalmentNote.length < 3) {
    return { ok: false, error: 'Course fee and instalment note are required.' };
  }

  return {
    ok: true,
    data: {
      heroHeadline,
      heroSubheadline,
      courseName,
      courseDays,
      courseFee,
      instalmentNote,
      announcementBanner,
    },
  };
}

export interface TestimonialInput {
  studentName: string;
  batchLabel: string;
  focusArea: string;
  quote: string;
  rating: number;
  published: boolean;
}

export function buildTestimonialPayload(
  input: TestimonialInput
): { ok: true; data: TestimonialInput } | { ok: false; error: string } {
  const studentName = sanitizeText(input.studentName, 80);
  const batchLabel = sanitizeText(input.batchLabel, 80);
  const focusArea = sanitizeText(input.focusArea, 80);
  const quote = sanitizeText(input.quote, 360);
  const rating = Number(input.rating);
  const published = Boolean(input.published);

  if (studentName.length < 2 || batchLabel.length < 2 || focusArea.length < 2) {
    return { ok: false, error: 'Student name, batch label, and focus area are required.' };
  }
  if (quote.length < 8) {
    return { ok: false, error: 'Testimonial quote must be at least 8 characters.' };
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Rating must be between 1 and 5.' };
  }

  return {
    ok: true,
    data: {
      studentName,
      batchLabel,
      focusArea,
      quote,
      rating: Math.round(rating),
      published,
    },
  };
}

export function normalizeDialPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppFollowupUrl(params: {
  studentName: string;
  phone: string;
  template: 'details' | 'visit' | 'seat';
}): string {
  const dial = normalizeDialPhone(params.phone);
  const first = sanitizeText(params.studentName, 60) || 'there';
  let text = '';
  if (params.template === 'details') {
    text = `Hi ${first}, thank you for contacting Amreen's Academy (Thanisandra, Bengaluru). Our single integrated 40-Day Skin, Hair & Makeup Course covers hands-on Skin Care, Hair Styling, Makeup & Bridal training. Total fee is ₹30,000 (3 instalments of ₹10,000). Would you like our upcoming batch dates?`;
  } else if (params.template === 'visit') {
    text = `Hi ${first}, we would love to welcome you for a quick studio tour and demo briefing at Amreen's Academy, Thanisandra Main Road. What day and time works best for your visit?`;
  } else {
    text = `Hi ${first}, seats are filling up for the upcoming 40-Day Skin, Hair & Makeup batch at Amreen's Academy. Reply here to reserve your seat with the first ₹10,000 instalment.`;
  }
  return `https://wa.me/${dial}?text=${encodeURIComponent(text)}`;
}

export function leadsToCsv(
  rows: Array<{
    id: string;
    name: string;
    phone: string;
    course: string;
    interest: string;
    status: string;
    sourcePage: string;
    message: string;
    counselorNotes?: string;
  }>
): string {
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const headers = ['ID', 'Name', 'Phone', 'Course', 'Focus Area', 'Status', 'Source', 'Message', 'Notes'];
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((r) =>
      [r.id, r.name, r.phone, r.course, r.interest, r.status, r.sourcePage, r.message, r.counselorNotes ?? '']
        .map(escape)
        .join(',')
    ),
  ];
  return lines.join('\n');
}
