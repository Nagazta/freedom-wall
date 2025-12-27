import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import './AdminReports.css';

const REASON_LABELS = {
  harassment: 'Harassment or hate speech',
  sexual_content: 'Sexual or explicit content',
  self_harm: 'Encouragement of self-harm',
  personal_info: 'Personal information / doxxing',
  spam: 'Spam or malicious content',
  other: 'Other',
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch reports with confession data
      let query = supabase
        .from('reports')
        .select(`
          *,
          confessions (
            id,
            message,
            mood,
            flagged,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError('Failed to load reports. Please refresh the page.');
        console.error('Error fetching reports:', fetchError);
      } else {
        // Group reports by confession
        const groupedReports = {};
        (data || []).forEach((report) => {
          const confessionId = report.confession_id;
          if (!groupedReports[confessionId]) {
            groupedReports[confessionId] = {
              confession: report.confessions,
              reports: [],
            };
          }
          groupedReports[confessionId].reports.push(report);
        });

        setReports(Object.values(groupedReports));
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (reportIds) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'reviewed' })
        .in('id', reportIds);

      if (error) {
        console.error('Error marking reports as reviewed:', error);
        alert('Failed to update reports.');
      } else {
        fetchReports();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }
  };

  const handleResolve = async (reportIds) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .in('id', reportIds);

      if (error) {
        console.error('Error resolving reports:', error);
        alert('Failed to resolve reports.');
      } else {
        fetchReports();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }
  };

  const handleDeleteConfession = async (confessionId, reportIds) => {
    if (!window.confirm('Are you sure you want to delete this confession? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete confession (cascade will delete reports)
      const { error } = await supabase
        .from('confessions')
        .delete()
        .eq('id', confessionId);

      if (error) {
        console.error('Error deleting confession:', error);
        alert('Failed to delete confession.');
      } else {
        fetchReports();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-reports">
      <motion.header
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="admin-title">Report Management</h1>
        <p className="admin-subtitle">Review and moderate reported confessions</p>
      </motion.header>

      <div className="admin-controls">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-filter"
        >
          <option value="">All Reports</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <motion.div
          className="admin-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p>No {filterStatus} reports found.</p>
        </motion.div>
      ) : (
        <div className="admin-reports-list">
          {reports.map((group, index) => {
            const { confession, reports: confessionReports } = group;
            const reportIds = confessionReports.map((r) => r.id);

            return (
              <motion.div
                key={confession?.id || index}
                className="admin-report-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="admin-report-header">
                  <div className="admin-report-meta">
                    <span className="admin-report-count">
                      {confessionReports.length} {confessionReports.length === 1 ? 'report' : 'reports'}
                    </span>
                    {confession?.flagged && (
                      <span className="admin-flagged-badge">⚠️ Auto-Flagged</span>
                    )}
                    <span className="admin-report-date">
                      Latest: {formatDate(confessionReports[0].created_at)}
                    </span>
                  </div>
                </div>

                <div className="admin-confession-preview">
                  {confession?.mood && (
                    <span className={`admin-mood-tag mood-${confession.mood.toLowerCase()}`}>
                      {confession.mood}
                    </span>
                  )}
                  <p className="admin-confession-message">{confession?.message}</p>
                  <p className="admin-confession-date">
                    Posted: {formatDate(confession?.created_at)}
                  </p>
                </div>

                <div className="admin-reports-details">
                  <button
                    className="admin-toggle-details"
                    onClick={() => setSelectedReport(selectedReport === confession?.id ? null : confession?.id)}
                  >
                    {selectedReport === confession?.id ? 'Hide' : 'Show'} Report Details
                  </button>

                  {selectedReport === confession?.id && (
                    <div className="admin-report-reasons">
                      {confessionReports.map((report) => (
                        <div key={report.id} className="admin-report-item">
                          <div className="admin-report-item-header">
                            <span className="admin-reason-badge">
                              {REASON_LABELS[report.reason]}
                            </span>
                            <span className="admin-status-badge status-{report.status}">
                              {report.status}
                            </span>
                          </div>
                          {report.details && (
                            <p className="admin-report-details-text">{report.details}</p>
                          )}
                          <span className="admin-report-timestamp">
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-actions">
                  <button
                    className="admin-action-btn review"
                    onClick={() => handleMarkReviewed(reportIds)}
                  >
                    Mark Reviewed
                  </button>
                  <button
                    className="admin-action-btn resolve"
                    onClick={() => handleResolve(reportIds)}
                  >
                    Resolve
                  </button>
                  <button
                    className="admin-action-btn delete"
                    onClick={() => handleDeleteConfession(confession?.id, reportIds)}
                  >
                    Delete Confession
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
