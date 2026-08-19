import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, FileText, Brain, CloudRain, Users, Calendar, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const ReportsTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);

  const fetchReportsAndInsights = async () => {
    try {
      setLoading(true);
      const [reportsRes, insightsRes] = await Promise.all([
        api.get(`/projects/${projectId}/reports`),
        api.get(`/projects/${projectId}/insights`)
      ]);
      setReports(reportsRes.data?.data?.reports || []);
      setInsights(insightsRes.data?.data?.insights || []);
    } catch (err) {
      console.error('Error fetching reports and insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndInsights();

    // Listen for Socket-driven compile completion events
    const handleReportCompiled = () => {
      setCompiling(false);
      fetchReportsAndInsights();
    };

    window.addEventListener('report-compiled', handleReportCompiled);
    return () => {
      window.removeEventListener('report-compiled', handleReportCompiled);
    };
  }, [projectId]);

  const handleCompileReport = async () => {
    try {
      setCompiling(true);
      await api.post(`/projects/${projectId}/reports`);
      // The compilation is async on the backend. It returns success: true, but the compilation itself
      // is processed by BullMQ. The server will emit 'report_compiled' via Socket.IO, which is handled
      // by window.addEventListener('report-compiled') above.
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger report compilation.');
      setCompiling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getConfidenceColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 0.85) return 'var(--success)';
    if (score >= 0.70) return 'var(--warning)';
    return 'var(--error)';
  };

  const canModify = isAdmin || isProjectManager;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', textAlign: 'left' }}>
      
      {/* 1. Daily Site Reports */}
      <div>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h2>Daily Operations Reports</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Chronological daily logs of site conditions, contractor workforce presence, and operations notes.
            </p>
          </div>

          {canModify && (
            <button className="btn btn-primary" onClick={handleCompileReport} disabled={compiling}>
              {compiling ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Compile Report</span>
                </>
              )}
            </button>
          )}
        </div>

        {compiling && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--accent)', backgroundColor: '#FFFDF9', marginBottom: '16px' }}>
            <Loader2 className="animate-spin" size={20} color="var(--accent)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>Asynchronous report compilation in progress...</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                BullMQ worker is generating PDF summaries and compiling data. Renders automatically on socket event.
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="skeleton" style={{ height: '200px' }}></div>
        ) : reports.length === 0 && !compiling ? (
          <div className="empty-state">
            <FileText size={36} color="var(--text-muted)" />
            <span className="empty-state-title">No daily reports generated</span>
            <span className="empty-state-desc">Trigger 'Compile Report' to synthesize daily logs into operational reports.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((report) => (
              <div key={report._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-light)' }}>
                    {formatDate(report.date)}
                  </div>
                  {report.pdfUrl && (
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      <span>View PDF Summary</span>
                      <ArrowRight size={12} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CloudRain size={16} color="var(--text-muted)" />
                    <span>Weather: <strong>{report.weather || 'Sunny/Clear'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="var(--text-muted)" />
                    <span>Workforce Headcount: <strong>{report.workforceCount || 0} present</strong></span>
                  </div>
                </div>

                {report.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '4px' }}>
                    <strong>Site Director Notes:</strong> {report.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. AI Forecast Summary Insights (Weekly) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Brain size={20} color="var(--primary-light)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>AI Forecast Audits</h2>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '300px' }}></div>
        ) : insights.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No weekly forecast forecasts compiled yet. Generated by system cron jobs.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {insights.map((ins) => (
              <div key={ins._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <span>{ins.type?.replace('_', ' ')}</span>
                  <span>{formatDate(ins.date)}</span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 500 }}>{ins.summary}</div>

                {ins.recommendations && ins.recommendations.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-muted)' }}>Barrier Actions</div>
                    <ul style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {ins.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--text-muted)' }}>
                  <span>Audit Confidence:</span>
                  <span style={{ fontWeight: 700, color: getConfidenceColor(ins.confidenceScore) }}>
                    {(ins.confidenceScore * 100).toFixed(0)}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ReportsTab;
