import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Store, Utensils, ShoppingBag,
  Users, Clock, ChevronRight, Package, ChevronDown, BarChart3
} from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  'Pending':          { bg: 'rgba(251,191,36,0.15)',  color: '#f59e0b', dot: '#f59e0b' },
  'Preparing':        { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6', dot: '#3b82f6' },
  'Out For Delivery': { bg: 'rgba(252,128,25,0.15)',  color: '#FC8019', dot: '#FC8019' },
  'Delivered':        { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', dot: '#10b981' },
};

const AdminOrders = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const sidebarBg = isDark
    ? 'linear-gradient(145deg, #3d0800, #5c0f00)'
    : 'linear-gradient(135deg, #fc9219, #e06a10)';

  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders');
      if (response.data.success) setOrders(response.data.data);
    } catch (error) {
      showToast('Error loading orders list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        showToast('Order status updated successfully');
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { bg: 'rgba(156,163,175,0.15)', color: '#6b7280', dot: '#6b7280' };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '999px',
        background: cfg.bg, color: cfg.color,
        fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
        {status}
      </span>
    );
  };

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOrders = orders.length;
  const chartData = Object.keys(STATUS_CONFIG).map(status => ({
    status,
    count: statusCounts[status] || 0,
    color: STATUS_CONFIG[status].color,
    bg: STATUS_CONFIG[status].bg,
  }));

  return (
    <div style={{ minHeight: '100vh', background: getBg(isDark) }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '44px 28px' }}>

        {/* Page Header – orange badge */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: isDark ? 'rgba(252, 101, 25, 0.2)' : 'rgba(252, 78, 25, 0.12)',
            border: `1px solid ${isDark ? 'rgba(252, 97, 25, 0.35)' : 'rgba(252, 112, 25, 0.25)'}`,
            borderRadius: '999px', padding: '6px 18px', marginBottom: '16px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(252, 116, 25, 0.1)',
          }}>
            <ShoppingBag size={14} color="#fc5d19" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc7019', letterSpacing: '1px', textTransform: 'uppercase' }}>Orders</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900',
            color: isDark ? '#f1f5f9' : '#1A1A2E',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '8px',
          }}>Admin Control Center</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px' }}>
            Manage all customer orders and their statuses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Sidebar – orange */}
          <aside style={{
            width: '256px', flexShrink: 0,
            background: sidebarBg,
            borderRadius: '24px', padding: '20px 14px',
            border: `1px solid ${isDark ? 'rgba(252, 112, 25, 0.3)' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 60px rgba(252, 131, 25, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
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
              {/* Active */}
              <div style={{
                ...sidebarItemBase(),
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'default',
              }}>
                <ShoppingBag size={17} /><span>Orders</span><ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              </div>
              <Link to="/admin/users" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <Users size={17} /><span>Users</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#1A1A2E', letterSpacing: '-0.5px' }}>Manage Orders</h2>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: '13px', marginTop: '2px' }}>
                  {orders.length} total orders on platform
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([label, cfg]) => (
                  <span key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 12px', borderRadius: '999px',
                    background: cfg.bg, color: cfg.color,
                    fontSize: '11px', fontWeight: '700',
                    border: `1px solid ${cfg.color}40`,
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Chart – Order Distribution */}
            {totalOrders > 0 && (
              <div style={{
                background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px', padding: '20px 24px', marginBottom: '24px',
                border: `1px solid ${isDark ? 'rgba(252,128,25,0.2)' : 'rgba(252,128,25,0.15)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <BarChart3 size={20} color="#fc6819" />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>
                    Order Status Distribution
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chartData.map((item) => {
                    const percentage = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#4b5563' }}>{item.status}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percentage}%`, height: '100%', borderRadius: '999px',
                            background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div style={{
              background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' : '0 10px 40px rgba(0,0,0,0.06)',
              border: `1px solid ${isDark ? 'rgba(252, 112, 25, 0.15)' : 'rgba(252, 97, 25, 0.1)'}`,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: isDark ? 'rgba(252, 108, 25, 0.15)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                      borderBottom: `2px solid ${isDark ? 'rgba(252, 85, 25, 0.2)' : 'rgba(252, 70, 25, 0.2)'}`,
                    }}>
                      {['Order ID', 'Customer', 'Dishes Ordered', 'Amount', 'Address', 'Status', 'Update Status'].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '800',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: isDark ? '#ff824d' : '#e05c10',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? orders.map((order: any, idx: number) => (
                      <tr key={order._id} style={{
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'}`,
                        background: isDark
                          ? (idx % 2 === 0 ? 'rgba(59, 41, 30, 0.95)' : 'rgba(42, 24, 15, 0.6)')
                          : (idx % 2 === 0 ? '#fff' : '#FFFAF7'),
                        verticalAlign: 'top',
                      }}>
                        <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '10px',
                              background: isDark ? 'rgba(252, 108, 25, 0.15)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.3)' : 'rgba(252, 97, 25, 0.2)'}`,
                            }}>
                              <Package size={14} color="#fc7419" />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: isDark ? '#e2e8f0' : '#1A1A2E', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                              #{order._id.substring(order._id.length - 8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', minWidth: '140px' }}>
                          <div style={{ fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E', fontSize: '14px' }}>{order.userId?.name || 'Customer'}</div>
                          <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#9ca3af', marginTop: '2px' }}>{order.userId?.email}</div>
                          <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#9ca3af' }}>{order.userId?.mobile}</div>
                        </td>
                        <td style={{ padding: '16px', minWidth: '160px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {order.items.map((item: any, i: number) => (
                              <div key={i} style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#374151' }}>
                                <span style={{ color: isDark ? '#64748b' : '#6b7280' }}>•</span>{' '}{item.name}{' '}
                                <span style={{ fontWeight: '800', color: '#fc7419' }}>×{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fc7019' }}>₹{order.totalAmount}</span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '12px', maxWidth: '200px', lineHeight: '1.5', color: isDark ? '#94a3b8' : '#6b7280' }}>
                          <strong style={{ color: isDark ? '#e2e8f0' : '#374151' }}>{order.address.fullName}</strong>
                          <span style={{ color: isDark ? '#64748b' : '#9ca3af' }}> ({order.address.mobile})</span>
                          <br />
                          {order.address.street}, {order.address.city}<br />
                          {order.address.state} — {order.address.pincode}
                        </td>
                        <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ position: 'relative', minWidth: '150px' }}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              style={{
                                width: '100%', padding: '9px 38px 9px 14px',
                                fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                                background: isDark ? 'rgba(255,255,255,0.07)' : '#fff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}`,
                                borderRadius: '12px', color: isDark ? '#f1f5f9' : '#374151',
                                cursor: 'pointer', outline: 'none', appearance: 'none',
                                transition: 'all 0.25s ease',
                              }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = '#fc6119'; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(59, 25, 252, 0.2)`; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                              {['Pending', 'Preparing', 'Out For Delivery', 'Delivered'].map(s => (
                                <option key={s} style={{ background: isDark ? '#1e293b' : '#fff' }}>{s}</option>
                              ))}
                            </select>
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '80px 24px' }}>
                          <Clock size={40} color={isDark ? '#475569' : '#d1d5db'} style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ color: isDark ? '#94a3b8' : '#9ca3af', fontSize: '15px', fontWeight: '600' }}>
                            No orders placed on the platform yet.
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

export default AdminOrders;
