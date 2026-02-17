'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

import Loading from '@/app/loading';
import EditPercaleModal from '../Modal/EditPercaleModal';
import { useOrderContext } from '@/app/contexts/OrderContext';

/* ================= CONSTANTS ================= */

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

const statusMapping = {
  [TAB.PREVIEW]: ['Assigned Pickup Rider', 'Order Placed', 'Pickup Done'],
  [TAB.PENDING]: ['Updated as Pending', 'Assigned To Delivery Rider'],
  [TAB.APPROVAL]: [
    'Assigned Pickup Rider',
    'Pickup Done',
    'Received by Pickup Branch',
    'Transfer Assign for Fulfillment',
    'Transfer Reach To Fullfilment',
    'Received By Fullfilment',
    'Transfer Assign for Branch',
    'Transfer Reach To Branch',
    'Received By Destination Hub',
    'Successfully Delivered',
    'Delivered Amount Collected from Branch',
  ],
  [TAB.PARTIAL]: ['Partially Delivered'],
  [TAB.CANCELLED]: [
    'Return Confirm',
    'Cancel Order',
    'Return Reach To Merchant',
    'Assigned Rider For Return',
    'Return Received By Destination Hub',
    'Return To Merchant',
  ],
  [TAB.DELIVERED]: [
    'Successfully Delivered',
    'Delivered Amount Collected from Branch',
    'Delivered Amount Send to Fulfillment',
    'Payment Processing',
    'Payment Completed',
    'Payment Processing Complete',
  ],
};

const DISABLED_EDIT_STATUSES = [
  'Successfully Delivered',
  'Delivered Amount Collected from Branch',
  'Delivered Amount Send to Fulfillment',
  'Payment Processing',
  'Payment Processing Complete',
  'Payment Completed',
];

/* ================= HELPERS ================= */

