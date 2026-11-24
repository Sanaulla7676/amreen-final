import {
  Check,
  Copy,
  Download,
  Kanban,
  LayoutList,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buildWhatsAppEnquiryUrl,
  buildWhatsAppFollowupUrl,
  leadsToCsv,
  type EnquiryStatus,
  type EnrollmentStatus,
  type FeePlan,
  type SiteSettingsInput,
} from '../backend/academy-validators.ts';
import {
  createEnrollmentAdmin,
  deleteBatchAdmin,
  deleteCertificateAdmin,
  deleteEnquiryAdmin,
  deleteTestimonialAdmin,
  issueCertificateAdmin,
  saveBatchAdmin,
  saveSiteSettingsAdmin,
  saveTestimonialAdmin,
  subscribeBatches,
  subscribeCertificates,
  subscribeEnquiries,
  subscribeEnrollments,
  subscribeTestimonials,
  updateEnquiryAdmin,
  updateEnrollmentPaymentAdmin,
  type BatchRecord,
  type CertificateRecord,
  type EnquiryRecord,
  type EnrollmentRecord,
  type TestimonialRecord,
} from '../backend/firebase-client.ts';
import { PageHero } from '../components/PageHero.tsx';
import { SeoHead } from '../components/SeoHead.tsx';
import { ADMIN_PRIMARY_EMAIL, useFirebase } from '../context/FirebaseContext.tsx';
import { DEFAULT_TESTIMONIALS } from '../data/academyData.ts';

function formatReadableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('Missing or insufficient permissions')) {
    return `Access denied: Sign in with the authorized admin Google account (${ADMIN_PRIMARY_EMAIL}).`;
  }
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  return raw;
}

const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'visited', 'enrolled', 'closed'];

const STAGE_LABELS: Record<EnquiryStatus, string> = {
  new: 'New Leads',
  contacted: 'WhatsApp Sent',
  visited: 'Studio Visit',
  enrolled: 'Enrolled',
  closed: 'Closed',
};

type AdminTab = 'leads' | 'cms' | 'testimonials' | 'batches' | 'enrollments' | 'certificates';

