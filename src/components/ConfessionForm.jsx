import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase, MOODS } from '../lib/supabase';
import { containsProfanity, getProfanityWarning } from '../utils/profanityFilter';
import './ConfessionForm.css';

const ConfessionForm = ({ onConfessionAdded }) => {
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastPostTime, setLastPostTime] = useState(0);
  const textareaRef = useRef(null);

  const MIN_CHARS = 1;
  const MAX_CHARS = 500;
  const RATE_LIMIT_MS = 60000; // 1 minute

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (message.trim().length < MIN_CHARS) {
      setError('Please write something before submitting.');
      return;
    }

    if (message.length > MAX_CHARS) {
      setError(`Message is too long. Maximum ${MAX_CHARS} characters allowed.`);
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastPostTime < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastPostTime)) / 1000);
      setError(`Please wait ${remainingSeconds} seconds before posting again.`);
      return;
    }

    // Profanity check
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
          setError('Failed to post your confession. Please try again.');
        }
        console.error('Error inserting confession:', insertError);
      } else {
        setSuccess(true);
        setMessage('');
        setMood('');
        setLastPostTime(now);

        // Notify parent component
        if (onConfessionAdded && data && data[0]) {
          onConfessionAdded(data[0]);
        }

        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
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
    <motion.div
      className="confession-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="form-reminder">Write kindly… these words will stay forever.</p>

      <form onSubmit={handleSubmit} className="confession-form">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write the words you never said this year…"
          className="confession-textarea"
          rows="6"
          disabled={loading}
        />

        <div className="form-footer">
          <div className="char-count" style={{ color: charCountColor }}>
            {charCount} / {MAX_CHARS}
          </div>

          <div className="mood-selector">
            <label htmlFor="mood-select" className="mood-label">
              Feeling:
            </label>
            <select
              id="mood-select"
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

        {success && (
          <motion.div
            className="message success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Your words have been released.
          </motion.div>
        )}

        <motion.button
          type="submit"
          className="submit-button"
          disabled={loading || message.trim().length < MIN_CHARS}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Releasing...' : 'Release'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ConfessionForm;
