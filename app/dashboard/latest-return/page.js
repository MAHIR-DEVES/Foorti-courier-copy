'use client';
import React, { useEffect, useState } from 'react';
import {
  Package,
  DollarSign,
  RefreshCw,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import Loading from '@/app/loading';

function DashboardButton({ title, count, icon, color, bgColor, isLoading }) {
  return (
    <div className="group relative">
      <div
        className={`
        relative  p-6 rounded-md shadow-lg  cursor-pointer
        ${bgColor} border-gray-300 ${color.replace('text-', 'border-')}/20
      `}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${color} bg-white/20`}>
                {icon}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{title}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {count.toLocaleString()}
                  </h3>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL =
    'https://admin.merchantfcservice.com/api/dashboard-button-list';
  const stored = localStorage.getItem('token');
  const token = stored ? JSON.parse(stored).token : null;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Delivery Processing',
      key: 'delivery_processing',
      icon: <Package className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'COD Processing',
      key: 'cod_processing',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    },
    {
      title: 'Return Request',
      key: 'return_request',
      icon: <RefreshCw className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    },
    {
      title: 'Latest Returns',
      key: 'latest_return',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    },
  ];

  if (loading) return <Loading></Loading>;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time status of your delivery operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          {stats.map(stat => (
            <DashboardButton
              key={stat.key}
              title={stat.title}
              count={data ? data[stat.key] : 0}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              isLoading={loading}
            />
          ))}
        </div>

        {/* Latest Returns Section */}
        <div className="bg-white rounded-md shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Returns
              </h2>
              <p className="text-gray-600">
                Recently processed return requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : data?.latest_return_list && data.latest_return_list.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.latest_return_list.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">#{item.id || 'N/A'}</td>
                      <td className="py-4 px-4">
                        {item.customer || 'Unknown'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Processing
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {item.date || new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Returns Found
              </h3>
              <p className="text-gray-500">
                There are no recent return requests to display.
              </p>
            </div>
          )}

          {/* Summary Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Total Returns: {data?.latest_return || 0}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Last Updated: Just now
                  </span>
                </div>
              </div>
              <button className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                View All Returns →
              </button>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
      </div>
    </div>
  );
}
