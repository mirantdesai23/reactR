// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="home-container">
      <h1>Welcome, {user.username}!</h1>
      
      <div className="content-section">
        <h2>Access Premium Content</h2>
        <p>
          To access our premium Shiny App features, please complete the payment process.
          Once payment is complete, you'll be redirected to the application.
        </p>
        
        <div className="action-buttons">
          <Link to="/payment" className="payment-link">
            Continue to Payment
          </Link>
        </div>
      </div>
      
      <div className="user-info-section">
        <h3>Your Account Information</h3>
        <div className="user-details">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.attributes?.email || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
