import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Sparkles, History, DollarSign, Smile, Utensils, BookOpen, Zap } from 'lucide-react';

const getBg = (isDark: boolean) =>
  isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed';

const MOODS = [
  { label: 'Happy 😃', val: 'Happy', color: '#FC8019' },
  { label: 'Sad 😔', val: 'Sad', color: '#6366f1' },
  { label: 'Tired 😴', val: 'Tired', color: '#8b5cf6' },
  { label: 'Excited 🤩', val: 'Excited', color: '#f59e0b' },
  { label: 'Working Late 👨‍💻', val: 'Working', color: '#E06B10' },
];

const getInputStyle = (isDark: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', fontSize: '14px',
  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
  borderRadius: '12px', color: isDark ? '#f9fafb' : '#1A1A2E',
  outline: 'none', boxSizing: 'border-box',
});

const getLabelStyle = (isDark: boolean): React.CSSProperties => ({
  display: 'block', fontSize: '11px', fontWeight: '800',
  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px',
});

const getCardStyle = (isDark: boolean): React.CSSProperties => ({
  background: isDark
    ? 'linear-gradient(160deg, rgba(22,11,3,0.98) 0%, rgba(14,7,2,0.98) 100%)'
    : 'rgba(255,255,255,0.9)',
  borderRadius: '24px', padding: '28px',
  border: `1px solid ${isDark ? 'rgba(252, 116, 25, 0.2)' : 'rgba(252, 63, 25, 0.12)'}`,
  boxShadow: isDark ? '0 16px 60px rgba(0,0,0,0.5)' : '0 16px 60px rgba(252,128,25,0.06)',
});

