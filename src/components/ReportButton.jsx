import { useState } from 'react';
import ReportModal from './ReportModal';
import './ReportButton.css';

const ReportButton = ({ confessionId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="report-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="Report this confession"
        title="Report inappropriate content"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        confessionId={confessionId}
      />
    </>
  );
};

export default ReportButton;
