import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Store, Utensils, ShoppingBag, Users, DollarSign, BarChart3, TrendingUp, ChevronRight, Menu, X } from 'lucide-react';

const getBg = (isDark: boolean) =>
  isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed';

const NAV_ITEMS = [
  { to: '/admin/restaurants', icon: Store, label: 'Restaurants' },
  { to: '/admin/fooditems', icon: Utensils, label: 'Food Items' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const STAT_ITEMS = [
  { icon: Users, color: '#8b5cf6', shadow: '139,92,246', label: 'Total Users', key: 'totalUsers' as const },
  { icon: Store, color: '#FC8019', shadow: '252,128,25', label: 'Restaurants', key: 'totalRestaurants' as const },
  { icon: Utensils, color: '#ec4899', shadow: '236,72,153', label: 'Food Items', key: 'totalFoodItems' as const },
  { icon: ShoppingBag, color: '#10b981', shadow: '16,185,129', label: 'Total Orders', key: 'totalOrders' as const },
];

const AdminDashboard = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalFoodItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [charts, setCharts] = useState<{ monthly: any[]; topRestaurants: any[] }>({
    monthly: [],
    topRestaurants: [],
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setCharts(response.data.charts);
      }
    } catch (error: any) {
      console.error('Error fetching admin dashboard statistics:', error.message);
      showToast('Error loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const gradients = [
    'linear-gradient(90deg, #FC8019, #E06B10)',
    'linear-gradient(90deg, #8b5cf6, #ec4899)',
    'linear-gradient(90deg, #10b981, #0891b2)',
    'linear-gradient(90deg, #f59e0b, #ef4444)',
    'linear-gradient(90deg, #06b6d4, #3b82f6)',
  ];

  // Premium glass sidebar – uses transparency and backdrop blur
  const sidebarGlass = {
    background: isDark
      ? 'rgba(252,128,25,0.15)'
      : 'rgba(252, 78, 25, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.3)' : 'rgba(255,255,255,0.25)'}`,
    boxShadow: isDark
      ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 20px 60px rgba(252, 82, 25, 0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sidebarWidth = 260;

  return (
    <div style={{ minHeight: '100vh', background: getBg(isDark), position: 'relative' }}>

      {/* ===== SIDEBAR – full‑height, glassy, premium ===== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: sidebarWidth,
        height: '100vh',
        ...sidebarGlass,
        transform: sidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}>
        {/* Brand / Logo */}
        <div style={{
          padding: '4px 8px 16px',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '-0.5px',
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>Food GenAI</span>
          <span style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}>Admin Panel</span>
        </div>

        {/* Navigation – bold fonts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            fontWeight: '700', fontSize: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
          </div>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '13px 16px', borderRadius: '14px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '15px',
              fontWeight: '700', // bold
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            }}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Footer in sidebar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '14px',
          marginTop: 'auto',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          fontWeight: '600',
        }}>
          v2.0 • Premium
        </div>
      </div>

      {/* ===== MAIN CONTENT – centered ===== */}
      <div style={{
        marginLeft: sidebarOpen ? sidebarWidth : 0,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '44px 28px',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center', // center horizontally
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: '1300px',
          width: '100%',
        }}>
          {/* Header with toggle button */}
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isDark ? '#f1f5f9' : '#1A1A2E',
                padding: '8px',
                borderRadius: '10px',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: isDark ? 'rgba(252, 85, 25, 0.2)' : 'rgba(252, 63, 25, 0.12)',
                border: `1px solid ${isDark ? 'rgba(252, 59, 25, 0.35)' : 'rgba(252, 112, 25, 0.25)'}`,
                borderRadius: '999px', padding: '6px 18px', marginBottom: '8px',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 12px rgba(252,128,25,0.1)',
              }}>
                <LayoutDashboard size={14} color="#fc5219" />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc4e19', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Panel</span>
              </div>
              <h1 style={{
                fontSize: '42px', fontWeight: '900',
                color: isDark ? '#f1f5f9' : '#1A1A2E',
                letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '4px',
              }}>Admin Control Center</h1>
              <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px' }}>
                Manage platform databases and view analytics summaries
              </p>
            </div>
          </div>

          {/* Stats + Charts (unchanged) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Stat Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '20px',
            }}>
              {STAT_ITEMS.map(({ icon: Icon, color, shadow, label, key }) => (
                <div key={key} style={{
                  background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
                  borderRadius: '20px', padding: '26px 20px', textAlign: 'center',
                  boxShadow: isDark
                    ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                    : `0 10px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(${shadow},0.1)`,
                  borderTop: `4px solid ${color}`,
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px rgba(${shadow},0.2)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = isDark
                    ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                    : `0 10px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(${shadow},0.1)`;
                }}>
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                    background: `radial-gradient(circle, rgba(${shadow},0.08) 0%, transparent 70%)`,
                    borderRadius: '0 0 0 80px',
                  }} />
                  <Icon size={28} color={color} style={{ margin: '0 auto', display: 'block' }} />
                  <div style={{
                    fontSize: '32px', fontWeight: '900', marginTop: '10px',
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    letterSpacing: '-1px',
                  }}>{stats[key]}</div>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '0.8px', color: isDark ? '#94a3b8' : '#9ca3af',
                    marginTop: '6px',
                  }}>{label}</div>
                </div>
              ))}

              {/* Revenue Card */}
              <div style={{
                background: isDark
                  ? 'linear-gradient(135deg, #3d1a00, #5C2800)'
                  : 'linear-gradient(135deg, #fc8319, #e05c10)',
                borderRadius: '20px', padding: '26px 20px', textAlign: 'center',
                boxShadow: isDark
                  ? '0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(252, 127, 25, 0.2)'
                  : '0 10px 40px rgba(252, 123, 25, 0.4)',
                borderTop: '4px solid #ffa04d',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                  borderRadius: '0 0 0 80px',
                }} />
                <DollarSign size={28} color={isDark ? '#ff854d' : '#fff'} style={{ margin: '0 auto', display: 'block' }} />
                <div style={{ fontSize: '30px', fontWeight: '900', marginTop: '10px', color: isDark ? '#ff7c4d' : '#fff', letterSpacing: '-1px' }}>
                  ₹{stats.totalRevenue}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: isDark ? 'rgba(77, 130, 255, 0.7)' : 'rgba(255,255,255,0.8)', marginTop: '6px' }}>Total Revenue</div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
              {/* Monthly Revenue Chart */}
              <div style={{
                background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
                borderRadius: '24px', padding: '28px',
                boxShadow: isDark
                  ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 10px 40px rgba(0,0,0,0.06)',
                border: `1px solid ${isDark ? 'rgba(25, 93, 252, 0.15)' : 'rgba(252,128,25,0.1)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: isDark ? 'rgba(25, 40, 252, 0.2)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isDark ? 'rgba(252, 123, 25, 0.3)' : 'rgba(252, 85, 25, 0.2)'}`,
                  }}>
                    <TrendingUp size={18} color="#fc8a19" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>Monthly Analytics</div>
                    <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#9ca3af' }}>Orders & Revenue trend</div>
                  </div>
                </div>
                {charts.monthly.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <svg viewBox="0 0 500 260" width="100%" height="240" style={{ minWidth: '380px' }}>
                      {[30, 80, 130, 180].map(y => (
                        <line key={y} x1="50" y1={y} x2="460" y2={y} stroke={isDark ? '#334155' : '#f3f4f6'} strokeWidth="1" strokeDasharray="4,4" />
                      ))}
                      {charts.monthly.map((monthData: any, idx: number) => {
                        const maxVal = Math.max(...charts.monthly.map((m: any) => m.revenue)) || 1000;
                        const height = maxVal > 0 ? (monthData.revenue / maxVal) * 140 : 0;
                        const y = 190 - height;
                        const x = 70 + idx * 55;
                        return (
                          <g key={idx}>
                            <rect x={x} y={y} width="26" height={height} fill="url(#orangeBarGrad)" rx="6" />
                            <text x={x + 13} y={y - 6} fontSize="9" fontWeight="700" fill={isDark ? '#e2e8f0' : '#374151'} textAnchor="middle">₹{monthData.revenue}</text>
                            <text x={x + 13} y="212" fontSize="10" fill={isDark ? '#94a3b8' : '#6b7280'} textAnchor="middle" fontWeight="600">{monthData.month.split(' ')[0]}</text>
                            <text x={x + 13} y="226" fontSize="9" fill={isDark ? '#64748b' : '#9ca3af'} textAnchor="middle">{monthData.orders} ord</text>
                          </g>
                        );
                      })}
                      <defs>
                        <linearGradient id="orangeBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fc7019" />
                          <stop offset="100%" stopColor="#e06d10" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#475569' : '#d1d5db', fontSize: '14px' }}>
                    No monthly statistics data loaded yet.
                  </div>
                )}
              </div>

              {/* Top Restaurants */}
              <div style={{
                background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
                borderRadius: '24px', padding: '28px',
                boxShadow: isDark
                  ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                  : '0 10px 40px rgba(0,0,0,0.06)',
                border: `1px solid ${isDark ? 'rgba(48, 25, 252, 0.15)' : 'rgba(25, 25, 252, 0.1)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: isDark ? 'rgba(63, 25, 252, 0.2)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isDark ? 'rgba(252, 150, 25, 0.3)' : 'rgba(252, 112, 25, 0.2)'}`,
                  }}>
                    <BarChart3 size={18} color="#fc9d19" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>Top Restaurants</div>
                    <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#9ca3af' }}>By order volume</div>
                  </div>
                </div>
                {charts.topRestaurants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {charts.topRestaurants.map((rest: any, idx: number) => {
                      const maxOrders = Math.max(...charts.topRestaurants.map((r: any) => r.orders)) || 1;
                      const percentage = (rest.orders / maxOrders) * 100;
                      return (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '22px', height: '22px', borderRadius: '7px',
                                background: gradients[idx % gradients.length],
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: '900', color: '#fff',
                              }}>{idx + 1}</div>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>{rest.name}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: isDark ? '#94a3b8' : '#6b7280' }}>{rest.orders} orders</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: isDark ? '#334155' : '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${percentage}%`, height: '100%', borderRadius: '999px',
                              background: gradients[idx % gradients.length],
                              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#475569' : '#d1d5db', fontSize: '14px' }}>
                    No restaurant sales figures available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;