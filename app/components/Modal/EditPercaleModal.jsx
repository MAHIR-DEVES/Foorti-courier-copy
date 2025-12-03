'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EditPercaleModal = ({ order, onClose }) => {
  if (!order) return null;

  const [customerName, setCustomerName] = useState(order.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(
    order.customer_phone || ''
  );
  const [collection, setCollection] = useState(order.collection || '');
  const [customerAddress, setCustomerAddress] = useState(
    order.customer_address || ''
  );
  const [remarks, setRemarks] = useState(order.remarks || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const updatedOrder = {
      tracking_id: order.tracking_id, // API সাধারণত ID দরকার
      customer_name: customerName,
      customer_phone: customerPhone,
      cod_amount: collection,
      customer_address: customerAddress,
      remarks: remarks,
    };

    try {
      const stored = localStorage.getItem('token');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const token = parsed?.token;
      if (!token) return;

      const res = await fetch(
        'https://admin.merchantfcservice.com/api/parcel-update',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Token send
          },
          body: JSON.stringify(updatedOrder),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success('Parcel updated successfully!');
        onClose();
      } else {
        toast.error(data.message || 'Update failed!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Parcel</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Tracking ID */}
          <div>
            <label className="block font-semibold mb-1">Tracking ID</label>
            <input
              type="text"
              value={order.tracking_id}
              readOnly
              className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block font-semibold mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              required
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block font-semibold mb-1">Customer Phone</label>
            <input
              type="text"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              required
            />
          </div>

          {/* COD Amount */}
          <div>
            <label className="block font-semibold mb-1">COD Amount</label>
            <input
              type="number"
              value={collection}
              onChange={e => setCollection(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          {/* Customer Address */}
          <div>
            <label className="block font-semibold mb-1">Customer Address</label>
            <textarea
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              rows={3}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
              disabled={loading}
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPercaleModal;
