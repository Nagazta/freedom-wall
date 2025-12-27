import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getClientHash } from '../utils/clientHash';
import './HeartReaction.css';

const HeartReaction = ({ confessionId, initialCount = 0, initialHasReacted = false }) => {
  const [count, setCount] = useState(initialCount);
  const [hasReacted, setHasReacted] = useState(initialHasReacted);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');

  const handleReaction = async () => {
    if (hasReacted || isAnimating) return;

    setIsAnimating(true);
    setError('');

    const clientHash = getClientHash();

    try {
      const { error: insertError } = await supabase
        .from('reactions')
        .insert([
          {
            confession_id: confessionId,
            reaction_type: 'heart',
            client_hash: clientHash,
          },
        ]);

      if (insertError) {
        // Check if it's a duplicate error
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setHasReacted(true);
        } else {
          setError('Failed to react. Please try again.');
          console.error('Error adding reaction:', insertError);
        }
      } else {
        // Success
        setHasReacted(true);
        setCount((prev) => prev + 1);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <div className="heart-reaction">
      <motion.button
        className={`heart-button ${hasReacted ? 'reacted' : ''}`}
        onClick={handleReaction}
        disabled={hasReacted || isAnimating}
        whileHover={!hasReacted ? { scale: 1.1 } : {}}
        whileTap={!hasReacted ? { scale: 0.95 } : {}}
        aria-label={hasReacted ? 'Already reacted' : 'React with heart'}
      >
        {/* Heart SVG */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={hasReacted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>

        {/* Count */}
        {count > 0 && (
          <motion.span
            className="heart-count"
            key={count}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {count}
          </motion.span>
        )}
      </motion.button>

      {error && <span className="heart-error">{error}</span>}
    </div>
  );
};

export default HeartReaction;
