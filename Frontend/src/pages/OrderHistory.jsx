import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Package, Clock, ShieldCheck, ChevronRight, MapPin } from 'lucide-react';

const OrderHistory = () => {
  const { user, setLoading, showToast } = useApp();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/myorders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      showToast('Error loading order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge-rating'; // Yellowish
      case 'Preparing':
        return 'badge-veg'; // Greenish/teal
      case 'Out For Delivery':
        return 'badge-nonveg'; // Red/Orange-ish
      case 'Delivered':
        return 'badge-veg'; // Green
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 style={{ marginTop: '32px', fontSize: '28px', fontWeight: '800' }}>Your Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Track order status and history</p>

      {orders.length > 0 ? (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={styles.orderCard}>
              {/* Order Header */}
              <div style={styles.orderHeader}>
                <div>
                  <span style={styles.orderId}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  <span style={styles.orderDate}>
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <span className={`badge ${getStatusColorClass(order.status)}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div style={styles.itemsList}>
                {order.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={styles.itemImg}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                      )}
                      <span>
                        {item.name} <strong style={{ color: 'var(--accent-orange)' }}>x{item.quantity}</strong>
                      </span>
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Details */}
              <div style={styles.deliveryDetails}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                <div>
                  <span style={styles.addressTitle}>Delivered To:</span>
                  <p style={styles.addressText}>
                    <strong>{order.address.fullName}</strong> ({order.address.mobile})<br />
                    {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>

              {/* Order Footer */}
              <div style={styles.orderFooter}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Payment: {order.paymentMethod}</span>
                <span style={styles.totalPrice}>
                  Total Paid: <span style={{ color: 'var(--accent-orange)' }}>₹{order.totalAmount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex-center" style={{ padding: '80px 40px', textAlign: 'center', flexDirection: 'column' }}>
          <Package size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px 0' }}>
            When you order, your history will show up here.
          </p>
          <Link to="/" className="btn btn-primary">
            Order Food Now
          </Link>
        </div>
      )}
    </div>
  );
};

const styles = {
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  orderCard: {
    padding: 0,
    backgroundColor: 'var(--bg-secondary)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
  },
  orderId: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  orderDate: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  itemsList: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    marginBottom: '12px',
  },
  itemImg: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
  },
  deliveryDetails: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  addressTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    display: 'block',
  },
  addressText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginTop: '2px',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
  },
  totalPrice: {
    fontSize: '16px',
    fontWeight: '700',
  },
};

export default OrderHistory;
