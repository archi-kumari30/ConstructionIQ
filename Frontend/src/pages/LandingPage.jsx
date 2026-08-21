import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Layers,
  Wrench,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Truck,
  TrendingUp,
  Activity,
  Menu,
  X,
  MapPin,
  ClipboardCheck,
  Award,
  Users2,
  Clock3,
  ChevronDown
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll handler
  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', fontFamily: 'var(--sans)', color: '#1A1A1A' }}>
      
      {/* 1. Header/Navbar */}
      <header style={{
        height: '72px',
        borderBottom: '1px solid #E8E5DF',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px'
      }}>
        {/* Logo block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1A1A1A' }}>
            <div style={{ width: '4px', height: '18px', backgroundColor: '#C1440E' }}></div>
            <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CONSTRUCTIONIQ</span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-nav">
            <a href="#product" onClick={(e) => handleAnchorClick(e, 'product')} style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none', transition: 'color 0.2s' }}>Product</a>
            <a href="#solutions" onClick={(e) => handleAnchorClick(e, 'solutions')} style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>Solutions</a>
            <a href="#features" onClick={(e) => handleAnchorClick(e, 'features')} style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, 'how-it-works')} style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>How It Works</a>
            <a href="#resources" onClick={(e) => handleAnchorClick(e, 'resources')} style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>Resources</a>
          </nav>
        </div>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/login" style={{ fontSize: '13.5px', fontWeight: 500, color: '#6B7280', textDecoration: 'none' }}>Sign In</Link>
          <Link to="/login" className="btn btn-primary" style={{
            height: '42px',
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            padding: '0 20px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none'
          }}>
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
            className="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={22} color="#1A1A1A" /> : <Menu size={22} color="#1A1A1A" />}
          </button>
        </div>
      </header>

      {/* Styles for responsiveness */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .hero-left {
            padding-right: 0 !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-buttons {
            justify-content: center;
          }
          .hero-visual {
            margin-top: 40px !important;
            margin-right: 0 !important;
            justify-content: center;
          }
          .trust-logos {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px !important;
          }
        }
      `}</style>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8E5DF',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          zIndex: 999
        }}>
          <a href="#product" onClick={(e) => { handleAnchorClick(e, 'product'); setMobileMenuOpen(false); }} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1A1A1A' }}>Product</a>
          <a href="#solutions" onClick={(e) => { handleAnchorClick(e, 'solutions'); setMobileMenuOpen(false); }} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1A1A1A' }}>Solutions</a>
          <a href="#features" onClick={(e) => { handleAnchorClick(e, 'features'); setMobileMenuOpen(false); }} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1A1A1A' }}>Features</a>
          <a href="#how-it-works" onClick={(e) => { handleAnchorClick(e, 'how-it-works'); setMobileMenuOpen(false); }} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1A1A1A' }}>How It Works</a>
          <a href="#resources" onClick={(e) => { handleAnchorClick(e, 'resources'); setMobileMenuOpen(false); }} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1A1A1A' }}>Resources</a>

          <div style={{ borderTop: '1px solid #E8E5DF', paddingTop: '14px', display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ flex: 1, height: '40px', justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/login" className="btn btn-primary" style={{ flex: 1, height: '40px', justifyContent: 'center', backgroundColor: '#1A1A1A' }} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 40px 100px 40px',
        borderBottom: '1px solid #E8E5DF'
      }}>
        {/* technical grid line layer */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(193, 68, 14, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(193, 68, 14, 0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 85%)',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '4.8fr 5.2fr', gap: '48px', alignItems: 'center' }}>
            
            {/* Left Column Content */}
            <div className="hero-left" style={{ textAlign: 'left', paddingRight: '20px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 650,
                color: '#C1440E',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                CONSTRUCTION OPERATIONS PLATFORM
              </div>

              <h1 style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(44px, 5.5vw, 68px)',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                marginBottom: '24px',
                color: '#1A1A1A'
              }}>
                Build with clarity.<br />
                Manage with <span style={{ color: '#C1440E' }}>confidence.</span>
              </h1>

              <p style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#6B7280',
                marginBottom: '36px',
                maxWidth: '480px'
              }}>
                ConstructionIQ connects projects, materials, equipment, deliveries and site operations in one connected workspace.
              </p>

              <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/login" className="btn btn-primary" style={{
                  height: '48px',
                  backgroundColor: '#1A1A1A',
                  color: '#FFFFFF',
                  padding: '0 24px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  textDecoration: 'none'
                }}>
                  Get Started →
                </Link>
                <a href="#features" className="btn btn-secondary" style={{
                  height: '48px',
                  backgroundColor: 'transparent',
                  color: '#1A1A1A',
                  borderColor: '#1A1A1A',
                  padding: '0 24px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  textDecoration: 'none'
                }}>
                  Explore Platform
                </a>
              </div>
            </div>

            {/* Right Column: Architectural Drawing + Project Card overlay */}
            <div className="hero-visual" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', height: '420px', minWidth: '320px' }}>
              
              {/* Fine line architectural sketch illustration */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '80%',
                height: '90%',
                opacity: 0.25,
                zIndex: 1,
                pointerEvents: 'none'
              }}>
                <svg viewBox="0 0 400 350" width="100%" height="100%" fill="none" stroke="#C1440E" strokeWidth="0.8">
                  {/* Building skeleton grids */}
                  <line x1="50" y1="320" x2="350" y2="320" strokeWidth="1.5" />
                  <rect x="120" y="80" width="160" height="240" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="160" y1="80" x2="160" y2="320" />
                  <line x1="200" y1="80" x2="200" y2="320" />
                  <line x1="240" y1="80" x2="240" y2="320" />
                  <line x1="120" y1="120" x2="280" y2="120" />
                  <line x1="120" y1="160" x2="280" y2="160" />
                  <line x1="120" y1="200" x2="280" y2="200" />
                  <line x1="120" y1="240" x2="280" y2="240" />
                  <line x1="120" y1="280" x2="280" y2="280" />

                  {/* Crane vector */}
                  <line x1="70" y1="320" x2="70" y2="40" strokeWidth="1.2" />
                  <line x1="70" y1="40" x2="320" y2="40" strokeWidth="1.2" />
                  <line x1="70" y1="40" x2="50" y2="60" />
                  <line x1="70" y1="120" x2="10" y2="40" strokeDasharray="2 2" />
                  
                  {/* Crane diagonal supports */}
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <line key={idx} x1={70 + idx * 25} y1="40" x2={70 + (idx + 1) * 25} y2="55" strokeWidth="0.5" />
                  ))}
                  {/* Pulley block drop lines */}
                  <line x1="260" y1="40" x2="260" y2="150" strokeDasharray="2 1" />
                  <rect x="254" y="150" width="12" height="10" />
                  <path d="M 260 160 L 260 180 L 255 180" />
                </svg>
              </div>

              {/* Floating Hero Project Card CT-024 */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                width: '380px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: '8px',
                padding: '24px',
                alignSelf: 'center',
                boxShadow: '0 12px 30px rgba(193, 68, 14, 0.05)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E5DF', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 650, color: '#6B7280', letterSpacing: '0.5px' }}>PROJECT</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-title)', color: '#1A1A1A' }}>CENTRAL TOWER</h3>
                  </div>
                  <span style={{ fontSize: '10px', color: '#C1440E', border: '1px solid #C1440E', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>CT-024</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: 500 }}>
                  <span>STATUS: <strong style={{ color: '#16A34A' }}>ON TRACK</strong></span>
                  <span>72%</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '5px', backgroundColor: '#FAF7F2', overflow: 'hidden', borderRadius: '9999px', marginBottom: '24px' }}>
                  <div style={{ width: '72%', height: '100%', backgroundColor: '#C1440E' }}></div>
                </div>

                {/* 4 Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', display: 'block' }}>MATERIALS</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', display: 'block', margin: '2px 0' }}>03</span>
                    <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>Low Stock</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', display: 'block' }}>EQUIPMENT</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', display: 'block', margin: '2px 0' }}>08</span>
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>Active</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', display: 'block' }}>DELIVERIES</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', display: 'block', margin: '2px 0' }}>14</span>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>This Week</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 650, letterSpacing: '0.5px', display: 'block' }}>SAFETY</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', display: 'block', margin: '2px 0' }}>02</span>
                    <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 500 }}>Open Incidents</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E8E5DF', paddingTop: '12px', fontSize: '9px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.5px' }}>
                  LAST UPDATED: 08:42 AM · 18 AUG 2026
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Trust Bar */}
      <section style={{ padding: '36px 40px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
            TRUSTED BY CONSTRUCTION LEADERS
          </div>
          <div className="trust-logos" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5, gap: '16px' }}>
            {['BuildRight', 'Skyline', 'UrbanGrid', 'ConstructCo', 'InfraOne'].map((mark, i) => (
              <span key={i} style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-title)', letterSpacing: '0.5px', color: '#1A1A1A' }}>
                ▰ {mark}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" style={{ padding: '80px 40px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C1440E', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            PLATFORM OVERVIEW
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 850, fontFamily: 'var(--font-title)', color: '#1A1A1A', marginBottom: '16px' }}>
            Streamline Infrastructure Workflows.
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 48px auto' }}>
            ConstructionIQ connects projects, materials, equipment, deliveries and site operations in one connected workspace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Project Management</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Establish project metadata, verify location coordinates, assign roles to site engineer and subcontractor rosters, and track progress timelines.</p>
            </div>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Materials & Inventory</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Oversee warehouse stock balances, set automated low-stock warnings, and verify material usage across multiple project locations.</p>
            </div>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Equipment</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Maintain a master catalog of heavy machinery fleet, track usage logs, and manage mechanical maintenance schedules.</p>
            </div>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Deliveries</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Coordinate incoming supplier carriers, expected timelines, delivery verification logs, and item receipt forms.</p>
            </div>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Site Operations</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Coordinate shift logs, attendance registers, and group task lists to keep operating crews aligned with project progress goals.</p>
            </div>
            <div style={{ padding: '24px', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1A1A1A' }}>Safety & Reporting</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Log site hazards with attached evidence photos, track severity ratings, and run background processes to compile Daily Site Reports into PDF.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" style={{ padding: '80px 40px', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C1440E', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            PRODUCT CAPABILITIES
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 850, fontFamily: 'var(--font-title)', color: '#1A1A1A', marginBottom: '48px' }}>
            Everything You Need. <span style={{ color: '#C1440E' }}>All in One Place.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            
            {/* Card 1 */}
            <div id="feat-pm" className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <FolderKanban size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Project Management</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Track progress, milestones and budgets in real-time.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 2 */}
            <div id="feat-materials" className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Materials & Inventory</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Monitor stock levels, orders and deliveries seamlessly.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 3 */}
            <div id="feat-equipment" className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Wrench size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Equipment Tracking</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Manage equipment, bookings and maintenance efficiently.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 4 */}
            <div id="feat-site" className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldAlert size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Site Operations</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Daily logs, safety reports and team coordination in one place.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" style={{ padding: '80px 40px', backgroundColor: '#FAF7F2', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C1440E', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            SOLUTIONS BY ROLE
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 850, fontFamily: 'var(--font-title)', color: '#1A1A1A', marginBottom: '48px' }}>
            Tailored For Infrastructure Teams.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#C1440E', marginBottom: '12px', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>General Contractors</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Manage multiple sub-contractors, track unified billing logs, and compile auditable operations feeds in one workspace.</p>
            </div>
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#C1440E', marginBottom: '12px', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>Project Managers</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Track project milestones, budget utilisation rates in Indian Rupees, active hazards count, and crew tasks lists.</p>
            </div>
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#C1440E', marginBottom: '12px', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>Site Teams</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Log concrete pouring details, request machinery fleet bookings, report safety hazards with photos, and log shift checklists.</p>
            </div>
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#C1440E', marginBottom: '12px', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>Procurement Teams</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Verify supplier catalog lists, monitor warehouse stock limits, receive low-stock alerts, and coordinate carriers.</p>
            </div>
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#C1440E', marginBottom: '12px', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>Operations Teams</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Monitor engine utilization logs, fuel consumption details, daily shift logs, and worker coordination sheets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 40px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C1440E', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            OPERATIONAL WORKFLOW
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 850, fontFamily: 'var(--font-title)', color: '#1A1A1A', marginBottom: '48px' }}>
            How ConstructionIQ Works.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#C1440E', fontFamily: 'var(--font-title)' }}>01</span>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Create & Organize Projects</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Initialize project parameters, map coordinates, configure project team rosters, and allocate budgets.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#C1440E', fontFamily: 'var(--font-title)' }}>02</span>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Connect Materials & Equipment</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Establish master catalogs, record logistics balances, manage delivery timelines, and log machinery usage.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#C1440E', fontFamily: 'var(--font-title)' }}>03</span>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Track Site Operations</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Record daily shift checklists, file hazard reports, verify team tasks, and coordinate supplier deliveries.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#C1440E', fontFamily: 'var(--font-title)' }}>04</span>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Make Better Decisions</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Monitor budget utilization in real-time, compile reports, analyze insights, and prevent site hazard risks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" style={{ padding: '80px 40px', backgroundColor: '#FAF7F2', borderBottom: '1px solid #E8E5DF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C1440E', fontWeight: 650, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            LEARNING RESOURCES
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 850, fontFamily: 'var(--font-title)', color: '#1A1A1A', marginBottom: '48px' }}>
            Industry Playbooks & Guides.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', textAlign: 'left' }}>
            
            {/* Card 1 */}
            <div className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ClipboardCheck size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Construction Operations Guide</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Understand standard procedures for daily logs, safety inspections, and subcontractor coordination on active jobsites.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <FolderKanban size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Project Management Guide</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                A deep dive into budgeting, scheduling milestones, and setting up role-aware user workspaces inside ConstructionIQ.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Materials & Inventory Guide</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                Best practices for tracking supplier catalogs, mitigating low stock alerts, and verifying steel & concrete deliveries.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#FDF4F0', color: '#C1440E', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldAlert size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Site Operations Guide</h3>
              <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                How to record incident safety hazard reports, coordinate site crews, and compile daily logs into PDF audit reports.
              </p>
              <Link to="/login" style={{ fontSize: '12.5px', fontWeight: 600, color: '#C1440E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Learn more</span>
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px 40px 40px', backgroundColor: '#FAF7F2', borderTop: '1px solid #E8E5DF', fontSize: '13.5px', color: '#6B7280' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', textAlign: 'left' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '18px', backgroundColor: '#C1440E' }}></div>
                <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px', color: '#1A1A1A' }}>CONSTRUCTIONIQ</span>
              </div>
              <p style={{ lineHeight: 1.6, color: '#6B7280', margin: 0, maxWidth: '360px' }}>
                Connected construction operations platform enabling teams to manage projects, materials, equipment, site logistics, and daily safety reporting in one workspace.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Platform</span>
                <a href="#product" onClick={(e) => handleAnchorClick(e, 'product')} style={{ color: '#6B7280', textDecoration: 'none' }}>Overview</a>
                <a href="#solutions" onClick={(e) => handleAnchorClick(e, 'solutions')} style={{ color: '#6B7280', textDecoration: 'none' }}>Solutions</a>
                <a href="#features" onClick={(e) => handleAnchorClick(e, 'features')} style={{ color: '#6B7280', textDecoration: 'none' }}>Capabilities</a>
                <a href="#how-it-works" onClick={(e) => handleAnchorClick(e, 'how-it-works')} style={{ color: '#6B7280', textDecoration: 'none' }}>Workflow</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Resources</span>
                <a href="#resources" onClick={(e) => handleAnchorClick(e, 'resources')} style={{ color: '#6B7280', textDecoration: 'none' }}>Guides & Playbooks</a>
                <Link to="/login" style={{ color: '#6B7280', textDecoration: 'none' }}>Sign In</Link>
                <Link to="/login" style={{ color: '#6B7280', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #E8E5DF', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span>&copy; {new Date().getFullYear()} ConstructionIQ. All rights reserved.</span>
            <span style={{ color: '#A0A0A0' }}>Designed for modern infrastructure teams.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
