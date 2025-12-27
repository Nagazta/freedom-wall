import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FreedomWall from './components/FreedomWall';
import Leaderboard from './components/Leaderboard';
import AdminReports from './components/AdminReports';
import SubmitConfessionModal from './components/SubmitConfessionModal';
import WelcomePage from './components/WelcomePage';
import SnowAnimation from './components/SnowAnimation';
import './App.css';

function App() {
  const [canPost, setCanPost] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConfession, setNewConfession] = useState(null);
  const [currentView, setCurrentView] = useState('wall'); // 'wall', 'leaderboard', or 'admin'
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('freedom-wall-visited');
    if (hasVisited) {
      setShowWelcome(false);
    }

    // Check if accessing admin route
    const currentPath = window.location.hash || window.location.pathname;
    if (currentPath.includes('admin')) {
      const adminKey = prompt('Enter admin key:');
      const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'admin123';

      if (adminKey === ADMIN_KEY) {
        setIsAdmin(true);
        setCurrentView('admin');
      } else {
        alert('Invalid admin key');
        window.location.hash = '';
      }
    }



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



  // Show welcome page on first visit
  if (showWelcome) {
    return <WelcomePage onEnter={() => setShowWelcome(false)} />;
  }

  return (
    <div className="app">
      <SnowAnimation />

      <div className="app-container">
        {/* Navigation */}
        <motion.nav
          className="app-nav"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            className={`nav-button ${currentView === 'wall' ? 'active' : ''}`}
            onClick={() => setCurrentView('wall')}
          >
            Freedom Wall
          </button>
          <button
            className={`nav-button ${currentView === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('leaderboard')}
          >
            Resonance
          </button>
        </motion.nav>

        <main className="app-main">
          {canPost && currentView === 'wall' && (
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
                {/* Pen / Writing SVG */}
                <span className="release-button-icon" style={{ display: 'inline-flex', marginRight: '0.5rem' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75l11.065-11.065-3.75-3.75L3 17.25zm18.71-11.04c.39-.39.39-1.02 0-1.41l-2.5-2.5a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.99-1.67z"/>
                  </svg>
                </span>

                <span className="release-button-text">Release your words</span>
              </motion.button>

            </>
          )}

          {!canPost && currentView === 'wall' && (
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

          {currentView === 'wall' ? (
            <FreedomWall newConfession={newConfession} />
          ) : currentView === 'leaderboard' ? (
            <Leaderboard />
          ) : currentView === 'admin' && isAdmin ? (
            <AdminReports />
          ) : null}
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
