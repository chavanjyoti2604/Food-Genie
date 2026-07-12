import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res?.success) {
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res?.message || 'Login failed.');
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}>
      <div className="card" style={styles.loginCard}>
        <div style={styles.header}>
          <div className="logo" style={{ justifyContent: 'center' }}>
            <span className="text-gradient" style={{ fontSize: '28px' }}>Food GenAI</span>
            <Sparkles size={20} color="var(--accent-pink)" />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Log in to satisfy your cravings</p>
        </div>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            <span>Sign In</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 142, 68, 0.1)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 139, 68, 0.2)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
};

export default Login;
