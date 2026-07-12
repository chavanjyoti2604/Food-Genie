import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Bike, ShieldCheck, CreditCard, Sparkles, Tag, Shield, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

const getBg = (isDark) => ({
  minHeight: '100vh',
  background: isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed',
});

const getInputStyle = (isDark) => ({
  width: '100%', padding: '11px 14px', fontSize: '14px',
  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
  borderRadius: '12px', color: isDark ? '#f9fafb' : '#1A1A2E',
  outline: 'none', boxSizing: 'border-box',
});

const getLabelStyle = (isDark) => ({
  display: 'block', fontSize: '11px', fontWeight: '800',
  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
  marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.8px',
});

const getCardStyle = (isDark) => ({
  background: isDark
    ? 'linear-gradient(160deg, rgba(22,11,3,0.98) 0%, rgba(12,6,2,0.98) 100%)'
    : 'rgba(255,255,255,0.92)',
  borderRadius: '24px', padding: '28px',
  border: `1px solid ${isDark ? 'rgba(252,128,25,0.15)' : 'rgba(252,128,25,0.08)'}`,
  boxShadow: isDark ? '0 16px 60px rgba(0,0,0,0.4)' : '0 16px 60px rgba(252,128,25,0.06)',
});

const Checkout = () => {
  const { user, cart, clearCart, showToast, setLoading, theme } = useApp();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (cart?.items?.length === 0) { navigate('/cart'); return; }
  }, [user, cart, navigate]);

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.foodItemId?.price || 0) * item.quantity, 0) || 0;
  const deliveryCharge = cart?.items?.length > 0 ? (cart.items[0].foodItemId?.restaurantId?.deliveryCharge || 0) : 0;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryCharge + gst;

  const primaryColor = '#fc8719';
  const primaryDark = '#e06010';
  const primaryGrad = `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`;
  const primaryShadow = `0 6px 28px rgba(252, 63, 25, 0.4)`;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !mobile || !street || !city || !state || !pincode) {
      showToast('Please fill out all address details', 'error'); return;
    }
    setLoading(true);
    try {
      const orderItems = cart.items
        .filter((item) => item.foodItemId)
        .map((item) => ({
          foodItemId: item.foodItemId._id,
          name: item.foodItemId.name,
          price: item.foodItemId.price,
          quantity: item.quantity,
          image: item.foodItemId.image,
        }));

      if (orderItems.length === 0) {
        showToast('No valid items in the cart to check out', 'error');
        return;
      }

      const orderData = {
        items: orderItems,
        totalAmount: grandTotal,
        deliveryCharge,
        address: { fullName, mobile, street, city, state, pincode },
        paymentMethod,
      };

      if (paymentMethod === 'Stripe') {
        const response = await axios.post('/api/payment/create-checkout-session', {
          items: orderItems,
          deliveryCharge,
          address: { fullName, mobile, street, city, state, pincode },
        });
        if (response.data.success) {
          if (response.data.url) {
            // Direct redirect to Stripe-hosted checkout URL (most reliable)
            window.location.href = response.data.url;
          } else {
            // Fallback redirect using Stripe SDK and publishable key
            const { sessionId } = response.data;
            const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
            const stripe = await stripePromise;
            if (stripe) {
              const { error } = await stripe.redirectToCheckout({ sessionId });
              if (error) {
                showToast(error.message || 'Stripe redirect failed', 'error');
              }
            } else {
              showToast('Failed to load Stripe SDK', 'error');
            }
          }
        }
        return;
      }

      const response = await axios.post('/api/orders', orderData);
      if (response.data.success) {
        showToast('Order placed successfully!');
        await clearCart();
        navigate('/orders');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = getInputStyle(isDark);
  const labelStyle = getLabelStyle(isDark);
  const cardStyle = getCardStyle(isDark);

  const inputFocusProps = {
    onFocus: (e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(252,128,25,0.15)`; },
    onBlur: (e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; },
  };

  return (
    <div style={getBg(isDark)}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '44px 28px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{
            fontSize: '38px', fontWeight: '900',
            background: primaryGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: '8px',
          }}>Checkout Details</h1>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', fontSize: '14px' }}>
            Almost there — confirm your address and place your order!
          </p>
        </div>

        {/* Steps progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          {[{ label: 'Cart', done: true }, { label: 'Address', done: false }, { label: 'Payment', done: false }, { label: 'Confirm', done: false }].map((step, i) => (
            <React.Fragment key={step.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: step.done || i === 1 ? primaryGrad : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '900',
                  color: step.done || i === 1 ? '#fff' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
                  boxShadow: step.done || i === 1 ? `0 2px 10px rgba(252, 116, 25, 0.4)` : 'none',
                }}>{step.done ? <CheckCircle2 size={12} /> : i + 1}</div>
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: step.done || i === 1 ? primaryColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
                }}>{step.label}</span>
              </div>
              {i < 3 && <div style={{ height: '1px', width: '24px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'flex-start' }}>

          {/* Left: Address + Payment */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Delivery Address Card */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px', paddingBottom: '18px',
                borderBottom: `1px solid ${isDark ? 'rgba(252,128,25,0.12)' : 'rgba(252,128,25,0.08)'}`,
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '14px',
                  background: primaryGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px rgba(252, 78, 25, 0.4)`,
                }}>
                  <Bike size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>Delivery Address</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px' }}>Where should we deliver?</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={labelStyle}><User size={10} style={{ display: 'inline', marginRight: '4px' }} />Recipient Name</label>
                    <input type="text" style={inputStyle} placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required {...inputFocusProps} />
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={labelStyle}><Phone size={10} style={{ display: 'inline', marginRight: '4px' }} />Contact Number</label>
                    <input type="tel" style={inputStyle} placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required {...inputFocusProps} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}><MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />Street Address</label>
                  <input type="text" style={inputStyle} placeholder="Flat / House No., Area, Landmark" value={street} onChange={(e) => setStreet(e.target.value)} required {...inputFocusProps} />
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={labelStyle}>City</label>
                    <input type="text" style={inputStyle} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required {...inputFocusProps} />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={labelStyle}>State</label>
                    <input type="text" style={inputStyle} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required {...inputFocusProps} />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={labelStyle}>Pincode</label>
                    <input type="text" style={inputStyle} placeholder="6-digit" value={pincode} onChange={(e) => setPincode(e.target.value)} required {...inputFocusProps} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Card */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px', paddingBottom: '18px',
                borderBottom: `1px solid ${isDark ? 'rgba(252, 70, 25, 0.12)' : 'rgba(252, 101, 25, 0.08)'}`,
              }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '14px',
                  background: isDark ? 'rgba(252, 89, 25, 0.15)' : 'rgba(252, 82, 25, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${isDark ? 'rgba(252, 93, 25, 0.25)' : 'rgba(252, 85, 25, 0.15)'}`,
                }}>
                  <CreditCard size={20} color={primaryColor} />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>Payment Option</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px' }}>Choose how you'd like to pay</div>
                </div>
              </div>

              {/* COD Option */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 18px', borderRadius: '16px', cursor: 'pointer',
                background: paymentMethod === 'COD'
                  ? (isDark ? 'rgba(252, 97, 25, 0.1)' : 'rgba(252, 127, 25, 0.06)')
                  : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'),
                border: paymentMethod === 'COD'
                  ? `1.5px solid ${isDark ? 'rgba(252, 104, 25, 0.5)' : 'rgba(252, 89, 25, 0.4)'}`
                  : `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                marginBottom: '12px', transition: 'all 0.2s',
              }}>
                <input
                  type="radio" name="paymentMethod" value="COD"
                  checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')}
                  style={{ accentColor: primaryColor, width: '16px', height: '16px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: isDark ? '#fff' : '#1A1A2E', fontSize: '14px' }}>Cash On Delivery (COD)</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px' }}>Pay cash or scan QR code at delivery.</div>
                </div>
                {paymentMethod === 'COD' && (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: primaryGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={13} color="#fff" />
                  </div>
                )}
              </label>

              {/* Stripe Option */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 18px', borderRadius: '16px', cursor: 'pointer',
                background: paymentMethod === 'Stripe'
                  ? (isDark ? 'rgba(252, 44, 25, 0.1)' : 'rgba(252,128,25,0.06)')
                  : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.02)'),
                border: paymentMethod === 'Stripe'
                  ? `1.5px solid ${isDark ? 'rgba(252, 55, 25, 0.5)' : 'rgba(252, 85, 25, 0.4)'}`
                  : `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'all 0.2s',
              }}>
                <input
                  type="radio" name="paymentMethod" value="Stripe"
                  checked={paymentMethod === 'Stripe'} onChange={() => setPaymentMethod('Stripe')}
                  style={{ accentColor: primaryColor, width: '16px', height: '16px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: isDark ? '#fff' : '#1A1A2E', fontSize: '14px' }}>Stripe Online Payment</div>
                  <div style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '2px' }}>Pay securely with your credit/debit card.</div>
                </div>
                {paymentMethod === 'Stripe' && (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: primaryGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={13} color="#fff" />
                  </div>
                )}
              </label>
            </div>
          </form>

          {/* Right: Order Summary */}
          <div style={{
            ...cardStyle,
            border: `1px solid ${isDark ? 'rgba(252, 104, 25, 0.2)' : 'rgba(252, 82, 25, 0.08)'}`,
            position: 'sticky', top: '24px',
          }}>
            <h2 style={{
              fontSize: '18px', fontWeight: '800',
              color: isDark ? '#fff' : '#1A1A2E',
              marginBottom: '20px', paddingBottom: '16px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
            }}>
              Order Review
            </h2>

            {/* Items list */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              maxHeight: '200px', overflowY: 'auto',
              paddingBottom: '16px', marginBottom: '16px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            }}>
              {cart?.items?.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <img
                      src={item.foodItemId?.image} alt={item.foodItemId?.name}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{
                      fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
                      fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.foodItemId?.name}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: primaryColor, flexShrink: 0 }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', flexShrink: 0 }}>
                    ₹{(item.foodItemId?.price || 0) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Subtotal', value: `₹${subtotal}`, icon: Tag },
                { label: 'Delivery Fee', value: `₹${deliveryCharge}`, icon: Bike },
                { label: 'GST & Taxes (5%)', value: `₹${gst}`, icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Icon size={13} color={primaryColor} />
                    <span style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', fontWeight: '500' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div style={{
              margin: '20px 0',
              padding: '16px 20px',
              background: isDark ? 'rgba(252, 104, 25, 0.12)' : 'rgba(252,128,25,0.06)',
              borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(252, 93, 25, 0.25)' : 'rgba(252, 63, 25, 0.15)'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E' }}>Grand Total</span>
              <span style={{ fontSize: '26px', fontWeight: '900', color: primaryColor }}>₹{grandTotal}</span>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              style={{
                width: '100%', padding: '15px',
                background: primaryGrad,
                color: '#fff', border: 'none', borderRadius: '16px',
                fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                boxShadow: primaryShadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 36px rgba(252, 97, 25, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = primaryShadow;
              }}
            >
              <ShieldCheck size={18} />
              {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Proceed to Payment (Stripe)'}
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Sparkles, label: 'Fresh Food' },
                { icon: Bike, label: 'Fast Delivery' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon size={11} color={primaryColor} />
                  <span style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontWeight: '600' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
