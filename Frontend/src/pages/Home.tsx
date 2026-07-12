import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import { Search, SlidersHorizontal, Sparkles, Flame, Star } from 'lucide-react';

// Background – changes based on theme (food image visible)
const getBg = (isDark) => ({
  minHeight: '100vh',
  background: isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed',
  padding: '44px 28px 80px',
});

const Home = () => {
  const { setLoading, theme } = useApp();
  const isDark = theme === 'dark';

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // 'veg' or 'non-veg'
  const [rating, setRating] = useState(''); // minimum rating
  const [priceRange, setPriceRange] = useState(''); // 'under-200', '200-500', 'over-500'
  const [sort, setSort] = useState('rating'); // 'rating', 'price', 'deliveryTime'

  // ===== PREMIUM ZOMATO/SWIGGY PALETTE =====
  const primaryColor = '#fc9219';      // Swiggy orange
  const primaryDark = '#e06710';
  const primaryLight = '#ff7a4d';
  const accentColor = '#ff5f47';       // Zomato red accent for highlights

  const primaryGrad = `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`;
  const primaryGradLight = `linear-gradient(135deg, ${primaryLight}, ${primaryColor})`;

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (rating) params.rating = rating;
      if (priceRange) params.priceRange = priceRange;
      if (sort) params.sort = sort;

      const response = await axios.get('/api/restaurants', { params });
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever filters/sorting parameters change
  useEffect(() => {
    fetchRestaurants();
  }, [type, rating, priceRange, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setRating('');
    setPriceRange('');
    setSort('rating');
  };

  // ===== THEME‑AWARE STYLES (Orange/Red premium) =====

  const heroStyle = {
    marginTop: '32px',
    background: isDark
      ? `linear-gradient(135deg, rgba(252, 116, 25, 0.12) 0%, rgba(252, 101, 25, 0.06) 50%, rgba(255, 157, 71, 0.08) 100%)`
      : `linear-gradient(135deg, rgba(252, 101, 25, 0.08) 0%, rgba(252, 93, 25, 0.04) 50%, rgba(255, 132, 71, 0.04) 100%)`,
    border: `1px solid ${isDark ? 'rgba(252, 63, 25, 0.2)' : 'rgba(252, 70, 25, 0.12)'}`,
    padding: '48px',
    borderRadius: '28px',
    boxShadow: isDark
      ? '0 20px 80px rgba(0,0,0,0.4)'
      : '0 20px 60px rgba(0,0,0,0.04)',
    backdropFilter: 'blur(6px)',
    position: 'relative',
    overflow: 'hidden',
  };

  const heroBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: isDark ? 'rgba(252, 59, 25, 0.15)' : 'rgba(252, 97, 25, 0.08)',
    color: primaryColor,
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '20px',
    border: `1px solid ${isDark ? 'rgba(252, 89, 25, 0.3)' : 'rgba(252, 89, 25, 0.15)'}`,
    letterSpacing: '0.3px',
  };

  const filterSelectStyle = {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '12px',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
    color: isDark ? '#f1f5f9' : '#1f2937',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 16px 12px 48px',
    fontSize: '14px',
    borderRadius: '16px',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
    color: isDark ? '#f1f5f9' : '#1f2937',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
    transition: 'all 0.2s',
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
  };

  const noResultsStyle = {
    padding: '80px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark
      ? 'linear-gradient(160deg, rgba(22,11,3,0.97) 0%, rgba(14,7,2,0.97) 100%)'
      : '#ffffff',
    borderRadius: '24px',
    border: `1px solid ${isDark ? 'rgba(252,128,25,0.12)' : 'rgba(0,0,0,0.04)'}`,
    boxShadow: isDark
      ? '0 20px 60px rgba(0,0,0,0.3)'
      : '0 20px 60px rgba(0,0,0,0.04)',
  };

  return (
    <div style={getBg(isDark)}>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>

        

        {/* ===== SEARCH & FILTERS ===== */}
        <div className="search-filter-section" style={{ marginTop: '32px' }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={20} style={searchIconStyle} />
              <input
                type="text"
                placeholder="Search by restaurant, cuisine, or dish..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '12px 32px',
                background: primaryGrad,
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${primaryColor}40`,
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${primaryColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${primaryColor}40`;
              }}
            >
              Search
            </button>
          </form>

          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <SlidersHorizontal size={16} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />

              {/* Veg / Non-Veg */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>All Food Types</option>
                <option value="veg" style={{ background: isDark ? '#1e293b' : '#fff' }}>Vegetarian</option>
                <option value="non-veg" style={{ background: isDark ? '#1e293b' : '#fff' }}>Non-Vegetarian</option>
              </select>

              {/* Ratings */}
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>All Ratings</option>
                <option value="4.5" style={{ background: isDark ? '#1e293b' : '#fff' }}>★ 4.5+</option>
                <option value="4.0" style={{ background: isDark ? '#1e293b' : '#fff' }}>★ 4.0+</option>
                <option value="3.5" style={{ background: isDark ? '#1e293b' : '#fff' }}>★ 3.5+</option>
              </select>

              {/* Price Ranges */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>All Budgets</option>
                <option value="under-200" style={{ background: isDark ? '#1e293b' : '#fff' }}>Under ₹200</option>
                <option value="200-500" style={{ background: isDark ? '#1e293b' : '#fff' }}>₹200 – ₹500</option>
                <option value="over-500" style={{ background: isDark ? '#1e293b' : '#fff' }}>Over ₹500</option>
              </select>
            </div>

            {/* Sorting and Reset */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              }}>Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="rating" style={{ background: isDark ? '#1e293b' : '#fff' }}>Rating (High to Low)</option>
                <option value="price" style={{ background: isDark ? '#1e293b' : '#fff' }}>Price (Low to High)</option>
                <option value="deliveryTime" style={{ background: isDark ? '#1e293b' : '#fff' }}>Delivery Time</option>
              </select>

              <button
                onClick={handleResetFilters}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ===== RESTAURANT GRID ===== */}
        {restaurants.length > 0 ? (
          <div className="grid-3" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px',
            marginTop: '32px',
          }}>
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div style={noResultsStyle}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: isDark ? 'rgba(252,128,25,0.08)' : 'rgba(252,128,25,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: `1px solid ${isDark ? 'rgba(252,128,25,0.15)' : 'rgba(252,128,25,0.08)'}`,
            }}>
              <Search size={28} color={primaryColor} />
            </div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: isDark ? '#fff' : '#1A1A2E',
              margin: 0,
            }}>No restaurants match your criteria</h3>
            <p style={{
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              marginTop: '8px',
              fontSize: '15px',
              maxWidth: '380px',
            }}>
              Try adjusting your filters or search for something else.
            </p>
            <button
              onClick={handleResetFilters}
              style={{
                marginTop: '20px',
                padding: '10px 28px',
                background: primaryGrad,
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${primaryColor}30`,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;