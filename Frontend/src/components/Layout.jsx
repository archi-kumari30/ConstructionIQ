import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  Truck,
  Users,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  ClipboardList,
  Search
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin, isSupplier } = useAuth();
  const { toasts, removeToast } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentProjectName, setCurrentProjectName] = useState('All Projects');
  
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Monitor scroll for height shrink (72px -> 60px)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch projects list on mount to match active project name
  const fetchProjectsList = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data?.data?.projects || []);
    } catch (err) {
      console.error('Navbar projects fetch failed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjectsList();
    }
  }, [user]);

  // Synchronize project name selector
  const syncProjectName = () => {
    // 1. Check path parameter id /projects/:id
    const match = location.pathname.match(/^\/projects\/([a-f\d\-]+)/i);
    const pathProjectId = match ? match[1] : null;

    // 2. Check localStorage key updated by pages dropdown selections
    const savedProjectId = localStorage.getItem('activeProjectId');

    const targetId = pathProjectId || savedProjectId;
    if (targetId && projects.length > 0) {
      const proj = projects.find(p => p._id === targetId || p.id === targetId);
      if (proj) {
        setCurrentProjectName(proj.name);
        return;
      }
    }
    
    setCurrentProjectName('All Projects');
  };

  useEffect(() => {
    syncProjectName();
  }, [location.pathname, projects]);

  useEffect(() => {
    const handleStorageChange = () => {
      syncProjectName();
    };
    window.addEventListener('projectContextChanged', handleStorageChange);
    return () => {
      window.removeEventListener('projectContextChanged', handleStorageChange);
    };
  }, [projects]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('activeProjectId');
    logout();
    navigate('/login');
  };

  const formatRole = (role) => {
    if (!role) return '';
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="layout-container">
      {/* Horizontal Sticky Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          {/* Logo with horizontal vertical oxide indicator line */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="navbar-logo-indicator"></div>
              <span className="navbar-logo-text" style={{ fontFamily: 'var(--sans)', fontWeight: 500 }}>CONSTRUCTIONIQ</span>
            </Link>
          </div>

          {/* Subtly Grouped Sections */}
          <nav className="navbar-menu">
            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>Projects</span>
            </NavLink>
            
            {!isSupplier && (
              <div className="navbar-dropdown" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <button className={`navbar-link ${location.pathname.startsWith('/materials') ? 'active' : ''} navbar-dropdown-trigger`}>
                  <span>Materials</span>
                  <ChevronDown size={12} />
                </button>
                <div className="navbar-dropdown-content" style={{ marginTop: '0px' }}>
                  <div style={{ padding: '6px 16px 2px 16px', fontSize: '9px', fontWeight: 500, color: '#A64B2A', letterSpacing: '0.5px' }}>MATERIALS</div>
                  <NavLink to="/materials/requests" className="navbar-dropdown-item">Material Requests</NavLink>
                  <NavLink to="/materials/inventory" className="navbar-dropdown-item">Inventory Status</NavLink>
                  <NavLink to="/materials/deliveries" className="navbar-dropdown-item">Deliveries Log</NavLink>
                  {isAdmin && (
                    <NavLink to="/materials" className="navbar-dropdown-item" style={{ borderTop: '1px solid #C9C5BD', marginTop: '4px', paddingTop: '8px' }}>
                      Master Catalog
                    </NavLink>
                  )}
                </div>
              </div>
            )}

            {!isSupplier && (
              <div className="navbar-dropdown" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <button className={`navbar-link ${location.pathname.startsWith('/equipment') ? 'active' : ''} navbar-dropdown-trigger`}>
                  <span>Equipment</span>
                  <ChevronDown size={12} />
                </button>
                <div className="navbar-dropdown-content" style={{ marginTop: '0px' }}>
                  <div style={{ padding: '6px 16px 2px 16px', fontSize: '9px', fontWeight: 500, color: '#A64B2A', letterSpacing: '0.5px' }}>EQUIPMENT</div>
                  <NavLink to="/equipment/bookings" className="navbar-dropdown-item">Fleet Bookings</NavLink>
                  {isAdmin && (
                    <NavLink to="/equipment" className="navbar-dropdown-item" style={{ borderTop: '1px solid #C9C5BD', marginTop: '4px', paddingTop: '8px' }}>
                      Master Fleet Catalog
                    </NavLink>
                  )}
                </div>
              </div>
            )}

            {!isSupplier && (
              <div className="navbar-dropdown" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <button className={`navbar-link ${location.pathname.startsWith('/suppliers') || location.pathname.startsWith('/incidents') || location.pathname.startsWith('/reports') ? 'active' : ''} navbar-dropdown-trigger`}>
                  <span>More</span>
                  <ChevronDown size={12} />
                </button>
                <div className="navbar-dropdown-content" style={{ marginTop: '0px' }}>
                  <div style={{ padding: '6px 16px 2px 16px', fontSize: '9px', fontWeight: 500, color: '#A64B2A', letterSpacing: '0.5px' }}>RESOURCES & CONTROL</div>
                  <NavLink to="/suppliers" className="navbar-dropdown-item">Suppliers</NavLink>
                  <NavLink to="/incidents" className="navbar-dropdown-item">Incidents</NavLink>
                  <NavLink to="/reports" className="navbar-dropdown-item">Reports</NavLink>
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="navbar-right">
          
          {/* Compact Global Search Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const val = e.target.elements.globalsearch.value;
              if (val.trim()) {
                navigate(`/search?q=${encodeURIComponent(val)}`);
                e.target.reset();
              }
            }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '16px' }}
          >
            <Search size={14} color="#5F6870" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            <input
              type="text"
              name="globalsearch"
              placeholder="Search materials, equipment, suppliers..."
              style={{
                height: '32px',
                width: '240px',
                padding: '0 12px 0 28px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #C9C5BD',
                backgroundColor: '#FFFFFF',
                color: '#1E252B',
                fontFamily: 'var(--sans)',
                outline: 'none',
                transition: 'width 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              onFocus={(e) => e.target.style.width = '300px'}
              onBlur={(e) => e.target.style.width = '240px'}
            />
          </form>

          {/* Real Selected Project Context Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderLeft: '1px solid #C9C5BD', paddingLeft: '16px', marginRight: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 500, color: '#5F6870', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CURRENT PROJECT</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--sans)' }}>{currentProjectName}</span>
          </div>

          {/* Notification Bell Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1E252B',
                position: 'relative',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
              className="navbar-dropdown-trigger-btn"
            >
              <Bell size={20} />
              {toasts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#A64B2A',
                  borderRadius: '50%'
                }}></span>
              )}
            </button>

            {notifOpen && (
              <div className="card" style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '320px',
                padding: '16px',
                zIndex: 1200,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid #C9C5BD',
                borderRadius: '10px',
                backgroundColor: '#F7F4EE'
              }}>
                <div style={{
                  fontWeight: 500,
                  fontSize: '13px',
                  borderBottom: '1px solid #C9C5BD',
                  paddingBottom: '10px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Operations Alerts ({toasts.length})</span>
                  {toasts.length > 0 && (
                    <button
                      onClick={() => toasts.forEach(t => removeToast(t.id))}
                      style={{ background: 'none', border: 'none', color: '#A64B2A', fontSize: '11px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {toasts.length === 0 ? (
                  <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                    No unread notifications in this session.
                  </div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {toasts.map((toast) => (
                      <div
                        key={toast.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          padding: '8px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '6px',
                          border: '1px solid #C9C5BD',
                          borderLeft: '4px solid ' + (toast.type === 'danger' || toast.type === 'error' ? '#C62828' : toast.type === 'warning' ? '#EF6C00' : '#0A4174'),
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{toast.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{toast.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown Menu */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button className="navbar-user-btn" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
              <div className="navbar-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="navbar-user-info">
                <div className="navbar-user-name">{user?.name}</div>
                <div className="navbar-user-role">{formatRole(user?.role)}</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {userDropdownOpen && (
              <div className="card" style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '180px',
                padding: '6px 0',
                zIndex: 1200,
                boxShadow: '0 4px 12px rgba(30, 37, 43, 0.05)',
                border: '1px solid #C9C5BD',
                borderRadius: '8px',
                backgroundColor: '#F7F4EE'
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #C9C5BD', marginBottom: '4px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signed in as</div>
                  <div style={{ fontWeight: 500, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    color: '#A64B2A',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="navbar-dropdown-item"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Navigation */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/projects" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
          <FolderKanban size={16} />
          <span>Projects</span>
        </NavLink>

        {!isSupplier && (
          <>
            <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Materials</div>
            <div className="mobile-nav-submenu">
              <NavLink to="/materials/requests" className="navbar-link">Requests</NavLink>
              <NavLink to="/materials/inventory" className="navbar-link">Inventory</NavLink>
              <NavLink to="/materials/deliveries" className="navbar-link">Deliveries</NavLink>
              {isAdmin && <NavLink to="/materials" className="navbar-link">Master Catalog</NavLink>}
            </div>
          </>
        )}

        {!isSupplier && (
          <>
            <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Equipment</div>
            <div className="mobile-nav-submenu">
              <NavLink to="/equipment/bookings" className="navbar-link">Bookings</NavLink>
              {isAdmin && <NavLink to="/equipment" className="navbar-link">Master Fleet</NavLink>}
            </div>
          </>
        )}

        {!isSupplier && (
          <NavLink to="/suppliers" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Users size={16} />
            <span>Suppliers</span>
          </NavLink>
        )}

        {!isSupplier && (
          <NavLink to="/incidents" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={16} />
            <span>Incidents</span>
          </NavLink>
        )}

        {!isSupplier && (
          <NavLink to="/reports" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={16} />
            <span>Reports</span>
          </NavLink>
        )}
      </div>

      {/* Main Container */}
      <main className="main-content">
        <div className="page-body">
          <Outlet />
        </div>
      </main>

      {/* Mini layout dropdown stylesheet hover overrides */}
      <style>{`
        .navbar-dropdown-trigger-btn:hover {
          background-color: rgba(30, 37, 43, 0.03) !important;
          color: #1E252B !important;
        }
      `}</style>
    </div>
  );
};

export default Layout;
