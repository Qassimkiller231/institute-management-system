'use client';

import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/authStorage';
import { useState, useMemo, useEffect } from 'react';
import ChatBot from '@/components/chatbot/ChatBot';
import Link from 'next/link';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  LayoutDashboard,
  GraduationCap,
  Users2,
  UserCog,
  UsersRound,
  ClipboardList,
  BookOpen,
  Megaphone,
  CalendarDays,
  ListChecks,
  BookMarked,
  CalendarRange,
  Target,
  Building2,
  DoorOpen,
  TrendingUp,
  LineChart,
  Wallet,
  CreditCard,
  Receipt,
  Mic2,
  FileCheck2,
  CheckCircle2,
  Wand2,
  HelpCircle,
  ShieldCheck,
  DatabaseBackup,
  Settings,
  LogOut,
  Bell,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  BarChart3,
  ClipboardCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

type Item = { icon: LucideIcon; label: string; path: string };
type Group = { id: string; label: string; icon: LucideIcon; items: Item[] };

const PINNED: Item[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
];

const GROUPS: Group[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    icon: Layers,
    items: [
      { icon: GraduationCap, label: 'Students',        path: '/admin/students' },
      { icon: Users2,        label: 'Parents',         path: '/admin/parents' },
      { icon: UserCog,       label: 'Teachers',        path: '/admin/teachers' },
      { icon: UsersRound,    label: 'Groups',          path: '/admin/groups' },
      { icon: ClipboardList, label: 'Enrollments',     path: '/admin/enrollments' },
      { icon: BookOpen,      label: 'Materials',       path: '/admin/materials' },
      { icon: Megaphone,     label: 'Announcements',   path: '/admin/announcements' },
      { icon: CalendarDays,  label: 'Sessions',        path: '/admin/sessions' },
      { icon: ListChecks,    label: 'Bulk attendance', path: '/admin/attendance/bulk' },
    ],
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: SlidersHorizontal,
    items: [
      { icon: BookMarked,   label: 'Programs', path: '/admin/programs' },
      { icon: CalendarRange,label: 'Terms',    path: '/admin/terms' },
      { icon: Target,       label: 'Levels',   path: '/admin/levels' },
      { icon: Building2,    label: 'Venues',   path: '/admin/venues' },
      { icon: DoorOpen,     label: 'Halls',    path: '/admin/halls' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & analytics',
    icon: BarChart3,
    items: [
      { icon: TrendingUp, label: 'Attendance reports', path: '/admin/reports/attendance' },
      { icon: LineChart,  label: 'Progress reports',   path: '/admin/reports/progress' },
      { icon: Wallet,     label: 'Financial reports',  path: '/admin/reports/financial' },
      { icon: CreditCard, label: 'Payments',           path: '/admin/payments' },
      { icon: Receipt,    label: 'Payment plans',      path: '/admin/payment-plans' },
    ],
  },
  {
    id: 'testing',
    label: 'Testing & progress',
    icon: ClipboardCheck,
    items: [
      { icon: Wand2,        label: 'Test builder',      path: '/admin/test-builder' },
      { icon: Mic2,         label: 'Speaking tests',    path: '/admin/speaking-tests' },
      { icon: FileCheck2,   label: 'Placement sessions', path: '/admin/placement-tests' },
      { icon: CheckCircle2, label: 'Progress criteria', path: '/admin/criteria' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Wrench,
    items: [
      { icon: HelpCircle,      label: 'FAQs',              path: '/admin/faqs' },
      { icon: ShieldCheck,     label: 'Audit logs',        path: '/admin/audit-logs' },
      { icon: DatabaseBackup,  label: 'Backup & restore',  path: '/admin/settings/backup' },
      { icon: Settings,        label: 'Settings',          path: '/admin/settings' },
    ],
  },
];

const ALL_ITEMS: Item[] = [...PINNED, ...GROUPS.flatMap(g => g.items)];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) =>
    path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

  const activeGroupId = useMemo(
    () => GROUPS.find(g => g.items.some(it => isActive(it.path)))?.id ?? null,
    [pathname] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Single-open accordion. Default: the group containing the active route.
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroupId);
  useEffect(() => { if (activeGroupId) setOpenGroup(activeGroupId); }, [activeGroupId]);

  const currentTitle =
    ALL_ITEMS.find(it => isActive(it.path))?.label ?? 'Admin';

  return (
    <div className="min-h-dvh flex bg-bg text-fg">
      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-20 flex flex-col',
          'border-r border-border bg-bg-elev',
          'transition-[width] duration-[var(--dur)] ease-[var(--ease-out)]',
          sidebarOpen ? 'w-[260px]' : 'w-[72px]',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-accent-fg font-serif text-lg leading-none">
            f
          </div>
          {sidebarOpen && (
            <div className="min-w-0 animate-fade-in">
              <div className="font-serif text-[17px] leading-tight tracking-tight text-fg">
                The Function
              </div>
              <div className="text-[11px] text-fg-subtle tracking-wide uppercase">
                Institute · Admin
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {/* Pinned */}
          {PINNED.map(it => (
            <NavLeaf
              key={it.path}
              item={it}
              active={isActive(it.path)}
              collapsed={!sidebarOpen}
              onClick={() => router.push(it.path)}
            />
          ))}

          <div className="my-2 mx-3 h-px bg-border" />

          {/* Groups */}
          {GROUPS.map(group => {
            const open = openGroup === group.id;
            const hasActive = group.items.some(it => isActive(it.path));
            return (
              <NavGroup
                key={group.id}
                group={group}
                open={open}
                hasActive={hasActive}
                collapsed={!sidebarOpen}
                onToggleHeader={() => {
                  if (!sidebarOpen) setSidebarOpen(true);
                  setOpenGroup(open ? null : group.id);
                }}
                isItemActive={isActive}
                onItemClick={(p) => router.push(p)}
              />
            );
          })}
        </nav>

        {/* Footer: logout */}
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            title={!sidebarOpen ? 'Sign out' : undefined}
            className="w-full flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] text-fg-muted transition-colors duration-[var(--dur-fast)] hover:bg-bg-sunken hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className={[
          'flex-1 min-h-dvh transition-[margin] duration-[var(--dur)] ease-[var(--ease-out)]',
          sidebarOpen ? 'ml-[260px]' : 'ml-[72px]',
        ].join(' ')}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-bg/80 backdrop-blur-md">
          <div className="h-full px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(v => !v)}
                aria-label="Toggle sidebar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-fg-muted transition-colors duration-[var(--dur-fast)] hover:bg-bg-sunken hover:text-fg"
              >
                {sidebarOpen
                  ? <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  : <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              </button>
              <div className="hidden sm:flex items-center gap-2 text-[13px] text-fg-subtle min-w-0">
                <span>Admin</span>
                <span className="text-fg-subtle/50">/</span>
                <span className="text-fg font-medium truncate">{currentTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Link
                href="/admin/notifications"
                aria-label="Notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-fg-muted transition-colors duration-[var(--dur-fast)] hover:bg-bg-sunken hover:text-fg"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </Link>
              <div className="ml-2 flex h-9 items-center gap-2.5 rounded-[var(--radius-sm)] pl-2 pr-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-[11px] font-semibold">
                  A
                </div>
                <span className="hidden sm:inline text-[13px] text-fg">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-8 lg:px-10 lg:py-10 animate-fade-in">
          {children}
        </div>
      </main>

      <ChatBot />
    </div>
  );
}

/* ───────── Sub-components ───────── */

function NavLeaf({
  item, active, collapsed, onClick,
}: { item: Item; active: boolean; collapsed: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={[
        'group relative w-full flex items-center gap-3 rounded-[var(--radius-sm)]',
        'px-3 py-2 text-[13.5px] transition-colors duration-[var(--dur-fast)]',
        active
          ? 'bg-accent-soft text-accent'
          : 'text-fg-muted hover:bg-bg-sunken hover:text-fg',
      ].join(' ')}
    >
      {active && (
        <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-accent" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} />
      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
    </button>
  );
}

function NavGroup({
  group, open, hasActive, collapsed, onToggleHeader, isItemActive, onItemClick,
}: {
  group: Group;
  open: boolean;
  hasActive: boolean;
  collapsed: boolean;
  onToggleHeader: () => void;
  isItemActive: (p: string) => boolean;
  onItemClick: (p: string) => void;
}) {
  const Icon = group.icon;
  return (
    <div className="select-none">
      <button
        onClick={onToggleHeader}
        title={collapsed ? group.label : undefined}
        aria-expanded={open}
        className={[
          'group w-full flex items-center gap-3 rounded-[var(--radius-sm)]',
          'px-3 py-2 text-[13.5px] transition-colors duration-[var(--dur-fast)]',
          hasActive ? 'text-fg' : 'text-fg-muted',
          'hover:bg-bg-sunken hover:text-fg',
        ].join(' ')}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{group.label}</span>
            <ChevronRight
              className={[
                'h-3.5 w-3.5 shrink-0 text-fg-subtle transition-transform duration-[var(--dur)] ease-[var(--ease-out)]',
                open ? 'rotate-90' : '',
              ].join(' ')}
              strokeWidth={2}
            />
          </>
        )}
      </button>

      {/* Expanding panel */}
      {!collapsed && (
        <div
          className={[
            'grid transition-[grid-template-rows] duration-[var(--dur)] ease-[var(--ease-out)]',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          ].join(' ')}
        >
          <div className="overflow-hidden">
            <div className="relative pl-3 mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-border">
              {group.items.map(it => {
                const Icon2 = it.icon;
                const active = isItemActive(it.path);
                return (
                  <button
                    key={it.path}
                    onClick={() => onItemClick(it.path)}
                    className={[
                      'group relative w-full flex items-center gap-2.5 rounded-[var(--radius-sm)]',
                      'pl-3 pr-3 py-1.5 text-[13px] transition-colors duration-[var(--dur-fast)]',
                      active
                        ? 'text-accent'
                        : 'text-fg-muted hover:bg-bg-sunken hover:text-fg',
                    ].join(' ')}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-[13px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-accent"
                      />
                    )}
                    <Icon2 className="h-[15px] w-[15px] shrink-0 opacity-80" strokeWidth={1.75} />
                    <span className="flex-1 text-left truncate">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
