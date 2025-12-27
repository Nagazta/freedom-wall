import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, MOODS, isLatest } from '../lib/supabase';
import { getClientHash } from '../utils/clientHash';
import HeartReaction from './HeartReaction';
import './FreedomWall.css';

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
      className="wall-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      {confession.mood && (
        <span className={`wall-mood-tag mood-${confession.mood.toLowerCase()}`}>
          {confession.mood}
        </span>
      )}
      <p className="wall-message">{confession.message}</p>
      <div className="wall-footer">
        <span className="wall-time">{formatDate(confession.created_at)}</span>
        <HeartReaction
          confessionId={confession.id}
          initialCount={confession.reaction_count || 0}
          initialHasReacted={confession.has_reacted || false}
        />
      </div>
    </motion.div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showEllipsisStart) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
};

const FreedomWall = ({ newConfession }) => {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [latestPage, setLatestPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  // Split confessions into Latest (24h) and Past
  const latestConfessions = confessions.filter(c => isLatest(c.created_at));
  const pastConfessions = confessions.filter(c => !isLatest(c.created_at));

  // Pagination for Latest
  const latestTotalPages = Math.ceil(latestConfessions.length / ITEMS_PER_PAGE);
  const latestStartIndex = (latestPage - 1) * ITEMS_PER_PAGE;
  const latestPaginatedConfessions = latestConfessions.slice(latestStartIndex, latestStartIndex + ITEMS_PER_PAGE);

  // Pagination for Past
  const pastTotalPages = Math.ceil(pastConfessions.length / ITEMS_PER_PAGE);
  const pastStartIndex = (pastPage - 1) * ITEMS_PER_PAGE;
  const pastPaginatedConfessions = pastConfessions.slice(pastStartIndex, pastStartIndex + ITEMS_PER_PAGE);

  const fetchConfessions = async () => {
    setLoading(true);
    setError('');

    const clientHash = getClientHash();

    try {
      // Fetch confessions with reactions
      let query = supabase
        .from('confessions')
        .select('*, reactions(client_hash)')
        .order('created_at', { ascending: false });

      if (selectedMood) {
        query = query.eq('mood', selectedMood);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError('Failed to load confessions. Please refresh the page.');
        console.error('Error fetching confessions:', fetchError);
      } else {
        // Process the data to format reaction counts and user reactions
        const processedConfessions = (data || []).map((confession) => {
          const reactions = confession.reactions || [];
          const reactionCount = reactions.length;
          const hasReacted = reactions.some((r) => r.client_hash === clientHash);

          return {
            ...confession,
            reaction_count: reactionCount,
            has_reacted: hasReacted,
          };
        });

        setConfessions(processedConfessions);
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
    const element = document.getElementById(`wall-confession-${confessions[randomIndex].id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight');
      setTimeout(() => element.classList.remove('highlight'), 2000);
    }
  };

  return (
    <div className="freedom-wall">
      <motion.header
        className="wall-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="wall-title">Freedom Wall</h1>
        <p className="wall-subtitle">Words people never said, now finally released.</p>
      </motion.header>

      <div className="wall-controls">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="wall-mood-filter"
        >
          <option value="">All feelings</option>
          {MOODS.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </select>

        <button onClick={getRandomConfession} className="wall-random-button" disabled={confessions.length === 0}>
          Random confession
        </button>
      </div>

      {error && <div className="wall-error">{error}</div>}

      {loading ? (
        <div className="wall-loading">
          <div className="loading-spinner"></div>
          <p>Loading the wall...</p>
        </div>
      ) : confessions.length === 0 ? (
        <motion.div
          className="wall-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No confessions yet. The wall awaits its first words.</p>
        </motion.div>
      ) : (
        <>
          {/* Latest Confessions Section */}
          {latestConfessions.length > 0 && (
            <section className="wall-section">
              <motion.h2
                className="wall-section-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Latest Words
              </motion.h2>
              <div className="wall-grid">
                <AnimatePresence mode="popLayout">
                  {latestPaginatedConfessions.map((confession, index) => (
                    <div key={confession.id} id={`wall-confession-${confession.id}`}>
                      <ConfessionCard confession={confession} index={index} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
              <Pagination
                currentPage={latestPage}
                totalPages={latestTotalPages}
                onPageChange={setLatestPage}
              />
            </section>
          )}

          {/* Past Confessions Section */}
          {pastConfessions.length > 0 && (
            <section className="wall-section">
              <motion.h2
                className="wall-section-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Earlier Words
              </motion.h2>
              <div className="wall-grid">
                <AnimatePresence mode="popLayout">
                  {pastPaginatedConfessions.map((confession, index) => (
                    <div key={confession.id} id={`wall-confession-${confession.id}`}>
                      <ConfessionCard confession={confession} index={index} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
              <Pagination
                currentPage={pastPage}
                totalPages={pastTotalPages}
                onPageChange={setPastPage}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default FreedomWall;
