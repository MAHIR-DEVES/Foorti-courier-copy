'use client';
import Loading from '@/app/loading';
import { useState, useEffect } from 'react';

const StatusBadge = ({ status }) => {
  const base =
    'px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center justify-center min-w-[80px]';

  const styles = {
    Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Ready: 'bg-green-50 text-green-700 border border-green-200',
    Hold: 'bg-red-50 text-red-700 border border-red-200',
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
};

export default function ViewParcelTable() {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsignments = async () => {
      try {
        const stored = localStorage.getItem('token');
        const token = stored ? JSON.parse(stored).token : null;

        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MERCHANT_API_KEY}/merchantdashboard`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        setConsignments(data.data?.parcel_details_list || []);
      } catch (error) {
        console.error('Error fetching consignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsignments();
  }, []);

  if (loading) {
     return <Loading />;
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Consignments Lists
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {consignments.length} consignments
          </p>
        </div>
        {/* <button className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
          Print Report
        </button> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Creation Date
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tracking Id
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                COD Amount
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Charge
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {consignments.map(item => (
              <tr
                key={item.tracking_id}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {item.tracking_id || '-'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {item.customer_name || '-'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-gray-900">
                    ৳{item.Cod_amount?.toLocaleString() || '-'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-emerald-600">
                    ৳{item.delivery_charge || '-'}
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={item.status || '-'} />
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-600">
                    -
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-300 bg-gray-50/50 text-sm text-gray-500">
        Showing {consignments.length} of {consignments.length} consignments
      </div>
    </div>
  );
}
