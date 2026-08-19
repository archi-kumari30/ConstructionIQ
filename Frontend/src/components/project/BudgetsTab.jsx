import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Landmark, PiggyBank, DollarSign, Calendar, FileText, AlertTriangle } from 'lucide-react';

const BudgetsTab = ({ projectId, isAdmin, isProjectManager }) => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modals
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Budget allocation fields
  const [allocCategory, setAllocCategory] = useState('materials');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocError, setAllocError] = useState('');
  const [allocSubmitting, setAllocSubmitting] = useState(false);

  // Expense fields
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('materials');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expError, setExpError] = useState('');
  const [expSubmitting, setExpSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, expensesRes] = await Promise.all([
        api.get(`/projects/${projectId}/budgets`),
        api.get(`/projects/${projectId}/expenses`)
      ]);
      setBudgets(budgetsRes.data?.data || []);
      setExpenses(expensesRes.data?.data?.expenses || []);
    } catch (err) {
      console.error('Error loading budget logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleAllocateBudget = async (e) => {
    e.preventDefault();
    setAllocError('');

    if (!allocAmount || parseFloat(allocAmount) <= 0) {
      setAllocError('Please specify a positive budget amount.');
      return;
    }

    try {
      setAllocSubmitting(true);
      await api.post(`/projects/${projectId}/budgets`, {
        category: allocCategory,
        allocatedAmount: parseFloat(allocAmount)
      });
      setBudgetModalOpen(false);
      setAllocAmount('');
      fetchData();
    } catch (err) {
      setAllocError(err.response?.data?.message || 'Failed to allocate budget.');
    } finally {
      setAllocSubmitting(false);
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    setExpError('');

    if (!expAmount || parseFloat(expAmount) <= 0 || !expDate || !expDesc) {
      setExpError('Please fill in all required fields.');
      return;
    }

    try {
      setExpSubmitting(true);
      await api.post(`/projects/${projectId}/expenses`, {
        amount: parseFloat(expAmount),
        category: expCategory,
        description: expDesc,
        date: new Date(expDate)
      });
      setExpenseModalOpen(false);
      setExpAmount('');
      setExpDesc('');
      setExpDate('');
      fetchData();
    } catch (err) {
      setExpError(err.response?.data?.message || 'Failed to log expense (checks limits or AI audits).');
    } finally {
      setExpSubmitting(false);
    }
  };

  const formatOnlyDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCategory = (cat) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const canModify = isAdmin || isProjectManager;

  const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Overview Cards */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <span className="kpi-title">Total Allocated Budget</span>
          <span className="kpi-value">${totalAllocated.toLocaleString()}</span>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <span className="kpi-title">Total Expenses Logged</span>
          <span className="kpi-value" style={{ color: totalSpent > totalAllocated ? 'var(--error)' : 'var(--text-primary)' }}>
            ${totalSpent.toLocaleString()}
          </span>
        </div>
        <div className="kpi-card" style={{ padding: '16px' }}>
          <span className="kpi-title">Remaining Margin</span>
          <span className="kpi-value" style={{ color: totalAllocated - totalSpent < 0 ? 'var(--error)' : 'var(--success)' }}>
            ${(totalAllocated - totalSpent).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Category Budget Allocation */}
        <div className="card">
          <div className="page-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3>Category Allocations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Limit spending triggers on project segments.</p>
            </div>
            {canModify && (
              <button className="btn btn-secondary" onClick={() => setBudgetModalOpen(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Plus size={12} />
                <span>Allocate</span>
              </button>
            )}
          </div>

          {budgets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No categories allocated yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {budgets.map((b) => {
                const ratio = b.allocatedAmount > 0 ? (b.spentAmount / b.allocatedAmount) * 100 : 0;
                return (
                  <div key={b._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                      <span>{formatCategory(b.category)}</span>
                      <span>
                        ${b.spentAmount.toLocaleString()} / ${b.allocatedAmount.toLocaleString()} ({ratio.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(ratio, 100)}%`,
                        height: '100%',
                        backgroundColor: ratio > 90 ? 'var(--error)' : ratio > 75 ? 'var(--warning)' : 'var(--success)',
                        borderRadius: '5px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses Listing */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="page-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3>Expense Journals</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Site expenditure statements logged.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setExpenseModalOpen(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Plus size={12} />
              <span>Log Expense</span>
            </button>
          </div>

          {expenses.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No expense journals logged for this project.
            </div>
          ) : (
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expenses.map((exp) => (
                <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{exp.description}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{formatCategory(exp.category)}</span>
                      <span>•</span>
                      <span>{formatOnlyDate(exp.date)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {exp.isAuditFlagged && (
                      <span className="badge badge-danger" title="AI Anomaly Audit Flagged" style={{ padding: '2px 4px' }}>
                        <AlertTriangle size={12} />
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      ${exp.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Allocate Budget Modal */}
      {budgetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Allocate Segment Budget</h2>
              <button onClick={() => setBudgetModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAllocateBudget}>
              <div className="modal-body">
                {allocError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {allocError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Budget Category</label>
                  <select
                    className="form-select"
                    value={allocCategory}
                    onChange={(e) => setAllocCategory(e.target.value)}
                  >
                    <option value="materials">Materials</option>
                    <option value="equipment">Equipment</option>
                    <option value="labor">Labor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Allocation Limit Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={allocAmount}
                    onChange={(e) => setAllocAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setBudgetModalOpen(false)} disabled={allocSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={allocSubmitting}>
                  {allocSubmitting ? 'Allocating...' : 'Allocate Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {expenseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Log Site Expense</h2>
              <button onClick={() => setExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleLogExpense}>
              <div className="modal-body">
                {expError && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '6px', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                    {expError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Expense Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Category</label>
                  <select
                    className="form-select"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                  >
                    <option value="materials">Materials</option>
                    <option value="equipment">Equipment</option>
                    <option value="labor">Labor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Journal Narrative</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Purchased 50 extra bags of OPC 53 cement"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setExpenseModalOpen(false)} disabled={expSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={expSubmitting}>
                  {expSubmitting ? 'Logging...' : 'Submit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsTab;
