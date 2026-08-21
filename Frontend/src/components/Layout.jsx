import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Wrench,
  Truck,
  ClipboardList,
  ShieldAlert,
  FileSpreadsheet,
  Calendar,
  Settings,
  MessageSquare,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
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

  // Monitor scroll state
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
    const match = location.pathname.match(/^\/projects\/([a-f\d\-]+)/i);
    const pathProjectId = match ? match[1] : null;
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

  // Role aware links:
  const materialsPath = isAdmin ? '/materials' : '/materials/inventory';
  const equipmentPath = isAdmin ? '/equipment' : '/equipment/bookings';

  return (
    <div className="layout-root" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--text-primary)' }}>
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.4)',
            zIndex: 999,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      {/* Dynamic responsive Stylesheet */}
      <style>{`
        .app-sidebar {
          width: 260px;
          background-color: var(--bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 260px;
          min-width: 0;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 6px;
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .sidebar-link:hover {
          color: var(--text-primary);
          background-color: rgba(193, 68, 14, 0.03);
        }

        .sidebar-link.active {
          color: var(--accent);
          background-color: rgba(193, 68, 14, 0.08);
          border-left-color: var(--accent);
          font-weight: 600;
        }

        .topbar-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .topbar-icon-btn:hover {
          background-color: rgba(193, 68, 14, 0.04);
        }

        @media (max-width: 1024px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
          .main-panel {
            margin-left: 0 !important;
          }
          .mobile-burger-btn {
            display: flex !important;
          }
          .topbar-search-form {
            display: none !important;
          }
        }

        @media (min-width: 1025px) {
          .app-sidebar {
            transform: translateX(0) !important;
          }
          .mobile-burger-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Desktop & Mobile Responsive Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        
        {/* Sidebar Header Brand block */}
        <div style={{ height: '72px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--accent)' }}></div>
            <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>CONSTRUCTIONIQ</span>
          </Link>
          <button 
            className="mobile-burger-btn" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          <NavLink to="/dashboard" className="sidebar-link">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/projects" className="sidebar-link">
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>

          {!isSupplier && (
            <NavLink to={materialsPath} className="sidebar-link">
              <Layers size={18} />
              <span>Materials</span>
            </NavLink>
          )}

          {!isSupplier && (
            <NavLink to={equipmentPath} className="sidebar-link">
              <Wrench size={18} />
              <span>Equipment</span>
            </NavLink>
          )}

          {!isSupplier && (
            <NavLink to="/materials/deliveries" className="sidebar-link">
              <Truck size={18} />
              <span>Deliveries</span>
            </NavLink>
          )}

          {!isSupplier && (
            <NavLink to="/site-operations" className="sidebar-link">
              <ClipboardList size={18} />
              <span>Site Operations</span>
            </NavLink>
          )}

          {!isSupplier && (
            <NavLink to="/safety" className="sidebar-link">
              <ShieldAlert size={18} />
              <span>Safety</span>
            </NavLink>
          )}

          {!isSupplier && (
            <NavLink to="/reports" className="sidebar-link">
              <FileSpreadsheet size={18} />
              <span>Reports</span>
            </NavLink>
          )}

          <NavLink to="/calendar" className="sidebar-link">
            <Calendar size={18} />
            <span>Calendar</span>
          </NavLink>

          <NavLink to="/settings" className="sidebar-link">
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* User Card Profile Footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(193, 68, 14, 0.01)' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent)', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Archi Kumari'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatRole(user?.role) || 'Project Manager'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="main-panel">
        
        {/* Horizontal TopBar */}
        <header style={{
          height: '72px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          {/* TopBar Left Side (Burger toggle and Search Input) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button 
              className="mobile-burger-btn" 
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
            >
              <Menu size={22} color="var(--text-primary)" />
            </button>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const val = e.target.elements.globalsearch.value;
                if (val.trim()) {
                  navigate(`/search?q=${encodeURIComponent(val)}`);
                  e.target.reset();
                }
              }}
              className="topbar-search-form"
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            >
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                name="globalsearch"
                placeholder="Search anything..."
                style={{
                  height: '38px',
                  width: '260px',
                  padding: '0 12px 0 34px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--sans)',
                  outline: 'none',
                  transition: 'width 0.25s ease'
                }}
                onFocus={(e) => {
                  e.target.style.width = '320px';
                  e.target.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.target.style.width = '260px';
                  e.target.style.borderColor = 'var(--border)';
                }}
              />
            </form>
          </div>

          {/* TopBar Right Side Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            {/* Active Selected Project Context Label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 650, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CURRENT PROJECT</span>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>{currentProjectName}</span>
            </div>

            {/* Message square button */}
            <button className="topbar-icon-btn">
              <MessageSquare size={19} />
            </button>

            {/* Settings Link */}
            <Link to="/settings" className="topbar-icon-btn" style={{ textDecoration: 'none' }}>
              <Settings size={19} />
            </Link>

            {/* Notification Bell with Toasts overlay */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="topbar-icon-btn"
                style={{ position: 'relative' }}
              >
                <Bell size={19} />
                {toasts.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--accent)',
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
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    borderBottom: '1px solid var(--border)',
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
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
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
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {toasts.map((toast) => (
                        <div
                          key={toast.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            padding: '8px',
                            backgroundColor: 'var(--bg)',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            borderLeft: '4px solid ' + (toast.type === 'danger' || toast.type === 'error' ? 'var(--error)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--accent)'),
                          }}
                        >
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{toast.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{toast.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger dropdown */}
            <div style={{ position: 'relative' }} ref={userRef}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {userDropdownOpen && (
                <div className="card" style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  width: '180px',
                  padding: '6px 0',
                  zIndex: 1200,
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Signed in as</div>
                    <div style={{ fontWeight: 600, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{user?.email}</div>
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
                      color: 'var(--error)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable page body content */}
        <main style={{ padding: '32px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default Layout;
