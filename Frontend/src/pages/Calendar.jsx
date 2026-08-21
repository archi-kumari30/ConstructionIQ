import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Raw data from DB
  const [milestones, setMilestones] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  // Calendar navigation state (default to August 2026 for demonstration reference aligned with milestones)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 20));

  // Sync project select box with localStorage context
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
        
        const cachedId = localStorage.getItem('activeProjectId');
        if (cachedId && list.some(p => p.id === cachedId || p._id === cachedId)) {
          setSelectedProjectId(cachedId);
        } else if (list.length > 0) {
          setSelectedProjectId(list[0].id || list[0]._id);
        }
      } catch (err) {
        console.error('Error fetching projects list:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch project events when project ID changes
  const fetchEvents = async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingData(true);
      const [milestonesRes, bookingsRes, deliveriesRes] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/milestones`),
        api.get(`/projects/${selectedProjectId}/bookings`),
        api.get(`/projects/${selectedProjectId}/deliveries`)
      ]);
      setMilestones(milestonesRes.data?.data?.milestones || []);
      setBookings(bookingsRes.data?.data?.bookings || []);
      setDeliveries(deliveriesRes.data?.data?.deliveries || []);
    } catch (err) {
      console.error('Error fetching project timeline events:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedProjectId]);

  // Unified list of all timeline events
  const getUnifiedEvents = () => {
    const events = [];

    // Map milestones
    milestones.forEach((m) => {
      if (!m.targetDate && !m.dueDate) return;
      events.push({
        id: `milestone-${m._id || m.id}`,
        title: `Milestone: ${m.title}`,
        date: new Date(m.targetDate || m.dueDate),
        type: 'milestone',
        color: '#D97706', // Amber
        location: 'Project Site',
        description: m.description || `Status: ${m.status.toUpperCase()}`
      });
    });

    // Map bookings
    bookings.forEach((b) => {
      if (!b.startTime) return;
      const equip = b.equipmentId || {};
      events.push({
        id: `booking-${b._id || b.id}`,
        title: `Fleet Booking: ${equip.name || 'Heavy Machinery'}`,
        date: new Date(b.startTime),
        type: 'booking',
        color: '#C1440E', // Terracotta
        location: b.purpose || 'Active Sector Site',
        description: `Reserved from ${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    });

    // Map deliveries
    deliveries.forEach((d) => {
      if (!d.deliveryDate) return;
      const material = d.materialId || {};
      events.push({
        id: `delivery-${d._id || d.id}`,
        title: `Delivery: ${material.name || 'Warehouse Stock'}`,
        date: new Date(d.deliveryDate),
        type: 'delivery',
        color: '#16A34A', // Green
        location: d.carrierName || 'Primary Storage Yard',
        description: `${d.quantityOrdered} ${material.unit || 'units'} (Status: ${d.status.replace('_', ' ')})`
      });
    });

    return events;
  };

  const allEvents = getUnifiedEvents();

  // Calendar calculation variables
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getMonthName = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getEventsForDay = (day) => {
    return allEvents.filter((e) => {
      const d = e.date;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  // Get active selected day events or upcoming events in current view
  const getUpcomingEvents = () => {
    return allEvents
      .filter((e) => e.date >= new Date(year, month, 1) && e.date <= new Date(year, month + 1, 0))
      .sort((a, b) => a.date - b.date);
  };

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={28} color="var(--primary)" />
        <span style={{ marginLeft: '10px', fontWeight: 600 }}>Loading calendar workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }} className="animate-fade-slide-up">
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#C1440E', letterSpacing: '1.5px', fontWeight: 600, fontFamily: 'var(--font-title)', marginBottom: '6px', textTransform: 'uppercase' }}>
            CONSTRUCTION OPERATIONS PLATFORM
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-title)', margin: 0 }}>
            Calendar & Schedule
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            Track project milestones, material deliveries, and heavy machinery bookings.
          </p>
        </div>

        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Active Project:</span>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: '220px', padding: '6px 12px' }}
            >
              {projects.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card" style={{ padding: '40px' }}>
          <CalendarIcon size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No projects active</span>
          <span className="empty-state-desc">Assign projects to access schedule calendars.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px', alignItems: 'start' }} className="responsive-calendar-grid">
          <style>{`
            @media (max-width: 1024px) {
              .responsive-calendar-grid {
                grid-template-columns: 1fr !important;
              }
            }
            .day-cell {
              background-color: #FFFFFF;
              min-height: 90px;
              padding: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              transition: background-color 0.2s ease;
            }
            .day-cell:hover {
              background-color: #FAF7F2;
            }
          `}</style>

          {/* Calendar main component */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-title)' }}>{getMonthName()}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={handlePrevMonth} style={{ padding: '6px 12px', height: '32px', fontSize: '12px' }}>
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())} style={{ padding: '6px 12px', height: '32px', fontSize: '12px' }}>
                  Today
                </button>
                <button className="btn btn-secondary" onClick={handleNextMonth} style={{ padding: '6px 12px', height: '32px', fontSize: '12px' }}>
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#E8E5DF', border: '1px solid #E8E5DF' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ backgroundColor: '#FAF7F2', padding: '10px', fontSize: '11px', fontWeight: 650, textAlign: 'center', textTransform: 'uppercase', color: '#6B7280' }}>
                  {d}
                </div>
              ))}
              
              {/* Offset days preceding month start */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ backgroundColor: '#FAF7F2', opacity: 0.5, minHeight: '90px' }}></div>
              ))}

              {/* Month day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const todayObj = new Date();
                const isToday = todayObj.getFullYear() === year && todayObj.getMonth() === month && todayObj.getDate() === day;
                const dayEvents = getEventsForDay(day);

                return (
                  <div key={day} className="day-cell" style={{ backgroundColor: isToday ? '#FDF4F0' : '#FFFFFF', border: isToday ? '1.5px solid #C1440E' : 'none' }}>
                    <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 600, color: isToday ? '#C1440E' : '#1A1A1A' }}>{day}</span>
                    
                    {/* Event indicators */}
                    {dayEvents.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', marginTop: '6px' }}>
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div 
                            key={ev.id} 
                            style={{ 
                              fontSize: '9px', 
                              fontWeight: 700, 
                              color: '#FFFFFF', 
                              backgroundColor: ev.color, 
                              padding: '2px 4px', 
                              borderRadius: '3px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'left'
                            }}
                            title={ev.title}
                          >
                            {ev.title.split(': ')[1]}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 650 }}>
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Schedule List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Legend card */}
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
                <span>Project Milestones</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C1440E' }}></span>
                <span>Fleet Machinery Bookings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                <span>Material Deliveries</span>
              </div>
            </div>

            {/* List card */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 650, color: '#1A1A1A', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming Schedule</h3>
              
              {loadingData ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 0' }}>
                  <Loader2 className="animate-spin" size={14} />
                  <span style={{ fontSize: '12px' }}>Loading timeline...</span>
                </div>
              ) : getUpcomingEvents().length === 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No items scheduled this month.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {getUpcomingEvents().map(e => (
                    <div key={e.id} style={{ borderLeft: `3px solid ${e.color}`, paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1A1A1A' }}>{e.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{e.description}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10.5px', color: '#6B7280', marginTop: '2px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {e.location}</span>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: e.color, textTransform: 'uppercase', marginTop: '2px' }}>
                        {e.date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer disclaimer alert */}
            <div className="card" style={{ display: 'flex', gap: '10px', backgroundColor: '#FFFDF9', borderColor: '#F5E6D3', padding: '16px' }}>
              <Info size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.4 }}>
                <strong>Dynamic Timelines:</strong> Direct calendar event creation is not supported. Log milestone targets, fleet reservations, or delivery slots under their respective tabs to populate this schedule automatically.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
