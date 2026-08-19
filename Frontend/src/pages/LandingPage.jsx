import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  ShieldAlert,
  FileClock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Truck,
  Layers,
  Settings,
  ClipboardList,
  Menu,
  X,
  TrendingUp,
  Activity,
  Briefcase
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('pm');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll state for navbar borders
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roleValue = {
    pm: {
      title: "Project Managers",
      description: "Keep site operations moving within safety and budget limits. Oversee complete team roster lists, review real-time activity feeds, and manage critical milestone tracking from a single workspace.",
      bullets: [
        "Monitor budget utilisation rates with active indicators.",
        "Oversee and assign roles to site engineers, sub-contractors, and suppliers.",
        "Track milestones using a live visual pipeline interface."
      ],
      modules: ["Projects", "Budgets & Expenses", "Milestones Pipeline"]
    },
    site: {
      title: "Site Teams & Engineers",
      description: "Log project status details directly from the construction yard. Easily create material consumption requests, request fleet machinery assets, record worker attendance, and report hazards with camera file uploads.",
      bullets: [
        "Request concrete, steel, and catalog items directly from the field.",
        "Book heavy equipment assets and log operational usage details.",
        "Report safety hazards instantly with attached evidence photos."
      ],
      modules: ["Material Requests", "Equipment Booking", "Safety Hazards"]
    },
    ops: {
      title: "Logistics & Operations",
      description: "Synthesize supply chains, audit inventory levels, and optimize machinery efficiency. Receive alerts when supplies drop below minimum stock limits and track delivery statuses.",
      bullets: [
        "Receive real-time low-stock alerts based on threshold variables.",
        "Track carriers, expected dates, and status options for incoming logistics.",
        "Monitor engine utilization hours and fuel consumption logs."
      ],
      modules: ["Inventory Status", "Deliveries Tracker", "Telemetry Logs"]
    },
    mgmt: {
      title: "Executive Management",
      description: "Access high-level operations summaries and track cross-project risk variables. Audit compiled PDF reports and access weekly AI milestone projections to drive intelligence.",
      bullets: [
        "Trigger Daily Report compilation PDF generation asynchronously via BullMQ.",
        "Review predictive weekly insights compiled by background crons.",
        "Audit unified logs and safety metrics across all active site workspaces."
      ],
      modules: ["Asynchronous Reports", "AI Forecasts", "Operational Audits"]
    }
  };

  return (
    <div style={{ backgroundColor: '#F4F1EA', minHeight: '100vh', fontFamily: 'var(--sans)', color: '#1E252B' }}>
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      
      {/* Editorial Simple Navbar */}
      <header className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`} style={{
        height: '64px',
        borderBottom: '1px solid #C9C5BD',
        backgroundColor: '#F4F1EA',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        transition: 'box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1E252B' }}>
            <div style={{ width: '4px', height: '18px', backgroundColor: '#A64B2A' }}></div>
            <span style={{ fontWeight: 500, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CONSTRUCTIONIQ</span>
          </Link>

          <nav className="navbar-menu" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <a href="#overview" style={{ fontSize: '13.5px', fontWeight: 500, color: '#5F6870', textDecoration: 'none' }}>Product</a>
            <a href="#showcase" style={{ fontSize: '13.5px', fontWeight: 500, color: '#5F6870', textDecoration: 'none' }}>Solutions</a>
            <a href="#workflow" style={{ fontSize: '13.5px', fontWeight: 500, color: '#5F6870', textDecoration: 'none' }}>Features</a>
            <a href="#roles" style={{ fontSize: '13.5px', fontWeight: 500, color: '#5F6870', textDecoration: 'none' }}>How It Works</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/login" style={{ fontSize: '13.5px', fontWeight: 500, color: '#5F6870', textDecoration: 'none' }}>Sign In</Link>
          <Link to="/login" className="btn" style={{
            height: '38px',
            backgroundColor: '#1E252B',
            color: '#FFFFFF',
            padding: '0 16px',
            fontSize: '12.5px',
            fontWeight: 500,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none'
          }}>
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} color="#1E252B" /> : <Menu size={20} color="#1E252B" />}
          </button>
        </div>
      </header>

      {/* Mobile Navbar menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#F4F1EA',
          borderBottom: '1px solid #C9C5BD',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <a href="#overview" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1E252B' }}>Product</a>
          <a href="#showcase" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1E252B' }}>Solutions</a>
          <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1E252B' }}>Features</a>
          <a href="#roles" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: '#1E252B' }}>How It Works</a>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ flex: 1, height: '40px', justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/login" className="btn btn-primary" style={{ flex: 1, height: '40px', justifyContent: 'center', backgroundColor: '#1E252B' }} onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}

      {/* Asymmetrical Off-Center Hero Section */}
      <section style={{
        backgroundColor: '#F4F1EA',
        color: '#1E252B',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 100px 24px',
        borderBottom: '1px solid #C9C5BD'
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(23, 37, 43, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(23, 37, 43, 0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        <div className="landing-container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Asymmetrical 42% / 58% split composition */}
          <div className="landing-hero-split" style={{ gridTemplateColumns: '4.2fr 5.8fr', gap: '48px', alignItems: 'center' }}>
            
            {/* Hero Left Content */}
            <div className="animate-fade-slide-up" style={{ textAlign: 'left', paddingRight: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#A64B2A',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: 'var(--sans)',
                marginBottom: '24px'
              }}>
                CONSTRUCTION OPERATIONS PLATFORM
              </div>

              {/* Bold cover headline with tight line-height */}
              <h1 style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(60px, 7vw, 78px)',
                fontWeight: 500,
                lineHeight: 0.94,
                letterSpacing: '-0.03em',
                marginBottom: '24px',
                color: '#1E252B'
              }}>
                Build with clarity.<br />
                Manage with confidence.
              </h1>

              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#5F6870',
                marginBottom: '36px',
                maxWidth: '440px',
                fontWeight: 400
              }}>
                ConstructionIQ connects projects, materials, equipment, deliveries and site operations in one connected workspace.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/login" className="btn btn-primary" style={{
                  height: '46px',
                  backgroundColor: '#1E252B',
                  color: '#FFFFFF',
                  padding: '0 24px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}>
                  Get Started →
                </Link>
                <a href="#overview" className="btn btn-secondary" style={{
                  height: '46px',
                  backgroundColor: 'transparent',
                  color: '#1E252B',
                  borderColor: '#1E252B',
                  padding: '0 24px',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}>
                  Explore Platform
                </a>
              </div>
            </div>

            {/* Hero Right: Project board mockup overlaying blueprint guidelines */}
            <div className="animate-fade-slide-up seq-1" style={{ position: 'relative', marginTop: '-20px', marginRight: '-20px' }}>
              
              {/* Asymmetrical Blueprint measurements backdrop */}
              <div style={{
                position: 'absolute',
                top: '-40px', left: '-30px', right: '20px', bottom: '20px',
                border: '1px dashed rgba(23, 35, 45, 0.1)',
                pointerEvents: 'none',
                zIndex: 1
              }}>
                <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '9px', color: '#5F6870', opacity: 0.6, fontFamily: 'var(--sans)', fontWeight: 400 }}>A-102 // GRID B4</span>
                <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '9px', color: '#5F6870', opacity: 0.6, fontFamily: 'var(--sans)', fontWeight: 400 }}>SCALE 1:100 // NORTH // REV 04</span>
              </div>

              {/* Prominent project control board */}
              <div style={{
                border: '1px solid #C9C5BD',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                padding: '28px',
                color: '#1E252B',
                fontFamily: 'var(--sans)',
                boxShadow: '0 12px 30px rgba(30, 37, 43, 0.04)',
                textAlign: 'left',
                position: 'relative',
                zIndex: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #D9D9D4', paddingBottom: '14px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', fontWeight: 500 }}>PROJECT</span>
                    <h3 style={{ fontSize: '22px', color: '#1E252B', margin: '2px 0 0 0', fontWeight: 500, fontFamily: 'var(--font-title)' }}>CENTRAL TOWER</h3>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#A64B2A', border: '1px solid #A64B2A', padding: '2px 6px', borderRadius: '4px' }}>CT-024</span>
                </div>

                {/* Progress bar visual */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>
                    <span>STATUS: ON TRACK</span>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px' }}>72%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#F4F1EA', borderRadius: '3px', overflow: 'hidden' }}>
                    <div className="animate-progress" style={{ width: '72%', height: '100%', backgroundColor: '#1E252B' }}></div>
                  </div>
                </div>

                {/* Details layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #D9D9D4', paddingTop: '20px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', display: 'block', fontWeight: 500 }}>MATERIALS</span>
                    <span style={{ fontSize: '20px', fontWeight: 500, color: '#C62828', fontFamily: 'var(--font-title)' }}>03</span>
                    <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', fontWeight: 400 }}>LOW STOCK</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', display: 'block', fontWeight: 500 }}>EQUIPMENT</span>
                    <span style={{ fontSize: '20px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>08</span>
                    <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', fontWeight: 400 }}>ACTIVE</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', display: 'block', fontWeight: 500 }}>DELIVERIES</span>
                    <span style={{ fontSize: '20px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>14</span>
                    <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', fontWeight: 400 }}>THIS WEEK</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#5F6870', textTransform: 'uppercase', display: 'block', fontWeight: 500 }}>SAFETY</span>
                    <span style={{ fontSize: '20px', fontWeight: 500, color: '#C62828', fontFamily: 'var(--font-title)' }}>02</span>
                    <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', fontWeight: 400 }}>OPEN INCIDENTS</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #D9D9D4', paddingTop: '14px', marginTop: '20px', fontSize: '9px', color: '#5F6870', textAlign: 'right', fontWeight: 400 }}>
                  LAST UPDATED: 08:42 AM • 18 Aug 2026
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 01: Control Layer overview */}
      <section id="overview" className="landing-sec-light" style={{ backgroundColor: '#E9E5DD', borderBottom: '1px solid #C9C5BD', padding: '100px 24px' }}>
        <div className="landing-container">
          <div className="landing-hero-split" style={{ gridTemplateColumns: '0.8fr 1.2fr', alignItems: 'start' }}>
            <div style={{ textAlign: 'left' }}>
              <span className="section-label" style={{ color: '#A64B2A', fontFamily: 'var(--sans)', fontWeight: 500, fontSize: '11px', letterSpacing: '1px' }}>FROM DISCONNECTED TO FULLY CONNECTED</span>
              <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontSize: '38px', color: '#1E252B', marginBottom: '16px', marginTop: '8px', fontWeight: 500 }}>Build with absolute control.</h2>
              <p style={{ color: '#5F6870', fontSize: '15px', lineHeight: 1.6, fontWeight: 400 }}>ConstructionIQ consolidates budgets, material workflows, equipment dispatch, and safety hazards into one connected workspace.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="dashboard-main-grid">
              {/* Traditional */}
              <div style={{ border: '1px solid #C9C5BD', padding: '30px', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '15px', color: '#C62828', fontFamily: 'var(--font-title)', fontWeight: 500, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={16} />
                  <span>TRADITIONAL WAY</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#5F6870', fontWeight: 400 }}>
                  <div>• Scattered spreadsheets</div>
                  <div>• Delayed information updates</div>
                  <div>• Limited budget visibility</div>
                  <div>• Communication gap delays</div>
                  <div>• Costly rework runs</div>
                </div>
              </div>

              {/* ConstructionIQ */}
              <div style={{ border: '1px solid #C9C5BD', padding: '30px', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '15px', color: '#0A4174', fontFamily: 'var(--font-title)', fontWeight: 500, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>WITH CONSTRUCTIONIQ</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: '#1E252B', fontWeight: 400 }}>
                  <div>• Real-time project data</div>
                  <div>• Complete pipeline visibility</div>
                  <div>• Connected operations</div>
                  <div>• Clear team communications</div>
                  <div>• Smarter operational decisions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: Material Workflow */}
      <section id="workflow" className="landing-sec-white" style={{ borderBottom: '1px solid #C9C5BD', padding: '100px 24px' }}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <span className="section-label" style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: '11px', letterSpacing: '1px', color: '#A64B2A' }}>SECTION 02 // LOGISTICS</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontSize: '38px', color: '#1E252B', marginBottom: '16px', fontWeight: 500 }}>From request to inventory</h2>
          <p className="section-desc" style={{ fontWeight: 400 }}>Follow material request workflows from the field to inventory replenishment updates.</p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            padding: '20px 0'
          }}>
            {/* Connecting rust-colored line */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '10%', right: '10%',
              height: '1px', backgroundColor: '#A64B2A',
              zIndex: 1
            }}></div>

            <div style={{ border: '1px solid #C9C5BD', padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', minWidth: '130px', position: 'relative', zIndex: 10 }}>
              <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', marginBottom: '4px', fontWeight: 500 }}>01 / STAGE</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>Material Request</span>
            </div>
            <div style={{ border: '1px solid #C9C5BD', padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', minWidth: '130px', position: 'relative', zIndex: 10 }}>
              <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', marginBottom: '4px', fontWeight: 500 }}>02 / STAGE</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>Approval Loop</span>
            </div>
            <div style={{ border: '1px solid #C9C5BD', padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', minWidth: '130px', position: 'relative', zIndex: 10 }}>
              <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', marginBottom: '4px', fontWeight: 500 }}>03 / STAGE</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>Supplier Sync</span>
            </div>
            <div style={{ border: '1px solid #C9C5BD', padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', minWidth: '130px', position: 'relative', zIndex: 10 }}>
              <span style={{ fontSize: '10px', color: '#5F6870', display: 'block', marginBottom: '4px', fontWeight: 500 }}>04 / STAGE</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>Carrier Delivery</span>
            </div>
            <div style={{ border: '1px solid #C9C5BD', padding: '16px', borderRadius: '8px', backgroundColor: '#ECEBE6', minWidth: '130px', position: 'relative', zIndex: 10 }}>
              <span style={{ fontSize: '10px', color: '#A64B2A', display: 'block', marginBottom: '4px', fontWeight: 500 }}>05 / STAGE</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#A64B2A', fontFamily: 'var(--font-title)' }}>Stock Balance</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: Product Showcase */}
      <section id="showcase" className="landing-sec-dark" style={{ borderBottom: '1px solid #1E252B', backgroundColor: '#1E252B', color: '#FFFFFF', padding: '100px 24px' }}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <span className="section-label" style={{ fontFamily: 'var(--sans)', color: '#A64B2A', fontWeight: 500, fontSize: '11px', letterSpacing: '1px' }}>SECTION 03 // INTERFACE</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', color: '#FFFFFF', fontSize: '38px', marginBottom: '16px', fontWeight: 500 }}>Everything under control.</h2>
          <p className="section-desc" style={{ color: '#BDD8E9', fontWeight: 400 }}>One connected workspace for construction operations.</p>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #C9C5BD',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            textAlign: 'left',
            color: '#1E252B',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Showcased Mock Dashboard header */}
            <div style={{
              backgroundColor: '#1E252B',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <span style={{ fontWeight: 500, color: '#FFFFFF', fontSize: '14px', fontFamily: 'var(--font-title)' }}>ConstructionIQ Workspace</span>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#BDD8E9', fontFamily: 'var(--font-title)', fontWeight: 500 }} className="navbar-menu">
                  <span>Dashboard</span>
                  <span>Projects</span>
                  <span>Materials</span>
                  <span>Suppliers</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#BDD8E9', fontWeight: 500 }}>Connected</span>
            </div>

            {/* Showcased Mock Dashboard body */}
            <div style={{ padding: '30px', backgroundColor: '#F4F1EA', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1E252B', margin: 0, fontFamily: 'var(--font-title)' }}>Skyline Tower — Operations Summary</h3>
                  <p style={{ fontSize: '12px', color: '#5F6870', margin: '3px 0 0 0', fontWeight: 400 }}>Real-time telemetry tracking and warehousing status alert monitors.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase', fontWeight: 500 }}>Active phase</span>
                  <span className="badge badge-success" style={{ textTransform: 'uppercase', backgroundColor: '#E2F0D9', color: '#2E7D32', fontWeight: 500 }}>On Track</span>
                </div>
              </div>

              {/* Progress bars & activities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }} className="dashboard-main-grid">
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #C9C5BD', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-title)' }}>
                    <TrendingUp size={16} color="#A64B2A" />
                    <span>Project Budget Utilisation</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                        <span>Skyline Tower — Phase 2 Block B</span>
                        <span>80% Spent</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#ECEBE6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '80%', height: '100%', backgroundColor: '#1E252B' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #C9C5BD', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-title)' }}>
                    <Activity size={16} color="#A64B2A" />
                    <span>Live Operations Stream</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#5F6870', fontWeight: 400 }}>
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #ECEBE6', paddingBottom: '6px' }}>
                      <span style={{ color: '#2E7D32' }}>✓</span>
                      <span>Cement OPC (500 bags) marked <strong>Delivered</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#EF6C00' }}>⚠</span>
                      <span>Incident log created: <strong>Crane engine warning</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03.5: B2B Search Catalog Preview */}
      <section id="catalog-preview" className="landing-sec-white" style={{ borderBottom: '1px solid #C9C5BD', padding: '100px 24px', backgroundColor: '#FFFFFF' }}>
        <div className="landing-container" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <span className="section-label" style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: '11px', color: '#A64B2A', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CONNECTED SUPPLY CATALOG & PROCUREMENT</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontSize: '38px', color: '#1E252B', marginTop: '12px', marginBottom: '16px', fontWeight: 500 }}>
            Unified construction search & operations
          </h2>
          <p className="section-desc" style={{ fontWeight: 400, color: '#5F6870', maxWidth: '600px', margin: '0 auto 40px auto', fontSize: '14px', lineHeight: 1.6 }}>
            ConstructionIQ functions as both a project site operations monitor and an industrial procurement hub.
          </p>

          {/* Visual Procurement Flow chart */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '760px',
            margin: '0 auto 40px auto',
            position: 'relative',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            color: '#5F6870',
            letterSpacing: '0.5px'
          }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '9px', left: '40px', right: '40px', height: '1px', backgroundColor: '#C9C5BD', zIndex: 1 }}></div>

            {[
              { label: 'SEARCH MATERIAL OR EQUIPMENT', step: '01' },
              { label: 'MATCH RESULTS', step: '02' },
              { label: 'COMPARE SUPPLIERS', step: '03' },
              { label: 'CHECK PRICE / AVAILABILITY', step: '04' },
              { label: 'REQUEST OR BOOK', step: '05' }
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, backgroundColor: '#FFFFFF', padding: '0 8px', width: '130px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1.5px solid #A64B2A',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#A64B2A',
                  marginBottom: '6px'
                }}>{node.step}</div>
                <div style={{ textAlign: 'center', fontWeight: 500, color: '#1E252B', fontSize: '9px', lineHeight: 1.2 }}>{node.label}</div>
              </div>
            ))}
          </div>

          {/* Search Simulation Container */}
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            border: '1px solid #C9C5BD',
            borderRadius: '6px',
            backgroundColor: '#F4F1EA',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'left'
          }}>
            {/* Mock Search Bar Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #C9C5BD',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#5F6870', fontSize: '14px' }}>🔍</span>
                <input
                  type="text"
                  readOnly
                  value="20T Excavator"
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '13px',
                    border: '1px solid #C9C5BD',
                    borderRadius: '6px',
                    backgroundColor: '#F4F1EA',
                    color: '#1E252B',
                    outline: 'none',
                    fontFamily: 'var(--sans)'
                  }}
                />
              </div>
              <Link to="/login" className="btn btn-primary" style={{ height: '34px', fontSize: '12px', padding: '0 16px', backgroundColor: '#1E252B', color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', borderRadius: '6px', fontWeight: 500 }}>
                Search
              </Link>
            </div>

            {/* Mock Search Results list */}
            <div style={{ padding: '8px 0', backgroundColor: '#FFFFFF' }}>
              
              {/* Row 1 */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #ECEBE6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>20T Hydraulic Excavator (CAT 320D)</span>
                    <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Available</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#5F6870', display: 'block', marginTop: '4px' }}>Rental Supplier: National Equipment Rentals • Region: Vadodara</span>
                </div>
                <Link to="/login" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#A64B2A',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Request Booking</span>
                  <span>➔</span>
                </Link>
              </div>

              {/* Row 2 */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #ECEBE6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>OPC 53 Cement Bags</span>
                    <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>In Stock</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#5F6870', display: 'block', marginTop: '4px' }}>Supplier: Apex Building Supplies • Region: Vadodara</span>
                </div>
                <Link to="/login" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#A64B2A',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Add to Request</span>
                  <span>➔</span>
                </Link>
              </div>

              {/* Row 3 */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #ECEBE6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>TMT Structural Steel Bars</span>
                    <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Available</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#5F6870', display: 'block', marginTop: '4px' }}>Supplier: Gujarat Steel Corp • Region: Ahmedabad</span>
                </div>
                <Link to="/login" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#A64B2A',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Compare Suppliers</span>
                  <span>➔</span>
                </Link>
              </div>

              {/* Row 4 */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #ECEBE6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>Putmeister M36 Concrete Boom Pump</span>
                    <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Available</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#5F6870', display: 'block', marginTop: '4px' }}>Supplier: Ahmedabad ReadyMix • Region: Ahmedabad</span>
                </div>
                <Link to="/login" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#A64B2A',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Request Booking</span>
                  <span>➔</span>
                </Link>
              </div>

              {/* Row 5 */}
              <div style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>Safety Equipment PPE Kit Class I</span>
                    <span style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>In Stock</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#5F6870', display: 'block', marginTop: '4px' }}>Supplier: SafeWork India • Region: Surat</span>
                </div>
                <Link to="/login" style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#A64B2A',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Add to Request</span>
                  <span>➔</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: Construction Team Roles */}
      <section id="roles" className="landing-sec-light" style={{ borderBottom: '1px solid #C9C5BD', padding: '100px 24px', backgroundColor: '#F4F1EA' }}>
        <div className="landing-container" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <span className="section-label" style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: '11px', color: '#A64B2A' }}>SECTION 04 // ROLES</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontSize: '38px', color: '#1E252B', marginBottom: '16px', fontWeight: 500 }}>Built for the people who keep projects moving</h2>
          <p className="section-desc" style={{ fontWeight: 400 }}>Select your profile category to see how ConstructionIQ connects your daily operations workflow.</p>

          {/* Slider track tab bar styling */}
          <div style={{ 
            display: 'inline-flex', 
            gap: '24px', 
            borderBottom: '2px solid #C9C5BD',
            paddingBottom: '8px',
            marginBottom: '32px',
            width: '100%',
            justifyContent: 'center'
          }}>
            {Object.keys(roleValue).map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setActiveRole(roleKey)}
                style={{
                  padding: '8px 4px',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  color: activeRole === roleKey ? '#A64B2A' : '#5F6870',
                  border: 'none',
                  borderBottom: activeRole === roleKey ? '2px solid #A64B2A' : '2px solid transparent',
                  marginBottom: '-10px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-title)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              >
                {roleValue[roleKey].title}
              </button>
            ))}
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #C9C5BD',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)' }}>{roleValue[activeRole].title}</h3>
            <p style={{ fontSize: '14.5px', color: '#5F6870', lineHeight: 1.6, fontWeight: 400 }}>{roleValue[activeRole].description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '8px' }}>
              {roleValue[activeRole].bullets.map((bullet, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13.5px', color: '#1E252B', fontWeight: 400 }}>
                  <CheckCircle size={18} color="#A64B2A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #C9C5BD', paddingTop: '20px', marginTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#5F6870', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Assigned Modules:</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {roleValue[activeRole].modules.map((mod, idx) => (
                  <span key={idx} className="badge badge-info" style={{ fontSize: '11px', padding: '5px 10px', textTransform: 'none', backgroundColor: '#ECEBE6', color: '#1E252B', border: '1px solid #C9C5BD', fontWeight: 500 }}>{mod}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        backgroundColor: '#A64B2A',
        color: '#FFFFFF',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="landing-container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 500, color: '#FFFFFF', marginBottom: '16px', fontFamily: 'var(--font-title)' }}>
            Build better. Operate smarter.
          </h2>
          <p style={{ fontSize: '16px', color: '#BDD8E9', marginBottom: '40px', lineHeight: 1.6, fontWeight: 400 }}>
            Bring projects, materials, equipment and site operations together with ConstructionIQ.
          </p>
          <div>
            <Link to="/login" className="btn btn-primary" style={{
              backgroundColor: '#F4F1EA',
              color: '#1E252B',
              padding: '14px 36px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}>
              <span>GET STARTED →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dark Footer */}
      <footer style={{
        backgroundColor: '#1E252B',
        color: '#FFFFFF',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '80px 40px 40px 40px'
      }}>
        <div className="landing-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            textAlign: 'left',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            paddingBottom: '48px',
            marginBottom: '32px'
          }} className="dashboard-main-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 500, fontSize: '18px', color: '#A64B2A', fontFamily: 'var(--font-title)' }}>CONSTRUCTIONIQ</span>
              </div>
              <p style={{ fontSize: '13px', color: '#BDD8E9', lineHeight: 1.6, maxWidth: '240px', opacity: 0.8, fontWeight: 400 }}>
                High-performance operational auditing and resource tracking software for commercial construction builders.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '20px', color: '#BDD8E9', letterSpacing: '1px', fontFamily: 'var(--font-title)' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                <span>Solutions</span>
                <span>Features overview</span>
                <span>Safety auditing</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '20px', color: '#BDD8E9', letterSpacing: '1px', fontFamily: 'var(--font-title)' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                <span>Documentation</span>
                <span>API integrations</span>
                <span>Platform Support</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '20px', color: '#BDD8E9', letterSpacing: '1px', fontFamily: 'var(--font-title)' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                <span>About us</span>
                <span>Privacy guidelines</span>
                <span>Terms of service</span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            flexWrap: 'wrap',
            gap: '16px',
            fontWeight: 400
          }}>
            <span>© 2026 ConstructionIQ Technologies Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
