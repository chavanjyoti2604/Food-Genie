import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import VegBadge from '../components/VegBadge';
import { Star, Clock, Bike, Sparkles, MessageSquare, StarHalf, Plus, Send } from 'lucide-react';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart, showToast, setLoading } = useApp();

  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Submit Review Form States
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/restaurants/${id}`);
      if (response.data.success) {
        setRestaurant(response.data.data.restaurant);
        setFoodItems(response.data.data.foodItems);
        setReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error.message);
      showToast('Error loading restaurant details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddToCart = async (foodItemId) => {
    const success = await addToCart(foodItemId);
    // Toast is shown in context
  };

  const handleBuyNow = async (foodItemId) => {
    const success = await addToCart(foodItemId);
    if (success) {
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to write a review', 'error');
      return;
    }
    if (!reviewText.trim()) {
      showToast('Please enter your review text', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/reviews', {
        restaurantId: id,
        rating,
        review: reviewText,
      });

      if (response.data.success) {
        showToast('Review submitted successfully!');
        setReviewText('');
        
        // Update local state: insert new review and update restaurant rating & summary
        setReviews((prev) => [response.data.review, ...prev]);
        setRestaurant((prev) => ({
          ...prev,
          rating: response.data.restaurantRating,
          reviewSummary: response.data.restaurantReviewSummary,
        }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return null;

  // Group food items by category
  const categories = foodItems.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* 1. Header Banner */}
      <div 
        className="restaurant-header" 
        style={{ backgroundImage: `url(${restaurant.image})` }}
      >
        <div className="restaurant-header-overlay">
          <div style={styles.headerBadge}>
            <span>{restaurant.cuisine.split(',')[0]}</span>
          </div>
          <h1 style={styles.headerName}>{restaurant.name}</h1>
          <p style={styles.headerAddress}>{restaurant.address}</p>

          <div className="restaurant-meta">
            <div style={styles.metaItem}>
              <Star size={16} fill="#f57c0b" color="#f55d0b" />
              <span style={{ fontWeight: 'bold' }}>{restaurant.rating.toFixed(1)}</span>
              <span style={{ color: '#94a3b8' }}>({reviews.length} reviews)</span>
            </div>
            <div style={styles.metaItem}>
              <Clock size={16} />
              <span>{restaurant.deliveryTime} mins delivery</span>
            </div>
            <div style={styles.metaItem}>
              <Bike size={16} />
              <span>₹{restaurant.deliveryCharge} delivery charge</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      <div className="restaurant-details-grid">
        {/* Left Side: Menu Food Items */}
        <div>
          <h2 style={styles.sectionTitle}>Browse Menu</h2>

          {foodItems.length > 0 ? (
            Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h3 className="food-category-title">{category}</h3>
                <div>
                  {items.map((item) => (
                    <div key={item._id} className="card food-item-row" style={{ backgroundColor: 'var(--bg-secondary)', marginBottom: '16px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="food-item-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="food-item-details">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={styles.foodName}>{item.name}</h4>
                            <span style={styles.foodPrice}>₹{item.price}</span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px', marginBottom: '8px' }}>
                            <VegBadge type={item.type} />
                            <div className="badge badge-rating" style={{ padding: '2px 8px', fontSize: '11px' }}>
                              <Star size={10} fill="#f5690b" color="#f5510b" style={{ marginRight: '2px' }} />
                              <span>{item.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <p style={styles.foodDesc}>{item.description}</p>
                        </div>

                        {(!user || user.role === 'user') && (
                          <div style={styles.actions}>
                            <button className="btn btn-secondary" onClick={() => handleAddToCart(item._id)}>
                              <Plus size={16} />
                              <span>Add to Cart</span>
                            </button>
                            <button className="btn btn-primary" onClick={() => handleBuyNow(item._id)}>
                              Buy Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="card flex-center" style={{ padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No items listed on the menu for this restaurant yet.</p>
            </div>
          )}
        </div>

        {/* Right Side: AI Review Summary & Review Submissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI Review Summary Card */}
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <Sparkles size={20} fill="var(--accent-purple)" />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Review Summary</h3>
            </div>
            
            <p style={{ fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {restaurant.reviewSummary || 'Gathering insights from reviews to generate a summary... Check back in a bit.'}
            </p>
          </div>

          {/* Review Writing Form */}
          {user ? (
            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Submit Your Review</h3>
              
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Your Rating</label>
                  <div style={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={styles.starBtn}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? '#f54d0b' : 'none'}
                          color={star <= rating ? '#f5590b' : 'var(--text-muted)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Review details</label>
                  <textarea
                    rows={4}
                    placeholder="How was the food? Add details about flavor, portion sizes, packaging, or delivery..."
                    className="form-control"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={14} />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '24px', textAlign: 'center' }}>
              <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3>Share your experience</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '8px 0 16px 0' }}>
                Please login to write customer reviews and ratings.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                Go to Login
              </button>
            </div>
          )}

          {/* User Reviews List */}
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Reviews</h3>
            {reviews.length > 0 ? (
              <div style={styles.reviewsList}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.reviewUser}>{rev.userId?.name || 'Anonymous User'}</span>
                      <div className="badge badge-rating" style={{ padding: '1px 6px', fontSize: '10px' }}>
                        <Star size={10} fill="#f5800b" color="#f5490b" style={{ marginRight: '2px' }} />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p style={styles.reviewText}>{rev.review}</p>
                    <span style={styles.reviewDate}>
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  headerBadge: {
    backgroundColor: 'var(--accent-orange)',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    width: 'fit-content',
    marginBottom: '10px',
  },
  headerName: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '800',
  },
  headerAddress: {
    color: '#e2e8f0',
    fontSize: '14px',
    marginTop: '4px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sectionTitle: {
    fontSize: '22px',
    marginBottom: '20px',
    fontWeight: '700',
  },
  foodName: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  foodPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--accent-orange)',
  },
  foodDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  starSelector: {
    display: 'flex',
    gap: '8px',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '350px',
    overflowY: 'auto',
  },
  reviewItem: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUser: {
    fontSize: '14px',
    fontWeight: '600',
  },
  reviewText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  reviewDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '4px',
  },
};

export default RestaurantDetails;
