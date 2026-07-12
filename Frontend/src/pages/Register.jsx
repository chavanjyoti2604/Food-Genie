import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Lock, Sparkles, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, user } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    const res = await register(name, email, mobile, password);
    if (res?.success) {
      navigate('/');
    } else {
      setErrorMsg(res?.message || 'Registration failed.');
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}>
      <div className="card" style={styles.registerCard}>
        <div style={styles.header}>
          <div className="logo" style={{ justifyContent: 'center' }}>
            <span className="text-gradient" style={{ fontSize: '28px' }}>Food GenAI</span>
            <Sparkles size={20} color="var(--accent-pink)" />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create an account to get started</p>
        </div>

        {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

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
            <label>Mobile Number</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} style={styles.inputIcon} />
              <input
                type="tel"
                className="form-control"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            <span>Register</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  registerCard: {
    width: '100%',
    maxWidth: '450px',
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
    backgroundColor: 'rgba(239, 168, 68, 0.1)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(239, 125, 68, 0.2)',
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

export default Register;
