import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, MOODS } from '../lib/supabase';
import { containsProfanity, getProfanityWarning } from '../utils/profanityFilter';
import './SubmitConfessionModal.css';

const SubmitConfessionModal = ({ isOpen, onClose, onConfessionAdded }) => {
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastPostTime, setLastPostTime] = useState(0);
  const textareaRef = useRef(null);

  const MIN_CHARS = 1;
  const MAX_CHARS = 500;
  const RATE_LIMIT_MS = 60000;

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
      setMessage('');
      setMood('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (message.trim().length < MIN_CHARS) {
      setError('Please write something before submitting.');
      return;
    }

    if (message.length > MAX_CHARS) {
      setError(`Message is too long. Maximum ${MAX_CHARS} characters allowed.`);
      return;
    }

    const now = Date.now();
    if (now - lastPostTime < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastPostTime)) / 1000);
      setError(`Please wait ${remainingSeconds} seconds before posting again.`);
      return;
    }

    if (containsProfanity(message)) {
      setError(getProfanityWarning());
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('confessions')
        .insert([
          {
            message: message.trim(),
            mood: mood || null,
          },
        ])
        .select();

      if (insertError) {
        if (insertError.message.includes('violates check constraint')) {
          setError('Posting is no longer allowed. The year has ended.');
        } else {
          setError('Failed to release your words. Please try again.');
        }
        console.error('Error inserting confession:', insertError);
      } else {
        setSuccess(true);
        setLastPostTime(now);

        if (onConfessionAdded && data && data[0]) {
          onConfessionAdded(data[0]);
        }

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

  const charCount = message.length;
  const charCountColor = charCount > MAX_CHARS ? '#F87171' : charCount > MAX_CHARS * 0.9 ? '#F3C969' : '#A9B7BE';

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
            className="submit-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal-close" onClick={handleClose} disabled={loading} aria-label="Close modal">
              ✕
            </button>

            <h2 className="modal-title">Say What You Never Could</h2>
            <p className="modal-reminder">Write kindly. This space is for healing, not harm.</p>

            {!success ? (
              <form onSubmit={handleSubmit} className="submit-form">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the words you kept all year…"
                  className="submit-textarea"
                  rows="8"
                  disabled={loading}
                  autoFocus
                  aria-label="Confession message"
                />

                <div className="submit-footer">
                  <div className="char-count" style={{ color: charCountColor }}>
                    {charCount} / {MAX_CHARS}
                  </div>

                  <div className="mood-selector">
                    <label htmlFor="modal-mood-select" className="mood-label">
                      Feeling:
                    </label>
                    <select
                      id="modal-mood-select"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="mood-select"
                      disabled={loading}
                    >
                      <option value="">None</option>
                      {MOODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <motion.div
                    className="message error-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="submit-button"
                  disabled={loading || message.trim().length < MIN_CHARS}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Releasing...' : 'Release Your Words'}
                </motion.button>
              </form>
            ) : (
              <motion.div
                className="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="success-icon">✓</div>
                <h3>Your words have been released.</h3>
                <p>They now belong to the wall.</p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitConfessionModal;