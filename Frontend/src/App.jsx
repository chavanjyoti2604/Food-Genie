import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';

// Protected User Pages
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import AIRecommendations from './pages/AIRecommendations';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Protected Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminFoodItems from './pages/AdminFoodItems';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AppProvider>
      <Router>
        {/* Full-Screen Spinner Loader */}
        <Loader />
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Global Toast Alert container */}
        <Toast />

        {/* Main Content Area */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* Protected Client Routes */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment-success" 
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment-cancel" 
            element={
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <AIRecommendations />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/restaurants" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminRestaurants />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/fooditems" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminFoodItems />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
        </Routes>

        {/* Footer Bar */}
        <Footer />
      </Router>
    </AppProvider>
  );
}

export default App;
