import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, Clock, Bike, Heart } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(restaurant._id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(restaurant._id);
  };

  return (
    <Link to={`/restaurant/${restaurant._id}`} className="card" style={styles.cardLink}>
      {/* Image container */}
      <div style={styles.imageContainer}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={styles.image}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';
          }}
        />
        {/* Heart Icon for Favorites */}
        <button
          style={styles.favBtn}
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart
            size={18}
            fill={isFavorite ? 'var(--accent-red)' : 'none'}
            color={isFavorite ? 'var(--accent-red)' : '#ffffff'}
          />
        </button>
      </div>

      {/* Meta Content */}
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <h3 style={styles.name}>{restaurant.name}</h3>
          <div className="badge badge-rating">
            <Star size={12} fill="#f5ab0b" color="#f5610b" style={{ marginRight: '4px' }} />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <p style={styles.cuisine}>{restaurant.cuisine}</p>

        {/* Deliver charges and time */}
        <div style={styles.footerRow}>
          <div style={styles.metaItem}>
            <Clock size={14} color="var(--text-muted)" />
            <span>{restaurant.deliveryTime} mins</span>
          </div>
          <div style={styles.metaItem}>
            <Bike size={14} color="var(--text-muted)" />
            <span>₹{restaurant.deliveryCharge} delivery</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  cardLink: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    cursor: 'pointer',
  },
  imageContainer: {
    position: 'relative',
    height: '180px',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform var(--transition-smooth)',
  },
  favBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'transform var(--transition-fast)',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  cuisine: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
};

export default RestaurantCard;
