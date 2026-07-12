import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Store, Utensils, ShoppingBag,
  Users, Plus, Edit2, Trash2, X, Upload, ChevronRight, MapPin, BarChart3
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

const modalOverlay = (isDark: boolean): React.CSSProperties => ({
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: isDark ? 'rgba(5,2,1,0.82)' : 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(12px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500,
});

const AdminRestaurants = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const sidebarBg = isDark
    ? 'linear-gradient(145deg, #3d1d00, #5c2000)'
    : 'linear-gradient(135deg, #fc6819, #e04b10)';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [rating, setRating] = useState(4.0);
  const [deliveryCharge, setDeliveryCharge] = useState(30);
  const [deliveryTime, setDeliveryTime] = useState(30);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/restaurants');
      if (response.data.success) setRestaurants(response.data.data);
    } catch (error) {
      showToast('Failed to load restaurants list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setName(''); setImage(''); setAddress(''); setCuisine('');
    setRating(4.0); setDeliveryCharge(30); setDeliveryTime(30);
    setModalOpen(true);
  };

  const handleOpenEdit = (rest: any) => {
    setEditId(rest._id);
    setName(rest.name); setImage(rest.image); setAddress(rest.address);
    setCuisine(rest.cuisine); setRating(rest.rating);
    setDeliveryCharge(rest.deliveryCharge); setDeliveryTime(rest.deliveryTime);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingFile(true);
    try {
      const response = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) { setImage(response.data.url); showToast('Image uploaded successfully!'); }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally { setUploadingFile(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image || !address || !cuisine) { showToast('Please fill all required fields', 'error'); return; }
    const payload = { name, image, address, cuisine, rating: parseFloat(String(rating)), deliveryCharge: parseInt(String(deliveryCharge)), deliveryTime: parseInt(String(deliveryTime)) };
    setLoading(true);
    try {
      if (editId) {
        const response = await axios.put(`/api/restaurants/${editId}`, payload);
        if (response.data.success) { showToast('Restaurant updated successfully!'); fetchRestaurants(); setModalOpen(false); }
      } else {
        const response = await axios.post('/api/restaurants', payload);
        if (response.data.success) { showToast('Restaurant added successfully!'); fetchRestaurants(); setModalOpen(false); }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save restaurant details', 'error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant and all its menus? This action is irreversible.')) return;
    setLoading(true);
    try {
      const response = await axios.delete(`/api/restaurants/${id}`);
      if (response.data.success) { showToast('Restaurant deleted successfully'); fetchRestaurants(); }
    } catch (error) {
      showToast('Error deleting restaurant', 'error');
    } finally { setLoading(false); }
  };

  const cuisineCounts = restaurants.reduce((acc, rest) => {
    acc[rest.cuisine] = (acc[rest.cuisine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRestaurants = restaurants.length;

  const chartData: { cuisine: string; count: number }[] = Object.entries(cuisineCounts)
    .map(([cuisine, count]) => ({ cuisine, count } as { cuisine: string; count: number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const chartColors = [
    'linear-gradient(90deg, #FC8019, #E06B10)',
    'linear-gradient(90deg, #FFA94D, #FC8019)',
    'linear-gradient(90deg, #E06B10, #C45C0C)',
    'linear-gradient(90deg, #8b5cf6, #6d28d9)',
    'linear-gradient(90deg, #10b981, #059669)',
    'linear-gradient(90deg, #3b82f6, #2563eb)',
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: '14px',
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '12px', color: isDark ? '#f9fafb' : '#1A1A2E',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div style={{ minHeight: '100vh', background: getBg(isDark) }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '44px 28px' }}>

        {/* Header – orange badge */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: isDark ? 'rgba(252, 97, 25, 0.2)' : 'rgba(252, 82, 25, 0.12)',
            border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.35)' : 'rgba(252, 104, 25, 0.25)'}`,
            borderRadius: '999px', padding: '6px 18px', marginBottom: '16px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(252, 108, 25, 0.1)',
          }}>
            <Store size={14} color="#fc8a19" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc6819', letterSpacing: '1px', textTransform: 'uppercase' }}>Restaurants</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900',
            color: isDark ? '#f1f5f9' : '#1A1A2E',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '8px',
          }}>Admin Control Center</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px' }}>
            Manage all restaurants and their details
          </p>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Sidebar – orange */}
          <aside style={{
            width: '256px', flexShrink: 0,
            background: sidebarBg,
            borderRadius: '24px', padding: '20px 14px',
            border: `1px solid ${isDark ? 'rgba(252, 146, 25, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 60px rgba(252, 138, 25, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
              {/* Active */}
              <div style={{
                ...sidebarItemBase(),
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'default',
              }}>
                <Store size={17} /><span>Restaurants</span><ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              </div>
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
              <Link to="/admin/users" style={sidebarItemBase()}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}>
                <Users size={17} /><span>Users</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#1A1A2E', letterSpacing: '-0.5px' }}>Manage Restaurants</h2>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: '13px', marginTop: '2px' }}>{restaurants.length} restaurants in database</p>
              </div>
              <button onClick={handleOpenAdd} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #fc6c19, #e05510)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '12px 22px', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(252, 82, 25, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(252, 116, 25, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(252, 85, 25, 0.4)'; }}>
                <Plus size={16} /><span>Add Restaurant</span>
              </button>
            </div>

            {/* Chart – Cuisine Distribution */}
            {totalRestaurants > 0 && chartData.length > 0 && (
              <div style={{
                background: isDark ? 'rgba(59, 39, 30, 0.8)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px', padding: '20px 24px', marginBottom: '24px',
                border: `1px solid ${isDark ? 'rgba(252, 123, 25, 0.2)' : 'rgba(252, 85, 25, 0.15)'}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <BarChart3 size={20} color="#fc6819" />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E' }}>Top Cuisines</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chartData.map((item, idx) => {
                    const percentage = totalRestaurants > 0 ? (item.count / totalRestaurants) * 100 : 0;
                    return (
                      <div key={item.cuisine}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#4b5563' }}>{item.cuisine}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#fc7019' }}>{item.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percentage}%`, height: '100%', borderRadius: '999px',
                            background: chartColors[idx % chartColors.length],
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table */}
            <div style={{
              background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' : '0 10px 40px rgba(0,0,0,0.06)',
              border: `1px solid ${isDark ? 'rgba(252, 93, 25, 0.15)' : 'rgba(252,128,25,0.1)'}`,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: isDark ? 'rgba(252, 82, 25, 0.15)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                      borderBottom: `2px solid ${isDark ? 'rgba(252, 93, 25, 0.2)' : 'rgba(252, 85, 25, 0.2)'}`,
                    }}>
                      {['Image', 'Name', 'Cuisine', 'Rating', 'Delivery Fee', 'Delivery Time', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '800',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: isDark ? '#ff854d' : '#e03610',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.length > 0 ? restaurants.map((rest: any, idx: number) => (
                      <tr key={rest._id} style={{
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'}`,
                        background: isDark
                          ? (idx % 2 === 0 ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.6)')
                          : (idx % 2 === 0 ? '#fff' : '#FFFAF7'),
                        verticalAlign: 'middle',
                      }}>
                        <td style={{ padding: '14px 16px' }}>
                          <img
                            src={rest.image} alt={rest.name}
                            style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
                            onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'; }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E', fontSize: '14px' }}>{rest.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={10} color={isDark ? '#64748b' : '#9ca3af'} />
                            <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#9ca3af' }}>
                              {rest.address?.substring(0, 30)}{rest.address?.length > 30 ? '...' : ''}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: isDark ? 'rgba(252, 85, 25, 0.12)' : '#FFF8F5',
                            borderRadius: '8px', padding: '4px 10px',
                            fontSize: '12px', fontWeight: '600',
                            color: isDark ? '#ff824d' : '#e04710',
                            border: `1px solid ${isDark ? 'rgba(252, 116, 25, 0.2)' : 'rgba(252, 131, 25, 0.2)'}`,
                          }}>{rest.cuisine}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#f5800b', fontWeight: '800', fontSize: '14px' }}>★ {rest.rating.toFixed(1)}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: '700', color: isDark ? '#cbd5e1' : '#374151' }}>₹{rest.deliveryCharge}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#374151' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fc6819', display: 'inline-block' }} />
                            {rest.deliveryTime} mins
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleOpenEdit(rest)} title="Edit Restaurant" style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '34px', height: '34px', borderRadius: '10px',
                              background: isDark ? 'rgba(246, 134, 59, 0.2)' : '#eff6ff',
                              border: `1px solid ${isDark ? 'rgba(246, 118, 59, 0.3)' : '#bfdbfe'}`,
                              cursor: 'pointer', color: isDark ? '#faa560' : '#f6833b',
                            }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(rest._id)} title="Delete Restaurant" style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '34px', height: '34px', borderRadius: '10px',
                              background: isDark ? 'rgba(239, 114, 68, 0.2)' : '#fef2f2',
                              border: `1px solid ${isDark ? 'rgba(239, 128, 68, 0.3)' : '#cad8fe'}`,
                              cursor: 'pointer', color: isDark ? '#f89771' : '#ef6f44',
                            }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '80px 24px' }}>
                          <Store size={40} color={isDark ? '#695147' : '#d1d5db'} style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ color: isDark ? '#94a3b8' : '#9ca3af', fontSize: '15px', fontWeight: '600' }}>
                            No restaurants found. Click <strong style={{ color: '#fc7419' }}>Add Restaurant</strong> to create one.
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

      {/* Modal */}
      {modalOpen && (
        <div style={modalOverlay(isDark)}>
          <div style={{
            width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto',
            background: isDark
              ? 'linear-gradient(160deg, rgba(22,11,3,0.99) 0%, rgba(12,6,2,0.99) 100%)'
              : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.3)' : 'rgba(252, 142, 25, 0.2)'}`,
            borderRadius: '28px', padding: '36px',
            boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.7)' : '0 40px 100px rgba(252,128,25,0.1)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '28px', paddingBottom: '20px',
              borderBottom: `1px solid ${isDark ? 'rgba(252, 82, 25, 0.15)' : 'rgba(252, 82, 25, 0.1)'}`,
            }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', letterSpacing: '-0.5px' }}>
                  {editId ? 'Edit Restaurant Details' : 'Add New Restaurant'}
                </h3>
                <p style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '3px' }}>
                  Fill in all details to save the restaurant
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Restaurant Name</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Spice Villa" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Cuisine Type</label>
                  <input type="text" style={inputStyle} placeholder="e.g. North Indian, Tandoori" value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Restaurant Address</label>
                <input type="text" style={inputStyle} placeholder="e.g. 12, Indiranagar, Bangalore" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div>
                <label style={labelStyle}>Restaurant Image URL / Upload</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" style={inputStyle} placeholder="Image URL https://..." value={image} onChange={(e) => setImage(e.target.value)} required />
                  <div style={{ flexShrink: 0 }}>
                    <input type="file" id="rest-image-file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                    <label htmlFor="rest-image-file" style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 16px', borderRadius: '12px',
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                      cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                    }}>
                      <Upload size={14} />{uploadingFile ? 'Uploading...' : 'Upload'}
                    </label>
                  </div>
                </div>
              </div>

              {image && (
                <div style={{ borderRadius: '14px', overflow: 'hidden', height: '120px', border: `1px solid rgba(252,128,25,0.2)` }}>
                  <img src={image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Initial Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" style={inputStyle} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Delivery Fee (₹)</label>
                  <input type="number" style={inputStyle} value={deliveryCharge} onChange={(e) => setDeliveryCharge(Number(e.target.value))} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Delivery Duration (mins)</label>
                  <input type="number" style={inputStyle} value={deliveryTime} onChange={(e) => setDeliveryTime(Number(e.target.value))} />
                </div>
              </div>

              <button type="submit" style={{
                width: '100%', marginTop: '8px',
                background: 'linear-gradient(135deg, #fc5d19, #e04010)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '14px', fontSize: '15px', fontWeight: '800',
                cursor: 'pointer', boxShadow: '0 6px 24px rgba(252, 74, 25, 0.4)',
                letterSpacing: '0.2px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(252, 112, 25, 0.55)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(252, 82, 25, 0.4)'; }}>
                {editId ? 'Save Changes' : 'Create Restaurant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;
