// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Header = () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo */}
      <div>
        <Link 
          to="/" 
          style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            color: '#007bff'
          }}
        >
          WanderWise
        </Link>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Home</Link>
        <Link to="/booking" style={{ textDecoration: 'none', color: '#333' }}>Book Now</Link>
        
        {/* Conditional rendering based on login status */}
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#666' }}>
              Welcome, {user.name || user.email || 'User'}!
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: '#007bff',
                padding: '8px 16px',
                border: '1px solid #007bff',
                borderRadius: '4px'
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                backgroundColor: '#007bff',
                padding: '8px 16px',
                borderRadius: '4px'
              }}
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;