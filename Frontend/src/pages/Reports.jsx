import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, Brain, CloudRain, Users, Calendar, Loader2, ArrowRight } from 'lucide-react';

const Reports = () => {
  const { isAdmin, isProjectManager } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('activeProjectId', selectedProjectId);
      window.dispatchEvent(new Event('projectContextChanged'));
    }
  }, [selectedProjectId]);

  // 1. Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api.get('/projects');
        const list = res.data?.data?.projects || [];
        setProjects(list);
        if (list.length > 0) {
          const firstId = list[0].id || list[0]._id;
          setSelectedProjectId(firstId);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch reports and insights when selected project changes
  const fetchReportsAndInsights = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingData(true);
      const [reportsRes, insightsRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/reports`),
        api.get(`/projects/${selectedProjectId}/insights`)
      ]);
      setReports(reportsRes.data?.data?.reports || []);
      setInsights(insightsRes.data?.data?.insights || []);
    } catch (err) {
      console.error('Error fetching reports and insights:', err);
    } finally {
      setLoadingData(false);
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
  }, [selectedProjectId]);

  const handleCompileReport = async () => {
    try {
      setCompiling(true);
      await api.post(`/projects/${selectedProjectId}/reports`, {
        date: new Date().toISOString()
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger report compilation.');
      setCompiling(false);
    }
  };

  const handleViewPdf = async (reportId) => {
    // Open blank tab immediately to prevent popup blockers from blocking async window.open
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write('<p style="font-family: sans-serif; text-align: center; margin-top: 100px; color: #666;">Loading daily report PDF summary...</p>');
    }

    try {
      const response = await api.get(`/projects/${selectedProjectId}/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      if (newTab) {
        newTab.location.href = fileURL;
      } else {
        // Fallback: direct download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `report_${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      if (newTab) {
        newTab.close();
      }
      alert('Failed to load report PDF summary.');
      console.error('Error opening report PDF:', err);
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

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={28} color="var(--primary)" />
        <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading project list...</span>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Reports & Insights</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Auditing daily operational logs and AI-driven predictive insights.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {projects.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Project:</span>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '220px', padding: '6px 12px' }}
              >
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No projects available</span>
          )}

          {projects.length > 0 && canModify && (
            <button className="btn btn-primary" onClick={handleCompileReport} disabled={compiling}>
              {compiling ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Compile Daily Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FileText size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects configured</span>
          <span className="empty-state-desc">Create a project workspace first before generating site reports.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="dashboard-main-grid">
          {/* 1. Daily Site Reports */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Daily Site Logs</h2>
            {compiling && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid var(--soft-blue)', backgroundColor: '#F0F9FF', marginBottom: '16px', padding: '14px' }}>
                <Loader2 className="animate-spin" size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Asynchronous report compilation in progress...</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    BullMQ worker is generating PDF summaries and compiling data. Renders automatically on socket event.
                  </div>
                </div>
              </div>
            )}

            {loadingData ? (
              <div className="skeleton" style={{ height: '200px' }}></div>
            ) : reports.length === 0 && !compiling ? (
              <div className="empty-state">
                <FileText size={36} color="var(--text-muted)" />
                <span className="empty-state-title">No compiled logs found</span>
                <span className="empty-state-desc">Trigger 'Compile Daily Report' to synthesize daily logs into operational PDF summaries.</span>
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
                        <button
                          onClick={() => handleViewPdf(report.id || report._id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          <span>View PDF Summary</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CloudRain size={16} color="var(--text-muted)" />
                        <span>Weather: <strong>{report.weather || 'Sunny/Clear'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="var(--text-muted)" />
                        <span>Workforce headcount: <strong>{report.workforceCount || 0} present</strong></span>
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

          {/* 2. AI Weekly Insights */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Brain size={20} color="var(--primary-light)" />
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>AI Forecast Summary</h2>
            </div>

            {loadingData ? (
              <div className="skeleton" style={{ height: '300px' }}></div>
            ) : insights.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No weekly forecast forecasts compiled yet. Generated by system cron jobs.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {insights.map((ins) => (
                  <div key={ins._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--steel-blue)' }}>
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
      )}
    </div>
  );
};

export default Reports;
