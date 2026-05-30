'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { reportingAPI } from '@/lib/api/reporting';
import {
  Users,
  GraduationCap,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Calendar,
  Settings2,
  X,
  Plus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import RevenueChart from '@/components/dashboard/RevenueChart';
import StudentDistributionChart from '@/components/dashboard/StudentDistributionChart';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import RevenueByProgramChart from '@/components/dashboard/RevenueByProgramChart';
import PaymentMethodChart from '@/components/dashboard/PaymentMethodChart';
import TeacherWorkloadChart from '@/components/dashboard/TeacherWorkloadChart';
import EnrollmentTrendChart from '@/components/dashboard/EnrollmentTrendChart';

type WidgetKey =
  | 'revenueTrend' | 'studentDist' | 'attendanceTrend'
  | 'programRevenue' | 'paymentMethods' | 'teacherWorkload' | 'enrollmentTrend';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [activeWidgets, setActiveWidgets] = useState<Record<WidgetKey, boolean>>({
    revenueTrend: true,
    studentDist: true,
    attendanceTrend: true,
    programRevenue: true,
    paymentMethods: true,
    teacherWorkload: true,
    enrollmentTrend: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [d, t, c] = await Promise.all([
          reportingAPI.getDashboardAnalytics(),
          reportingAPI.getTrends(6),
          reportingAPI.getAnalyticsCharts(),
        ]);
        if (d.success) setDashboardData(d.dashboard);
        if (t.success) setTrendData(t.data);
        if (c.success) setChartData(c.data);
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const toggle = (k: WidgetKey) =>
    setActiveWidgets(p => ({ ...p, [k]: !p[k] }));

  if (isLoading) return <DashboardSkeleton />;
  if (!dashboardData) return null;

  return (
    <div className="space-y-10 max-w-[1400px]">
      <Header onConfig={() => setShowConfig(v => !v)} />
      {showConfig && (
        <LayoutConfig
          active={activeWidgets}
          onToggle={toggle}
          onClose={() => setShowConfig(false)}
        />
      )}
      <StatRow data={dashboardData} trendData={trendData} />
      <ChartsGrid
        active={activeWidgets}
        trendData={trendData}
        chartData={chartData}
        onClose={toggle}
      />
      <BottomRow data={dashboardData} />
    </div>
  );
}

/* ─── Header ─── */

function Header({ onConfig }: { onConfig: () => void }) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' :
    now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="ambient-wash flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between pt-2">
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-success pulse-dot" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Live overview
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-fg text-balance">
          {greeting}. Here is the state of the institute.
        </h1>
        <p className="text-[13.5px] text-fg-muted">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <button
        onClick={onConfig}
        className="group inline-flex items-center gap-2 self-start sm:self-end rounded-[var(--radius-sm)] border border-border bg-bg-elev px-3.5 py-2 text-[13px] text-fg-muted transition-all duration-[var(--dur-fast)] hover:border-border-strong hover:text-fg hover:-translate-y-0.5"
      >
        <Settings2 className="h-4 w-4 transition-transform duration-[var(--dur)] group-hover:rotate-45" strokeWidth={1.75} />
        Customize
      </button>
    </header>
  );
}

/* ─── Layout config ─── */

