import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeModal.css';

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('freedom-wall-visited');

    if (!hasVisited) {
      // Show modal after a brief delay for better UX
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    // Mark as visited
    localStorage.setItem('freedom-wall-visited', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Modal */}
          <motion.div
            className="welcome-modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="welcome-content">
              <motion.div
                className="welcome-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              >
                ✨
              </motion.div>

              <motion.h2
                className="welcome-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Welcome to the Freedom Wall
              </motion.h2>

              <motion.div
                className="welcome-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p>As the year comes to a close, we carry more than memories — we carry unspoken words.</p>
                <p>This space exists for those feelings left behind in the noise of the year.</p>
                <p>Before stepping into something new, take a moment to release what you've been holding onto.</p>
              </motion.div>

              <motion.div
                className="welcome-privacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
               <div className="privacy-note" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {/* Lock SVG */}
                  <span className="privacy-icon" style={{ display: 'inline-flex' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C9.243 2 7 4.243 7 7v4H6c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 5c0-1.654 1.346-3 3-3s3 1.346 3 3v4H9V7zm9 6v9H6v-9h12z"/>
                    </svg>
                  </span>

                  {/* Text */}
                  <p style={{ margin: 0 }}>
                    Please do not share personal details such as names, contact information, or any identifying information. Keep it anonymous.
                  </p>
                </div>
              </motion.div>

              <motion.button
                className="welcome-button"
                onClick={handleClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                I Understand
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;