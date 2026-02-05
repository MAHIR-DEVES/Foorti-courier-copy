'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/app/loading';

const DashboardProcessingTable = () => {
  const params = useParams();
  const type = params.type;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map type to API response key
  const getTypeMapping = () => {
    switch (type) {
      case 'delivery':
        return 'delivery_processing_list';
      case 'cod':
        return 'cod_processing_list';
      case 'return':
      case 'latest':
        return 'latest_return_list';
      default:
        return null;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'delivery':
        return 'Delivery Processing';
      case 'cod':
        return 'COD Processing';
      case 'return':
      case 'latest':
        return 'Latest Return';
      default:
        return 'Processing List';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('token');
        const token = stored ? JSON.parse(stored).token : null;

        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://admin.merchantfcservice.com/api/dashboard-button-list',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result?.success && result?.data) {
          const listKey = getTypeMapping();
          if (listKey && result.data[listKey]) {
            setData(result.data[listKey]);
          } else {
            setData([]);
          }
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchData();
    }
  }, [type]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Link 
            href="/dashboard" 
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 mt-8">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{getTypeTitle()} Details</h1>
        <p className="text-gray-600 mt-2">
          Showing {data.length} {type} processing records
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto text-[19px] text-left text-gray-700">
          <thead className="border-b border-gray bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr className="text-primary">
              <th className="px-4 py-3">SL#</th>
              <th className="px-4 py-3">Create Date</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Customer Phone</th>
              <th className="px-4 py-3">Charge</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  className="border-b-2 border-gray-200 hover:bg-gray-50"
                  key={`${item.tracking_id || item.id || index}-${index}`}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    {item.created_at 
                      ? new Date(item.created_at).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: true,
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.tracking_id ? (
                      <Link 
                        href={`/dashboard/consignments/${item.tracking_id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        #{item.tracking_id}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.customer_name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.customer_phone || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.selling_price || item.delivery || '0'}
                  </td>
                  <td className="px-4 py-3">
                    {item.collection || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.remarks || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.status || 'Processing'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardProcessingTable;