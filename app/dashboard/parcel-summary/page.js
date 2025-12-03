'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDate, setFormDate] = useState('2025-11-01');
  const [toDate, setToDate] = useState('2025-11-31');

  useEffect(() => {
    fetchData();
  }, [formDate, toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('token');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const token = parsed?.token;
      if (!token) return;

      const res = await fetch(
        `https://admin.merchantfcservice.com/api/order-summary?FormDate=${formDate}&toDate=${toDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, count, amount, icon: Icon, color, bgColor }) => (
    <div
      className={`p-6 rounded-2xl ${bgColor} shadow-lg transition-transform hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-gray-600">Orders</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {count.toLocaleString()}
        </p>
        <p className="text-xl font-semibold text-gray-700">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: '#155dfc' }}
          />
          <p className="text-lg font-medium text-gray-700">
            Loading order summary...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#155dfc', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Order Summary Dashboard
              </h1>
              <p className="text-gray-600">
                Overview of your order performance
              </p>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors hover:shadow-md"
              style={{ backgroundColor: '#155dfc', color: 'white' }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Delivered Orders"
            count={data.in_review_delivered.total_count}
            amount={data.in_review_delivered.total_amount}
            icon={CheckCircle}
            color="bg-blue-100"
            bgColor="bg-white"
          />

          <StatCard
            title="Cancelled Orders"
            count={data.in_review_cancel.total_count}
            amount={data.in_review_cancel.total_amount}
            icon={XCircle}
            color="bg-red-100"
            bgColor="bg-white"
          />

          <StatCard
            title="Partial Orders"
            count={data.in_review_partials.total_count}
            amount={data.in_review_partials.total_amount}
            icon={Package}
            color="bg-teal-100"
            bgColor="bg-white"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Performance Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: '#155dfc' }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Total Performance
                </h3>
                <p className="text-gray-600">Combined overview</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-medium text-gray-700">Total Orders</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: '#155dfc' }}
                >
                  {(
                    data.in_review_delivered.total_count +
                    data.in_review_cancel.total_count +
                    data.in_review_partials.total_count
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-xl">
                <span className="font-medium text-gray-700">Total Revenue</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: '#00b797' }}
                >
                  {formatCurrency(
                    data.in_review_delivered.total_amount +
                      data.in_review_cancel.total_amount +
                      data.in_review_partials.total_amount
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Success Rate Analysis
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Delivery Rate
                  </span>
                  <span className="font-bold" style={{ color: '#155dfc' }}>
                    {(
                      (data.in_review_delivered.total_count /
                        (data.in_review_delivered.total_count +
                          data.in_review_cancel.total_count +
                          data.in_review_partials.total_count)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: '#155dfc',
                      width: `${
                        (data.in_review_delivered.total_count /
                          (data.in_review_delivered.total_count +
                            data.in_review_cancel.total_count +
                            data.in_review_partials.total_count)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Revenue Efficiency
                  </span>
                  <span className="font-bold" style={{ color: '#00b797' }}>
                    {(
                      (data.in_review_delivered.total_amount /
                        (data.in_review_delivered.total_amount +
                          data.in_review_cancel.total_amount +
                          data.in_review_partials.total_amount)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: '#00b797',
                      width: `${
                        (data.in_review_delivered.total_amount /
                          (data.in_review_delivered.total_amount +
                            data.in_review_cancel.total_amount +
                            data.in_review_partials.total_amount)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Data updated in real-time • Last fetched:{' '}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
