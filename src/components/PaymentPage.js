// src/components/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe outside of component render to avoid recreating the Stripe object
// Get publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const PaymentForm = ({ onSuccess, shinyAppUrl, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet. Make sure to disable form submission until Stripe.js has loaded
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Call backend API to create a payment intent
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 2000, // $20.00
          currency: 'usd',
          userId: user?.username,
          email: user?.attributes?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: shinyAppUrl,
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`.
      if (error) {
        setErrorMessage(error.message);
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (error) {
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-row">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || loading} 
        className="payment-button"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

// Main Payment Page Component
const PaymentPage = ({ shinyAppUrl, user }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 2000, // $20.00
            currency: 'usd',
            userId: user?.username,
            email: user?.attributes?.email
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        setError(error.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      createPaymentIntent();
    }
  }, [user]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    // Additional logic can be added here, such as updating the user's subscription status
  };

  if (paymentComplete) {
    return (
      <div className="payment-success">
        <h2>Payment Successful!</h2>
        <p>Redirecting to application...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-loading">
        <h2>Preparing Payment...</h2>
        <p>Please wait while we set up your payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>
      <p>Please provide your payment details to continue to the application.</p>
      
      {clientSecret && (
        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0570de',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'Ideal Sans, system-ui, sans-serif',
                borderRadius: '4px',
              },
            },
          }}
        >
          <PaymentForm 
            onSuccess={handlePaymentSuccess} 
            shinyAppUrl={shinyAppUrl || process.env.REACT_APP_SHINY_APP_URL} 
            user={user}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentPage;
