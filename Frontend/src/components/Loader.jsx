import React from 'react';
import { useApp } from '../context/AppContext';

const Loader = () => {
  const { loading } = useApp();

  if (!loading) return null;

  return (
    <div style={styles.overlay}>
      <div className="spinner"></div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
};

export default Loader;
