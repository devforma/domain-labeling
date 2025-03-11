'use client';

import { useEffect, useState } from 'react';
import React from 'react';
interface SubjectStats {
  subject_code: string;
  total_domains: number;
  rated_domains: number;
  completion_percentage: number;
}

export default function StatsPage({searchParams}: any) {
  const [stats, setStats] = useState<SubjectStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const { token } = React.use(searchParams) as { token: string };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats?token=${token}`);
        if (!response.ok) {
          throw new Error('Unauthorized access');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const handleExport = async (subject: string) => {
    try {
      setExporting(subject);
      const response = await fetch(`/api/stats/export?token=${token}&subject=${subject}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subject}_domains.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setExportingAll(true);
      const response = await fetch(`/api/stats/export-all?token=${token}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_domains.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">学科标注统计</h1>
          <button
            onClick={handleExportAll}
            disabled={exportingAll}
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingAll ? '导出中...' : '导出全部'}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学科代码
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总域名数
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  已标注数量
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完成度
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((stat) => (
                <tr key={stat.subject_code}>
                  <td className="px-4 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.subject_code}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-500">
                    {stat.total_domains}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-500">
                    {stat.rated_domains}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${stat.completion_percentage}%` }}
                        ></div>
                      </div>
                      <span>{stat.completion_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-500 w-22">
                    <button
                      onClick={() => handleExport(stat.subject_code)}
                      disabled={exporting === stat.subject_code}
                      className="cursor-pointer inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exporting === stat.subject_code ? '导出中' : '导出'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 