function LayoutConfig({
  active, onToggle, onClose,
}: {
  active: Record<WidgetKey, boolean>;
  onToggle: (k: WidgetKey) => void;
  onClose: () => void;
}) {
  const list: { id: WidgetKey; label: string }[] = [
    { id: 'revenueTrend', label: 'Revenue trend' },
    { id: 'studentDist', label: 'Student distribution' },
    { id: 'attendanceTrend', label: 'Attendance trend' },
    { id: 'programRevenue', label: 'Program revenue' },
    { id: 'paymentMethods', label: 'Payment methods' },
    { id: 'teacherWorkload', label: 'Teacher workload' },
    { id: 'enrollmentTrend', label: 'Enrollment growth' },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elev p-5 animate-rise-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium text-fg flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          Visible widgets
        </h3>
        <button
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-bg-sunken hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map(w => {
          const on = active[w.id];
          return (
            <button
              key={w.id}
              onClick={() => onToggle(w.id)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition-all duration-[var(--dur-fast)]',
                on
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'border border-border bg-bg-elev text-fg-muted hover:border-border-strong hover:text-fg hover:-translate-y-0.5',
              ].join(' ')}
            >
              {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {w.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Stats row ─── */

function StatRow({ data, trendData }: { data: any; trendData: any }) {
  const items: StatItem[] = [
    {
      title: 'Total students',
      raw: data.overview.totalStudents,
      trend: 12.4,
      Icon: GraduationCap,
      spark: pickSpark(trendData?.enrollmentTrend, 'count') ?? [4,6,5,8,7,10,12],
    },
    {
      title: 'Active enrollments',
      raw: data.overview.activeEnrollments,
      trend: 4.8,
      Icon: Users,
      spark: pickSpark(trendData?.enrollmentTrend, 'count') ?? [3,5,4,6,7,6,9],
    },
    {
      title: 'Monthly revenue',
      raw: data.financialSummary.collectedThisMonth,
      prefix: 'BD ',
      trend: 8.1,
      Icon: CreditCard,
      spark: pickSpark(trendData?.revenueTrend, 'collected') ?? [2,4,3,5,4,7,8],
    },
    {
      title: 'Teachers',
      raw: data.overview.totalTeachers,
      trend: 0,
      Icon: Users,
      spark: [5,5,5,5,5,5,5],
    },
  ];
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
      {items.map(it => <StatCard key={it.title} {...it} />)}
    </section>
  );
}

type StatItem = {
  title: string;
  raw: number | string;
  prefix?: string;
  trend: number;
  Icon: LucideIcon;
  spark: number[];
};

function StatCard({ title, raw, prefix = '', trend, Icon, spark }: StatItem) {
  const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^\d.-]/g, '')) || 0;
  const display = useCountUp(numeric, 900);
  const dir = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
  const TrendIcon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const trendColor = dir === 'up' ? 'text-success' : dir === 'down' ? 'text-danger' : 'text-fg-subtle';
  const trendBg = dir === 'up'
    ? 'bg-[oklch(from_var(--success)_l_c_h_/_0.10)]'
    : dir === 'down'
      ? 'bg-[oklch(from_var(--danger)_l_c_h_/_0.10)]'
      : 'bg-bg-sunken';

  return (
    <div className="lift group relative rounded-[var(--radius-lg)] border border-border bg-bg-elev p-5 overflow-hidden">
      {/* Hover tint wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur)] pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 0% 0%, oklch(from var(--accent) l c h / 0.06), transparent 60%)',
        }}
      />

      <div className="relative flex items-start justify-between">
        <p className="text-[11.5px] uppercase tracking-[0.1em] text-fg-subtle">{title}</p>
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-bg-sunken text-fg-muted group-hover:bg-accent-soft group-hover:text-accent transition-colors duration-[var(--dur-fast)]">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <p className="relative mt-4 font-serif text-[36px] leading-none tracking-tight text-fg tnum">
        {prefix}{display.toLocaleString()}
      </p>

      <div className="relative mt-3 flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11.5px] tnum ${trendBg} ${trendColor}`}>
          <TrendIcon className="h-3 w-3" strokeWidth={2} />
          {dir === 'flat' ? 'flat' : `${Math.abs(trend)}%`}
        </span>
        <span className="text-[11.5px] text-fg-subtle">vs last month</span>
      </div>

      <Sparkline data={spark} dir={dir} />
    </div>
  );
}

function Sparkline({ data, dir }: { data: number[]; dir: 'up' | 'down' | 'flat' }) {
  if (!data?.length) return null;
  const w = 220, h = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * h] as const);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  const stroke =
    dir === 'down' ? 'var(--danger)' :
    dir === 'flat' ? 'var(--fg-subtle)' :
    'var(--accent)';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="relative mt-4 w-full h-9 overflow-visible" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`sg-${dir}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${dir})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={stroke} />
    </svg>
  );
}

/* ─── Charts ─── */

function ChartsGrid({
  active, trendData, chartData, onClose,
}: {
  active: Record<WidgetKey, boolean>;
  trendData: any;
  chartData: any;
  onClose: (k: WidgetKey) => void;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger">
      {active.revenueTrend     && <ChartFrame><RevenueChart data={trendData.revenueTrend}             onClose={() => onClose('revenueTrend')} /></ChartFrame>}
      {active.enrollmentTrend  && <ChartFrame><EnrollmentTrendChart data={trendData.enrollmentTrend}  onClose={() => onClose('enrollmentTrend')} /></ChartFrame>}
      {active.studentDist      && chartData?.studentDistribution && <ChartFrame><StudentDistributionChart data={chartData.studentDistribution} onClose={() => onClose('studentDist')} /></ChartFrame>}
      {active.paymentMethods   && chartData?.paymentMethods      && <ChartFrame><PaymentMethodChart      data={chartData.paymentMethods}      onClose={() => onClose('paymentMethods')} /></ChartFrame>}
      {active.attendanceTrend  && <ChartFrame><AttendanceChart data={trendData.attendanceTrend}        onClose={() => onClose('attendanceTrend')} /></ChartFrame>}
      {active.programRevenue   && chartData?.revenueByProgram    && <ChartFrame><RevenueByProgramChart   data={chartData.revenueByProgram}    onClose={() => onClose('programRevenue')} /></ChartFrame>}
      {active.teacherWorkload  && chartData?.teacherWorkload     && <ChartFrame><TeacherWorkloadChart    data={chartData.teacherWorkload}     onClose={() => onClose('teacherWorkload')} /></ChartFrame>}
    </section>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="lift rounded-[var(--radius-lg)] border border-border bg-bg-elev overflow-hidden">
      {children}
    </div>
  );
}

/* ─── Bottom: actions + activity ─── */

function BottomRow({ data }: { data: any }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <QuickActions />
      <RecentActivity items={data.recentActivity} />
    </section>
  );
}

function QuickActions() {
  const actions = [
    { href: '/admin/students/register',     label: 'Enroll student',  Icon: GraduationCap },
    { href: '/admin/payments/new',          label: 'New payment',     Icon: CreditCard },
    { href: '/admin/announcements/create',  label: 'Announcement',    Icon: Calendar },
    { href: '/admin/groups',                label: 'Manage groups',   Icon: Users },
  ];
  return (
    <div className="lift rounded-[var(--radius-lg)] border border-border bg-bg-elev p-6">
      <h3 className="text-[11px] uppercase tracking-[0.14em] text-fg-subtle mb-5">
        Quick actions
      </h3>
      <ul className="space-y-1">
        {actions.map(a => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group relative flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 text-[13.5px] text-fg-muted overflow-hidden transition-colors duration-[var(--dur-fast)] hover:bg-bg-sunken hover:text-fg"
            >
              <span aria-hidden className="absolute left-0 top-0 h-full w-0 bg-accent-soft transition-[width] duration-[var(--dur)] ease-[var(--ease-out)] group-hover:w-1" />
              <span className="relative flex items-center gap-3">
                <a.Icon className="h-4 w-4 text-fg-subtle group-hover:text-accent transition-colors" strokeWidth={1.75} />
                {a.label}
              </span>
              <ArrowUpRight className="relative h-3.5 w-3.5 text-fg-subtle opacity-0 -translate-x-1 transition-all duration-[var(--dur-fast)] group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent" strokeWidth={1.75} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentActivity({ items }: { items: any[] }) {
  return (
    <div className="lift lg:col-span-2 rounded-[var(--radius-lg)] border border-border bg-bg-elev p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-fg-subtle flex items-center gap-2">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-accent pulse-dot" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Recent activity
        </h3>
        <Link href="/admin/audit-logs" className="group inline-flex items-center gap-1 text-[12px] text-fg-muted hover:text-accent transition-colors">
          View all
          <ArrowUpRight className="h-3 w-3 -translate-y-px transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:-translate-y-1" strokeWidth={2} />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-fg-subtle">Nothing to show yet.</p>
        </div>
      ) : (
        <ol className="relative">
          {items.map((a: any, i: number) => (
            <li
              key={i}
              className="group relative flex gap-4 pb-5 last:pb-0 animate-rise-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative flex flex-col items-center">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-accent ring-4 ring-accent-soft transition-transform duration-[var(--dur)] group-hover:scale-150" />
                {i < items.length - 1 && (
                  <div className="absolute top-3.5 bottom-0 w-px bg-border" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-[13.5px] text-fg group-hover:text-accent transition-colors duration-[var(--dur-fast)]">
                  {a.description}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-fg-subtle tnum">
                  <Clock className="h-3 w-3" strokeWidth={1.75} />
                  {new Date(a.timestamp).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ─── Skeleton ─── */

function DashboardSkeleton() {
  return (
    <div className="space-y-10 max-w-[1400px] animate-fade-in">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-bg-sunken rounded" />
        <div className="h-12 w-2/3 bg-bg-sunken rounded" />
        <div className="h-3 w-40 bg-bg-sunken rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-border bg-bg-elev p-5 space-y-4 overflow-hidden relative">
            <div className="h-3 w-24 bg-bg-sunken rounded" />
            <div className="h-9 w-32 bg-bg-sunken rounded" />
            <div className="h-3 w-28 bg-bg-sunken rounded" />
            <div className="h-9 w-full bg-bg-sunken rounded" />
            <div className="absolute inset-0 shimmer pointer-events-none" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative h-72 rounded-[var(--radius-lg)] border border-border bg-bg-elev overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hooks & helpers ─── */

function useCountUp(target: number, duration = 800): number {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const animate = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    startRef.current = null;
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function pickSpark(arr: any[] | undefined, key: string): number[] | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const vals = arr.map(o => Number(o?.[key])).filter(n => Number.isFinite(n));
  return vals.length ? vals.slice(-7) : null;
}