export function AdminPage() {
  const { user, authReady, signIn, signOut, siteSettings, refreshPublicContent } = useFirebase();

  const [activeTab, setActiveTab] = useState<AdminTab>('leads');
  const [crmView, setCrmView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialRecord[]>([]);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [enquiryFilter, setEnquiryFilter] = useState<'all' | EnquiryStatus>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, EnquiryStatus>>({});

  // Site CMS form state
  const [cmsDraft, setCmsDraft] = useState<SiteSettingsInput>(siteSettings);
  const [savingCms, setSavingCms] = useState(false);

  // Testimonial form state
  const [tName, setTName] = useState('');
  const [tBatch, setTBatch] = useState('40-Day Skin & Hair Batch');
  const [tFocus, setTFocus] = useState('Skin & Hair Services');
  const [tQuote, setTQuote] = useState('');
  const [tRating, setTRating] = useState('5');
  const [tPublished, setTPublished] = useState(true);

  // Batch form state
  const [batchTitle, setBatchTitle] = useState('');
  const [batchStart, setBatchStart] = useState('');
  const [batchTiming, setBatchTiming] = useState('10:30 AM – 1:30 PM');
  const [batchFee, setBatchFee] = useState('30000');
  const [batchInstNote, setBatchInstNote] = useState('3 instalments of ₹10,000 available');
  const [batchLimit, setBatchLimit] = useState('15');

  // Enrollment form state
  const [enrName, setEnrName] = useState('');
  const [enrPhone, setEnrPhone] = useState('');
  const [enrEmail, setEnrEmail] = useState('');
  const [enrBatchId, setEnrBatchId] = useState('');
  const [enrPlan, setEnrPlan] = useState<FeePlan>('instalments_3');
  const [enrTotalFee, setEnrTotalFee] = useState('30000');
  const [enrPaid, setEnrPaid] = useState('10000');
  const [enrInstCount, setEnrInstCount] = useState('1');
  const [enrStatus, setEnrStatus] = useState<EnrollmentStatus>('reserved');

  // Certificate form state
  const [certCode, setCertCode] = useState('');
  const [certStudent, setCertStudent] = useState('');
  const [certCourse, setCertCourse] = useState(siteSettings.courseName);
  const [certDate, setCertDate] = useState('');
  const [certGrade, setCertGrade] = useState('Distinction');

  useEffect(() => {
    setCmsDraft(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (!authReady || !user) {
      setEnquiries([]);
      setBatches([]);
      setEnrollments([]);
      setCertificates([]);
      setTestimonialsList([]);
      return;
    }

    const onError = (err: unknown) => setErrorBanner(formatReadableError(err));
    const unsubs = [
      subscribeEnquiries(setEnquiries, onError),
      subscribeBatches((rows) => {
        setBatches(rows);
        if (rows.length > 0 && !enrBatchId) {
          setEnrBatchId(rows[0].id);
        }
      }, onError),
      subscribeEnrollments(setEnrollments, onError),
      subscribeCertificates(setCertificates, onError),
      subscribeTestimonials(setTestimonialsList, onError),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [authReady, user]);

  const filteredEnquiries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return enquiries.filter((item) => {
      const matchesStatus = enquiryFilter === 'all' || item.status === enquiryFilter;
      if (!matchesStatus) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        item.course.toLowerCase().includes(term) ||
        item.interest.toLowerCase().includes(term)
      );
    });
  }, [enquiries, enquiryFilter, searchTerm]);

  const totalCollectedInr = useMemo(
    () => enrollments.reduce((sum, item) => sum + (Number(item.amountPaidInr) || 0), 0),
    [enrollments]
  );

  const openSeatsRemaining = useMemo(
    () =>
      batches
        .filter((b) => b.status === 'open')
        .reduce((sum, b) => sum + Math.max(0, b.seatLimit - b.enrolledCount), 0),
    [batches]
  );

  function notify(msg: string) {
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(null), 4000);
  }

  async function handleSignIn() {
    setErrorBanner(null);
    setAuthMsg('Opening Google Sign-In...');
    try {
      await signIn();
      setAuthMsg(null);
    } catch (err) {
      setAuthMsg('Sign-in was cancelled or blocked.');
      setErrorBanner(formatReadableError(err));
    }
  }

  async function handleSeedDemo() {
    setErrorBanner(null);
    setSeeding(true);
    try {
      const batchExists = batches.some((b) => b.id === 'batch_dec_2026_morning');
      await saveBatchAdmin(
        'batch_dec_2026_morning',
        {
          title: '40-Day Integrated Skin, Hair & Makeup — Dec Batch',
          startDate: '2026-12-07',
          timing: '10:30 AM – 1:30 PM',
          feeInr: 30000,
          instalmentNote: '3 instalments of ₹10,000 available',
          seatLimit: 15,
          enrolledCount: 4,
          status: 'open',
        },
        batchExists
      );

      const certExists = certificates.some((c) => c.certCode === 'AA-2026-0001');
      await issueCertificateAdmin(
        {
          certCode: 'AA-2026-0001',
          studentName: 'Ayesha Siddiqui',
          courseName: siteSettings.courseName,
          completionDate: '2026-11-15',
          grade: 'Distinction',
          status: 'valid',
        },
        certExists
      );

      for (const item of DEFAULT_TESTIMONIALS) {
        const exists = testimonialsList.some((t) => t.id === item.id);
        await saveTestimonialAdmin(
          item.id,
          {
            studentName: item.studentName,
            batchLabel: item.batchLabel,
            focusArea: item.focusArea,
            quote: item.quote,
            rating: item.rating,
            published: item.published,
          },
          exists
        );
      }

      await refreshPublicContent();
      notify('Sample batch, certificate, and 3 testimonials synced.');
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    } finally {
      setSeeding(false);
    }
  }

  function handleExportCsv() {
    const csv = leadsToCsv(filteredEnquiries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amreens-academy-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Exported ${filteredEnquiries.length} leads to CSV.`);
  }

  function handleConvertLeadToStudent(lead: EnquiryRecord) {
    setEnrName(lead.name);
    setEnrPhone(lead.phone);
    setEnrStatus('reserved');
    setActiveTab('enrollments');
    notify(`Prefilled enrollment form for ${lead.name}.`);
  }

  async function handleSaveCms(e: React.FormEvent) {
    e.preventDefault();
    setErrorBanner(null);
    setSavingCms(true);
    try {
      await saveSiteSettingsAdmin({
        ...cmsDraft,
        courseDays: Number(cmsDraft.courseDays) || 40,
      });
      await refreshPublicContent();
      notify('Live website copy & fee settings updated across all pages.');
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    } finally {
      setSavingCms(false);
    }
  }

  async function handleCreateTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setErrorBanner(null);
    try {
      await saveTestimonialAdmin(
        null,
        {
          studentName: tName,
          batchLabel: tBatch,
          focusArea: tFocus,
          quote: tQuote,
          rating: Number(tRating) || 5,
          published: tPublished,
        },
        false
      );
      await refreshPublicContent();
      setTName('');
      setTQuote('');
      notify('Student testimonial published.');
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    }
  }

  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    setErrorBanner(null);
    try {
      await saveBatchAdmin(
        null,
        {
          title: batchTitle,
          startDate: batchStart,
          timing: batchTiming,
          feeInr: Number(batchFee),
          instalmentNote: batchInstNote,
          seatLimit: Number(batchLimit),
          enrolledCount: 0,
          status: 'open',
        },
        false
      );
      setBatchTitle('');
      setBatchStart('');
      notify('New course batch created.');
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    }
  }

  async function handleCreateEnrollment(e: React.FormEvent) {
    e.preventDefault();
    setErrorBanner(null);
    try {
      await createEnrollmentAdmin({
        studentName: enrName,
        phone: enrPhone,
        email: enrEmail,
        batchId: enrBatchId || (batches[0]?.id ?? ''),
        feePlan: enrPlan,
        totalFeeInr: Number(enrTotalFee),
        amountPaidInr: Number(enrPaid),
        instalmentsPaid: Number(enrInstCount),
        status: enrStatus,
        notes: '',
      });
      setEnrName('');
      setEnrPhone('');
      setEnrEmail('');
      notify('Student enrollment saved.');
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    }
  }

  async function handleIssueCertificate(e: React.FormEvent) {
    e.preventDefault();
    setErrorBanner(null);
    try {
      const issued = await issueCertificateAdmin(
        {
          certCode,
          studentName: certStudent,
          courseName: certCourse,
          completionDate: certDate,
          grade: certGrade,
          status: 'valid',
        },
        false
      );
      setCertCode('');
      setCertStudent('');
      setCertDate('');
      notify(`Certificate ${issued} issued.`);
    } catch (err) {
      setErrorBanner(formatReadableError(err));
    }
  }

  async function handleCopyVerifyUrl(code: string) {
    const url = `${window.location.origin}/verify?code=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      notify(url);
    }
  }

  return (
    <div>
      <SeoHead
        title="Admin CRM & Live Website CMS | Amreen's Academy"
        description="Manage incoming student leads, WhatsApp follow-ups, live course settings, student testimonials, batches, fee instalments, and certificates."
      />

      <PageHero
        kicker="ACADEMY OPERATIONS CRM & CMS"
        title="Admin Console & CRM."
        subtitle="Manage your student lead pipeline, instant WhatsApp replies, live website headline & fee CMS, testimonials, batches, and verified certificates."
        footerTag="STAFF PORTAL"
        showActions={false}
      />

      <section className="content-section surface-light">
        <div className="page-container">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <strong style={{ fontSize: 18, fontWeight: 900, color: '#07182f' }}>
                Amreen&#39;s Academy Workspace
              </strong>
              <p className="mt-0.5 text-xs text-slate-500">
                Real-time Firestore CRM · Atomic Pipeline + Live Content CMS
              </p>
            </div>

            {user && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSeedDemo}
                  disabled={seeding}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#07182f] hover:bg-slate-50 disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#8c1539]" />
                  {seeding ? 'Syncing...' : 'Seed Sample Data'}
                </button>
                <span className="text-xs font-semibold text-slate-600">{user.email}</span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {errorBanner && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-[#b20f42]/35 bg-[#fdf2f5] p-4 text-sm font-semibold text-[#8c1539]"
            >
              {errorBanner}
            </div>
          )}

          {statusNotice && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-900"
            >
              {statusNotice}
            </div>
          )}

          {!authReady && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              Checking authentication status...
            </div>
          )}

          {authReady && !user && (
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#8c1539]/10 text-[#8c1539]">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-[#07182f]">
                Sign in with Admin Google Account
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Access to the Lead CRM, Website CMS, student fee ledgers, and certificate registry
                is protected by Firebase Authentication and Firestore Security Rules.
              </p>
              <button
                type="button"
                id="admin-signin-btn"
                onClick={handleSignIn}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#8c1539] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b20f42]"
              >
                Sign in with Google →
              </button>
              {authMsg && <p className="mt-3 text-xs font-semibold text-[#8c1539]">{authMsg}</p>}
            </div>
          )}

          {authReady && user && (
            <div className="space-y-6">
              {/* KPI Overview */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pipeline Leads
                  </span>
                  <strong className="mt-1.5 block font-heading text-3xl font-black text-[#07182f] tabular-nums">
                    {enquiries.length}
                  </strong>
                  <small className="text-xs text-slate-500">
                    {enquiries.filter((e) => e.status === 'new').length} awaiting follow-up
                  </small>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Collected Fees
                  </span>
                  <strong className="mt-1.5 block font-heading text-3xl font-black text-[#8c1539] tabular-nums">
                    ₹{totalCollectedInr.toLocaleString('en-IN')}
                  </strong>
                  <small className="text-xs text-slate-500">
                    {enrollments.length} enrolled students
                  </small>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Open Seats
                  </span>
                  <strong className="mt-1.5 block font-heading text-3xl font-black text-[#07182f] tabular-nums">
                    {openSeatsRemaining}
                  </strong>
                  <small className="text-xs text-slate-500">
                    Across {batches.filter((b) => b.status === 'open').length} open batches
                  </small>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Certificates
                  </span>
                  <strong className="mt-1.5 block font-heading text-3xl font-black text-[#07182f] tabular-nums">
                    {certificates.filter((c) => c.status === 'valid').length}
                  </strong>
                  <small className="text-xs text-slate-500">
                    {testimonialsList.filter((t) => t.published).length} published reviews
                  </small>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div
                role="tablist"
                aria-label="CRM and CMS sections"
                className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
              >
                {(
                  [
                    ['leads', `Lead CRM (${enquiries.length})`],
                    ['cms', 'Website CMS'],
                    ['testimonials', `Testimonials (${testimonialsList.length})`],
                    ['batches', `Batches (${batches.length})`],
                    ['enrollments', `Enrollments & Fees (${enrollments.length})`],
                    ['certificates', `Certificates (${certificates.length})`],
                  ] as [AdminTab, string][]
                ).map(([tabKey, label]) => (
                  <button
                    key={tabKey}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
                      activeTab === tabKey
                        ? 'bg-[#07182f] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#07182f]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* TAB 1: LEAD CRM (KANBAN + LIST + WHATSAPP PLAYBOOKS + CSV) */}
              {activeTab === 'leads' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-[#07182f]">
                        Student Lead Pipeline &amp; WhatsApp Desk
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Track enquiries from first contact to studio visit and 3-instalment enrollment.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex rounded-lg bg-slate-100 p-1">
                        <button
                          type="button"
                          onClick={() => setCrmView('kanban')}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                            crmView === 'kanban'
                              ? 'bg-white text-[#07182f] shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <Kanban className="h-3.5 w-3.5" />
                          Kanban
                        </button>
                        <button
                          type="button"
                          onClick={() => setCrmView('list')}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                            crmView === 'list'
                              ? 'bg-white text-[#07182f] shadow-xs'
                              : 'text-slate-600'
                          }`}
                        >
                          <LayoutList className="h-3.5 w-3.5" />
                          List
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportCsv}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Search & stage filters */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative min-w-[220px] flex-1 max-w-sm">
                      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, phone, or focus area..."
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-[#07182f]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                      {(['all', ...ENQUIRY_STATUSES] as const).map((statusKey) => (
                        <button
                          key={statusKey}
                          type="button"
                          onClick={() => setEnquiryFilter(statusKey)}
                          className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                            enquiryFilter === statusKey
                              ? 'bg-white text-[#07182f] shadow-xs'
                              : 'text-slate-600 hover:text-[#07182f]'
                          }`}
                        >
                          {statusKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {crmView === 'kanban' ? (
                    <div className="mt-5 grid gap-3 overflow-x-auto pb-2 lg:grid-cols-5">
                      {ENQUIRY_STATUSES.map((stage) => {
                        const stageItems = filteredEnquiries.filter((e) => e.status === stage);
                        return (
                          <div
                            key={stage}
                            className="flex min-w-[220px] flex-col rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-2.5 flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wider text-[#07182f]">
                                {STAGE_LABELS[stage]}
                              </span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#8c1539] border border-slate-200 tabular-nums">
                                {stageItems.length}
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {stageItems.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
                                  Empty stage
                                </p>
                              ) : (
                                stageItems.map((lead) => (
                                  <article
                                    key={lead.id}
                                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <strong className="text-xs font-extrabold text-[#07182f]">
                                        {lead.name}
                                      </strong>
                                      <button
                                        type="button"
                                        onClick={() => handleConvertLeadToStudent(lead)}
                                        title="Enroll student"
                                        className="rounded border border-slate-200 p-1 text-[#07182f] hover:bg-slate-100"
                                      >
                                        <UserPlus className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="mt-0.5 block font-mono text-[11px] font-semibold text-[#8c1539] hover:underline"
                                    >
                                      {lead.phone}
                                    </a>
                                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                                      {lead.interest || lead.course}
                                    </p>

                                    <div className="mt-2.5 flex flex-wrap gap-1">
                                      <a
                                        href={buildWhatsAppFollowupUrl({
                                          studentName: lead.name,
                                          phone: lead.phone,
                                          template: 'details',
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100"
                                      >
                                        WA Details
                                      </a>
                                      <a
                                        href={buildWhatsAppFollowupUrl({
                                          studentName: lead.name,
                                          phone: lead.phone,
                                          template: 'visit',
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 hover:bg-sky-100"
                                      >
                                        WA Visit
                                      </a>
                                      <a
                                        href={buildWhatsAppFollowupUrl({
                                          studentName: lead.name,
                                          phone: lead.phone,
                                          template: 'seat',
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-[#8c1539] hover:bg-rose-100"
                                      >
                                        WA Seat
                                      </a>
                                    </div>

                                    <select
                                      aria-label={`Move ${lead.name} stage`}
                                      value={lead.status}
                                      onChange={(e) => {
                                        const nextStatus = e.target.value as EnquiryStatus;
                                        void updateEnquiryAdmin(
                                          lead.id,
                                          nextStatus,
                                          lead.counselorNotes ?? ''
                                        ).catch((err) => setErrorBanner(formatReadableError(err)));
                                      }}
                                      className="mt-2.5 w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[#07182f]"
                                    >
                                      {ENQUIRY_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          Stage: {STAGE_LABELS[s]}
                                        </option>
                                      ))}
                                    </select>
                                  </article>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {filteredEnquiries.length === 0 ? (
                        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                          No enquiries matching this filter yet.
                        </p>
                      ) : (
                        filteredEnquiries.map((enq) => {
                          const currentStatus = statusDrafts[enq.id] ?? enq.status;
                          const currentNotes = noteDrafts[enq.id] ?? enq.counselorNotes ?? '';
                          const waUrl = buildWhatsAppEnquiryUrl({
                            enquiryId: enq.id,
                            name: enq.name,
                            phone: enq.phone,
                            course: enq.course,
                            interest: enq.interest,
                          });

                          return (
                            <article
                              key={enq.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-base font-extrabold text-[#07182f]">
                                    {enq.name} ·{' '}
                                    <a
                                      href={`tel:${enq.phone}`}
                                      className="font-mono text-sm font-semibold text-[#8c1539] hover:underline"
                                    >
                                      {enq.phone}
                                    </a>
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Ref: <span className="font-mono">{enq.id}</span> · Source:{' '}
                                    {enq.sourcePage} · {enq.course}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleConvertLeadToStudent(enq)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Enroll
                                  </button>
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#8c1539]">
                                    {STAGE_LABELS[enq.status]}
                                  </span>
                                </div>
                              </div>

                              {enq.message && (
                                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                                  {enq.message}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                                  <MessageSquare className="h-3 w-3" /> Quick WhatsApp:
                                </span>
                                <a
                                  href={buildWhatsAppFollowupUrl({
                                    studentName: enq.name,
                                    phone: enq.phone,
                                    template: 'details',
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                                >
                                  Send 40-Day Details ↗
                                </a>
                                <a
                                  href={buildWhatsAppFollowupUrl({
                                    studentName: enq.name,
                                    phone: enq.phone,
                                    template: 'visit',
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100"
                                >
                                  Invite Studio Visit ↗
                                </a>
                                <a
                                  href={buildWhatsAppFollowupUrl({
                                    studentName: enq.name,
                                    phone: enq.phone,
                                    template: 'seat',
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-[#8c1539] hover:bg-rose-100"
                                >
                                  Reserve Seat ↗
                                </a>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                                >
                                  Original Chat ↗
                                </a>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <select
                                  aria-label={`Status for ${enq.name}`}
                                  value={currentStatus}
                                  onChange={(e) =>
                                    setStatusDrafts((prev) => ({
                                      ...prev,
                                      [enq.id]: e.target.value as EnquiryStatus,
                                    }))
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#07182f]"
                                >
                                  {ENQUIRY_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {STAGE_LABELS[s]}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  value={currentNotes}
                                  onChange={(e) =>
                                    setNoteDrafts((prev) => ({
                                      ...prev,
                                      [enq.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Counselor notes..."
                                  className="min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-[#07182f]"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateEnquiryAdmin(enq.id, currentStatus, currentNotes)
                                      .then(() => notify(`Updated lead ${enq.name}.`))
                                      .catch((err) => setErrorBanner(formatReadableError(err)))
                                  }
                                  className="rounded-lg bg-[#07182f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#102c52]"
                                >
                                  Save
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteEnquiryAdmin(enq.id).catch((err) =>
                                      setErrorBanner(formatReadableError(err))
                                    )
                                  }
                                  aria-label={`Delete enquiry from ${enq.name}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#b20f42]/30 px-2.5 py-1.5 text-xs font-bold text-[#8c1539] hover:bg-[#fdf2f5]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </article>
                          );
                        })
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* TAB 2: WEBSITE CMS */}
              {activeTab === 'cms' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#8c1539]" />
                    <h2 className="text-xl font-black text-[#07182f]">
                      Live Website Content CMS (No Code Editing)
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Update your hero headline, course name, duration, fee, and announcement banner
                    in real time across the homepage, course pages, and enquiry dialog.
                  </p>

                  <form
                    onSubmit={handleSaveCms}
                    className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2"
                  >
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Hero Headline (5-Second Hook)
                      <input
                        required
                        value={cmsDraft.heroHeadline}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, heroHeadline: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Top Announcement Kicker
                      <input
                        required
                        value={cmsDraft.announcementBanner}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, announcementBanner: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f] sm:col-span-2">
                      Hero Subheadline (What We Teach + Price)
                      <textarea
                        required
                        rows={2}
                        value={cmsDraft.heroSubheadline}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, heroSubheadline: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Single Course Title
                      <input
                        required
                        value={cmsDraft.courseName}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, courseName: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Course Duration (Days)
                      <input
                        type="number"
                        required
                        min={1}
                        max={365}
                        value={cmsDraft.courseDays}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({
                            ...prev,
                            courseDays: Number(e.target.value) || 40,
                          }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Course Fee Display
                      <input
                        required
                        value={cmsDraft.courseFee}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, courseFee: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Instalment Note
                      <input
                        required
                        value={cmsDraft.instalmentNote}
                        onChange={(e) =>
                          setCmsDraft((prev) => ({ ...prev, instalmentNote: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>

                    <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={savingCms}
                        className="rounded-lg bg-[#8c1539] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#b20f42] disabled:opacity-60"
                      >
                        {savingCms ? 'Publishing...' : 'Publish Changes Live'}
                      </button>
                      <Link
                        to="/"
                        className="text-xs font-bold text-[#07182f] underline hover:text-[#8c1539]"
                      >
                        Preview Live Homepage ↗
                      </Link>
                    </div>
                  </form>
                </section>
              )}

              {/* TAB 3: TESTIMONIALS */}
              {activeTab === 'testimonials' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#8c1539]" />
                    <h2 className="text-xl font-black text-[#07182f]">
                      Student Testimonials &amp; Social Proof
                    </h2>
                  </div>

                  <form
                    onSubmit={handleCreateTestimonial}
                    className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
                  >
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Student Name
                      <input
                        required
                        value={tName}
                        onChange={(e) => setTName(e.target.value)}
                        placeholder="e.g. Sana Fathima"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Batch / Verification Label
                      <input
                        required
                        value={tBatch}
                        onChange={(e) => setTBatch(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Focus Area
                      <input
                        required
                        value={tFocus}
                        onChange={(e) => setTFocus(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f] sm:col-span-2">
                      Student Review Quote
                      <textarea
                        required
                        minLength={8}
                        rows={2}
                        value={tQuote}
                        onChange={(e) => setTQuote(e.target.value)}
                        placeholder="What did the student love about the 40-day Skin & Hair training?"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <div className="grid gap-2">
                      <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                        Rating (1–5)
                        <select
                          value={tRating}
                          onChange={(e) => setTRating(e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#07182f]">
                        <input
                          type="checkbox"
                          checked={tPublished}
                          onChange={(e) => setTPublished(e.target.checked)}
                        />
                        Publish on website
                      </label>
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#07182f] px-4 py-2 text-xs font-bold text-white hover:bg-[#102c52]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Testimonial
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 space-y-3">
                    {testimonialsList.map((item) => (
                      <article
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      >
                        <div className="max-w-2xl">
                          <strong className="text-sm font-extrabold text-[#07182f]">
                            {item.studentName} ·{' '}
                            <span className="text-xs font-semibold text-[#8c1539]">
                              {'★'.repeat(item.rating)} · {item.focusArea}
                            </span>
                          </strong>
                          <p className="mt-1 text-xs text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                          <small className="text-[11px] text-slate-500">
                            {item.batchLabel} · {item.published ? 'Published' : 'Hidden'}
                          </small>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void saveTestimonialAdmin(
                                item.id,
                                {
                                  studentName: item.studentName,
                                  batchLabel: item.batchLabel,
                                  focusArea: item.focusArea,
                                  quote: item.quote,
                                  rating: item.rating,
                                  published: !item.published,
                                },
                                true
                              )
                                .then(() => refreshPublicContent())
                                .catch((err) => setErrorBanner(formatReadableError(err)))
                            }
                            className="rounded-lg bg-[#07182f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102c52]"
                          >
                            {item.published ? 'Hide' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void deleteTestimonialAdmin(item.id)
                                .then(() => refreshPublicContent())
                                .catch((err) => setErrorBanner(formatReadableError(err)))
                            }
                            className="rounded-lg border border-[#b20f42]/30 px-3 py-1.5 text-xs font-bold text-[#8c1539] hover:bg-[#fdf2f5]"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB 4: BATCHES */}
              {activeTab === 'batches' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <h2 className="text-xl font-black text-[#07182f]">
                    Course Batches &amp; Seat Capacity
                  </h2>

                  <form
                    onSubmit={handleCreateBatch}
                    className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
                  >
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Batch Title
                      <input
                        required
                        value={batchTitle}
                        onChange={(e) => setBatchTitle(e.target.value)}
                        placeholder="40-Day Skin & Hair — Jan Batch"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Start Date
                      <input
                        required
                        value={batchStart}
                        onChange={(e) => setBatchStart(e.target.value)}
                        placeholder="2027-01-12"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Class Timing
                      <input
                        required
                        value={batchTiming}
                        onChange={(e) => setBatchTiming(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Total Fee (INR)
                      <input
                        type="number"
                        required
                        min={0}
                        max={500000}
                        value={batchFee}
                        onChange={(e) => setBatchFee(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Instalment Note
                      <input
                        required
                        value={batchInstNote}
                        onChange={(e) => setBatchInstNote(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Seat Limit
                      <input
                        type="number"
                        required
                        min={1}
                        max={500}
                        value={batchLimit}
                        onChange={(e) => setBatchLimit(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#07182f] px-4 py-2 text-xs font-bold text-white hover:bg-[#102c52]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Batch
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 space-y-3">
                    {batches.map((b) => (
                      <article
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      >
                        <div>
                          <strong className="text-sm font-extrabold text-[#07182f]">
                            {b.title} · {b.startDate}
                          </strong>
                          <p className="mt-1 text-xs text-slate-600 tabular-nums">
                            {b.timing} · Fee: ₹{Number(b.feeInr).toLocaleString('en-IN')} · Seats:{' '}
                            {b.enrolledCount}/{b.seatLimit} · Status: {b.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const nextCount = Math.min(b.seatLimit, b.enrolledCount + 1);
                              void saveBatchAdmin(
                                b.id,
                                {
                                  title: b.title,
                                  startDate: b.startDate,
                                  timing: b.timing,
                                  feeInr: b.feeInr,
                                  instalmentNote: b.instalmentNote,
                                  seatLimit: b.seatLimit,
                                  enrolledCount: nextCount,
                                  status: nextCount >= b.seatLimit ? 'full' : b.status,
                                },
                                true
                              ).catch((err) => setErrorBanner(formatReadableError(err)));
                            }}
                            className="rounded-lg bg-[#07182f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102c52]"
                          >
                            +1 Seat
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void deleteBatchAdmin(b.id).catch((err) =>
                                setErrorBanner(formatReadableError(err))
                              )
                            }
                            className="rounded-lg border border-[#b20f42]/30 px-3 py-1.5 text-xs font-bold text-[#8c1539] hover:bg-[#fdf2f5]"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB 5: ENROLLMENTS */}
              {activeTab === 'enrollments' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <h2 className="text-xl font-black text-[#07182f]">
                    Student Enrollments &amp; 3-Instalment Fee Tracker
                  </h2>

                  <form
                    onSubmit={handleCreateEnrollment}
                    className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
                  >
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Student Name
                      <input
                        required
                        value={enrName}
                        onChange={(e) => setEnrName(e.target.value)}
                        placeholder="Full name"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Phone Number
                      <input
                        required
                        value={enrPhone}
                        onChange={(e) => setEnrPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Email (optional)
                      <input
                        type="email"
                        value={enrEmail}
                        onChange={(e) => setEnrEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Batch
                      <select
                        required
                        value={enrBatchId}
                        onChange={(e) => setEnrBatchId(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      >
                        {batches.length === 0 ? (
                          <option value="">Create a batch first</option>
                        ) : (
                          batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.title} ({b.startDate})
                            </option>
                          ))
                        )}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Fee Plan
                      <select
                        value={enrPlan}
                        onChange={(e) => setEnrPlan(e.target.value as FeePlan)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      >
                        <option value="instalments_3">3 Instalments</option>
                        <option value="full">Full Payment</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Total Fee (INR)
                      <input
                        type="number"
                        required
                        min={0}
                        max={500000}
                        value={enrTotalFee}
                        onChange={(e) => setEnrTotalFee(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Paid So Far (INR)
                      <input
                        type="number"
                        required
                        min={0}
                        max={500000}
                        value={enrPaid}
                        onChange={(e) => setEnrPaid(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Instalments Paid (0–3)
                      <input
                        type="number"
                        required
                        min={0}
                        max={3}
                        value={enrInstCount}
                        onChange={(e) => setEnrInstCount(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium tabular-nums"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Status
                      <select
                        value={enrStatus}
                        onChange={(e) => setEnrStatus(e.target.value as EnrollmentStatus)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      >
                        <option value="reserved">Reserved</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#07182f] px-4 py-2 text-xs font-bold text-white hover:bg-[#102c52]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Enrollment
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 space-y-3">
                    {enrollments.map((item) => {
                      const balance = Math.max(0, item.totalFeeInr - item.amountPaidInr);
                      return (
                        <article
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                        >
                          <div>
                            <strong className="text-sm font-extrabold text-[#07182f]">
                              {item.studentName} · {item.phone}
                            </strong>
                            <p className="mt-1 text-xs text-slate-600 tabular-nums">
                              Paid ₹{item.amountPaidInr.toLocaleString('en-IN')} / ₹
                              {item.totalFeeInr.toLocaleString('en-IN')} (Balance: ₹
                              {balance.toLocaleString('en-IN')}) · Instalments:{' '}
                              {item.instalmentsPaid}/3 · Status: {item.status}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const nextPaid = Math.min(item.totalFeeInr, item.amountPaidInr + 10000);
                              const nextInst = Math.min(3, item.instalmentsPaid + 1);
                              void updateEnrollmentPaymentAdmin(item.id, {
                                studentName: item.studentName,
                                phone: item.phone,
                                email: item.email,
                                feePlan: item.feePlan,
                                totalFeeInr: item.totalFeeInr,
                                amountPaidInr: nextPaid,
                                instalmentsPaid: nextInst,
                                status: nextPaid >= item.totalFeeInr ? 'active' : item.status,
                                notes: item.notes,
                              })
                                .then(() => notify(`Recorded ₹10,000 instalment for ${item.studentName}.`))
                                .catch((err) => setErrorBanner(formatReadableError(err)));
                            }}
                            className="rounded-lg bg-[#07182f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102c52]"
                          >
                            Record ₹10,000 Instalment
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TAB 6: CERTIFICATES */}
              {activeTab === 'certificates' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                  <h2 className="text-xl font-black text-[#07182f]">
                    Online Certificate Registry
                  </h2>

                  <form
                    onSubmit={handleIssueCertificate}
                    className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
                  >
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Certificate ID
                      <input
                        required
                        value={certCode}
                        onChange={(e) => setCertCode(e.target.value)}
                        placeholder="AA-2026-0002"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs uppercase"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Graduate Name
                      <input
                        required
                        value={certStudent}
                        onChange={(e) => setCertStudent(e.target.value)}
                        placeholder="Student full name"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Course Name
                      <input
                        required
                        value={certCourse}
                        onChange={(e) => setCertCourse(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Completion Date
                      <input
                        required
                        value={certDate}
                        onChange={(e) => setCertDate(e.target.value)}
                        placeholder="2026-12-20"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-[#07182f]">
                      Grade / Standing
                      <input
                        required
                        value={certGrade}
                        onChange={(e) => setCertGrade(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      />
                    </label>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#07182f] px-4 py-2 text-xs font-bold text-white hover:bg-[#102c52]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Issue Certificate
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 space-y-3">
                    {certificates.map((c) => (
                      <article
                        key={c.certCode}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                      >
                        <div>
                          <strong className="text-sm font-extrabold text-[#07182f]">
                            {c.studentName} ·{' '}
                            <span className="font-mono text-xs text-[#8c1539]">{c.certCode}</span>
                          </strong>
                          <p className="mt-1 text-xs text-slate-600 tabular-nums">
                            {c.courseName} · Completed: {c.completionDate} · Standing: {c.grade} ·
                            Status: {c.status}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/verify?code=${encodeURIComponent(c.certCode)}`}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                          >
                            Verify ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleCopyVerifyUrl(c.certCode)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-[#07182f] hover:bg-slate-50"
                          >
                            {copiedCode === c.certCode ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-700" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy Link
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void issueCertificateAdmin(
                                {
                                  certCode: c.certCode,
                                  studentName: c.studentName,
                                  courseName: c.courseName,
                                  completionDate: c.completionDate,
                                  grade: c.grade,
                                  status: c.status === 'valid' ? 'revoked' : 'valid',
                                },
                                true
                              ).catch((err) => setErrorBanner(formatReadableError(err)))
                            }
                            className="rounded-lg bg-[#07182f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102c52]"
                          >
                            {c.status === 'valid' ? 'Revoke' : 'Restore'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void deleteCertificateAdmin(c.certCode).catch((err) =>
                                setErrorBanner(formatReadableError(err))
                              )
                            }
                            className="rounded-lg border border-[#b20f42]/30 px-3 py-1.5 text-xs font-bold text-[#8c1539] hover:bg-[#fdf2f5]"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
