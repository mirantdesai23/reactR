// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import PaymentPage from './components/PaymentPage';
import Home from './components/Home';

// Import AWS Amplify configuration
import awsconfig from './aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

// Define the Shiny App URL that we'll redirect to after payment
const SHINY_APP_URL = 'https://test.mirant.info';

function App({ signOut, user }) {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="app-title">Your Application</div>
          <button onClick={signOut} className="sign-out-button">Sign out</button>
        </header>

        <Routes>
          {/* Home route - protected by authentication */}
          <Route 
            path="/" 
            element={<Home user={user} />} 
          />
          
          {/* Payment route - protected by authentication */}
          <Route 
            path="/payment" 
            element={<PaymentPage shinyAppUrl={SHINY_APP_URL} />} 
          />
          
          {/* Redirect to home for undefined routes */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

// Wrap the App component with the withAuthenticator HOC
export default withAuthenticator(App);
