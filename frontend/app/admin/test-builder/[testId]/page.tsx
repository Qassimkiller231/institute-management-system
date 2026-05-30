'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  testsAdminAPI,
  type AdminTest,
  type AdminQuestion,
  type QuestionType,
} from '@/lib/api/tests';
import {
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  CircleDot,
  ToggleLeft,
  PenLine,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const QUESTION_TYPES: { value: QuestionType; label: string; icon: any }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice', icon: CircleDot },
  { value: 'TRUE_FALSE',     label: 'True / false',    icon: ToggleLeft },
  { value: 'FILL_BLANK',     label: 'Fill blank',      icon: PenLine },
];

export default function TestEditorPage() {
  const params = useParams<{ testId: string }>();
  const router = useRouter();
  const testId = params.testId;

  const [test, setTest] = useState<AdminTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirtyMeta, setDirtyMeta] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [reordering, setReordering] = useState(false);

  // local working draft for metadata
  const [meta, setMeta] = useState<{ name: string; durationMinutes: number; isActive: boolean }>({
    name: '', durationMinutes: 45, isActive: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await testsAdminAPI.get(testId);
      const t = res?.test as AdminTest | undefined;
      if (t) {
        setTest(t);
        setMeta({ name: t.name, durationMinutes: t.durationMinutes, isActive: t.isActive });
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [testId]); // eslint-disable-line

  useEffect(() => {
    if (!test) return;
    const changed =
      meta.name !== test.name ||
      meta.durationMinutes !== test.durationMinutes ||
      meta.isActive !== test.isActive;
    setDirtyMeta(changed);
  }, [meta, test]);

  const saveMeta = async () => {
    if (!test) return;
    setSavingMeta(true);
    try {
      const res = await testsAdminAPI.update(test.id, meta);
      if (res?.success) {
        await load();
      }
    } finally {
      setSavingMeta(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!test) return;
    const nextOrder =
      Math.max(0, ...(test.questions ?? []).map(q => q.orderNumber)) + 1;
    const res = await testsAdminAPI.addQuestion(test.id, {
      questionText: 'New question',
      questionType: 'MULTIPLE_CHOICE',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      points: 1,
      orderNumber: nextOrder,
    });
    if (res?.success) await load();
  };

  const handleSaveQuestion = async (q: AdminQuestion) => {
    if (!test) return;
    await testsAdminAPI.updateQuestion(test.id, q.id, {
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ?? null,
      correctAnswer: q.correctAnswer,
      points: q.points,
    });
    await load();
  };

  const handleDeleteQuestion = async (q: AdminQuestion) => {
    if (!test) return;
    if (!confirm('Delete this question?')) return;
    await testsAdminAPI.deleteQuestion(test.id, q.id);
    await load();
  };

  const moveQuestion = async (q: AdminQuestion, dir: -1 | 1) => {
    if (!test?.questions?.length) return;
    const sorted = [...test.questions].sort((a, b) => a.orderNumber - b.orderNumber);
    const idx = sorted.findIndex(x => x.id === q.id);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    setReordering(true);
    try {
      const swapped = [...sorted];
      [swapped[idx], swapped[target]] = [swapped[target], swapped[idx]];
      const orders = swapped.map((x, i) => ({ id: x.id, orderNumber: i + 1 }));
      await testsAdminAPI.reorder(test.id, orders);
      await load();
    } finally {
      setReordering(false);
    }
  };

  if (loading) return <EditorSkeleton />;
  if (!test) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elev p-10 text-center max-w-xl mx-auto">
        <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
        <h2 className="mt-3 font-serif text-xl">Test not found</h2>
        <Link href="/admin/test-builder" className="mt-4 inline-block text-accent text-[13.5px] hover:underline">
          Back to tests
        </Link>
      </div>
    );
  }

  const sortedQs = [...(test.questions ?? [])].sort((a, b) => a.orderNumber - b.orderNumber);
  const totalPoints = sortedQs.reduce((s, q) => s + (q.points || 0), 0);

  return (
    <div className="space-y-8 max-w-[1100px]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/admin/test-builder')}
          className="group inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
          All tests
        </button>
        {dirtyMeta && (
          <button
            onClick={saveMeta}
            disabled={savingMeta}
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent text-accent-fg px-3.5 py-2 text-[13px] font-medium hover:bg-accent-hover transition-colors animate-fade-in"
          >
            {savingMeta ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save changes
          </button>
        )}
      </div>

      {/* Meta panel */}
      <section className="ambient-wash rounded-[var(--radius-lg)] border border-border bg-bg-elev p-6 space-y-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-fg-subtle">{test.testType}</p>
        <input
          value={meta.name}
          onChange={(e) => setMeta({ ...meta, name: e.target.value })}
          className="w-full font-serif text-3xl sm:text-4xl leading-tight tracking-tight bg-transparent border-0 border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors text-fg pb-1"
          placeholder="Untitled test"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetaStat label="Questions" value={String(sortedQs.length)} />
          <MetaStat label="Total points" value={String(totalPoints)} />
          <MetaStat
            label="Duration"
            value={
              <input
                type="number" min={5} max={300}
                value={meta.durationMinutes}
                onChange={(e) => setMeta({ ...meta, durationMinutes: parseInt(e.target.value || '0', 10) })}
                className="w-16 bg-transparent tnum text-fg focus:outline-none border-b border-transparent hover:border-border focus:border-accent transition-colors"
              />
            }
            suffix="min"
          />
        </div>

        <label className="inline-flex items-center gap-3 text-[13px] text-fg-muted cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={meta.isActive}
            onClick={() => setMeta({ ...meta, isActive: !meta.isActive })}
            className={[
              'relative shrink-0 h-6 w-11 rounded-full transition-colors duration-[var(--dur-fast)]',
              meta.isActive ? 'bg-accent' : 'bg-bg-sunken border border-border',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-[var(--dur)] ease-[var(--ease-out)]',
                meta.isActive ? 'left-[22px]' : 'left-0.5',
              ].join(' ')}
            />
          </button>
          <span>{meta.isActive ? 'Visible to students' : 'Draft — hidden from students'}</span>
        </label>
      </section>

      {/* Questions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-fg">Questions</h2>
          <button
            onClick={handleAddQuestion}
            className="group inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-bg-elev px-3.5 py-2 text-[13px] text-fg-muted hover:text-fg hover:border-border-strong transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2} />
            Add question
          </button>
        </div>

        {sortedQs.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-bg-elev py-12 text-center">
            <p className="text-fg-muted text-[13.5px]">No questions yet. Add the first one to begin.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {sortedQs.map((q, i) => (
              <QuestionCard
                key={q.id}
                index={i + 1}
                question={q}
                isFirst={i === 0}
                isLast={i === sortedQs.length - 1}
                reordering={reordering}
                onSave={handleSaveQuestion}
                onDelete={() => handleDeleteQuestion(q)}
                onMoveUp={() => moveQuestion(q, -1)}
                onMoveDown={() => moveQuestion(q, 1)}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

/* ─── Question card ─── */

function QuestionCard({
  index, question, isFirst, isLast, reordering,
  onSave, onDelete, onMoveUp, onMoveDown,
}: {
  index: number;
  question: AdminQuestion;
  isFirst: boolean;
  isLast: boolean;
  reordering: boolean;
  onSave: (q: AdminQuestion) => Promise<void>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [draft, setDraft] = useState<AdminQuestion>(question);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(question); }, [question]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(question), [draft, question]);

  const save = async () => {
    setSaving(true);
    try { await onSave(draft); } finally { setSaving(false); }
  };

  const reset = () => setDraft(question);

  const changeType = (qt: QuestionType) => {
    if (qt === 'TRUE_FALSE') {
      setDraft({ ...draft, questionType: qt, options: ['True', 'False'], correctAnswer: 'True' });
    } else if (qt === 'MULTIPLE_CHOICE') {
      const opts = Array.isArray(draft.options) && draft.options.length >= 2 ? draft.options : ['Option A', 'Option B', 'Option C', 'Option D'];
      setDraft({ ...draft, questionType: qt, options: opts, correctAnswer: opts.includes(draft.correctAnswer) ? draft.correctAnswer : opts[0] });
    } else {
      setDraft({ ...draft, questionType: qt, options: null });
    }
  };

  return (
    <li className="lift group rounded-[var(--radius-lg)] border border-border bg-bg-elev overflow-hidden">
      <div className="flex">
        {/* Side rail */}
        <div className="flex flex-col items-center justify-between bg-bg-sunken border-r border-border w-12 py-3">
          <div className="flex flex-col items-center gap-1">
            <GripVertical className="h-3.5 w-3.5 text-fg-subtle opacity-60" strokeWidth={1.75} />
            <span className="font-serif text-[15px] tnum text-fg-muted">{index}</span>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={isFirst || reordering}
              className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-fg-subtle hover:bg-bg-elev hover:text-fg disabled:opacity-25 transition-colors"
              aria-label="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast || reordering}
              className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-fg-subtle hover:bg-bg-elev hover:text-fg disabled:opacity-25 transition-colors"
              aria-label="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-4">
          {/* Type selector */}
          <div className="flex flex-wrap items-center gap-2">
            {QUESTION_TYPES.map(t => {
              const Icon = t.icon;
              const active = draft.questionType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => changeType(t.value)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition-colors',
                    active ? 'bg-accent-soft text-accent' : 'text-fg-subtle hover:text-fg',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {t.label}
                </button>
              );
            })}
            <div className="ml-auto inline-flex items-center gap-2 text-[11.5px] text-fg-subtle">
              Points
              <input
                type="number" min={0} max={100}
                value={draft.points}
                onChange={(e) => setDraft({ ...draft, points: parseInt(e.target.value || '0', 10) })}
                className="w-14 h-7 px-2 rounded-[var(--radius-sm)] border border-border bg-bg text-[12.5px] tnum text-fg focus:border-accent outline-none"
              />
            </div>
          </div>

          {/* Question text */}
          <textarea
            value={draft.questionText}
            onChange={(e) => setDraft({ ...draft, questionText: e.target.value })}
            rows={2}
            className="w-full text-[15px] leading-relaxed text-fg bg-transparent resize-none outline-none border-0 border-b border-transparent hover:border-border focus:border-accent transition-colors pb-1.5"
            placeholder="Type the question here…"
          />

          {/* Type-specific editor */}
          {draft.questionType === 'MULTIPLE_CHOICE' && (
            <MCEditor draft={draft} onChange={setDraft} />
          )}
          {draft.questionType === 'TRUE_FALSE' && (
            <TFEditor draft={draft} onChange={setDraft} />
          )}
          {draft.questionType === 'FILL_BLANK' && (
            <FillEditor draft={draft} onChange={setDraft} />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-subtle hover:text-danger transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Delete
            </button>
            <div className="flex items-center gap-2">
              {dirty && (
                <button
                  onClick={reset}
                  className="text-[12.5px] text-fg-muted hover:text-fg transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={save}
                disabled={!dirty || saving}
                className={[
                  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                  dirty
                    ? 'bg-accent text-accent-fg hover:bg-accent-hover'
                    : 'bg-bg-sunken text-fg-subtle cursor-not-allowed',
                ].join(' ')}
              >
                {saving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : dirty ? <Save className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? 'Saving' : dirty ? 'Save' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ─── Type editors ─── */

function MCEditor({
  draft, onChange,
}: { draft: AdminQuestion; onChange: (q: AdminQuestion) => void }) {
  const options = (Array.isArray(draft.options) ? draft.options : []) as string[];

  const setOption = (i: number, value: string) => {
    const next = options.map((o, idx) => (idx === i ? value : o));
    const correct = options[i] === draft.correctAnswer ? value : draft.correctAnswer;
    onChange({ ...draft, options: next, correctAnswer: correct });
  };

  const addOption = () => {
    onChange({ ...draft, options: [...options, `Option ${String.fromCharCode(65 + options.length)}`] });
  };

  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    const removed = options[i];
    const next = options.filter((_, idx) => idx !== i);
    const correct = removed === draft.correctAnswer ? next[0] : draft.correctAnswer;
    onChange({ ...draft, options: next, correctAnswer: correct });
  };

  const setCorrect = (value: string) => onChange({ ...draft, correctAnswer: value });

  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isCorrect = opt === draft.correctAnswer;
        return (
          <div
            key={i}
            className={[
              'group/option flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 transition-colors',
              isCorrect
                ? 'border-[oklch(from_var(--success)_l_c_h_/_0.4)] bg-[oklch(from_var(--success)_l_c_h_/_0.06)]'
                : 'border-border bg-bg',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => setCorrect(opt)}
              title={isCorrect ? 'Correct answer' : 'Mark as correct'}
              className={[
                'inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors shrink-0',
                isCorrect ? 'bg-success border-success text-white' : 'border-border-strong text-transparent hover:border-success',
              ].join(' ')}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </button>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              className="flex-1 bg-transparent text-[13.5px] text-fg outline-none"
            />
            <button
              onClick={() => removeOption(i)}
              disabled={options.length <= 2}
              className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-fg-subtle opacity-0 group-hover/option:opacity-100 hover:text-danger disabled:opacity-0 transition-opacity"
              aria-label="Remove option"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addOption}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-muted hover:text-accent transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Add option
      </button>
    </div>
  );
}

function TFEditor({
  draft, onChange,
}: { draft: AdminQuestion; onChange: (q: AdminQuestion) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['True', 'False'] as const).map(v => {
        const active = draft.correctAnswer === v;
        return (
          <button
            key={v}
            onClick={() => onChange({ ...draft, correctAnswer: v })}
            className={[
              'rounded-[var(--radius-sm)] border px-4 py-3 text-[13.5px] font-medium transition-colors',
              active
                ? 'border-[oklch(from_var(--success)_l_c_h_/_0.4)] bg-[oklch(from_var(--success)_l_c_h_/_0.08)] text-success'
                : 'border-border bg-bg text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function FillEditor({
  draft, onChange,
}: { draft: AdminQuestion; onChange: (q: AdminQuestion) => void }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.1em] text-fg-subtle mb-1.5">
        Expected answer
      </label>
      <input
        value={draft.correctAnswer}
        onChange={(e) => onChange({ ...draft, correctAnswer: e.target.value })}
        placeholder="The exact text the student should type"
        className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-border bg-bg text-[13.5px] text-fg focus:border-accent outline-none"
      />
    </div>
  );
}

/* ─── Misc ─── */

function MetaStat({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-bg-sunken px-4 py-3">
      <p className="text-[10.5px] uppercase tracking-[0.1em] text-fg-subtle">{label}</p>
      <p className="mt-1 font-serif text-2xl text-fg tnum leading-none">
        {value}
        {suffix && <span className="ml-1 text-[13px] text-fg-subtle font-sans">{suffix}</span>}
      </p>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="space-y-6 max-w-[1100px] animate-fade-in">
      <div className="h-4 w-24 bg-bg-sunken rounded" />
      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elev p-6 space-y-4 relative overflow-hidden">
        <div className="h-3 w-24 bg-bg-sunken rounded" />
        <div className="h-10 w-1/2 bg-bg-sunken rounded" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-bg-sunken rounded" />)}
        </div>
        <div className="absolute inset-0 shimmer" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 rounded-[var(--radius-lg)] border border-border bg-bg-elev relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
        </div>
      ))}
    </div>
  );
}
