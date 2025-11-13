import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// This component protects your private pages
// It checks if a user is logged in (has a token)
// If not, it redirects them to the /login page

function ProtectedRoute({ token, children }) {
  const location = useLocation();

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // If logged in, render the child component (e.g., Dashboard)
}

export default ProtectedRoute;