'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reportingAPI } from '@/lib/api/reporting';
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Clock,
  Calendar,
  Settings,
  X,
  Filter
} from 'lucide-react';

// Charts
import RevenueChart from '@/components/dashboard/RevenueChart';
import StudentDistributionChart from '@/components/dashboard/StudentDistributionChart';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import RevenueByProgramChart from '@/components/dashboard/RevenueByProgramChart';
import PaymentMethodChart from '@/components/dashboard/PaymentMethodChart';
import TeacherWorkloadChart from '@/components/dashboard/TeacherWorkloadChart';
import EnrollmentTrendChart from '@/components/dashboard/EnrollmentTrendChart';
import DashboardNotificationWidget from '@/components/dashboard/DashboardNotificationWidget';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Widget Configuration State - ALL TRUE BY DEFAULT
  const [activeWidgets, setActiveWidgets] = useState({
    revenueTrend: true,
    studentDist: true,
    attendanceTrend: true,
    programRevenue: true,
    paymentMethods: true,
    teacherWorkload: true,
    enrollmentTrend: true
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [dashboardRes, trendsRes, chartsRes] = await Promise.all([
          reportingAPI.getDashboardAnalytics(),
          reportingAPI.getTrends(6),
          reportingAPI.getAnalyticsCharts()
        ]);

        if (dashboardRes.success) setDashboardData(dashboardRes.dashboard);
        if (trendsRes.success) setTrendData(trendsRes.data);
        if (chartsRes.success) setChartData(chartsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleWidget = (key: keyof typeof activeWidgets) => {
    setActiveWidgets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your institute&apos;s performance at a glance.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
          >
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Customize Layout</span>
          </button>

        </div>
      </div>

      {/* Layout Configuration Panel */}
      {showConfig && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Visible Charts</h3>
            <button onClick={() => setShowConfig(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'revenueTrend', label: 'Revenue Trend' },
              { id: 'studentDist', label: 'Student Distribution' },
              { id: 'attendanceTrend', label: 'Attendance Trend' },
              { id: 'programRevenue', label: 'Program Revenue' },
              { id: 'paymentMethods', label: 'Payment Methods' },
              { id: 'teacherWorkload', label: 'Teacher Workload' },
              { id: 'enrollmentTrend', label: 'Enrollment Growth' },
            ].map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id as keyof typeof activeWidgets)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${activeWidgets[widget.id as keyof typeof activeWidgets]
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                {widget.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link to Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={dashboardData.overview.totalStudents}
          icon={Users}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Active Enrollments"
          value={dashboardData.overview.activeEnrollments}
          icon={GraduationCap}
          trend="+5%"
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`BD ${dashboardData.financialSummary.collectedThisMonth}`}
          icon={CreditCard}
          trend="+8%"
          color="emerald"
        />
        <StatCard
          title="Total Teachers"
          value={dashboardData.overview.totalTeachers}
          icon={Users}
          trend="stable"
          color="purple"
        />
      </div>

      {/* Dynamic Widget Grid - 7 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWidgets.revenueTrend && (
          <RevenueChart
            data={trendData.revenueTrend}  // Using trendData
            onClose={() => toggleWidget('revenueTrend')}
          />
        )}
        {activeWidgets.enrollmentTrend && (
          <EnrollmentTrendChart
            data={trendData.enrollmentTrend}
            onClose={() => toggleWidget('enrollmentTrend')}
          />
        )}
        {activeWidgets.studentDist && chartData?.studentDistribution && (
          <StudentDistributionChart
            data={chartData.studentDistribution}
            onClose={() => toggleWidget('studentDist')}
          />
        )}
        {activeWidgets.paymentMethods && chartData?.paymentMethods && (
          <PaymentMethodChart
            data={chartData.paymentMethods}
            onClose={() => toggleWidget('paymentMethods')}
          />
        )}
        {activeWidgets.attendanceTrend && (
          <AttendanceChart
            data={trendData.attendanceTrend}
            onClose={() => toggleWidget('attendanceTrend')}
          />
        )}
        {activeWidgets.programRevenue && chartData?.revenueByProgram && (
          <RevenueByProgramChart
            data={chartData.revenueByProgram}
            onClose={() => toggleWidget('programRevenue')}
          />
        )}
        {activeWidgets.teacherWorkload && chartData?.teacherWorkload && (
          <TeacherWorkloadChart
            data={chartData.teacherWorkload}
            onClose={() => toggleWidget('teacherWorkload')}
          />
        )}
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/students/register" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Enroll Student</span>
            </Link>
            <Link href="/admin/payments/new" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">New Payment</span>
            </Link>
            <Link href="/admin/announcements/create" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all group">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform text-purple-600">
                <Calendar className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Announcement</span>
            </Link>
            <Link href="/admin/groups" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform text-orange-600">
                <Users className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Manage Groups</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="p-2 bg-blue-50 rounded-full text-blue-600 mt-1 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {dashboardData.recentActivity.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-green-600 font-medium flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  );
}