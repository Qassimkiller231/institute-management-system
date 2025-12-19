'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, X } from 'lucide-react';

export default function BulkAttendanceUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setError(null);
                setUploadResult(null);
            } else {
                setError('Please upload a valid CSV file.');
            }
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "CPR,Date,Status,Remarks\n123456789,2025-01-15,PRESENT,On time\n987654321,2025-01-15,ABSENT,Sick leave";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "attendance_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using direct fetch or api client wrapper if supported for multipart
            // Assuming api.post supports FormData or we use fetch directly manually for simplicity with auth header

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/attendance/bulk-upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok && response.status !== 207) {
                throw new Error(data.message || 'Upload failed');
            }

            setUploadResult(data);
            if (data.success && (!data.data.failed || data.data.failed === 0)) {
                setFile(null); // Clear file on full success
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Attendance Upload</h1>
                    <p className="text-gray-500 mt-1">Upload CSV files to record attendance for multiple students at once.</p>
                </div>
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8">

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <Upload className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {file ? file.name : 'Click or Drag file to upload'}
                            </h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                Supported format: CSV (max 10MB)
                            </p>
                        </div>
                    </div>

                    {/* File Selected State */}
                    {file && (
                        <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-blue-900">{file.name}</p>
                                    <p className="text-xs text-blue-600">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-blue-400 hover:text-blue-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-sm
                ${!file || isUploading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                                }`}
                        >
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                'Upload Attendance'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold">Upload Failed</h4>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {uploadResult && (
                <div className={`rounded-lg p-6 border animate-in fade-in slide-in-from-bottom-4
          ${uploadResult.success
                        ? (uploadResult.data.failed > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200')
                        : 'bg-red-50 border-red-200'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        {uploadResult.data?.failed === 0 ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                        )}
                        <h3 className={`text-lg font-bold
              ${uploadResult.data?.failed === 0 ? 'text-green-800' : 'text-orange-800'}
            `}>
                            {uploadResult.message}
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/60 p-3 rounded-lg text-center">
                            <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Rows</span>
                            <span className="text-2xl font-bold text-gray-800">{uploadResult.data?.total || 0}</span>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg text-center">
                            <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold">Success</span>
                            <span className="text-2xl font-bold text-green-600">{uploadResult.data?.success || 0}</span>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg text-center">
                            <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold">Failed</span>
                            <span className="text-2xl font-bold text-red-600">{uploadResult.data?.failed || 0}</span>
                        </div>
                    </div>

                    {/* Error Details Table */}
                    {uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
                        <div className="mt-4 bg-white/60 rounded-lg overflow-hidden border border-gray-200/50">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="p-3 font-semibold text-gray-700">Row</th>
                                        <th className="p-3 font-semibold text-gray-700">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {uploadResult.data.errors.map((err: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-mono text-gray-600">{err.row}</td>
                                            <td className="p-3 text-red-600">{err.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
