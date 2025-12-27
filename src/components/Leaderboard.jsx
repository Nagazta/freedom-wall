import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import ReportButton from './ReportButton';
import './Leaderboard.css';

const LeaderboardCard = ({ confession, index }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="leaderboard-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      {confession.mood && (
        <span className={`leaderboard-mood-tag mood-${confession.mood.toLowerCase()}`}>
          {confession.mood}
        </span>
      )}
      <p className="leaderboard-message">{confession.message}</p>
      <div className="leaderboard-footer">
        <span className="leaderboard-time">{formatDate(confession.created_at)}</span>
        <div className="leaderboard-actions">
          <div className="leaderboard-hearts">
            {/* Heart SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="leaderboard-count">{confession.reaction_count}</span>
          </div>
          <ReportButton confessionId={confession.id} />
        </div>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopConfessions();
  }, []);

  const fetchTopConfessions = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch confessions with reaction counts, ordered by reactions
      const { data, error: fetchError } = await supabase
        .from('confessions')
        .select(`
          *,
          reactions(count)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load confessions. Please refresh the page.');
        console.error('Error fetching leaderboard:', fetchError);
      } else {
        // Process and sort by reaction count
        const processedConfessions = (data || [])
          .map((confession) => ({
            ...confession,
            reaction_count: confession.reactions?.[0]?.count || 0,
          }))
          .filter((confession) => confession.reaction_count > 0) // Only show confessions with hearts
          .sort((a, b) => b.reaction_count - a.reaction_count); // Sort by hearts descending

        setConfessions(processedConfessions);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard">
      <motion.header
        className="leaderboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="leaderboard-title">Resonance</h1>
        <p className="leaderboard-subtitle">
          These are the words that quietly resonated with others.
        </p>
      </motion.header>

      {error && <div className="leaderboard-error">{error}</div>}

      {loading ? (
        <div className="leaderboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading resonant words...</p>
        </div>
      ) : confessions.length === 0 ? (
        <motion.div
          className="leaderboard-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="leaderboard-empty-icon">✨</div>
          <p>No hearts yet. Be the first to resonate with someone's words.</p>
        </motion.div>
      ) : (
        <div className="leaderboard-grid">
          <AnimatePresence mode="popLayout">
            {confessions.map((confession, index) => (
              <LeaderboardCard key={confession.id} confession={confession} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
