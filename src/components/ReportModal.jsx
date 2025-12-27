import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import './ReportModal.css';

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'sexual_content', label: 'Sexual or explicit content' },
  { value: 'self_harm', label: 'Encouragement of self-harm' },
  { value: 'personal_info', label: 'Personal information / doxxing' },
  { value: 'spam', label: 'Spam or malicious content' },
  { value: 'other', label: 'Other' },
];

const ReportModal = ({ isOpen, onClose, confessionId }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user already reported this confession
  const [alreadyReported, setAlreadyReported] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check localStorage for existing reports
      const reportedConfessions = JSON.parse(localStorage.getItem('reported-confessions') || '[]');
      if (reportedConfessions.includes(confessionId)) {
        setAlreadyReported(true);
      }
    }
  }, [isOpen, confessionId]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!loading) {
      setSelectedReason('');
      setDetails('');
      setError('');
      setSuccess(false);
      setAlreadyReported(false);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }

    if (alreadyReported) {
      setError('You have already reported this confession.');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('reports')
        .insert([
          {
            confession_id: confessionId,
            reason: selectedReason,
            details: details.trim() || null,
          },
        ]);

      if (insertError) {
        setError('Failed to submit report. Please try again.');
        console.error('Error inserting report:', insertError);
      } else {
        // Mark confession as reported in localStorage
        const reportedConfessions = JSON.parse(localStorage.getItem('reported-confessions') || '[]');
        reportedConfessions.push(confessionId);
        localStorage.setItem('reported-confessions', JSON.stringify(reportedConfessions));

        setSuccess(true);
        setAlreadyReported(true);

        setTimeout(() => {
          handleClose();
        }, 2500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="report-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="modal-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close modal"
            >
              ✕
            </button>

            {!success ? (
              <>
                <h2 className="report-modal-title">Report this confession</h2>
                <p className="report-modal-description">
                  Reports help keep this space safe and respectful. All reports are reviewed
                  manually and handled with care.
                </p>

                {alreadyReported ? (
                  <div className="report-already-submitted">
                    <p>You have already reported this confession. Thank you for helping keep our community safe.</p>
                    <button
                      className="report-modal-button"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="report-form">
                    <div className="report-reasons">
                      <label className="report-label">Reason for report:</label>
                      {REPORT_REASONS.map((reason) => (
                        <label key={reason.value} className="report-reason-option">
                          <input
                            type="radio"
                            name="reason"
                            value={reason.value}
                            checked={selectedReason === reason.value}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            disabled={loading}
                          />
                          <span>{reason.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="report-details">
                      <label htmlFor="report-details" className="report-label">
                        Additional details (optional):
                      </label>
                      <textarea
                        id="report-details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Provide any additional context that might help us understand your concern..."
                        className="report-textarea"
                        rows="4"
                        maxLength="500"
                        disabled={loading}
                      />
                      <div className="report-char-count">
                        {details.length} / 500
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        className="report-error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      className="report-modal-button"
                      disabled={loading || !selectedReason}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Submitting...' : 'Submit Report'}
                    </motion.button>
                  </form>
                )}
              </>
            ) : (
              <motion.div
                className="report-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="success-icon">✓</div>
                <h3>Report submitted</h3>
                <p>Thank you for helping keep this space safe. We'll review this report carefully.</p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
