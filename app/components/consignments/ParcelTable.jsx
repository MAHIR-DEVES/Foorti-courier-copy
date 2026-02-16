'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; 

import Loading from '@/app/loading';
import { useOrderContext } from '@/app/contexts/OrderContext';

/* ================= TAB CONSTANTS ================= */

const TAB = {
  ALL: 'All',
  LIST_DATE: 'List by Date',
  PREVIEW: 'In Preview',
  PENDING: 'Pending',
  APPROVAL: 'Approval Pending',
  PARTIAL: 'Partially Delivered',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
  PAYMENT: 'Payment',
};

const tabs = [
  { label: 'All', value: TAB.ALL },
  { label: 'List by Date', value: TAB.LIST_DATE },
  { label: 'In Preview', value: TAB.PREVIEW },
  { label: 'Pending', value: TAB.PENDING },
  { label: 'Approval Pending', value: TAB.APPROVAL },
  { label: 'Partially Delivered', value: TAB.PARTIAL },
  { label: 'Cancelled', value: TAB.CANCELLED },
  { label: 'Delivered', value: TAB.DELIVERED },
  { label: 'Payment', value: TAB.PAYMENT },
];

/* ================= STATUS MAPPING ================= */

const statusMapping = {
  [TAB.PREVIEW]: ['Assigned Pickup Rider', 'Order Placed', 'Pickup Done'],
  [TAB.APPROVAL]: [
    'Successfully Delivered',
    'Delivered Amount Collected from Branch',
  ],
  [TAB.PARTIAL]: ['Partially Delivered'],
  [TAB.CANCELLED]: [
    'Cancel Order',
    'Return Confirm',
    'Return To Merchant',
    'Return Reach To Merchant',
  ],
};

/* ================= HELPERS ================= */

const groupByDate = orders =>
  orders.reduce((acc, order) => {
    if (!order?.order_create_date) return acc;
    const key = order.order_create_date.split(' ')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

/* ================= COMPONENT ================= */

const ParcelTable = () => {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get('status') || TAB.ALL;

  const [activeTab, setActiveTab] = useState(queryStatus);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const { updatePendingCount } = useOrderContext();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  /* ================= SYNC TAB ================= */

  useEffect(() => {
    setActiveTab(queryStatus);
    setCurrentPage(1);
  }, [queryStatus]);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = JSON.parse(localStorage.getItem('token'))?.token;
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MERCHANT_API_KEY}/confirm-orders-list`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const data = await res.json();
        const list =
          data?.data?.confirmed_order_list ||
          data?.confirmed_order_list ||
          [];

        setOrders(list);
        // Update the pending count in context
        updatePendingCount(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [updatePendingCount]);

  /* ================= FILTER LOGIC (FIXED) ================= */

  const filteredOrders = useMemo(() => {
  if (activeTab === TAB.ALL || activeTab === TAB.LIST_DATE) {
    return orders;
  }

  // Pending orders:
  // parcel_update_track_confirm === '1'
  if (activeTab === TAB.PENDING) {
    return orders.filter(o =>
      String(o?.parcel_update_track_confirm) === '1' &&
      !statusMapping[TAB.APPROVAL].includes(o.status)
    );
  }

  // PREVIEW
  if (activeTab === TAB.PREVIEW) {
    return orders.filter(
      o =>
        String(o?.parcel_update_track_confirm) !== '1' &&
        statusMapping[TAB.PREVIEW].includes(o.status)
    );
  }

  // Approval / Partial / Cancelled
  const allowed = statusMapping[activeTab];
  if (!allowed) return [];

  return orders.filter(o => allowed.includes(o.status));
}, [orders, activeTab]);


  /* ================= PAGINATION ================= */

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /* ================= UI ================= */

  if (loadingOrders) return <Loading />;

  return (
    <div className="p-4 md:p-6 mt-8">
      <h1 className="text-xl font-semibold mb-4">
        Consignments List
      </h1>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded border text-sm
              ${activeTab === tab.value
                ? 'bg-blue-100 button-primary'
                : 'bg-white border-gray'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table className="w-full text-left border">
        <thead className="bg-blue-50 border-b">
          <tr>
            <th className="px-4 py-3">SL</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Tracking</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Charge</th>
            <th className="px-4 py-3">Collection</th>
            <th className="px-4 py-3">Remarks</th>
            {activeTab === TAB.PENDING && (
              <th className="px-4 py-3">Status</th>
            )}
            {activeTab === TAB.APPROVAL && (
              <th className="px-4 py-3">Status</th>
            )}
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedOrders.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-6">
                No data found
              </td>
            </tr>
          ) : (
            paginatedOrders.map((order, idx) => (
              <tr
                key={`${order.tracking_id}-${startIndex + idx}`}
                className="border-b"
              >
                <td className="px-4 py-3">
                  {startIndex + idx + 1}
                </td>

                <td className="px-4 py-3">
                  {order.order_create_date || '-'}
                </td>

                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/consignments/${order.tracking_id}`}
                    className="text-blue-600"
                  >
                    #{order.tracking_id}
                  </Link>
                </td>

                <td className="px-4 py-3">
                  {order.customer_name}
                </td>

                <td className="px-4 py-3">
                  {order.customer_phone}
                </td>

                <td className="px-4 py-3">
                  {order.delivery}
                </td>

                <td className="px-4 py-3">
                  {order.collection}
                </td>

                <td className="px-4 py-3">
                  {order.remarks || '-'}
                </td>

                {activeTab === TAB.PENDING && (
                  <td className="px-4 py-3 font-semibold">
                    {order.status ===
                      'Assigned To Delivery Rider'
                      ? 'Assigned (Pending)'
                      : 'Unassigned'}
                  </td>
                )}
                {activeTab === TAB.APPROVAL && (
                  <td className="px-4 py-3 font-semibold text-green-600">
                    Successfully Delivered
                  </td>
                )}

                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/consignments/${order.tracking_id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParcelTable;
