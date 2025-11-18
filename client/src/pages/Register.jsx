// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const BASE_URL = import.meta.env.VITE_APP_API_URL; // http://localhost:8000
const API_URL = `${BASE_URL}/api`;

function Register({ setToken }) {
 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Register
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       
        body: JSON.stringify({ username, email, password }), 
      });
      
      let data = await res.json();
      if (!res.ok) {
       
        const errorMsg = data.message || (data.errors ? data.errors[0].msg : 'Signup failed');
        throw new Error(errorMsg);
      }
      
      // Step 2: Auto-login after successful registration
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      data = await loginRes.json();
      if (!loginRes.ok) throw new Error(data.message || 'Auto-login failed');
      
      setToken(data.token); // Update token in App.jsx
      navigate('/'); // Go to dashboard
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md">
        <div className="mb-8 text-center">
          {/* ... (Header icon) ... */}
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-300">Start organizing your life</p>
        </div>

        <form onSubmit={handleSignUp}>
          <div className="space-y-4">
            
            {/* 5. FIXED: Username Input Field Added */}
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-12"
                placeholder="Enter your username"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-12"
                placeholder="Enter your email"
              />
              {/* ... (email icon) ... */}
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pl-12"
                placeholder="Enter your password (min. 6 chars)"
              />
              {/* ... (password icon) ... */}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
              {error}
            </div>
          )}



          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl font-semibold shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium ml-1 transition-colors">
              Sign In

            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;