'use client';

import React, { useState, useEffect } from 'react';

const NoteModal = ({ isOpen, onClose, onSave, initialNote = '' }) => {
  const [note, setNote] = useState(initialNote);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(note.length);
  }, [note]);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!note.trim()) {
      setError('Please write something before saving');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave(note);
      setNote('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onClose();
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
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {initialNote ? 'Edit Note' : 'New Note'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {initialNote
                    ? 'Update your thoughts'
                    : 'Capture your thoughts'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
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

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full min-h-[180px] bg-white border-2 border-gray-200 rounded-xl p-4 pr-12 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none text-gray-800 placeholder:text-gray-400"
                rows={6}
                placeholder="Start typing your note here..."
                autoFocus
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span
                  className={`text-sm ${charCount > 500 ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {charCount}/500
                </span>
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 flex-shrink-0 text-red-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer with buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Auto-saved locally</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={submitting || !note.trim()}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    submitting || !note.trim()
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {submitting ? (
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
                      Saving...
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {initialNote ? 'Update Note' : 'Save Note'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
