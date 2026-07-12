import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2, AlertCircle, Calendar, MapPin, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';

const getBg = (isDark) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  background: isDark
    ? 'linear-gradient(rgba(10,10,10,0.92), rgba(18,18,18,0.95)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed'
    : 'linear-gradient(rgba(255,255,255,0.88), rgba(255,248,245,0.92)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80&auto=format&fit=crop") center/cover fixed',
});

const getCardStyle = (isDark) => ({
  background: isDark
    ? 'linear-gradient(160deg, rgba(22,11,3,0.98) 0%, rgba(12,6,2,0.98) 100%)'
    : 'rgba(255,255,255,0.95)',
  borderRadius: '28px',
  padding: '40px',
  maxWidth: '550px',
  width: '100%',
  border: `1px solid ${isDark ? 'rgba(252, 120, 25, 0.15)' : 'rgba(252, 104, 25, 0.08)'}`,
  boxShadow: isDark ? '0 20px 80px rgba(0, 0, 0, 0.5)' : '0 20px 80px rgba(252, 85, 25, 0.08)',
  textAlign: 'center',
});

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, showToast, theme } = useApp();
  const isDark = theme === 'dark';

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const verifiedRef = useRef(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Stripe payment session token is missing.');
      return;
    }

    const verifyPayment = async () => {
      if (verifiedRef.current) return;
      verifiedRef.current = true;
      try {
        const response = await axios.post('/api/payment/verify', { sessionId });
        if (response.data.success) {
          setOrder(response.data.data);
          setStatus('success');
          showToast('Payment verified & order placed!', 'success');
          await clearCart();
        } else {
          setStatus('error');
          setErrorMessage(response.data.message || 'Payment verification failed.');
        }
      } catch (error) {
        console.error('Stripe payment verification error:', error);
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Server error occurred during payment verification.');
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, showToast]);

  const primaryColor = '#fc7819';
  const primaryGrad = `linear-gradient(135deg, ${primaryColor}, #e05210)`;

  if (status === 'verifying') {
    return (
      <div style={getBg(isDark)}>
        <div style={getCardStyle(isDark)}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: isDark ? 'rgba(252,128,25,0.1)' : 'rgba(252,128,25,0.05)', marginBottom: '24px' }}>
            <Loader2 className="animate-spin" size={48} color={primaryColor} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '12px' }}>
            Verifying Your Payment
          </h2>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '15px', lineHeight: 1.5 }}>
            Please wait a moment while we confirm your transaction details with Stripe. Do not refresh or close this window.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={getBg(isDark)}>
        <div style={getCardStyle(isDark)}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', marginBottom: '24px' }}>
            <AlertCircle size={48} color="#ef7d44" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '12px' }}>
            Verification Problem
          </h2>
          <p style={{ color: '#ef7544', fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
            {errorMessage}
          </p>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>
            If you believe your payment was deducted, please take a screenshot of your Stripe receipt and contact support with the Session ID below:<br />
            <code style={{ fontSize: '12px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', display: 'inline-block', wordBreak: 'break-all' }}>{sessionId}</code>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/checkout" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Return to Checkout
            </Link>
            <Link to="/" style={{ color: isDark ? '#fff' : '#1A1A2E', textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginTop: '8px' }}>
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={getBg(isDark)}>
      <div style={getCardStyle(isDark)}>
        {/* Success Icon */}
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: isDark ? 'rgba(252,128,25,0.1)' : 'rgba(252,128,25,0.05)', marginBottom: '24px' }}>
          <CheckCircle2 size={56} color={primaryColor} />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '900', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Payment Successful!
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '15px', marginBottom: '32px' }}>
          Thank you! Your order has been placed successfully and is being prepared.
        </p>

        {/* Order Details box */}
        {order && (
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Order Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>Order ID:</span>
                <span style={{ fontWeight: '700', color: isDark ? '#fff' : '#1A1A2E' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}><CreditCard size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />Payment Status:</span>
                <span style={{ fontWeight: '700', color: '#10B981' }}>Paid via Stripe</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}><MapPin size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />Deliver to:</span>
                <span style={{ fontWeight: '700', color: isDark ? '#fff' : '#1A1A2E', maxWidth: '220px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.address.street}, {order.address.city}
                </span>
              </div>
              
              <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
                <span style={{ color: isDark ? '#fff' : '#1A1A2E' }}>Total Paid:</span>
                <span style={{ color: primaryColor }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/orders" className="btn btn-primary" style={{
            background: primaryGrad,
            border: 'none',
            padding: '14px',
            borderRadius: '16px',
            color: '#fff',
            fontWeight: '800',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            boxShadow: `0 4px 18px rgba(252, 104, 25, 0.3)`
          }}>
            <ShoppingBag size={18} />
            View Order Status
            <ArrowRight size={16} />
          </Link>
          
          <Link to="/" style={{
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            padding: '10px',
            marginTop: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
          onMouseLeave={(e) => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}>
            Order More Food
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
