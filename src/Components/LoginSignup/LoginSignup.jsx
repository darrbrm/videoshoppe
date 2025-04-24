/* 
This provides a page from which one may log in or sign up. Renders different buttons/field data depending on if one is logging in or signing up.
Resources:  https://www.youtube.com/watch?v=8QgQKRcAUvM,
            ChatGPT for refactoring/debugging/explaining what the code does
*/

import React, { useState } from 'react';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import key_icon from '../Assets/key_icon.svg';
import lock_icon from '../Assets/lock_icon.svg';
import user_icon from '../Assets/user_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const [action, setAction] = useState('Log in'); // renders page according to if log in is desired
  const [username, setUsername] = useState(''); // state trigger for username field
  const [password, setPassword] = useState(''); // state trigger for password field
  const [adminPassword, setAdminPassword] = useState(''); // state trigger for admin password field
  const { setState } = useMyContext(); // context manager, helps React know what page is currently being rendered
  const [error, setError] = useState(''); // error handler
  const [loading, setLoading] = useState(false); // load handler
  const navigate = useNavigate(); // allows for url routing


  const backendUrl = 'http://localhost:5001'; // declares backend url

  // manages submission of credentials for either login or signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = action === 'Log in' ? '/api/login' : '/api/register'; // state is login, if so, set endpoint accordingly, otherwise register
      const payload = action === 'Log in' 
        ? { username, password } //payload for login is username and password
        : { username, password, adminPassword }; //payload for register is new username, new password, admin password
      
      // POST request to server and awaiting data
      const response = await axios.post(`${backendUrl}${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.success) { // if login payload is valid, provide a token and redirect to homepage
        if (action === 'Log in') {
          localStorage.setItem('token', response.data.token);
        }
        setState('Logged in');
        navigate('/home');
      } else {
        setError(response.data.message || 'Login failed.'); // otherwise if credentials are invalid, raise an exception
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.'); // edge cases
    } finally {
      setLoading(false); // end loading
    }
  };
  
// HTML returned by React
  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      
      <form className="inputs" onSubmit={handleSubmit}>
        <div className="input">
          <img src={user_icon} alt="username icon" />
          <input
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={lock_icon} alt="lock icon" />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {action === 'Register Employee' && (
          <div className="input">
            <img src={key_icon} alt="key icon" />
            <input
              placeholder="Administrator Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        <div className="submit-container">
          <button type="submit" className="submit" disabled={loading}>
            {loading ? 'Processing...' : action}
          </button>
          <div
            className="switch-btn"
            onClick={() => setAction(action === 'Log in' ? 'Register Employee' : 'Log in')}
          >
            {action === 'Log in' ? 'Switch to Register' : 'Switch to Login'}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginSignup;
