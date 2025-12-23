import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isPostingAllowed, POSTING_DEADLINE } from './lib/supabase';
import FreedomWall from './components/FreedomWall';
import SubmitConfessionModal from './components/SubmitConfessionModal';
import WelcomeModal from './components/WelcomeModal';
import SnowAnimation from './components/SnowAnimation';
import './App.css';

function App() {
  const [canPost, setCanPost] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConfession, setNewConfession] = useState(null);

  useEffect(() => {
    // Check posting deadline
    setCanPost(isPostingAllowed());

    // Set up interval to check deadline every minute
    const interval = setInterval(() => {
      setCanPost(isPostingAllowed());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleConfessionAdded = (confession) => {
    setNewConfession(confession);
    // Reset after passing to feed
    setTimeout(() => setNewConfession(null), 100);
  };

  const formatDeadline = () => {
    return POSTING_DEADLINE.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <div className="app">
      <SnowAnimation />

      <div className="app-container">
        <main className="app-main">
          {canPost ? (
            <>
              {/* Floating Release Button */}
              <motion.button
                className="release-button"
                onClick={() => setIsModalOpen(true)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="release-button-icon">✍️</span>
                <span className="release-button-text">Release your words</span>
              </motion.button>

              {/* Deadline Notice */}
              <motion.div
                className="deadline-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Posting closes: {formatDeadline()}
              </motion.div>
            </>
          ) : (
            <motion.div
              className="locked-banner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="locked-icon">🔒</span>
              <div className="locked-content">
                <strong>The Year Has Ended</strong>
                <p>This wall is now a time capsule. Read, reflect, and carry these stories forward.</p>
              </div>
            </motion.div>
          )}

          <FreedomWall newConfession={newConfession} />
        </main>

        <motion.footer
          className="app-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p>Anonymous. Honest. Forever.</p>
          <p className="footer-year">2025 — Soft Rebirth</p>
        </motion.footer>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal />

      {/* Submit Modal */}
      <SubmitConfessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfessionAdded={handleConfessionAdded}
      />
    </div>
  );
}

export default App;
