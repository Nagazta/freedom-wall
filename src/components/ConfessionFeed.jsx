import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, MOODS } from '../lib/supabase';
import './ConfessionFeed.css';

const ConfessionCard = ({ confession, index }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="confession-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      {confession.mood && (
        <span className={`mood-tag mood-${confession.mood.toLowerCase()}`}>
          {confession.mood}
        </span>
      )}
      <p className="confession-message">{confession.message}</p>
      <div className="confession-footer">
        <span className="confession-time">{formatDate(confession.created_at)}</span>
      </div>
    </motion.div>
  );
};

const ConfessionFeed = ({ newConfession }) => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const fetchConfessions = async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedMood) {
        query = query.eq('mood', selectedMood);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError('Failed to load confessions. Please refresh the page.');
        console.error('Error fetching confessions:', fetchError);
      } else {
        setConfessions(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [selectedMood]);

  // Add new confession to the feed
  useEffect(() => {
    if (newConfession) {
      setConfessions((prev) => [newConfession, ...prev]);
    }
  }, [newConfession]);

  const getRandomConfession = () => {
    if (confessions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * confessions.length);
    const element = document.getElementById(`confession-${confessions[randomIndex].id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight');
      setTimeout(() => element.classList.remove('highlight'), 2000);
    }
  };

  return (
    <div className="confession-feed">
      <div className="feed-header">
        <h2 className="feed-title">Whispers from the year that was</h2>

        <div className="feed-controls">
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="mood-filter"
          >
            <option value="">All feelings</option>
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>

          <button onClick={getRandomConfession} className="random-button" disabled={confessions.length === 0}>
            Random
          </button>
        </div>
      </div>

      {error && <div className="feed-error">{error}</div>}

      {loading ? (
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading whispers...</p>
        </div>
      ) : confessions.length === 0 ? (
        <motion.div
          className="feed-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No confessions yet. Be the first to share.</p>
        </motion.div>
      ) : (
        <div className="confessions-list">
          <AnimatePresence mode="popLayout">
            {confessions.map((confession, index) => (
              <div key={confession.id} id={`confession-${confession.id}`}>
                <ConfessionCard confession={confession} index={index} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ConfessionFeed;
