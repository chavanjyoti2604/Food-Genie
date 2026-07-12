import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';
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
  maxWidth: '500px',
  width: '100%',
  border: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)'}`,
  boxShadow: isDark ? '0 20px 80px rgba(0,0,0,0.5)' : '0 20px 80px rgba(239,68,68,0.05)',
  textAlign: 'center',
});

const PaymentCancel = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const primaryColor = '#fc9619';
  const primaryGrad = `linear-gradient(135deg, ${primaryColor}, #e06710)`;

  return (
    <div style={getBg(isDark)}>
      <div style={getCardStyle(isDark)}>
        {/* Cancel Icon */}
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', marginBottom: '24px' }}>
          <XCircle size={56} color="#ef9444" />
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: '900', color: isDark ? '#fff' : '#1A1A2E', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.5 }}>
          Your transaction was cancelled and you were not charged. Your food items are still saved in your cart. You can retry the payment or select another option.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/checkout" className="btn btn-primary" style={{
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
            boxShadow: `0 4px 18px rgba(252, 120, 25, 0.3)`
          }}>
            <RefreshCw size={18} />
            Retry Checkout
          </Link>
          
          <Link to="/cart" style={{
            color: isDark ? '#fff' : '#1A1A2E',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            padding: '12px',
            border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <ShoppingBag size={16} />
            View Shopping Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
