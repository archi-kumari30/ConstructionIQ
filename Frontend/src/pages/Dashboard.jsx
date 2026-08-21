import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Folder,
  AlertTriangle,
  FileClock,
  Wrench,
  TrendingUp,
  Activity,
  ShieldAlert,
  Loader2,
  Package,
  Calendar,
  CheckCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { formatINRCompact } from '../utils/format';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Backend dynamic lists
  const [projects, setProjects] = useState([]);
  const [openIncidents, setOpenIncidents] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch projects
        const projectsRes = await api.get('/projects');
        const projectList = projectsRes.data?.data?.projects || [];
        setProjects(projectList);

        let allIncidents = [];
        let allLowStock = [];
        let allBudgets = [];
        let allFeed = [];

        // 2. Fetch metrics for each project in parallel
        await Promise.all(
          projectList.map(async (project) => {
            const pId = project.id || project._id;
            
            // Fetch Incidents
            try {
              const incidentsRes = await api.get(`/projects/${pId}/incidents`);
              const list = incidentsRes.data?.data?.incidents || [];
              const openList = list.filter((i) => i.status === 'open' || i.status === 'investigating');
              allIncidents = [...allIncidents, ...openList];
              
              list.forEach((i) => {
                allFeed.push({
                  id: i.id || i._id,
                  type: 'incident',
                  text: `Incident reported: "${i.title}" (${i.severity} severity)`,
                  time: new Date(i.createdAt),
                  project: project.name
                });
              });
            } catch (e) {
              console.warn(`Error fetching incidents for project ${pId}:`, e.message);
            }

            // Fetch Inventory (for low stock)
            try {
              const inventoryRes = await api.get(`/projects/${pId}/inventory`);
              const list = inventoryRes.data?.data?.inventory || [];
              const lowStockList = list.filter(
                (item) => item.quantityAvailable < item.lowStockThreshold
              );
              allLowStock = [...allLowStock, ...lowStockList.map(i => ({ ...i, projectName: project.name }))];
            } catch (e) {
              console.warn(`Error fetching inventory for project ${pId}:`, e.message);
            }

            // Fetch Budgets
            try {
              const budgetsRes = await api.get(`/projects/${pId}/budgets`);
              const list = budgetsRes.data?.data || [];
              const totalAllocated = list.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
              const totalSpent = list.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
              allBudgets.push({
                id: pId,
                name: project.name,
                allocated: totalAllocated,
                spent: totalSpent
              });
            } catch (e) {
              console.warn(`Error fetching budgets for project ${pId}:`, e.message);
            }

            // Fetch Deliveries
            try {
              const deliveriesRes = await api.get(`/projects/${pId}/deliveries`);
              const list = deliveriesRes.data?.data?.deliveries || [];
              list.forEach((d) => {
                allFeed.push({
                  id: d.id || d._id,
                  type: 'delivery',
                  text: `Delivery status updated to ${d.status}: ${d.quantityOrdered} of ${d.materialId?.name || 'Material'}`,
                  time: new Date(d.updatedAt || d.createdAt),
                  project: project.name
                });
              });
            } catch (e) {
              console.warn(`Error fetching deliveries for project ${pId}:`, e.message);
            }
          })
        );

        // Sort activities by date descending
        allFeed.sort((a, b) => b.time - a.time);

        setOpenIncidents(allIncidents);
        setLowStockAlerts(allLowStock);
        setBudgetData(allBudgets);
        setRecentActivities(allFeed.slice(0, 4)); // top 4 for Dashboard panel
      } catch (err) {
        console.error('Error fetching dashboard aggregated data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreetingName = () => {
    if (user?.name && user.name !== 'Project Manager One') {
      return user.name.split(' ')[0];
    }
    return 'Archi';
  };

  // Static Fallback projects mapped dynamically if DB projects exist, styled matching the premium mockup
  const getProjectRowData = (proj, index) => {
    // Mapping mockup data patterns on top of real projects for consistent UX
    const projectMocks = [
      { name: 'Central Tower', progress: 72, allocated: 17500000, spent: 12500000, status: 'On Track', date: '18 Aug 2026' },
      { name: 'Skyline Residences', progress: 45, allocated: 14000000, spent: 8500000, status: 'At Risk', date: '28 Aug 2026' },
      { name: 'Metro Station', progress: 60, allocated: 18300000, spent: 11000000, status: 'On Track', date: '12 Sep 2026' },
      { name: 'Warehouse Complex', progress: 30, allocated: 21000000, spent: 6300000, status: 'Delayed', date: '30 Sep 2026' }
    ];

    const mock = projectMocks[index % projectMocks.length];
    
    // Calculate spent/allocated from real project if available in budgetData state
    const pId = proj.id || proj._id;
    const realBudget = budgetData.find(b => b.id === pId);
    
    return {
      id: pId,
      name: proj.name || mock.name,
      progress: mock.progress,
      spent: realBudget?.spent && realBudget.spent > 0 ? realBudget.spent : mock.spent,
      allocated: realBudget?.allocated && realBudget.allocated > 0 ? realBudget.allocated : mock.allocated,
      status: mock.status,
      date: mock.date
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', padding: '40px 0' }}>
        <div className="skeleton skeleton-title" style={{ width: '280px', height: '36px', backgroundColor: '#E8E5DF' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '90px', backgroundColor: '#FFFFFF' }}></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '24px', marginTop: '12px' }}>
          <div className="card skeleton" style={{ height: '300px', backgroundColor: '#FFFFFF' }}></div>
          <div className="card skeleton" style={{ height: '300px', backgroundColor: '#FFFFFF' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-slide-up">
      
      {/* 1. Header Greeting Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
            Good Morning, {getGreetingName()}! 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13.5px', margin: '4px 0 0 0', fontWeight: 500 }}>
            Here's what's happening on your projects today.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/projects')}
          className="btn btn-primary" 
          style={{
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            borderRadius: '6px',
            height: '40px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* 2. KPI 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Projects */}
        <div 
          className="card" 
          onClick={() => navigate('/projects')}
          style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 650, color: '#6B7280', letterSpacing: '0.5px' }}>PROJECTS</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)' }}>24</span>
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>On Track</span>
          </div>
          {/* Sparkline line */}
          <svg viewBox="0 0 100 30" style={{ width: '80px', height: '30px', overflow: 'visible' }}>
            <path d="M 0 25 L 20 20 L 40 22 L 60 15 L 80 18 L 100 8" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Card 2: Budget Utilization */}
        <div 
          className="card" 
          onClick={() => navigate('/analytics')}
          style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 650, color: '#6B7280', letterSpacing: '0.5px' }}>BUDGET UTILIZATION</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)' }}>58%</span>
            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>of total budget</span>
          </div>
          {/* Small Donut Chart */}
          <svg width="44" height="44" viewBox="0 0 36 36" style={{ overflow: 'visible' }}>
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8E5DF" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C1440E" strokeWidth="3.8" strokeDasharray="58 42" strokeDashoffset="25" />
          </svg>
        </div>

        {/* Card 3: Total Spend */}
        <div 
          className="card" 
          onClick={() => navigate('/analytics')}
          style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 650, color: '#6B7280', letterSpacing: '0.5px' }}>TOTAL SPEND</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)' }}>₹2.45 Cr</span>
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>+12.5% from last month</span>
          </div>
          {/* Terracotta Sparkline line */}
          <svg viewBox="0 0 100 30" style={{ width: '80px', height: '30px', overflow: 'visible' }}>
            <path d="M 0 25 L 15 23 L 35 15 L 55 18 L 75 10 L 100 5" fill="none" stroke="#C1440E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Card 4: Open Incidents */}
        <div 
          className="card" 
          onClick={() => navigate('/safety')}
          style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 650, color: '#6B7280', letterSpacing: '0.5px' }}>OPEN INCIDENTS</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)' }}>
              {String(openIncidents.length || 2).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '11px', color: '#C1440E', fontWeight: 600 }}>-33% from last month</span>
          </div>
          {/* Small caution indicator */}
          <div style={{ width: '32px', height: '32px', backgroundColor: '#FDF4F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={16} color="#C1440E" />
          </div>
        </div>

      </div>

      {/* 3. Primary Section (Split 6.5fr / 3.5fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '6.5fr 3.5fr', gap: '24px', alignItems: 'start' }} className="responsive-dashboard-split">
        <style>{`
          @media (max-width: 1024px) {
            .responsive-dashboard-split {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Left Side: Project Progress Table */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Project Progress</h3>
            <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', color: '#C1440E', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              View All
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8E5DF' }}>
                  <th style={{ padding: '10px 8px', fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>PROJECT</th>
                  <th style={{ padding: '10px 8px', fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>PROGRESS</th>
                  <th style={{ padding: '10px 8px', fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>BUDGET</th>
                  <th style={{ padding: '10px 8px', fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>STATUS</th>
                  <th style={{ padding: '10px 8px', fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px' }}>DUE DATE</th>
                </tr>
              </thead>
              <tbody>
                {(projects.length > 0 ? projects.slice(0, 4) : [{}, {}, {}, {}]).map((proj, idx) => {
                  const row = getProjectRowData(proj, idx);
                  
                  return (
                    <tr 
                      key={row.id || idx} 
                      onClick={() => navigate(`/projects/${row.id}`)}
                      style={{ borderBottom: '1px solid #FAF7F2', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF7F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1A1A1A', display: 'block' }}>{row.name}</span>
                        <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase' }}>CT-{100 + idx}</span>
                      </td>
                      <td style={{ padding: '12px 8px', width: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1A1A1A' }}>{row.progress}%</span>
                          <div style={{ flex: 1, height: '4px', backgroundColor: '#FAF7F2', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${row.progress}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                        {formatINRCompact(row.spent)} / {formatINRCompact(row.allocated)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          backgroundColor: row.status === 'On Track' ? 'rgba(22, 163, 74, 0.08)' : row.status === 'At Risk' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                          color: row.status === 'On Track' ? '#16A34A' : row.status === 'At Risk' ? '#D97706' : '#DC2626'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>
                        {row.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Recent Activity timeline feed */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Recent Activity</h3>
            <button onClick={() => navigate('/reports')} style={{ background: 'none', border: 'none', color: '#C1440E', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
              View All
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#6B7280', fontSize: '12.5px' }}>
              No operations logged in active databases.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', paddingLeft: '18px', margin: '8px 0' }}>
              {/* Timeline guide line */}
              <div style={{
                position: 'absolute',
                top: '6px',
                bottom: '6px',
                left: '6px',
                width: '1px',
                backgroundColor: '#E8E5DF'
              }}></div>

              {recentActivities.map((act) => (
                <div key={act.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-16px',
                    top: '5px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: act.type === 'incident' ? '#DC2626' : act.type === 'delivery' ? '#C1440E' : '#16A34A'
                  }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#C1440E', fontWeight: 600 }}>
                      {act.type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '10px', color: '#6B7280' }}>
                      {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4 }}>
                    {act.text}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
                    Project: {act.project}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. Lower Dashboard Grid (3 equal columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Column 1: Materials Low Stock alerts */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Materials Low Stock</h3>
            <button onClick={() => navigate(materialsPath)} style={{ background: 'none', border: 'none', color: '#C1440E', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(lowStockAlerts.length > 0 ? lowStockAlerts.slice(0, 3) : [
              { materialId: { name: 'Steel Rods', unit: 'units' }, quantityAvailable: 120, lowStockThreshold: 200 },
              { materialId: { name: 'Cement Bags', unit: 'units' }, quantityAvailable: 85, lowStockThreshold: 150 },
              { materialId: { name: 'Bricks', unit: 'units' }, quantityAvailable: 150, lowStockThreshold: 300 }
            ]).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 2 ? '1px solid #FAF7F2' : 'none', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{item.materialId?.name || 'Material Type'}</span>
                  <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
                    {item.projectName ? `Project: ${item.projectName}` : 'Primary Storage Yard'}
                  </span>
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#DC2626' }}>
                  {item.quantityAvailable} units left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Equipment Utilization Donut Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Equipment Utilization</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E8E5DF" strokeWidth="3" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#C1440E" strokeWidth="3.2" strokeDasharray="68 32" strokeDashoffset="25" />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>68%</span>
                <span style={{ fontSize: '7px', color: '#6B7280', fontWeight: 650 }}>Utilized</span>
              </div>
            </div>

            {/* Legend info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>Active</span>
                <strong style={{ color: '#1A1A1A' }}>08</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>Idle</span>
                <strong style={{ color: '#1A1A1A' }}>03</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: 500 }}>Maintenance</span>
                <strong style={{ color: '#1A1A1A' }}>02</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Deliveries logs */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Upcoming Deliveries</h3>
            <button onClick={() => navigate('/materials/deliveries')} style={{ background: 'none', border: 'none', color: '#C1440E', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { mat: 'Steel Beams', site: 'Site A', date: '19 Aug 2026' },
              { mat: 'Concrete Mix', site: 'Site B', date: '20 Aug 2026' },
              { mat: 'Electrical Items', site: 'Site C', date: '22 Aug 2026' }
            ].map((d, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 2 ? '1px solid #FAF7F2' : 'none', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1A1A1A' }}>{d.mat}</span>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Destination: {d.site}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#C1440E', fontWeight: 600 }}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
