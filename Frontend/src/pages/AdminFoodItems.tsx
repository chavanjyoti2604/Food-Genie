import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import VegBadge from '../components/VegBadge';
import {
  LayoutDashboard, Store, Utensils, ShoppingBag, Users,
  Plus, Edit2, Trash2, X, Upload, Sparkles, ChevronRight, ChevronDown
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

const AdminFoodItems = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const sidebarBg = isDark
    ? 'linear-gradient(145deg, #3d0f00, #5c1a00)'
    : 'linear-gradient(135deg, #fc8a19, #e06a10)';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [category, setCategory] = useState('Main Course');
  const [type, setType] = useState('veg');
  const [rating, setRating] = useState(4.0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const restRes = await axios.get('/api/restaurants');
      if (restRes.data.success) {
        setRestaurants(restRes.data.data);
        if (restRes.data.data.length > 0 && !selectedRestId) {
          setSelectedRestId(restRes.data.data[0]._id);
        }
      }
    } catch (error) {
      showToast('Error loading restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    if (!selectedRestId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/fooditems/restaurant/${selectedRestId}`);
      if (response.data.success) setFoodItems(response.data.data);
    } catch (error) {
      showToast('Failed to load menu items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchFoodItems(); }, [selectedRestId]);

  const handleOpenAdd = () => {
    setEditId(null);
    setRestaurantId(selectedRestId || (restaurants[0]?._id || ''));
    setName(''); setImage(''); setDescription('');
    setPrice(150); setCategory('Main Course'); setType('veg'); setRating(4.0);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item._id);
    setRestaurantId(item.restaurantId);
    setName(item.name); setImage(item.image); setDescription(item.description);
    setPrice(item.price); setCategory(item.category); setType(item.type); setRating(item.rating);
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
      if (response.data.success) { setImage(response.data.url); showToast('Food image uploaded successfully!'); }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally { setUploadingFile(false); }
  };

  const handleGenerateAIDescription = async () => {
    if (!name) { showToast('Please enter a food name first to generate a description', 'error'); return; }
    setGeneratingDesc(true);
    try {
      const response = await axios.post('/api/ai/describe', { foodName: name });
      if (response.data.success) { setDescription(response.data.description); showToast('AI description generated successfully!'); }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to generate description', 'error');
    } finally { setGeneratingDesc(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !name || !image || !description || !price || !category) {
      showToast('Please fill out all required details', 'error'); return;
    }
    const payload = { restaurantId, name, image, description, price: parseInt(String(price)), category, type, rating: parseFloat(String(rating)) };
    setLoading(true);
    try {
      if (editId) {
        const response = await axios.put(`/api/fooditems/${editId}`, payload);
        if (response.data.success) { showToast('Menu item updated!'); fetchFoodItems(); setModalOpen(false); }
      } else {
        const response = await axios.post('/api/fooditems', payload);
        if (response.data.success) { showToast('Menu item added successfully!'); setSelectedRestId(restaurantId); fetchFoodItems(); setModalOpen(false); }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save menu item', 'error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    setLoading(true);
    try {
      const response = await axios.delete(`/api/fooditems/${id}`);
      if (response.data.success) { showToast('Menu item deleted'); fetchFoodItems(); }
    } catch (error) {
      showToast('Error deleting item', 'error');
    } finally { setLoading(false); }
  };

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
            background: isDark ? 'rgba(252, 116, 25, 0.2)' : 'rgba(252, 131, 25, 0.12)',
            border: `1px solid ${isDark ? 'rgba(252, 112, 25, 0.35)' : 'rgba(252, 89, 25, 0.25)'}`,
            borderRadius: '999px', padding: '6px 18px', marginBottom: '16px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(252, 127, 25, 0.1)',
          }}>
            <Utensils size={14} color="#fca119" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc7f19', letterSpacing: '1px', textTransform: 'uppercase' }}>Food Items</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900',
            color: isDark ? '#f1f5f9' : '#1A1A2E',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '8px',
          }}>Admin Control Center</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px' }}>
            Manage restaurant entries and food menus
          </p>
        </div>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Sidebar – orange */}
          <aside style={{
            width: '256px', flexShrink: 0,
            background: sidebarBg,
            borderRadius: '24px', padding: '20px 14px',
            border: `1px solid ${isDark ? 'rgba(252, 120, 25, 0.3)' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 60px rgba(252, 138, 25, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
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
              {/* Active item */}
              <div style={{
                ...sidebarItemBase(),
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontWeight: '700',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'default',
              }}>
                <Utensils size={17} /><span>Food Items</span><ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
              </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#f1f5f9' : '#1A1A2E', letterSpacing: '-0.5px' }}>Manage Food Items</h2>
                <p style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: '13px', marginTop: '2px' }}>{foodItems.length} items in current menu</p>
              </div>
              <button
                onClick={handleOpenAdd}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #fc9619, #e04b10)',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  padding: '12px 22px', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer', boxShadow: '0 4px 20px rgba(252, 154, 25, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(252,128,25,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(252,128,25,0.4)'; }}
              >
                <Plus size={16} /><span>Add Food Item</span>
              </button>
            </div>

            {/* Filter Card */}
            <div style={{
              background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px', padding: '20px 24px', marginBottom: '24px',
              border: `1px solid ${isDark ? 'rgba(252, 138, 25, 0.2)' : 'rgba(252, 123, 25, 0.15)'}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>
                Select Restaurant Menu:
              </label>
              <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px' }}>
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 44px 12px 18px', fontSize: '14px',
                    fontWeight: '500', fontFamily: 'inherit',
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '14px', color: isDark ? '#f1f5f9' : '#1A1A2E',
                    cursor: 'pointer', outline: 'none', appearance: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#fc7819'; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(252, 127, 25, 0.2)`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option value="" disabled style={{ background: isDark ? '#1e293b' : '#fff' }}>Choose a restaurant...</option>
                  {restaurants.map(rest => (
                    <option key={rest._id} value={rest._id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{rest.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.97)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' : '0 10px 40px rgba(0,0,0,0.06)',
              border: `1px solid ${isDark ? 'rgba(252, 135, 25, 0.15)' : 'rgba(252, 127, 25, 0.1)'}`,
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: isDark ? 'rgba(252, 116, 25, 0.15)' : 'linear-gradient(135deg, #FFF8F5, #FFE5CC)',
                      borderBottom: `2px solid ${isDark ? 'rgba(252, 150, 25, 0.2)' : 'rgba(252, 135, 25, 0.2)'}`,
                    }}>
                      {['Image', 'Name', 'Category', 'Type', 'Price', 'Rating', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '14px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '800',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: isDark ? '#ffa04d' : '#e08610',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.length > 0 ? (
                      foodItems.map((item: any, idx: number) => (
                        <tr key={item._id} style={{
                          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb'}`,
                          background: isDark
                            ? (idx % 2 === 0 ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.6)')
                            : (idx % 2 === 0 ? '#fff' : '#FFFAF7'),
                        }}>
                          <td style={{ padding: '14px 16px' }}>
                            <img
                              src={item.image} alt={item.name}
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                              onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'; }}
                            />
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1A1A2E', fontSize: '14px' }}>{item.name}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                              borderRadius: '8px', padding: '4px 10px',
                              fontSize: '12px', fontWeight: '600',
                              color: isDark ? '#cbd5e1' : '#374151',
                            }}>{item.category}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}><VegBadge type={item.type} /></td>
                          <td style={{ padding: '14px 16px', fontWeight: '800', color: '#fc7419', fontSize: '15px' }}>₹{item.price}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ color: '#f5740b', fontWeight: '700', fontSize: '14px' }}>★ {item.rating.toFixed(1)}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: '34px', height: '34px', borderRadius: '10px',
                                  background: isDark ? 'rgba(246, 146, 59, 0.2)' : '#eff6ff',
                                  border: `1px solid ${isDark ? 'rgba(246, 156, 59, 0.3)' : '#bfdbfe'}`,
                                  cursor: 'pointer', color: isDark ? '#faaf60' : '#f6953b',
                                }}
                                title="Edit Item"
                              ><Edit2 size={14} /></button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: '34px', height: '34px', borderRadius: '10px',
                                  background: isDark ? 'rgba(239, 154, 68, 0.2)' : '#fef2f2',
                                  border: `1px solid ${isDark ? 'rgba(239, 128, 68, 0.3)' : '#fecaca'}`,
                                  cursor: 'pointer', color: isDark ? '#f8a971' : '#ef9144',
                                }}
                                title="Delete Item"
                              ><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '60px 24px', color: isDark ? '#94a3b8' : '#9ca3af', fontSize: '15px' }}>
                          No dishes listed in this menu yet. Click <strong style={{ color: '#fc7b19' }}>Add Food Item</strong> to begin.
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
            width: '100%', maxWidth: '700px', maxHeight: '92vh', overflowY: 'auto',
            background: isDark
              ? 'linear-gradient(160deg, rgba(22,11,3,0.99) 0%, rgba(12,6,2,0.99) 100%)'
              : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(252, 89, 25, 0.3)' : 'rgba(252, 142, 25, 0.2)'}`,
            borderRadius: '28px', padding: '36px',
            boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.7)' : '0 40px 100px rgba(252, 154, 25, 0.1)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '28px', paddingBottom: '20px',
              borderBottom: `1px solid ${isDark ? 'rgba(252, 123, 25, 0.15)' : 'rgba(252, 108, 25, 0.1)'}`,
            }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', letterSpacing: '-0.5px' }}>
                  {editId ? 'Edit Menu Item' : 'Add New Food Item'}
                </h3>
                <p style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '3px' }}>
                  Fill in all details to save to the menu
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>Assign to Restaurant</label>
                  <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} style={inputStyle} required>
                    <option value="" disabled style={{ background: isDark ? '#1a0a02' : '#fff' }}>Select restaurant</option>
                    {restaurants.map(rest => <option key={rest._id} value={rest._id} style={{ background: isDark ? '#1a0a02' : '#fff' }}>{rest.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1.5 1 220px' }}>
                  <label style={labelStyle}>Food Item Name</label>
                  <input type="text" style={inputStyle} placeholder="e.g. Garlic Naan / Chilly Chicken" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Food Image URL / Upload</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" style={inputStyle} placeholder="Image URL https://..." value={image} onChange={(e) => setImage(e.target.value)} required />
                  <div style={{ flexShrink: 0 }}>
                    <input type="file" id="food-image-file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
                    <label htmlFor="food-image-file" style={{
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

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={labelStyle}>Food Description</label>
                  <button
                    type="button" onClick={handleGenerateAIDescription}
                    disabled={generatingDesc}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                      background: generatingDesc
                        ? (isDark ? 'rgba(252, 138, 25, 0.1)' : 'rgba(252, 116, 25, 0.08)')
                        : (isDark ? 'rgba(252, 93, 25, 0.2)' : 'rgba(252, 146, 25, 0.12)'),
                      border: `1px solid ${isDark ? 'rgba(252, 131, 25, 0.35)' : 'rgba(252, 154, 25, 0.3)'}`,
                      cursor: generatingDesc ? 'not-allowed' : 'pointer',
                      color: '#fc5919',
                    }}
                  >
                    <Sparkles size={12} />{generatingDesc ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  rows={4} style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Describe ingredients, taste, seasoning, and texture..."
                  value={description} onChange={(e) => setDescription(e.target.value)} required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} required>
                    {['Starter', 'Main Course', 'Bread', 'Dessert', 'Beverages'].map(c => (
                      <option key={c} style={{ background: isDark ? '#1a0a02' : '#fff' }} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={labelStyle}>Food Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle} required>
                    <option style={{ background: isDark ? '#1a0a02' : '#fff' }} value="veg">Vegetarian</option>
                    <option style={{ background: isDark ? '#1a0a02' : '#fff' }} value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={labelStyle}>Price (₹)</label>
                  <input type="number" min="1" style={inputStyle} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={labelStyle}>Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" style={inputStyle} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                </div>
              </div>

              <button type="submit" style={{
                width: '100%', marginTop: '8px',
                background: 'linear-gradient(135deg, #fc7b19, #e06310)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '14px', fontSize: '15px', fontWeight: '800',
                cursor: 'pointer', boxShadow: '0 6px 24px rgba(252, 104, 25, 0.4)',
                letterSpacing: '0.2px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(252, 74, 25, 0.55)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(252, 104, 25, 0.4)'; }}>
                {editId ? 'Save Changes' : 'Add Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodItems;