const AIRecommendations = () => {
  const { setLoading, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const [mood, setMood] = useState('Happy');
  const [budget, setBudget] = useState(300);
  const [foodType, setFoodType] = useState('Main Course');
  const [preference, setPreference] = useState('Veg');
  const [cuisine, setCuisine] = useState('North Indian');
  const [recommendation, setRecommendation] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/ai/recommend/history');
      if (response.data.success) setHistory(response.data.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation('');
    try {
      const response = await axios.post('/api/ai/recommend', { mood, budget, foodType, preference, cuisine });
      if (response.data.success) {
        setRecommendation(response.data.recommendation);
        showToast('AI recommendation generated!');
        fetchHistory();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to generate recommendation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectHistoryItem = (item: any) => {
    setMood(item.mood); setBudget(item.budget); setFoodType(item.foodType);
    setPreference(item.preference); setCuisine(item.cuisine);
    setRecommendation(item.recommendation);
  };

  const inputStyle = getInputStyle(isDark);
  const labelStyle = getLabelStyle(isDark);
  const cardStyle = getCardStyle(isDark);

  return (
    <div style={{ minHeight: '100vh', background: getBg(isDark) }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '44px 28px 80px' }}>

        {/* Page Header – orange badge */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: isDark ? 'rgba(252, 101, 25, 0.2)' : 'rgba(252, 85, 25, 0.12)',
            border: `1px solid ${isDark ? 'rgba(252, 108, 25, 0.35)' : 'rgba(252, 116, 25, 0.25)'}`,
            borderRadius: '999px', padding: '6px 18px', marginBottom: '16px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 12px rgba(252, 101, 25, 0.12)',
          }}>
            <Sparkles size={14} color="#fc7b19" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fc7019', letterSpacing: '1px', textTransform: 'uppercase' }}>Powered by AI</span>
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: '900',
            color: isDark ? '#f1f5f9' : '#1A1A2E',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px',
          }}>Smart AI Food Recommendations</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4A4A5A', fontSize: '15px', maxWidth: '560px' }}>
            Tell us how you feel and your preferences, and our AI assistant will suggest the perfect meal tailored just for you.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Left: Form + Result */}
          <div style={{ flex: '1.4 1 420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Form Card */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '28px', paddingBottom: '20px',
                borderBottom: `1px solid ${isDark ? 'rgba(252,128,25,0.12)' : 'rgba(252,128,25,0.1)'}`,
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #fc7019, #e05910)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(252, 101, 25, 0.4)',
                }}>
                  <Smile size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>Personalize Your Cravings</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px' }}>Set mood, budget & preferences</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Mood Selector */}
                <div>
                  <label style={labelStyle}>What's your current mood?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {MOODS.map(({ label, val, color }) => {
                      const active = mood === val;
                      return (
                        <button
                          key={val} type="button"
                          onClick={() => setMood(val)}
                          style={{
                            padding: '8px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '700',
                            cursor: 'pointer', transition: 'all 0.2s',
                            background: active ? `${color}22` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                            border: active ? `1.5px solid ${color}` : `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                            color: active ? color : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
                            boxShadow: active ? `0 0 16px ${color}30` : 'none',
                          }}
                        >{label}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Preference + Food Type */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 160px' }}>
                    <label style={labelStyle}>Food Preference</label>
                    <select value={preference} onChange={(e) => setPreference(e.target.value)} style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#fc7819'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <option style={{ background: isDark ? '#1a0a02' : '#fff' }} value="Veg">Vegetarian Only</option>
                      <option style={{ background: isDark ? '#1a0a02' : '#fff' }} value="Non-Veg">Vegetarian & Non-Veg</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 160px' }}>
                    <label style={labelStyle}>Food Category</label>
                    <select value={foodType} onChange={(e) => setFoodType(e.target.value)} style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#fc6c19'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.15)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      {['Starter', 'Main Course', 'Dessert', 'Beverages'].map(c => (
                        <option key={c} style={{ background: isDark ? '#1a0a02' : '#fff' }} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <label style={labelStyle}>Max Budget</label>
                    <span style={{
                      fontSize: '20px', fontWeight: '900', color: '#fc7419',
                      background: isDark ? 'rgba(252, 116, 25, 0.12)' : 'rgba(252,128,25,0.08)',
                      border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.25)' : 'rgba(252, 112, 25, 0.2)'}`,
                      borderRadius: '10px', padding: '2px 12px',
                    }}>₹{budget}</span>
                  </div>
                  <input
                    type="range" min="100" max="1000" step="50"
                    value={budget} onChange={(e) => setBudget(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#fc5919' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', marginTop: '4px' }}>
                    <span>₹100</span><span>₹500</span><span>₹1000</span>
                  </div>
                </div>

                {/* Cuisine */}
                <div>
                  <label style={labelStyle}>Cuisine Preference</label>
                  <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#fc6c19'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {['North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Desserts'].map(c => (
                      <option key={c} style={{ background: isDark ? '#1a0a02' : '#fff' }} value={c}>{c === 'Desserts' ? 'Desserts / Sweet' : c}</option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  width: '100%', padding: '15px',
                  background: 'linear-gradient(135deg, #fc5d19, #e05510)',
                  color: '#fff', border: 'none', borderRadius: '16px',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                  boxShadow: '0 6px 28px rgba(252, 97, 25, 0.4)',
                  letterSpacing: '0.2px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(252, 138, 25, 0.55)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(252, 78, 25, 0.4)'; }}>
                  <Sparkles size={18} />
                  Get AI Recommendation
                  <Zap size={16} style={{ opacity: 0.8 }} />
                </button>
              </form>
            </div>

            {/* AI Result */}
            {recommendation && (
              <div style={{
                ...cardStyle,
                border: `1px solid ${isDark ? 'rgba(252, 116, 25, 0.4)' : 'rgba(252, 85, 25, 0.25)'}`,
                boxShadow: isDark
                  ? '0 16px 60px rgba(25, 33, 252, 0.12), 0 0 0 1px rgba(252,128,25,0.1)'
                  : '0 16px 60px rgba(93, 25, 252, 0.08), 0 0 0 1px rgba(252,128,25,0.08)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Glow orb */}
                <div style={{
                  position: 'absolute', top: '-40px', right: '-40px',
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${isDark ? 'rgba(252, 120, 25, 0.15)' : 'rgba(252, 112, 25, 0.08)'} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    background: isDark ? 'rgba(252, 131, 25, 0.2)' : 'rgba(252, 93, 25, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isDark ? 'rgba(252, 112, 25, 0.3)' : 'rgba(252, 104, 25, 0.2)'}`,
                  }}>
                    <Sparkles size={20} color="#fc8319" />
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>AI Suggestion</div>
                    <div style={{ fontSize: '11px', color: '#fc7819', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>AI-powered result</div>
                  </div>
                </div>
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(252,128,25,0.02)',
                  borderRadius: '16px', padding: '20px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(252,128,25,0.08)'}`,
                }}>
                  <p style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.75', color: isDark ? 'rgba(255,255,255,0.85)' : '#1A1A2E', margin: 0 }}>
                    {recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div style={{ flex: '0.8 1 320px' }}>
            <div style={{ ...cardStyle, maxHeight: '680px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: isDark ? 'rgba(252, 135, 25, 0.15)' : 'rgba(252,128,25,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${isDark ? 'rgba(252, 131, 25, 0.25)' : 'rgba(252, 116, 25, 0.15)'}`,
                }}>
                  <History size={18} color="#fc7419" />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>History</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', marginTop: '1px' }}>Past recommendations</div>
                </div>
              </div>

              {history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {history.map((item: any) => (
                    <div
                      key={item._id}
                      onClick={() => selectHistoryItem(item)}
                      style={{
                        padding: '14px 16px', borderRadius: '16px', cursor: 'pointer',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(252, 116, 25, 0.08)' : 'rgba(252,128,25,0.04)';
                        (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(252, 123, 25, 0.2)' : 'rgba(252,128,25,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
                        (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#fc7b19' }}>{item.mood} Mood</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#e06710' }}>₹{item.budget}</span>
                      </div>
                      <p style={{
                        fontSize: '13px', fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.8)' : '#1A1A2E',
                        margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.recommendation.split('\n')[0].replace('1. Recommended Food: ', '') || 'Suggestion'}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', background: isDark ? 'rgba(252, 97, 25, 0.12)' : 'rgba(252,128,25,0.08)', border: `1px solid ${isDark ? 'rgba(252,128,25,0.2)' : 'rgba(252,128,25,0.15)'}`, color: '#FC8019', borderRadius: '6px', padding: '2px 7px', fontWeight: '700' }}>{item.cuisine}</span>
                        <span style={{ fontSize: '10px', background: isDark ? 'rgba(246, 182, 92, 0.12)' : 'rgba(246, 161, 92, 0.08)', border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`, color: '#8b5cf6', borderRadius: '6px', padding: '2px 7px', fontWeight: '700' }}>{item.foodType}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0,0,0,0.25)', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '20px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}`,
                  }}>
                    <BookOpen size={26} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
                  </div>
                  <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontWeight: '600', margin: '12px 0 0' }}>No recommendation history found.</p>
                  <p style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', marginTop: '6px' }}>Your AI queries will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
