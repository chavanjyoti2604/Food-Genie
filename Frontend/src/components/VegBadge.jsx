import React from 'react';

const VegBadge = ({ type }) => {
  const isVeg = type?.toLowerCase() === 'veg';

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.borderBox,
        borderColor: isVeg ? 'var(--accent-green)' : 'var(--accent-red)'
      }}>
        <div style={{
          ...styles.innerCircle,
          backgroundColor: isVeg ? 'var(--accent-green)' : 'var(--accent-red)'
        }}></div>
      </div>
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: isVeg ? 'var(--accent-green)' : 'var(--accent-red)'
      }}>
        {isVeg ? 'Veg' : 'Non-Veg'}
      </span>
    </div>
  );
};

const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  borderBox: {
    width: '14px',
    height: '14px',
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '3px',
    padding: '2px',
  },
  innerCircle: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  }
};

export default VegBadge;
