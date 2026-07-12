import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Store, Utensils, ShoppingBag, Users, Trash2, Search, ChevronRight, UserCircle2, BarChart3 } from 'lucide-react';

const getBg = (isDark: boolean) =>
  isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed';

const sidebarItemBase = (): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '13px 16px', borderRadius: '14px',
  color: 'rgba(255,255,255,0.85)',
  fontSize: '14px', fontWeight: '500',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
});

const AVATAR_COLORS = [
  'linear-gradient(135deg,#FC8019,#E06B10)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#10b981,#0891b2)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
];

const AdminUsers = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const sidebarBg = isDark
    ? 'linear-gradient(145deg, #3D1A00, #5C2800)'
    : 'linear-gradient(135deg, #fc6119, #e05210)';

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const response = await axios.get('/api/auth/users', { params });
      if (response.data.success) setUsers(response.data.data);
    } catch (error) {
      showToast('Error loading users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    setLoading(true);
    try {
      const response = await axios.delete(`/api/auth/users/${id}`);
      if (response.data.success) { showToast('User deleted successfully'); fetchUsers(); }
    } catch (error) {
      showToast('Failed to delete user', 'error');
    } finally { setLoading(false); }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const registrationsByMonth = users.reduce((acc, user) => {
    const date = new Date(user.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const now = new Date();
  const last6Months: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    last6Months.push({ month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, count: registrationsByMonth[key] || 0 });
  }

  const chartData = last6Months;
  const maxCount = Math.max(...chartData.map(item => item.count), 1);

  const inputStyle: React.CSSProperties = {
    paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
    width: '280px', fontSize: '13px', fontWeight: '500',
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '12px',
    color: isDark ? '#f9fafb' : '#1A1A2E',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: getBg(isDark) }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '44px 28px' }}>

        {/* Header – orange badge */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: isDark ? 'rgba(252, 131, 25, 0.2)' : 'rgba(252, 93, 25, 0.12)',
            border: `1px solid ${isDark ? 'rgba(252, 131, 25, 0.35)' : 'rgba(252, 161, 25, 0.25)'}`,
            borderRadius: '999px', padding: '6px 18px', marginBottom: '16px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(252,128,25,0.1)',
          }}>
            <Users size={14} color="#fc8319" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc6819', letterSpacing: '1px', textTransform: 'uppercase' }}>Users</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900',
            color: isDark ? '#f1f5f9' : '#1A1A2E',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '8px',
          }}>Admin Control Center</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px' }}>
            Manage all registered users
          </p>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Sidebar – orange */}
          <aside style={{
            width: '256px', flexShrink: 0,
            background: sidebarBg,
            borderRadius: '24px', padding: '20px 14px',
            border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.3)' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 60px rgba(252, 78, 25, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            position: 'sticky', top: '24px',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ padding: '4px 8px 14px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Navigation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link to="/admin" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <LayoutDashboard size={17} /><span>Dashboard</span>
              </Link>
              <Link to="/admin/restaurants" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <Store size={17} /><span>Restaurants</span>
              </Link>
              <Link to="/admin/fooditems" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <Utensils size={17} /><span>Food Items</span>
              </Link>
              <Link to="/admin/orders" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <ShoppingBag size={17} /><span>Orders</span>
              </Link>
              {/* Active */}
              <div style={{
                ...sidebarItemBase(),
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'default',
              }}>
                <Users size={17} /><span>Users</span><ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#1A1A2E', letterSpacing: '-0.5px' }}>Manage Users</h2>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: '13px', marginTop: '2px' }}>{users.length} registered accounts</p>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#fc7b19'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Chart: Monthly User Registrations */}
            {users.length > 0 && (
              <div style={{
                background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px', padding: '20px 24px', marginBottom: '24px',
                border: `1px solid ${isDark ? 'rgba(252, 101, 25, 0.2)' : 'rgba(252,128,25,0.15)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <BarChart3 size={20} color="#fc5219" />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>
                    Monthly User Registrations (Last 6 Months)
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chartData.map((item) => {
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.month}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#4b5563' }}>{item.month}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#fc6819' }}>{item.count} user{item.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percentage}%`, height: '100%', borderRadius: '999px',
                            background: 'linear-gradient(90deg, #fc5d19, #ff714d)',
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users Table */}
            <div style={{
              background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' : '0 10px 40px rgba(0,0,0,0.06)',
              border: `1px solid ${isDark ? 'rgba(25, 51, 252, 0.15)' : 'rgba(25, 74, 252, 0.1)'}`,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: isDark ? 'rgba(33, 25, 252, 0.15)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                      borderBottom: `2px solid ${isDark ? 'rgba(252, 154, 25, 0.2)' : 'rgba(252, 116, 25, 0.2)'}`,
                    }}>
                      {['User', 'Email', 'Mobile', 'Address', 'Registered On', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '800',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: isDark ? '#ffa04d' : '#e04e10',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map((u: any, idx: number) => (
                      <tr key={u._id} style={{
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'}`,
                        background: isDark
                          ? (idx % 2 === 0 ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.6)')
                          : (idx % 2 === 0 ? '#fff' : '#FFFAF7'),
                        verticalAlign: 'middle',
                      }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '12px',
                              background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '15px', fontWeight: '800',
                              flexShrink: 0,
                            }}>
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E', fontSize: '14px' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: isDark ? '#cbd5e1' : '#374151' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: isDark ? '#cbd5e1' : '#374151', whiteSpace: 'nowrap' }}>{u.mobile}</td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: isDark ? '#94a3b8' : '#6b7280', maxWidth: '220px', lineHeight: '1.5' }}>
                          {u.address?.street ? (
                            <span>{u.address.street}, {u.address.city}, {u.address.state} — {u.address.pincode}</span>
                          ) : (
                            <span style={{ color: isDark ? '#475569' : '#d1d5db', fontStyle: 'italic' }}>No address listed</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: isDark ? '#94a3b8' : '#6b7280', whiteSpace: 'nowrap' }}>
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => handleDelete(u._id)}
                            title="Delete User Account"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '34px', height: '34px', borderRadius: '10px',
                              background: isDark ? 'rgba(239, 114, 68, 0.2)' : '#fef2f2',
                              border: `1px solid ${isDark ? 'rgba(239, 154, 68, 0.3)' : '#fecaca'}`,
                              cursor: 'pointer', color: isDark ? '#f8ac71' : '#ef7244',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '80px 24px' }}>
                          <UserCircle2 size={40} color={isDark ? '#475569' : '#d1d5db'} style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ color: isDark ? '#94a3b8' : '#9ca3af', fontSize: '15px', fontWeight: '600' }}>
                            {search ? `No users matching "${search}"` : 'No user accounts found.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
