import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  buildBatchPayload,
  buildCertificatePayload,
  buildEnquiryPayload,
  buildSiteSettingsPayload,
  buildTestimonialPayload,
  isValidFirestoreId,
  normalizeCertificateCode,
  sanitizeText,
  type BatchInput,
  type CertificateInput,
  type EnquiryInput,
  type EnquiryStatus,
  type EnrollmentStatus,
  type FeePlan,
  type SiteSettingsInput,
  type TestimonialInput,
} from './academy-validators.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;

export async function testConnection(): Promise<boolean> {
  if (connectionTested) return true;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

function makeClientDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export async function submitAcademyEnquiry(input: EnquiryInput): Promise<{ enquiryId: string }> {
  const validated = buildEnquiryPayload(input);
  if (!validated.ok) {
    throw new Error(validated.error);
  }
  const enquiryId = makeClientDocId('enq');
  const docPath = `enquiries/${enquiryId}`;
  try {
    await setDoc(doc(db, 'enquiries', enquiryId), {
      ...validated.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { enquiryId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export interface BatchRecord extends BatchInput {
  id: string;
}

export async function listPublicBatches(): Promise<BatchRecord[]> {
  const colPath = 'batches';
  try {
    const snap = await getDocs(query(collection(db, colPath), orderBy('startDate', 'asc')));
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as BatchInput),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

export interface CertificateRecord extends CertificateInput {
  id: string;
  issuedAt?: unknown;
}

export async function verifyCertificateByCode(rawCode: string): Promise<CertificateRecord | null> {
  const code = normalizeCertificateCode(rawCode);
  if (!code || !isValidFirestoreId(code)) {
    throw new Error('Please enter a valid certificate code (e.g. AA-2026-0001).');
  }
  const docPath = `certificates/${code}`;
  try {
    const snap = await getDoc(doc(db, 'certificates', code));
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...(snap.data() as CertificateInput),
      issuedAt: snap.data().issuedAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, cb);
}

export interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  course: string;
  interest: string;
  message: string;
  sourcePage: string;
  status: EnquiryStatus;
  counselorNotes?: string;
  createdAt?: unknown;
}

export function subscribeEnquiries(
  onData: (rows: EnquiryRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'enquiries';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EnquiryRecord, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}

export async function updateEnquiryAdmin(
  enquiryId: string,
  status: EnquiryStatus,
  counselorNotes: string
): Promise<void> {
  if (!isValidFirestoreId(enquiryId)) throw new Error('Invalid enquiry ID.');
  const docPath = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), {
      status,
      counselorNotes: sanitizeText(counselorNotes, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteEnquiryAdmin(enquiryId: string): Promise<void> {
  if (!isValidFirestoreId(enquiryId)) throw new Error('Invalid enquiry ID.');
  const docPath = `enquiries/${enquiryId}`;
  try {
    await deleteDoc(doc(db, 'enquiries', enquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeBatches(
  onData: (rows: BatchRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'batches';
  const q = query(collection(db, path), orderBy('startDate', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as BatchInput),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}

export async function saveBatchAdmin(
  batchId: string | null,
  input: BatchInput,
  isUpdate = Boolean(batchId)
): Promise<string> {
  const validated = buildBatchPayload(input);
  if (!validated.ok) throw new Error(validated.error);
  const id = batchId && isValidFirestoreId(batchId) ? batchId : makeClientDocId('batch');
  const docPath = `batches/${id}`;
  try {
    if (isUpdate && batchId) {
      await updateDoc(doc(db, 'batches', id), {
        ...validated.data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'batches', id), {
        ...validated.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isUpdate && batchId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteBatchAdmin(batchId: string): Promise<void> {
  if (!isValidFirestoreId(batchId)) throw new Error('Invalid batch ID.');
  const docPath = `batches/${batchId}`;
  try {
    await deleteDoc(doc(db, 'batches', batchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export interface EnrollmentRecord {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  batchId: string;
  feePlan: FeePlan;
  totalFeeInr: number;
  amountPaidInr: number;
  instalmentsPaid: number;
  status: EnrollmentStatus;
  notes: string;
}

export function subscribeEnrollments(
  onData: (rows: EnrollmentRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'enrollments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EnrollmentRecord, 'id'>),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}

export async function createEnrollmentAdmin(input: Omit<EnrollmentRecord, 'id'>): Promise<string> {
  const id = makeClientDocId('enr');
  const docPath = `enrollments/${id}`;
  const studentName = sanitizeText(input.studentName, 100);
  const phone = sanitizeText(input.phone, 20);
  const email = sanitizeText(input.email, 160);
  const notes = sanitizeText(input.notes, 1000);
  if (studentName.length < 2) throw new Error('Student name must be at least 2 characters.');
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) throw new Error('Valid phone number is required.');
  if (!isValidFirestoreId(input.batchId)) throw new Error('Please choose a valid batch.');
  if (input.amountPaidInr < 0 || input.amountPaidInr > input.totalFeeInr) {
    throw new Error('Amount paid cannot exceed total fee.');
  }

  try {
    await setDoc(doc(db, 'enrollments', id), {
      studentName,
      phone,
      email,
      batchId: input.batchId,
      feePlan: input.feePlan,
      totalFeeInr: Number(input.totalFeeInr),
      amountPaidInr: Number(input.amountPaidInr),
      instalmentsPaid: Number(input.instalmentsPaid),
      status: input.status,
      notes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateEnrollmentPaymentAdmin(
  enrollmentId: string,
  patch: Pick<EnrollmentRecord, 'studentName' | 'phone' | 'email' | 'feePlan' | 'totalFeeInr' | 'amountPaidInr' | 'instalmentsPaid' | 'status' | 'notes'>
): Promise<void> {
  if (!isValidFirestoreId(enrollmentId)) throw new Error('Invalid enrollment ID.');
  const docPath = `enrollments/${enrollmentId}`;
  try {
    await updateDoc(doc(db, 'enrollments', enrollmentId), {
      studentName: sanitizeText(patch.studentName, 100),
      phone: sanitizeText(patch.phone, 20),
      email: sanitizeText(patch.email, 160),
      feePlan: patch.feePlan,
      totalFeeInr: Number(patch.totalFeeInr),
      amountPaidInr: Number(patch.amountPaidInr),
      instalmentsPaid: Number(patch.instalmentsPaid),
      status: patch.status,
      notes: sanitizeText(patch.notes, 1000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export function subscribeCertificates(
  onData: (rows: CertificateRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'certificates';
  const q = query(collection(db, path), orderBy('issuedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as CertificateInput),
          issuedAt: d.data().issuedAt,
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}

export async function issueCertificateAdmin(input: CertificateInput, isUpdate = false): Promise<string> {
  const validated = buildCertificatePayload(input);
  if (!validated.ok) throw new Error(validated.error);
  const code = validated.data.certCode;
  const docPath = `certificates/${code}`;
  try {
    if (isUpdate) {
      await updateDoc(doc(db, 'certificates', code), {
        studentName: validated.data.studentName,
        courseName: validated.data.courseName,
        completionDate: validated.data.completionDate,
        grade: validated.data.grade,
        status: validated.data.status,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'certificates', code), {
        ...validated.data,
        issuedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return code;
  } catch (error) {
    handleFirestoreError(error, isUpdate ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteCertificateAdmin(certCode: string): Promise<void> {
  if (!isValidFirestoreId(certCode)) throw new Error('Invalid certificate code.');
  const docPath = `certificates/${certCode}`;
  try {
    await deleteDoc(doc(db, 'certificates', certCode));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = {
  heroHeadline: 'ONE 40-DAY SKIN, HAIR & MAKEUP COURSE',
  heroSubheadline:
    'Hands-on salon training focused on Skin Care & Hair Services, plus Makeup & Bridal finishing — ₹30,000 in 3 easy instalments.',
  courseName: '40-Day Integrated Skin, Hair & Beauty Course',
  courseDays: 40,
  courseFee: '₹30,000',
  instalmentNote: '3 instalments of ₹10,000 available',
  announcementBanner: 'Admissions Open · Thanisandra, Bengaluru · Small Hands-On Batches',
};

export async function getPublicSiteSettings(): Promise<SiteSettingsInput> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!snap.exists()) return DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...(snap.data() as Partial<SiteSettingsInput>),
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettingsAdmin(input: SiteSettingsInput): Promise<void> {
  const validated = buildSiteSettingsPayload(input);
  if (!validated.ok) throw new Error(validated.error);
  const docPath = 'siteSettings/main';
  try {
    await setDoc(doc(db, 'siteSettings', 'main'), {
      ...validated.data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export interface TestimonialRecord extends TestimonialInput {
  id: string;
}

export async function listPublicTestimonials(): Promise<TestimonialRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')));
    return snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as TestimonialInput),
      }))
      .filter((item) => item.published);
  } catch {
    return [];
  }
}

export function subscribeTestimonials(
  onData: (rows: TestimonialRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'testimonials';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as TestimonialInput),
        }))
      );
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped);
      }
    }
  );
}

export async function saveTestimonialAdmin(
  testimonialId: string | null,
  input: TestimonialInput,
  isUpdate = Boolean(testimonialId)
): Promise<string> {
  const validated = buildTestimonialPayload(input);
  if (!validated.ok) throw new Error(validated.error);
  const id =
    testimonialId && isValidFirestoreId(testimonialId)
      ? testimonialId
      : makeClientDocId('testi');
  const docPath = `testimonials/${id}`;
  try {
    if (isUpdate && testimonialId) {
      await updateDoc(doc(db, 'testimonials', id), {
        ...validated.data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'testimonials', id), {
        ...validated.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, isUpdate && testimonialId ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function deleteTestimonialAdmin(testimonialId: string): Promise<void> {
  if (!isValidFirestoreId(testimonialId)) throw new Error('Invalid testimonial ID.');
  const docPath = `testimonials/${testimonialId}`;
  try {
    await deleteDoc(doc(db, 'testimonials', testimonialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
