// PaymentDetails.jsx
'use client';

import Loading from '@/app/loading';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function PaymentDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('token');
        const token = stored ? JSON.parse(stored).token : null;

        if (!token) throw new Error('No token found');

        const res = await fetch(
          'https://admin.merchantfcservice.com/api/payment-details',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch');

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;
  if (error)
    return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  const d = data || {};
  const format = num => (num || 0).toLocaleString('en-US');

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header + Action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Payment</h1>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md transition">
              Add Funds
            </button>
            <button className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md transition">
              Setup Payout Account
            </button>
          </div>
        </div>

        {/* Big green balance card – exact rounded rectangle style */}
        <div className="bg-[#26A69A] rounded-2xl overflow-hidden shadow-lg mb-10 text-white text-center py-12 px-6 md:py-16 md:px-10">
          <p className="text-xl md:text-2xl font-medium tracking-wide">
            Your Balance
          </p>
          <p className="text-5xl md:text-7xl font-bold mt-4 tracking-tight">
            {format(d.balance || 0)}{' '}
            <span className="text-4xl md:text-5xl">TK</span>
          </p>
          {/* <button className="mt-8 px-10 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-gray-100 transition shadow">
            View Payments
          </button> */}
        </div>

        {/* Details section – white box with list-like rows */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between text-gray-700">
              <span>Amount Delivered</span>
              <span>{format(d.total_collection || 0)}</span>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between text-gray-700">
              <span>Payable Delivery Charge</span>
              <span
                className={d.total_delivery_charge > 0 ? 'text-red-600' : ''}
              >
                {d.total_delivery_charge > 0 ? '-' : ''}
                {format(Math.abs(d.total_delivery_charge || 0))}
              </span>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between text-gray-700">
              <span>Sub-Total</span>
              <span>{format(0)}</span>{' '}
              {/* adjust calculation if you have real sub-total logic */}
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between text-gray-700">
              <span>COD Charge</span>
              <span>{format(d.total_cod_charge || 0)}</span>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex justify-between text-gray-800 font-medium text-lg border-t border-gray-300 pt-4">
              <span>Available Balance (BDT)</span>
              <span>{format(d.balance || 0)}</span>
            </div>
          </div>
        </div>

        {/* Bottom centered button */}
        <div className="mt-10 flex justify-center">
          <Link href={'/dashboard/view-parcel'}>
            <button className="px-12 py-4 bg-[#26A69A] hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition text-lg">
              View Parcel Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
