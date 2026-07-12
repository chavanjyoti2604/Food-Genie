import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set initial axios token before app renders to prevent race conditions during page mount transitions
const initialToken = localStorage.getItem('token') || '';
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load initial states from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });

  const [cart, setCart] = useState({ items: [] });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'; // Default to dark mode for premium look
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem('favorites');
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set default axios headers whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync theme with body class and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch cart details on user login
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user, token]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Theme action
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Favorites action
  const toggleFavorite = (restaurantId) => {
    let updated;
    if (favorites.includes(restaurantId)) {
      updated = favorites.filter((id) => id !== restaurantId);
      showToast('Removed from favorites', 'info');
    } else {
      updated = [...favorites, restaurantId];
      showToast('Added to favorites', 'success');
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Auth Action: Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { success, token: userToken, ...userData } = response.data;
      
      if (success) {
        // Set header synchronously before updates propagate to pages
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        showToast(`Welcome back, ${userData.name}!`);
        return { success: true, role: userData.role };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Auth Action: Register
  const register = async (name, email, mobile, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, email, mobile, password });
      const { success, token: userToken, ...userData } = response.data;

      if (success) {
        // Set header synchronously before updates propagate to pages
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        showToast('Registration successful! Welcome.');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Auth Action: Logout
  const logout = () => {
    // Delete header synchronously
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setUser(null);
    setCart({ items: [] });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showToast('Logged out successfully');
  };

  // Auth Action: Update Profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      const { success, token: userToken, ...userData } = response.data;

      if (success) {
        if (userToken) {
          // Set header synchronously before updates propagate to pages
          axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
          setToken(userToken);
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        showToast('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Cart Action: Fetch
  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error.message);
    }
  };

  // Cart Action: Add
  const addToCart = async (foodItemId, quantity = 1) => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return false;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/cart/add', { foodItemId, quantity });
      if (response.data.success) {
        setCart(response.data.data);
        showToast('Item added to cart');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add item';
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cart Action: Update Quantity
  const updateCartItem = async (foodItemId, quantity) => {
    try {
      const response = await axios.put('/api/cart/update', { foodItemId, quantity });
      if (response.data.success) {
        setCart(response.data.data);
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update cart';
      showToast(msg, 'error');
      return false;
    }
  };

  // Cart Action: Remove Item
  const removeFromCart = async (foodItemId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/cart/remove/${foodItemId}`);
      if (response.data.success) {
        setCart(response.data.data);
        showToast('Item removed from cart', 'info');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cart Action: Clear
  const clearCart = async () => {
    try {
      const response = await axios.delete('/api/cart/clear');
      if (response.data.success) {
        setCart(response.data.data);
        return true;
      }
    } catch (error) {
      console.error('Failed to clear cart:', error.message);
    }
  };

  // Axios response interceptor for 401 unauthorized (session expired/invalid signature)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
          showToast('Session expired or unauthorized. Please login again.', 'error');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        cart,
        theme,
        favorites,
        toasts,
        loading,
        setLoading,
        toggleTheme,
        toggleFavorite,
        showToast,
        login,
        register,
        logout,
        updateProfile,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
