'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { testsAdminAPI, type AdminTest } from '@/lib/api/tests';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileQuestion,
  Clock,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  X,
} from 'lucide-react';

const TEST_TYPES = ['PLACEMENT', 'SPEAKING', 'WRITTEN', 'UPGRADE'] as const;

export default function TestBuilderListPage() {
  const router = useRouter();
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('PLACEMENT');
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await testsAdminAPI.list({ testType: typeFilter });
      setTests(res?.tests ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter]); // eslint-disable-line

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async (t: AdminTest) => {
    if (!confirm(`Delete "${t.name}"? This removes all its questions.`)) return;
    setBusy(t.id);
    try {
      await testsAdminAPI.remove(t.id);
      setTests(prev => prev.filter(x => x.id !== t.id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete test');
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (t: AdminTest) => {
    setBusy(t.id);
    try {
      const res = await testsAdminAPI.update(t.id, { isActive: !t.isActive });
      const next = res?.test;
      if (next) setTests(prev => prev.map(x => (x.id === t.id ? { ...x, isActive: next.isActive } : x)));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <header className="ambient-wash flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pt-2">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-fg-subtle">Test builder</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-fg text-balance">
            Build and edit placement tests.
          </h1>
          <p className="text-[13.5px] text-fg-muted max-w-xl">
            Create question banks, set correct answers, adjust difficulty. Students see only what is active.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="group inline-flex items-center gap-2 self-start sm:self-end rounded-[var(--radius-sm)] bg-accent text-accent-fg px-4 py-2.5 text-[13px] font-medium transition-all duration-[var(--dur-fast)] hover:bg-accent-hover hover:-translate-y-0.5 shadow-sm"
        >
          <Plus className="h-4 w-4 transition-transform duration-[var(--dur)] group-hover:rotate-90" strokeWidth={2} />
          New test
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests by name…"
            className="w-full h-10 pl-10 pr-3 rounded-[var(--radius-sm)] border border-border bg-bg-elev text-[13.5px] text-fg placeholder:text-fg-subtle focus:border-accent outline-none"
          />
        </div>
        <div className="inline-flex rounded-[var(--radius-sm)] border border-border bg-bg-elev p-0.5">
          {TEST_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={[
                'px-3 py-1.5 text-[12px] rounded-[6px] transition-colors duration-[var(--dur-fast)]',
                typeFilter === t
                  ? 'bg-accent text-accent-fg'
                  : 'text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filtered.map(t => (
            <li key={t.id}>
              <TestCard
                test={t}
                busy={busy === t.id}
                onOpen={() => router.push(`/admin/test-builder/${t.id}`)}
                onDelete={() => handleDelete(t)}
                onToggle={() => toggleActive(t)}
              />
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <CreateTestDialog
          defaultType={typeFilter}
          onClose={() => setShowCreate(false)}
          onCreated={(t) => {
            setShowCreate(false);
            router.push(`/admin/test-builder/${t.id}`);
          }}
        />
      )}
    </div>
  );
}

function TestCard({
  test, busy, onOpen, onDelete, onToggle,
}: {
  test: AdminTest;
  busy: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <article className="lift group relative rounded-[var(--radius-lg)] border border-border bg-bg-elev p-5 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur)] pointer-events-none"
        style={{ background: 'radial-gradient(120% 80% at 0% 0%, oklch(from var(--accent) l c h / 0.06), transparent 60%)' }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.12em] text-fg-subtle">{test.testType}</p>
          <h3 className="mt-1.5 font-serif text-[22px] leading-tight text-fg truncate">{test.name}</h3>
        </div>
        <button
          onClick={onToggle}
          disabled={busy}
          title={test.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
          className={[
            'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors',
            test.isActive
              ? 'bg-[oklch(from_var(--success)_l_c_h_/_0.10)] text-success'
              : 'bg-bg-sunken text-fg-subtle',
          ].join(' ')}
        >
          {test.isActive ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <Circle className="h-3 w-3" strokeWidth={2} />}
          {test.isActive ? 'Active' : 'Draft'}
        </button>
      </div>

      <dl className="relative mt-5 grid grid-cols-2 gap-3 text-[12px]">
        <div className="rounded-[var(--radius-sm)] bg-bg-sunken px-3 py-2">
          <dt className="text-fg-subtle text-[10.5px] uppercase tracking-wider">Questions</dt>
          <dd className="mt-0.5 tnum text-fg font-medium inline-flex items-center gap-1">
            <FileQuestion className="h-3.5 w-3.5 text-fg-subtle" strokeWidth={1.75} />
            {test.totalQuestions}
          </dd>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-bg-sunken px-3 py-2">
          <dt className="text-fg-subtle text-[10.5px] uppercase tracking-wider">Duration</dt>
          <dd className="mt-0.5 tnum text-fg font-medium inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-fg-subtle" strokeWidth={1.75} />
            {test.durationMinutes} min
          </dd>
        </div>
      </dl>

      <div className="relative mt-5 flex items-center justify-between">
        <button
          onClick={onOpen}
          className="group/btn inline-flex items-center gap-1.5 text-[13px] text-accent hover:text-accent-hover transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          Edit
          <ArrowUpRight className="h-3 w-3 -translate-y-px transition-transform duration-[var(--dur-fast)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-1" strokeWidth={2} />
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-fg-subtle hover:bg-[oklch(from_var(--danger)_l_c_h_/_0.10)] hover:text-danger transition-colors disabled:opacity-50"
          aria-label="Delete test"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="relative h-44 rounded-[var(--radius-lg)] border border-border bg-bg-elev overflow-hidden">
          <div className="absolute inset-0 shimmer" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-bg-elev py-16 px-6 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent mb-4">
        <FileQuestion className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-xl text-fg">No tests yet</h3>
      <p className="mt-1.5 text-[13.5px] text-fg-muted max-w-md mx-auto">
        Create your first test, then add questions one by one. Students will see it on their dashboard.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent text-accent-fg px-4 py-2 text-[13px] font-medium hover:bg-accent-hover transition-colors"
      >
        <Plus className="h-4 w-4" />
        New test
      </button>
    </div>
  );
}

function CreateTestDialog({
  defaultType, onClose, onCreated,
}: {
  defaultType: string;
  onClose: () => void;
  onCreated: (t: AdminTest) => void;
}) {
  const [name, setName] = useState('');
  const [testType, setTestType] = useState(defaultType);
  const [duration, setDuration] = useState(45);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Name is required.');
    setSubmitting(true);
    try {
      const res = await testsAdminAPI.create({
        name: name.trim(),
        testType,
        durationMinutes: duration,
        totalQuestions: 0,
      });
      if (res?.success && res.test) onCreated(res.test);
      else setError(res?.message ?? 'Failed to create.');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[oklch(from_var(--fg)_l_c_h_/_0.40)] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-bg-elev p-6 shadow-xl animate-rise-in"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl text-fg leading-tight">New test</h2>
            <p className="mt-1 text-[12.5px] text-fg-muted">You can add questions after creating.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-bg-sunken">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="A1 placement, autumn 2026"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-border bg-bg text-[13.5px] focus:border-accent outline-none"
              autoFocus
            />
          </Field>

          <Field label="Type">
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-[var(--radius-sm)] border border-border bg-bg">
              {TEST_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTestType(t)}
                  className={[
                    'px-2 py-1.5 text-[12px] rounded-[6px] transition-colors',
                    testType === t ? 'bg-accent text-accent-fg' : 'text-fg-muted hover:text-fg',
                  ].join(' ')}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Duration (minutes)">
            <input
              type="number" min={5} max={300}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-border bg-bg text-[13.5px] tnum focus:border-accent outline-none"
            />
          </Field>

          {error && (
            <p className="text-[12.5px] text-danger">{error}</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3.5 py-2 text-[13px] text-fg-muted hover:text-fg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent text-accent-fg px-4 py-2 text-[13px] font-medium hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Creating…' : 'Create test'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[11px] uppercase tracking-[0.1em] text-fg-subtle">{label}</span>
      {children}
    </label>
  );
}