const groupByDate = (items, dateField = 'order_create_date') => {
  return items.reduce((acc, item) => {
    if (!item?.[dateField]) return acc;
    const key = item[dateField].split(' ')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/* ================= COMPONENT ================= */

const ParcelTable = () => {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get('status') || TAB.ALL;

  // State
  const [activeTab, setActiveTab] = useState(queryStatus);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState({
    orders: true,
    payments: true,
    delivered: true,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationGroup, setPaginationGroup] = useState(1);
  const [expandedDates, setExpandedDates] = useState({});

  const itemsPerPage = 20;
  const { updatePendingCount, updateCodPendingCount, setAllOrders } = useOrderContext();

  /* ================= SYNC TAB WITH URL ================= */

  useEffect(() => {
    setActiveTab(queryStatus);
    setCurrentPage(1);
    setPaginationGroup(1);
  }, [queryStatus]);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(prev => ({ ...prev, orders: true }));
      try {
        const token = JSON.parse(localStorage.getItem('token'))?.token;
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MERCHANT_API_KEY}/confirm-orders-list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        const list = data?.data?.confirmed_order_list || data?.confirmed_order_list || [];

        setOrders(list);

        // Update context
        updatePendingCount(list);
        updateCodPendingCount(list);
        setAllOrders(list);

      } catch (err) {
        console.error('Orders API Error:', err);
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };

    fetchOrders();


  }, []);

  /* ================= FETCH PAYMENTS ================= */

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(prev => ({ ...prev, payments: true }));
      try {
        const token = JSON.parse(localStorage.getItem('token'))?.token;
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MERCHANT_API_KEY}/merchant-payment-history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch payments');

        const data = await response.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error('Payments API Error:', err);
      } finally {
        setLoading(prev => ({ ...prev, payments: false }));
      }
    };

    if (activeTab === TAB.PAYMENT) {
      fetchPayments();
    }
  }, [activeTab]);

  /* ================= FETCH DELIVERED ================= */

  useEffect(() => {
    const fetchDelivered = async () => {
      setLoading(prev => ({ ...prev, delivered: true }));
      try {
        const token = JSON.parse(localStorage.getItem('token'))?.token;
        if (!token) return;

        const response = await fetch(
          `https://admin.merchantfcservice.com/api/order-delivered`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch delivered');

        const data = await response.json();
        setDeliveredOrders(data?.in_review_delivered || []);
      } catch (err) {
        console.error('Delivered API Error:', err);
      } finally {
        setLoading(prev => ({ ...prev, delivered: false }));
      }
    };

    if (activeTab === TAB.DELIVERED) {
      fetchDelivered();
    }
  }, [activeTab]);

  /* ================= FILTER LOGIC ================= */

  const filteredOrders = useMemo(() => {
    if (activeTab === TAB.ALL || activeTab === TAB.LIST_DATE) {
      return orders;
    }


    // Pending tab: parcel_update_track_confirm === "1" AND not in delivered statuses
    if (activeTab === TAB.PENDING) {
      return orders.filter(order =>
        String(order?.parcel_update_track_confirm) === "1" &&
        !['Successfully Delivered',
          'Delivered Amount Collected from Branch',
          'Delivered Amount Send to Fulfillment',
          'Payment Processing',
          'Payment Completed',
          'Payment Processing Complete',
        ].includes(order.status)
      );
    }


    // Preview tab: parcel_update_track_confirm !== "1" AND status in mapping
    if (activeTab === TAB.PREVIEW) {
      return orders.filter(order =>
        String(order?.parcel_update_track_confirm) !== "1" &&
        statusMapping[TAB.PREVIEW].includes(order.status)
      );
    }

    // Approval Pending tab: special handling for delivered statuses
    if (activeTab === TAB.APPROVAL) {
      return orders.filter(order =>
        order.status === 'Successfully Delivered' ||
        order.status === 'Delivered Amount Collected from Branch'
      );
    }

    // Other tabs with status mapping
    const allowedStatuses = statusMapping[activeTab];
    if (!allowedStatuses) return [];

    return orders.filter(order => allowedStatuses.includes(order.status));
  }, [orders, activeTab]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPageGroup = () => {
    if (paginationGroup > 1) {
      setPaginationGroup(prev => prev - 1);
      setCurrentPage((paginationGroup - 2) * 5 + 1);
    }
  };

  const handleNextPageGroup = () => {
    const maxGroup = Math.ceil(totalPages / 5);
    if (paginationGroup < maxGroup) {
      setPaginationGroup(prev => prev + 1);
      setCurrentPage(paginationGroup * 5 + 1);
    }
  };

  const handlePageClick = (page) => setCurrentPage(page);

  const renderPageNumbers = () => {
    const pages = [];
    const start = (paginationGroup - 1) * 5 + 1;
    const end = Math.min(start + 4, totalPages);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`mx-2 px-2.5 py-1 rounded-full text-sm font-medium transition ${currentPage === i
            ? 'button-primary cursor-pointer text-white'
            : 'bg-white text-primary-active cursor-pointer hover:bg-blue-100'
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  /* ================= GROUPED ORDERS ================= */

  const groupedOrders = useMemo(() => {
    if (activeTab === TAB.LIST_DATE) {
      return groupByDate(filteredOrders);
    }
    if (activeTab === TAB.DELIVERED) {
      return groupByDate(deliveredOrders, 'delivered_date');
    }
    if (activeTab === TAB.CANCELLED) {
      return groupByDate(
        filteredOrders.filter(order =>
          statusMapping[TAB.CANCELLED].includes(order.status)
        )
      );
    }
    return {};
  }, [activeTab, filteredOrders, deliveredOrders]);

  /* ================= EXPAND DATES ================= */

  useEffect(() => {
    if ([TAB.LIST_DATE, TAB.DELIVERED, TAB.CANCELLED, TAB.PAYMENT].includes(activeTab)) {
      const today = new Date().toISOString().split('T')[0];
      setExpandedDates({ [today]: true });
    }
  }, [activeTab]);

  const toggleDateExpand = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  /* ================= RENDER FUNCTIONS ================= */

  const renderDateGroupedTable = (items, dateField = 'order_create_date', type = 'order') => {
    if (Object.keys(items).length === 0) {
      return <p className="text-center py-6">No data found.</p>;
    }

    return Object.keys(items).map(date => (
      <div key={date} className="mb-6 rounded-lg shadow-sm">
        {/* Date Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-t-lg border border-gray-200">
          <h2 className="text-base font-bold text-gray-800 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            {date}
            <span className="ml-2 text-xs font-normal text-gray-600 bg-white px-2 py-0.5 rounded-full">
              {items[date].length} {type === 'order' ? 'Parcel' : 'Payment'}
            </span>
          </h2>
          <button
            onClick={() => toggleDateExpand(date)}
            className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            {expandedDates[date] ? 'Hide' : 'View'}
          </button>
        </div>

        {/* Table */}
        {expandedDates[date] && (
          <div className="overflow-hidden rounded-b-lg shadow-sm border border-gray-200 border-t-0">
            <div className="overflow-x-auto">
              {type === 'order' ? renderOrderTable(items[date]) : renderPaymentTable(items[date])}
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderOrderTable = (ordersList) => (
    <table className="w-full text-left text-xs">
      <thead className="bg-gray-50">
        <tr className="border-b border-gray-200">
          <th className="px-3 py-2">SL#</th>
          <th className="px-3 py-2">ID</th>
          <th className="px-3 py-2">Customer</th>
          <th className="px-3 py-2">Phone</th>
          <th className="px-3 py-2">Charge</th>
          <th className="px-3 py-2">Collection</th>
          <th className="px-3 py-2">Reason</th>
          <th className="px-3 py-2">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {ordersList.map((order, idx) => (
          <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50">
            <td className="px-3 py-2">{idx + 1}</td>
            <td className="px-3 py-2">
              <Link
                href={`/dashboard/consignments/${order.tracking_id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                #{order.tracking_id}
              </Link>
            </td>
            <td className="px-3 py-2">{order.customer_name}</td>
            <td className="px-3 py-2">{order.customer_phone}</td>
            <td className="px-3 py-2">{order.delivery}</td>
            <td className="px-3 py-2">{order.collection}</td>
            <td className="px-3 py-2">{order?.reason_name || '-'}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <Link
                href={`/dashboard/consignments/${order.tracking_id}`}
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs mr-1 inline-block"
              >
                View
              </Link>
              <button
                onClick={() => setSelectedOrder(order)}
                disabled={DISABLED_EDIT_STATUSES.includes(order?.status)}
                className={`px-2 py-0.5 rounded text-xs ${DISABLED_EDIT_STATUSES.includes(order?.status)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white'
                  }`}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPaymentTable = (paymentsList) => (
    <table className="w-full text-left text-xs text-gray-700">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr className="text-primary">
          <th className="px-3 py-2">SL#</th>
          <th className="px-3 py-2">Date & Time</th>
          <th className="px-3 py-2">Invoice</th>
          <th className="px-3 py-2">Amount</th>
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {paymentsList.map((payment, idx) => (
          <tr key={payment.id} className="hover:bg-gray-50">
            <td className="px-3 py-2">{idx + 1}</td>
            <td className="px-3 py-2">{formatDate(payment.created_at)}</td>
            <td className="px-3 py-2 text-blue-600 font-medium">{payment.invoice_id}</td>
            <td className="px-3 py-2">{payment.t_payable}</td>
            <td className={`px-3 py-2 font-medium ${payment.status === 'Payment Received By Merchant'
              ? 'text-green-600'
              : payment.status === 'Payment Processing'
                ? 'text-yellow-600'
                : 'text-red-600'
              }`}>
              {payment.status === 'Payment Received By Merchant'
                ? 'Complete'
                : payment.status === 'Payment Processing'
                  ? 'Processing'
                  : payment.status}
            </td>
            <td className="px-3 py-2 text-center">
              <Link
                href={`/dashboard/consignments/payment-details?invoiceId=${payment.invoice_id}`}
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDeliveredTable = (deliveredList) => (
    <table className="w-full text-left text-xs text-gray-700">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr className="text-primary">
          <th className="px-3 py-2">SL#</th>
          <th className="px-3 py-2">Tracking ID</th>
          <th className="px-3 py-2">Date</th>
          <th className="px-3 py-2">Customer</th>
          <th className="px-3 py-2">Phone</th>
          <th className="px-3 py-2">Charge</th>
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {deliveredList.map((order, idx) => (
          <tr key={order.order_id} className="hover:bg-gray-50">
            <td className="px-3 py-2">{idx + 1}</td>
            <td className="px-3 py-2 font-medium">{order.tracking_id}</td>
            <td className="px-3 py-2">{formatDateTime(order?.delivered_date)}</td>
            <td className="px-3 py-2">{order?.customer_name}</td>
            <td className="px-3 py-2">{order?.customer_phone}</td>
            <td className="px-3 py-2">{order?.delivery_charge}৳</td>
            <td className="px-3 py-2 text-green-600 font-medium">{order?.status}</td>
            <td className="px-3 py-2 text-center whitespace-nowrap">
              <Link
                href={`/dashboard/consignments/${order.tracking_id}`}
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs mr-1 inline-block"
              >
                View
              </Link>
              <button
                onClick={() => setSelectedOrder(order)}
                disabled={DISABLED_EDIT_STATUSES.includes(order?.status)}
                className={`px-2 py-0.5 rounded text-xs ${DISABLED_EDIT_STATUSES.includes(order?.status)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white'
                  }`}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderStandardTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-gray bg-gradient-to-r from-blue-50 to-indigo-50">
          <tr className="text-primary">
            <th className="px-2 py-2">SL#</th>
            <th className="px-2 py-2">Date</th>
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Customer</th>
            <th className="px-2 py-2">Phone</th>
            <th className="px-2 py-2">Charge</th>
            <th className="px-2 py-2">Collection</th>
            <th className="px-2 py-2">Remarks</th>
            {(activeTab === TAB.PENDING || activeTab === TAB.APPROVAL) && (
              <th className="px-2 py-2">Status</th>
            )}
            <th className="px-2 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-2 py-3 text-center">
                No data found.
              </td>
            </tr>
          ) : (
            paginatedOrders.map((order, idx) => (
              <tr className="border-b border-gray-200 hover:bg-gray-50" key={`${order.id}-${idx}`}>
                <td className="px-2 py-2">{startIndex + idx + 1}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatDateTime(order?.order_create_date)}</td>
                <td className="px-2 py-2">
                  <Link
                    href={`/dashboard/consignments/${order.tracking_id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    #{order.tracking_id}
                  </Link>
                </td>
                <td className="px-2 py-2">{order.customer_name}</td>
                <td className="px-2 py-2">{order.customer_phone}</td>
                <td className="px-2 py-2">{order.delivery}</td>
                <td className="px-2 py-2">{order.collection}</td>
                <td className="px-2 py-2">{order.remarks || '-'}</td>

                {activeTab === TAB.PENDING && (
                  <td className="px-2 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Assigned To Delivery Rider'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status === 'Assigned To Delivery Rider' ? 'Assigned' : 'Unassigned'}
                    </span>
                  </td>
                )}

                {activeTab === TAB.APPROVAL && (
                  <td className="px-2 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {order.status === 'Delivered Amount Collected from Branch'
                        ? 'Successfully Delivered'
                        : order.status}
                    </span>
                  </td>
                )}

                <td className="px-2 py-2">
                  <Link
                    href={`/dashboard/consignments/${order.tracking_id}`}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs whitespace-nowrap hover:bg-blue-700"
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

  const renderPaymentGrouped = () => {
    const groupedPayments = groupByDate(payments, 'created_at');
    return renderDateGroupedTable(groupedPayments, 'created_at', 'payment');
  };

  const renderDeliveredGrouped = () => {
    return renderDateGroupedTable(groupedOrders, 'delivered_date', 'order');
  };

  const renderCancelledGrouped = () => {
    return renderDateGroupedTable(groupedOrders, 'order_create_date', 'order');
  };

  const renderListByDateGrouped = () => {
    return renderDateGroupedTable(groupedOrders, 'order_create_date', 'order');
  };

  /* ================= MAIN RENDER ================= */

  const isLoading = loading.orders ||
    (activeTab === TAB.PAYMENT && loading.payments) ||
    (activeTab === TAB.DELIVERED && loading.delivered);

  if (isLoading) return <Loading />;

  return (
    <div className="p-3 md:p-4 mt-4">
      <h1 className="text-lg font-semibold mb-3">Consignments List</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setCurrentPage(1);
              setPaginationGroup(1);
            }}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${activeTab === tab.value
              ? 'bg-blue-100 button-primary cursor-pointer'
              : 'bg-white text-gray-700 cursor-pointer border-gray'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="w-full">
        {activeTab === TAB.LIST_DATE && renderListByDateGrouped()}
        {activeTab === TAB.DELIVERED && renderDeliveredGrouped()}
        {activeTab === TAB.CANCELLED && renderCancelledGrouped()}
        {activeTab === TAB.PAYMENT && renderPaymentGrouped()}
        {![TAB.LIST_DATE, TAB.DELIVERED, TAB.CANCELLED, TAB.PAYMENT].includes(activeTab) && renderStandardTable()}
      </div>

      {/* Pagination */}
      {![TAB.LIST_DATE, TAB.DELIVERED, TAB.CANCELLED, TAB.PAYMENT].includes(activeTab) && filteredOrders.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={handlePreviousPageGroup}
            disabled={paginationGroup === 1}
            className={`mx-1.5 px-2 py-1 text-xs rounded-full ${paginationGroup === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primary hover:bg-blue-100'
              }`}
          >
            <FaChevronLeft />
          </button>
          {renderPageNumbers()}
          <button
            onClick={handleNextPageGroup}
            disabled={paginationGroup * 5 >= totalPages}
            className={`mx-1.5 px-2 py-1 text-xs rounded-full ${paginationGroup * 5 >= totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primary hover:bg-blue-100'
              }`}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {selectedOrder && (
        <EditPercaleModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default ParcelTable;