import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Bike, Tag, Shield } from 'lucide-react';

const getBg = (isDark: boolean): React.CSSProperties => ({
  background: isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed',
  minHeight: '100vh',
});

const getCardStyle = (isDark: boolean): React.CSSProperties => ({
  background: isDark
    ? 'linear-gradient(160deg, rgba(22,11,3,0.97) 0%, rgba(14,7,2,0.97) 100%)'
    : '#ffffff',
  borderRadius: '20px',
  padding: '20px',
  border: `1px solid ${isDark ? 'rgba(252, 120, 25, 0.12)' : 'rgba(252, 120, 25, 0.08)'}`,
  boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(252, 108, 25, 0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap' as const,
});

const Cart = () => {
  const { user, cart, fetchCart, updateCartItem, removeFromCart, showToast, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleQuantityChange = async (foodItemId: string, currentQty: number, amount: number) => {
    const newQty = currentQty + amount;
    await updateCartItem(foodItemId, newQty);
  };

  const handleRemove = async (foodItemId: string) => {
    await removeFromCart(foodItemId);
  };

  const subtotal = cart?.items?.reduce((sum: number, item: any) => sum + (item.foodItemId?.price || 0) * item.quantity, 0) || 0;
  const deliveryCharge = cart?.items?.length > 0 ? (cart.items[0].foodItemId?.restaurantId?.deliveryCharge || 0) : 0;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryCharge + gst;

  const primaryGrad = 'linear-gradient(135deg, #fc7019, #e05210)';
  const primaryShadow = '0 6px 24px rgba(252, 104, 25, 0.4)';

  if (!user) {
    return (
      <div style={getBg(isDark)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{
            textAlign: 'center', padding: '60px 40px',
            background: isDark
              ? 'linear-gradient(160deg, rgba(22,11,3,0.98) 0%, rgba(12,6,2,0.98) 100%)'
              : 'rgba(255,255,255,0.92)',
            borderRadius: '28px', border: `1px solid ${isDark ? 'rgba(252, 120, 25, 0.2)' : 'rgba(252, 104, 25, 0.12)'}`,
            boxShadow: isDark ? '0 40px 80px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(252, 131, 25, 0.06)',
            maxWidth: '420px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #fc7419, #e04e10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(252, 97, 25, 0.4)',
            }}>
              <ShoppingBag size={36} color="#fff" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '8px' }}>
              Your cart is waiting
            </h2>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '28px', lineHeight: 1.6 }}>
              Please log in to add delicious items and view your cart.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: primaryGrad,
              color: '#fff', textDecoration: 'none', borderRadius: '16px',
              padding: '13px 28px', fontSize: '15px', fontWeight: '800',
              boxShadow: primaryShadow,
            }}>
              Log In to Continue <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={getBg(isDark)}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '44px 28px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '14px',
              background: primaryGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(252, 101, 25, 0.4)',
            }}>
              <ShoppingBag size={20} color="#fff" />
            </div>
            <h1 style={{
              fontSize: '36px', fontWeight: '900',
              background: 'linear-gradient(135deg, #fc8e19, #e05210)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              letterSpacing: '-1px',
            }}>Your Shopping Cart</h1>
          </div>
          {cart?.items?.length > 0 && (
            <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: '14px', marginLeft: '54px' }}>
              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} ready to order
            </p>
          )}
        </div>

        {cart?.items?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'flex-start' }}>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item: any) => {
                const food = item.foodItemId;
                if (!food) return null;
                return (
                  <div key={item._id} style={getCardStyle(isDark)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 16px 48px rgba(0,0,0,0.4)' : '0 16px 48px rgba(252,128,25,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(252,128,25,0.06)'; }}>
                    {/* Food Image */}
                    <img
                      src={food.image} alt={food.name}
                      style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                      onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'; }}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', lineHeight: 1.2, marginBottom: '4px' }}>{food.name}</h3>
                      <p style={{ fontSize: '12px', color: '#fc6119', fontWeight: '600' }}>from {food.restaurantId?.name || 'Restaurant'}</p>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', marginTop: '4px', display: 'block' }}>₹{food.price} each</span>
                    </div>

                    {/* Qty Controls */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderRadius: '12px', padding: '4px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      <button
                        onClick={() => handleQuantityChange(food._id, item.quantity, -1)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      ><Minus size={14} /></button>
                      <span style={{ width: '28px', textAlign: 'center', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', fontSize: '15px' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(food._id, item.quantity, 1)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: 'none', background: primaryGrad, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(252,128,25,0.4)' }}
                      ><Plus size={14} /></button>
                    </div>

                    {/* Line Total */}
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#fc6819' }}>₹{food.price * item.quantity}</span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(food._id)}
                      style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(239, 125, 68, 0.25)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    ><Trash2 size={15} /></button>
                  </div>
                );
              })}

              {/* Continue Shopping */}
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
                padding: '10px 20px', borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(252, 123, 25, 0.06)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(252, 112, 25, 0.15)'}`,
                color: isDark ? 'rgba(255,255,255,0.6)' : '#fc6819',
                textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                marginTop: '4px',
              }}>
                + Add More Items
              </Link>
            </div>

            {/* Bill Summary */}
            <div style={{
              background: isDark
                ? 'linear-gradient(160deg, rgba(22,11,3,0.98) 0%, rgba(12,6,2,0.98) 100%)'
                : '#ffffff',
              borderRadius: '24px', padding: '28px',
              border: `1px solid ${isDark ? 'rgba(252, 138, 25, 0.2)' : 'rgba(252, 85, 25, 0.1)'}`,
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(252,128,25,0.06)',
              position: 'sticky', top: '24px',
            }}>
              <h2 style={{
                fontSize: '18px', fontWeight: '800',
                color: isDark ? '#fff' : '#1A1A2E',
                marginBottom: '24px', paddingBottom: '16px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              }}>
                Bill Details
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Item Subtotal', value: `₹${subtotal}`, icon: Tag },
                  { label: 'Delivery Partner Fee', value: `₹${deliveryCharge}`, icon: Bike },
                  { label: 'Taxes & GST (5%)', value: `₹${gst}`, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={14} color="#fc5219" />
                      <span style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontWeight: '500' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{
                marginTop: '20px', padding: '16px 20px',
                background: isDark ? 'rgba(252,128,25,0.12)' : 'rgba(252,128,25,0.06)',
                borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(252, 101, 25, 0.25)' : 'rgba(252,128,25,0.15)'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>Total To Pay</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#fc6519' }}>₹{grandTotal}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%', marginTop: '20px', padding: '15px',
                  background: primaryGrad,
                  color: '#fff', border: 'none', borderRadius: '16px',
                  fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                  boxShadow: primaryShadow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(252,128,25,0.55)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = primaryShadow; }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              {/* Safety note */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
                <Shield size={12} color="rgba(252, 123, 25, 0.6)" />
                <span style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0,0,0,0.3)', fontWeight: '600' }}>
                  Secure checkout · 100% safe payments
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '100px 40px', textAlign: 'center',
            background: isDark
              ? 'linear-gradient(160deg, rgba(22,11,3,0.97) 0%, rgba(14,7,2,0.97) 100%)'
              : '#ffffff',
            borderRadius: '28px', border: `1px solid ${isDark ? 'rgba(252,128,25,0.12)' : 'rgba(252,128,25,0.06)'}`,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(252,128,25,0.04)',
          }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '28px', marginBottom: '24px',
              background: 'linear-gradient(135deg, #fc7019, #e05910)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(252, 93, 25, 0.4)',
            }}>
              <ShoppingBag size={40} color="#fff" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '8px' }}>
              Your cart is empty
            </h3>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '28px', fontSize: '15px' }}>
              Browse restaurants and add delicious items to your cart.
            </p>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: primaryGrad,
              color: '#fff', textDecoration: 'none', borderRadius: '16px',
              padding: '13px 28px', fontSize: '15px', fontWeight: '800',
              boxShadow: primaryShadow,
            }}>
              Explore Restaurants <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
