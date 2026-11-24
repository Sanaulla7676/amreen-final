import { Calendar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listPublicBatches, type BatchRecord } from '../backend/firebase-client.ts';
import { useFirebase } from '../context/FirebaseContext.tsx';

export function LiveBatchesPanel({ dark = false }: { dark?: boolean }) {
  const { openEnquiryModal } = useFirebase();
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listPublicBatches()
      .then((rows) => {
        if (!active) return;
        setBatches(rows);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Confirm upcoming batch dates directly with our admissions desk.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="backend-panel p-6" style={{ fontSize: 14, color: 'rgba(7,26,55,0.72)' }}>
        Loading upcoming batch schedules...
      </div>
    );
  }

  if (error || batches.length === 0) {
    return (
      <div className="backend-panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <span className="mini-label" style={{ marginBottom: 6, color: '#8c1539' }}>
            NEXT COHORT ADMISSIONS
          </span>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(7,26,55,0.78)' }}>
            {error ||
              'New 40-day batches open monthly in Thanisandra, Bengaluru. Reserve your seat with our counselor.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEnquiryModal('40-Day Integrated Beauty & Makeup Program')}
          className="button button-primary"
        >
          Request Batch Dates →
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {batches.map((batch) => {
        const seatsLeft = Math.max(0, batch.seatLimit - batch.enrolledCount);
        return (
          <article
            key={batch.id}
            className={`rounded-xl border p-6 ${
              dark
                ? 'border-white/15 bg-white/5 text-white'
                : 'border-slate-200 bg-white text-[#07182f] shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#ee376c]">
                Status: {batch.status}
              </span>
              <span className={`tabular-nums ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {seatsLeft} of {batch.seatLimit} seats remaining
              </span>
            </div>
            <h3 className="mt-2.5 text-lg font-extrabold leading-snug">{batch.title}</h3>
            <div
              className={`mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs ${
                dark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#ee376c]" />
                {batch.startDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#ee376c]" />
                {batch.timing}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Users className="h-3.5 w-3.5 text-[#ee376c]" />
                ₹{Number(batch.feeInr).toLocaleString('en-IN')} · {batch.instalmentNote}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openEnquiryModal(batch.title)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#ee376c] transition-colors hover:underline"
            >
              Enquire for this batch →
            </button>
          </article>
        );
      })}
    </div>
  );
}
