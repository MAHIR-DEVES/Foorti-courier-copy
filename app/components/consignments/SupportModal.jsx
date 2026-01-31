'use client';

import React, { useState } from 'react';

const SupportModal = ({ isOpen, onClose, trackingId }) => {
  const [issueName, setIssueName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleMessageChange = e => {
    setMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!issueName || !message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stored = localStorage.getItem('token');
      const token = stored ? JSON.parse(stored).token : null;

      const formData = new FormData();
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('tracking_id', trackingId);
      formData.append('issue_name', issueName);
      formData.append('message', message);

      const res = await fetch(
        'https://admin.merchantfcservice.com/api/create-support-ticket',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit ticket');
      }

      onClose();
      setIssueName('');
      setMessage('');
      setCharCount(0);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Support Ticket
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We'll get back to you as soon as possible
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Name Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl px-4 appearance-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 text-gray-800 cursor-pointer"
                    value={issueName}
                    onChange={e => setIssueName(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="" disabled>
                      Select an issue type
                    </option>
                    <option value="pick up">Pick Up Issue</option>
                    <option value="delivery">Delivery Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="billing & service">Billing & Service</option>
                    <option value="service">Service Issue</option>
                    <option value="others">Others</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-800">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-sm ${charCount > 1000 ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {charCount}/1000
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full min-h-[140px] bg-white border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none text-gray-800 placeholder:text-gray-400"
                    rows={4}
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Please describe your issue in detail..."
                    required
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <svg
                        className={`w-5 h-5 ${charCount > 0 ? 'text-blue-500' : 'text-gray-300'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
                  <div className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-600 font-medium">
                      Submission Failed
                    </p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Help text */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Tips for faster resolution
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Include order numbers, dates, and specific error messages to
                    help us assist you better.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer with buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !issueName || !message.trim()}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  loading || !issueName || !message.trim()
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
