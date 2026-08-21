import React, { useState } from 'react';
import { Calendar, TrendingUp, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { formatINRCompact } from '../utils/format';

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('This Month');

  // Hardcoded mockup data in line with user request, styled dynamically
  const kpis = [
    { label: 'TOTAL PROJECTS', value: '24', change: '+8% from last month', type: 'projects', isPositive: true },
    { label: 'TOTAL SPEND', value: '₹2.45 Cr', change: '+12.5% from last month', type: 'spend', isPositive: true },
    { label: 'ON-TIME DELIVERY', value: '98%', change: '+5% from last month', type: 'delivery', isPositive: true },
    { label: 'SAFETY SCORE', value: '92%', change: '+3% from last month', type: 'safety', isPositive: true }
  ];

  // SVG Line Chart coordinates and data points for Spend Overview
  // Dates: 14 Aug, 16 Aug, 18 Aug, 20 Aug, 22 Aug, 24 Aug, 26 Aug
  // Points: (14 Aug -> ₹0.40 Cr, 16 Aug -> ₹0.65 Cr, 18 Aug -> ₹0.95 Cr, 20 Aug -> ₹1.25 Cr, 22 Aug -> ₹1.50 Cr, 24 Aug -> ₹1.95 Cr, 26 Aug -> ₹2.45 Cr)
  const linePoints = [
    { date: '14 Aug', value: 4000000, x: 50, y: 180, valStr: '₹40 L' },
    { date: '16 Aug', value: 6500000, x: 150, y: 155, valStr: '₹65 L' },
    { date: '18 Aug', value: 9500000, x: 250, y: 125, valStr: '₹95 L' },
    { date: '20 Aug', value: 12500000, x: 350, y: 95, valStr: '₹1.25 Cr', active: true },
    { date: '22 Aug', value: 15000000, x: 450, y: 70, valStr: '₹1.50 Cr' },
    { date: '24 Aug', value: 19500000, x: 550, y: 40, valStr: '₹1.95 Cr' },
    { date: '26 Aug', value: 24500000, x: 650, y: 15, valStr: '₹2.45 Cr' }
  ];

  const pathD = linePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 650 200 L 50 200 Z`;

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }} className="animate-fade-slide-up">
      {/* Breadcrumb & Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <span>Dashboard</span>
            <span>/</span>
            <span style={{ color: '#C1440E', fontWeight: 500 }}>Analytics</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
            Analytics Overview
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px', padding: '2px' }}>
            {['This Week', 'This Month', 'This Year'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: timeFilter === tab ? 600 : 500,
                  border: 'none',
                  background: timeFilter === tab ? '#FAF7F2' : 'transparent',
                  color: timeFilter === tab ? '#C1440E' : '#6B7280',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '36px' }}>
            <Calendar size={14} />
            <span>Custom Date</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {kpis.map((kpi, idx) => (
          <div className="card" key={idx} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: kpi.type === 'safety' ? '3px solid #C1440E' : '1px solid #E8E5DF' }}>
            <span style={{ fontSize: '10px', fontWeight: 650, color: '#6B7280', letterSpacing: '1px' }}>{kpi.label}</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)' }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', marginTop: '4px', fontWeight: 500 }}>
              <TrendingUp size={12} />
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Split Grid (60/40) */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '24px', alignItems: 'start' }} className="responsive-split-grid">
        
        {/* Spend Overview SVG Line/Area Chart */}
        <div className="card" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Spend Overview</h3>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>Visualisation of project spend accumulation in crores</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C1440E' }}>Cumulative Total: ₹2.45 Cr</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '240px', marginTop: '16px' }}>
            <svg viewBox="0 0 700 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="50" y1="15" x2="650" y2="15" stroke="#E8E5DF" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="50" y1="70" x2="650" y2="70" stroke="#E8E5DF" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="50" y1="125" x2="650" y2="125" stroke="#E8E5DF" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="50" y1="180" x2="650" y2="180" stroke="#E8E5DF" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="50" y1="200" x2="650" y2="200" stroke="#E8E5DF" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="20" fontSize="10" fill="#6B7280" fontFamily="var(--sans)">₹2.5 Cr</text>
              <text x="15" y="75" fontSize="10" fill="#6B7280" fontFamily="var(--sans)">₹1.5 Cr</text>
              <text x="15" y="130" fontSize="10" fill="#6B7280" fontFamily="var(--sans)">₹95 L</text>
              <text x="15" y="185" fontSize="10" fill="#6B7280" fontFamily="var(--sans)">₹40 L</text>

              {/* Area Under Curve */}
              <path d={areaD} fill="url(#spendGradient)" opacity="0.15" />

              {/* Line Curve */}
              <path d={pathD} fill="none" stroke="#C1440E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data Points */}
              {linePoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.active ? 6 : 4}
                    fill={p.active ? '#C1440E' : '#FFFFFF'}
                    stroke="#C1440E"
                    strokeWidth={p.active ? 3 : 2}
                    style={{ cursor: 'pointer' }}
                  />
                  {p.active && (
                    <g>
                      {/* Floating Tooltip Box */}
                      <rect x={p.x - 45} y={p.y - 45} width="90" height="30" rx="4" fill="#1A1A1A" />
                      <text x={p.x} y={p.y - 26} fontSize="11" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="var(--sans)">
                        {p.valStr}
                      </text>
                      <text x={p.x} y={p.y - 14} fontSize="9" fill="#E8E5DF" textAnchor="middle" fontFamily="var(--sans)">
                        {p.date}
                      </text>
                      {/* Anchor Line */}
                      <line x1={p.x} y1={p.y - 15} x2={p.x} y2={p.y} stroke="#1A1A1A" strokeWidth="1" />
                    </g>
                  )}
                  {/* X Axis Labels */}
                  <text x={p.x} y="215" fontSize="10" fill="#6B7280" textAnchor="middle" fontFamily="var(--sans)">
                    {p.date}
                  </text>
                </g>
              ))}

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C1440E" />
                  <stop offset="100%" stopColor="#C1440E" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Project Status Donut Chart */}
        <div className="card" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #E8E5DF', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Project Status Breakdown</h3>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>Status allocation across active operations</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', marginTop: '12px' }}>
            
            {/* SVG Donut Visual */}
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E8E5DF" strokeWidth="3" />
                
                {/* 67% On Track (Muted Green) -> strokeDasharray="67 33" strokeDashoffset="25" */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#16A34A" strokeWidth="3.2" strokeDasharray="67 33" strokeDashoffset="25" />
                
                {/* 21% At Risk (Muted Amber) -> strokeDasharray="21 79" strokeDashoffset="58" */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#D97706" strokeWidth="3.2" strokeDasharray="21 79" strokeDashoffset="58" />
                
                {/* 12% Delayed (Terracotta) -> strokeDasharray="12 88" strokeDashoffset="37" */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#C1440E" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="37" />
              </svg>
              {/* Center Text overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)', lineHeight: 1 }}>24</span>
                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Projects</span>
              </div>
            </div>

            {/* Legend table */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#16A34A', borderRadius: '50%' }}></div>
                  <span style={{ color: '#1A1A1A', fontWeight: 500 }}>On Track</span>
                </div>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>16 (67%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#D97706', borderRadius: '50%' }}></div>
                  <span style={{ color: '#1A1A1A', fontWeight: 500 }}>At Risk</span>
                </div>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>5 (21%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#C1440E', borderRadius: '50%' }}></div>
                  <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Delayed</span>
                </div>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>3 (12%)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
