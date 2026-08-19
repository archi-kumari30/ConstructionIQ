import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Folder,
  AlertTriangle,
  FileClock,
  BatteryCharging,
  TrendingUp,
  Activity,
  ShieldAlert,
  Loader2,
  Package,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // KPI states
  const [projects, setProjects] = useState([]);
  const [openIncidents, setOpenIncidents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch projects
        const projectsRes = await api.get('/projects');
        const projectList = projectsRes.data?.data?.projects || [];
        setProjects(projectList);

        let allIncidents = [];
        let allRequests = [];
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

            // Fetch Material Requests
            try {
              const requestsRes = await api.get(`/projects/${pId}/requests`);
              const list = requestsRes.data?.data?.requests || [];
              const pendingList = list.filter((r) => r.status === 'pending');
              allRequests = [...allRequests, ...pendingList];

              list.forEach((r) => {
                allFeed.push({
                  id: r.id || r._id,
                  type: 'request',
                  text: `Material request ${r.status}: ${r.quantityRequested} of ${r.materialId?.name || r.material?.name || 'Material'}`,
                  time: new Date(r.updatedAt || r.createdAt),
                  project: project.name
                });
              });
            } catch (e) {
              console.warn(`Error fetching requests for project ${pId}:`, e.message);
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
        setPendingRequests(allRequests);
        setLowStockAlerts(allLowStock);
        setBudgetData(allBudgets);
        setRecentActivities(allFeed.slice(0, 6)); // top 6
      } catch (err) {
        console.error('Error fetching dashboard aggregated data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const name = user?.name ? user.name.split(' ')[0] : 'Operator';
    return `Welcome back, ${name}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left', padding: '40px 0' }}>
        <div className="skeleton skeleton-title" style={{ width: '280px', height: '36px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '90px' }}></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '4.2fr 5.8fr', gap: '24px', marginTop: '12px' }}>
          <div className="card skeleton" style={{ height: '300px' }}></div>
          <div className="card skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }} className="animate-fade-slide-up">
      
      {/* Title & Eyebrow */}
      <div>
        <div style={{ fontSize: '10px', color: '#A64B2A', letterSpacing: '1.5px', fontWeight: 500, fontFamily: 'var(--font-title)', marginBottom: '6px', textTransform: 'uppercase' }}>
          CONSTRUCTION OPERATIONS
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#5F6870', fontSize: '13px', margin: '4px 0 0 0', fontWeight: 400 }}>
          {getGreeting()}. Real-time telemetry summaries, material flow logs, and equipment activity ledger.
        </p>
      </div>

      {/* 2. LARGE PROJECT OVERVIEW section */}
      {projects.length > 0 && (() => {
        const activeProj = projects[0];
        const totalBudgetAllocated = budgetData.reduce((sum, b) => sum + (b.allocated || 0), 0);
        return (
          <div style={{
            border: '1px solid #C9C5BD',
            backgroundColor: '#FFFFFF',
            padding: '28px 36px',
            position: 'relative'
          }}>
            {/* Technical grid coordinate markers */}
            <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '9px', fontFamily: 'var(--font-title)', color: '#C9C5BD', letterSpacing: '1px' }}>
              REF-N-45.92 // GRID-01
            </div>
            
            <div style={{ fontSize: '10px', color: '#A64B2A', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              PROJECT OVERVIEW
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: '0 0 24px 0' }}>
              {activeProj.name || 'ConstructionIQ Demo Project'}
            </h2>

            {/* Horizontal Structured Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '20px',
              borderTop: '1px solid #C9C5BD',
              paddingTop: '20px'
            }}>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>STATUS</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#A64B2A', fontFamily: 'var(--font-title)' }}>ACTIVE</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>PROJECT PROGRESS</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>72%</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>BUDGET</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>
                  ${totalBudgetAllocated > 0 ? totalBudgetAllocated.toLocaleString() : '840,000'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>MATERIALS</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>108 ITEMS</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>EQUIPMENT</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>56 UNITS</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>OPEN INCIDENTS</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: openIncidents.length > 0 ? '#C62828' : '#1E252B', fontFamily: 'var(--font-title)' }}>
                  {String(openIncidents.length).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Custom Drawing Subtext Detail Line */}
            <div style={{ width: '100%', height: '1px', backgroundColor: '#C9C5BD', marginTop: '24px', opacity: 0.5 }}></div>
          </div>
        );
      })()}

      {/* 3. PRIMARY OPERATIONS AREA (60/40 Asymmetric Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT — approximately 60% */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>PROJECT CONTROL</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 01 // BUDGET & UTILISATION</span>
            </div>

            {/* Budget Utilization bar details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', border: '1px solid #C9C5BD', padding: '20px' }}>
              {budgetData.length === 0 ? (
                <div style={{ padding: '20px 0', color: '#5F6870', fontSize: '12px', textAlign: 'center' }}>
                  No budget allocations recorded.
                </div>
              ) : (
                budgetData.map((project) => {
                  const ratio = project.allocated > 0 ? (project.spent / project.allocated) * 100 : 0;
                  return (
                    <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500 }}>
                        <span style={{ color: '#1E252B' }}>{project.name}</span>
                        <span style={{ color: '#5F6870' }}>
                          ${project.spent.toLocaleString()} / ${project.allocated.toLocaleString()} ({ratio.toFixed(0)}%)
                        </span>
                      </div>
                      {/* Progress Track */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#F4F1EA', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(ratio, 100)}%`,
                          height: '100%',
                          backgroundColor: ratio > 90 ? '#C62828' : '#0A4174',
                          transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Material Flow Node Diagram */}
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>PROCUREMENT LIFECYCLE FLOW</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 02 // LOGISTICS TRACKING</span>
            </div>
            
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #C9C5BD',
              padding: '24px 32px',
              height: '80px'
            }}>
              {/* Thin technical line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '40px',
                right: '40px',
                height: '1px',
                backgroundColor: '#C9C5BD',
                zIndex: 1
              }}></div>

              {[
                { label: 'REQUEST', step: '01', active: true },
                { label: 'APPROVAL', step: '02', active: true },
                { label: 'SUPPLIER', step: '03', active: true },
                { label: 'DELIVERY', step: '04', active: false },
                { label: 'INVENTORY', step: '05', active: false }
              ].map((node, i) => (
                <div key={i} style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  padding: '0 8px'
                }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `1.5px solid ${node.active ? '#A64B2A' : '#C9C5BD'}`,
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: node.active ? '#A64B2A' : '#5F6870',
                    fontFamily: 'var(--font-title)'
                  }}>
                    {node.step}
                  </div>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 500,
                    color: node.active ? '#1E252B' : '#5F6870',
                    marginTop: '4px',
                    letterSpacing: '0.5px'
                  }}>
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Operations Table List */}
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>EQUIPMENT OPERATIONS</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 03 // FLEET LOGS</span>
            </div>

            {/* Quick Fleet Stats Strip */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', fontSize: '11px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>
              <span>ACTIVE MACHINES: <strong style={{ color: '#1E252B' }}>56</strong></span>
              <span>AVAILABLE: <strong style={{ color: '#2E7D32' }}>42</strong></span>
              <span>BOOKED: <strong style={{ color: '#0A4174' }}>11</strong></span>
              <span>MAINTENANCE: <strong style={{ color: '#A64B2A' }}>03</strong></span>
            </div>

            {/* Compact list/table */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C9C5BD', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F4F1EA', borderBottom: '1px solid #C9C5BD' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870', fontSize: '9px', textTransform: 'uppercase' }}>EQUIPMENT</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870', fontSize: '9px', textTransform: 'uppercase' }}>STATUS</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870', fontSize: '9px', textTransform: 'uppercase' }}>LOCATION</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870', fontSize: '9px', textTransform: 'uppercase' }}>BOOKING</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870', fontSize: '9px', textTransform: 'uppercase' }}>UTILISATION</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'CAT 320 Hydraulic Excavator 20T', status: 'AVAILABLE', location: 'Vadodara Site', booking: 'N/A', util: '85%' },
                    { name: 'JCB 3DX Eco Backhoe Loader', status: 'BOOKED', location: 'Ahmedabad Phase 1', booking: 'Active Block A', util: '92%' },
                    { name: 'Tata Hitachi Zaxis 220 Excavator', status: 'AVAILABLE', location: 'Vadodara Site', booking: 'N/A', util: '78%' },
                    { name: 'Zoomlion TC6012 Tower Crane 6T', status: 'BOOKED', location: 'Surat Complex', booking: 'Scheduled Block B', util: '98%' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < 3 ? '1px solid #E9E5DD' : 'none' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1E252B' }}>{row.name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          color: row.status === 'AVAILABLE' ? '#2E7D32' : '#0A4174'
                        }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#5F6870' }}>{row.location}</td>
                      <td style={{ padding: '10px 12px', color: '#5F6870' }}>{row.booking}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>{row.util}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT — approximately 40% */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Live Operations Feed Section */}
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>LIVE OPERATIONS FEED</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 04 // TIMELINE</span>
            </div>

            {recentActivities.length === 0 ? (
              <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #C9C5BD', textAlign: 'center', fontSize: '12px', color: '#5F6870' }}>
                No operations logged in active databases.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                {/* Thin vertical timeline line */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  bottom: '6px',
                  left: '6px',
                  width: '1px',
                  backgroundColor: '#C9C5BD'
                }}></div>

                {recentActivities.map((act) => (
                  <div key={act.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {/* Timeline marker */}
                    <div style={{
                      position: 'absolute',
                      left: '-17px',
                      top: '5px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: act.type === 'incident' ? '#C62828' : act.type === 'request' ? '#A64B2A' : '#1E252B'
                    }}></div>
                    
                    <span style={{ fontSize: '10px', color: '#A64B2A', fontWeight: 500, fontFamily: 'var(--font-title)' }}>
                      {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: '12px', color: '#1E252B', fontWeight: 400, lineHeight: '1.3' }}>
                      {act.text}
                    </span>
                    <span style={{ fontSize: '10px', color: '#5F6870' }}>
                      {act.project}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Open Incidents list (no background cards, neat list) */}
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>OPEN SAFETY INCIDENTS</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 05 // HAZARD CONTROLS</span>
            </div>

            {openIncidents.length === 0 ? (
              <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #C9C5BD', textAlign: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#2E7D32', display: 'block' }}>All Clear</span>
                <span style={{ fontSize: '11px', color: '#5F6870' }}>All logged site hazards resolved.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {openIncidents.map((incident) => (
                  <div key={incident.id || incident._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #E9E5DD',
                    paddingBottom: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#1E252B' }}>{incident.title}</span>
                      <span style={{ fontSize: '11px', color: '#5F6870', display: 'block' }}>{incident.description}</span>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: incident.severity === 'critical' ? '#C62828' : '#A64B2A',
                      border: `1px solid ${incident.severity === 'critical' ? '#C62828' : '#C9C5BD'}`,
                      padding: '2px 6px',
                    }}>
                      {incident.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock inventory alert ledger */}
          <div>
            <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>LOW STOCK INVENTORY LEDGER</span>
              <span style={{ fontSize: '9px', color: '#5F6870', fontFamily: 'var(--font-title)' }}>SECTION 06 // ALERTS</span>
            </div>

            {lowStockAlerts.length === 0 ? (
              <div style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1px solid #C9C5BD', textAlign: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#2E7D32', display: 'block' }}>Limits Healthy</span>
                <span style={{ fontSize: '11px', color: '#5F6870' }}>All materials are stocked above threshold parameters.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockAlerts.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #E9E5DD',
                    paddingBottom: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#1E252B' }}>{item.materialId?.name || 'Material'}</span>
                      <span style={{ fontSize: '11px', color: '#5F6870', display: 'block' }}>Workspace: {item.projectName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#A64B2A' }}>LOW STOCK</span>
                      <span style={{ fontSize: '11px', color: '#5F6870', display: 'block' }}>{item.quantityAvailable} / {item.lowStockThreshold} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
