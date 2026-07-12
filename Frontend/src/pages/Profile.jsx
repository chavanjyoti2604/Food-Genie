import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, MapPin, KeyRound, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, showToast, setLoading } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  
  // Address
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');

  // Password Update
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state if context user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setPincode(user.address?.pincode || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const updateData = {
      name,
      email,
      mobile,
      address: {
        street,
        city,
        state,
        pincode,
      },
    };

    if (password) {
      updateData.password = password;
    }

    const res = await updateProfile(updateData);
    if (res?.success) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingBottom: '80px', maxWidth: '900px' }}>
      <h1 style={{ marginTop: '32px', fontSize: '28px', fontWeight: '800' }}>My Profile</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Manage your account settings and address details</p>

      <div style={styles.profileGrid}>
        {/* Left Side: Summary Card */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="card text-center" style={styles.summaryCard}>
            <div style={styles.avatar}>
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: '20px', marginTop: '16px' }}>{name}</h2>
            <span className="badge badge-veg" style={{ marginTop: '6px', textTransform: 'uppercase' }}>
              {user.role} Account
            </span>

            <div style={styles.summaryInfo}>
              <div style={styles.infoRow}>
                <Mail size={16} color="var(--text-muted)" />
                <span>{email}</span>
              </div>
              <div style={styles.infoRow}>
                <Phone size={16} color="var(--text-muted)" />
                <span>{mobile}</span>
              </div>
              {street && (
                <div style={styles.infoRow}>
                  <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span style={{ textAlign: 'left' }}>
                    {street}, {city}, {state} - {pincode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Edit Account Details</h3>
            
            <form onSubmit={handleUpdate}>
              <h4 style={styles.subHeading}>Basic Information</h4>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              <h4 style={styles.subHeading}>Delivery Address</h4>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street / Flat / Apartment"
                />
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <h4 style={styles.subHeading}>Change Password (Optional)</h4>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 chars"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  profileGrid: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  summaryCard: {
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  summaryInfo: {
    width: '100%',
    marginTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  subHeading: {
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--accent-orange)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginTop: '24px',
    marginBottom: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
};

export default Profile;
