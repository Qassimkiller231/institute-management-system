'use client';

import { useState, useEffect } from 'react';
import { reportingAPI, termsAPI } from '@/lib/api';

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const response = await termsAPI.getAll();
      // API returns { success: true, data: { data: [...], pagination: {...} } }
      const termsData = response?.data?.data || [];
      setTerms(Array.isArray(termsData) ? termsData : []);
    } catch (err: any) {
      // console.error('Error in loadTerms:', err);
      alert('Error loading terms: ' + err.message);
      setTerms([]);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const termId = selectedTerm || undefined;
      const response = await reportingAPI.getFinancialAnalytics(termId);
      // console.log('API Response:', response);
      // console.log('Response data:', response.data);

      // Transform backend data to match frontend expectations
      const backendData = response.data || response;
      const transformedData = {
        revenue: {
          totalCollected: backendData.totalPaid || 0,
          totalExpected: backendData.totalPlanned || 0,
          pending: backendData.outstanding || 0
        },
        collectionRate: backendData.totalPlanned > 0
          ? (backendData.totalPaid / backendData.totalPlanned) * 100
          : 0,
        paymentMethods: backendData.paymentMethods || {},
        monthlyTrend: backendData.monthlyTrend || []
      };

      // console.log('Transformed data:', transformedData);
      setReportData(transformedData);
    } catch (err: any) {
      // console.error('Generate report error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!reportData) return;

    // Create CSV content
    let csv = 'Financial Report\n\n';

    // Summary section
    csv += 'Summary\n';
    csv += 'Total Revenue,' + (reportData.revenue?.totalCollected?.toFixed(2) || 0) + ' BD\n';
    csv += 'Expected Revenue,' + (reportData.revenue?.totalExpected?.toFixed(2) || 0) + ' BD\n';
    csv += 'Pending Payments,' + (reportData.revenue?.pending?.toFixed(2) || 0) + ' BD\n';
    csv += 'Collection Rate,' + (reportData.collectionRate?.toFixed(1) || 0) + '%\n\n';

    // Payment methods
    if (reportData.paymentMethods) {
      csv += 'Payment Methods\n';
      Object.entries(reportData.paymentMethods).forEach(([method, amount]: [string, any]) => {
        csv += method.replace('_', ' ') + ',' + amount.toFixed(2) + ' BD\n';
      });
      csv += '\n';
    }

    // Monthly trend
    if (reportData.monthlyTrend) {
      csv += 'Monthly Trend\n';
      csv += 'Month,Collected,Expected,Difference\n';
      reportData.monthlyTrend.forEach((month: any) => {
        csv += `${month.month},${month.collected.toFixed(2)},${month.expected.toFixed(2)},${month.difference.toFixed(2)}\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1><p className="text-gray-700">View financial analytics and revenue reports</p></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-4">Select Term</h2><div className="grid md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-900 mb-2">Term</label><select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="">All Terms</option>{terms.length > 0 ? terms.map(term => <option key={term.id} value={term.id}>{term.isCurrent ? '⭐ ' : ''}{term.program?.name ? `${term.program.name} - ${term.name}` : term.name}</option>) : <option disabled>Loading terms...</option>}</select></div><div className="flex items-end"><button onClick={generateReport} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Loading...' : 'Generate Report'}</button></div></div></div>
  );

  const renderSummaryCards = () => (
    <div className="grid md:grid-cols-4 gap-6"><div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"><p className="text-sm font-medium text-gray-700 mb-2">Total Revenue</p><p className="text-3xl font-bold text-gray-900">{reportData.revenue?.totalCollected?.toFixed(2) || 0} BD</p><p className="text-xs text-gray-600 mt-1">All payments collected</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"><p className="text-sm font-medium text-gray-700 mb-2">Expected Revenue</p><p className="text-3xl font-bold text-gray-900">{reportData.revenue?.totalExpected?.toFixed(2) || 0} BD</p><p className="text-xs text-gray-600 mt-1">Total expected from plans</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600"><p className="text-sm font-medium text-gray-700 mb-2">Pending Payments</p><p className="text-3xl font-bold text-gray-900">{reportData.revenue?.pending?.toFixed(2) || 0} BD</p><p className="text-xs text-gray-600 mt-1">Outstanding amount</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600"><p className="text-sm font-medium text-gray-700 mb-2">Collection Rate</p><p className="text-3xl font-bold text-gray-900">{reportData.collectionRate?.toFixed(1) || 0}%</p><p className="text-xs text-gray-600 mt-1">Payment efficiency</p></div></div>
  );

  const renderPaymentMethods = () => (
    <div className="bg-white rounded-lg shadow p-6"><h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h3><div className="grid md:grid-cols-4 gap-4">{reportData.paymentMethods && Object.entries(reportData.paymentMethods).map(([method, amount]: [string, any]) => <div key={method} className="bg-gray-50 p-4 rounded-lg"><p className="text-sm font-medium text-gray-700">{method.replace('_', ' ')}</p><p className="text-2xl font-bold text-gray-900 mt-1">{amount.toFixed(2)} BD</p></div>)}</div></div>
  );

  const renderMonthlyTrendRow = (month: any, idx: number) => (
    <tr key={idx} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td><td className="px-6 py-4 text-sm text-right text-gray-900">{month.collected.toFixed(2)} BD</td><td className="px-6 py-4 text-sm text-right text-gray-900">{month.expected.toFixed(2)} BD</td><td className="px-6 py-4 text-sm text-right"><span className={`font-semibold ${month.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>{month.difference >= 0 ? '+' : ''}{month.difference.toFixed(2)} BD</span></td></tr>
  );

  const renderMonthlyTrend = () => (
    <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3><button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📊 Export Excel</button></div><div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th><th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Collected</th><th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Expected</th><th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Difference</th></tr></thead><tbody className="divide-y divide-gray-200">{reportData.monthlyTrend?.map(renderMonthlyTrendRow)}</tbody></table></div></div>
  );

  const renderReport = () => !reportData ? null : (
    <div className="space-y-6">{renderSummaryCards()}{renderPaymentMethods()}{renderMonthlyTrend()}</div>
  );

  const renderEmptyState = () => !reportData && !loading ? (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"><p className="text-gray-600 text-lg">Select term and click "Generate Report" to view financial data</p></div>
  ) : null;

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div>
      {renderHeader()}
      {renderFilters()}

      {renderReport()}
      {renderEmptyState()}
    </div>
  );
}
