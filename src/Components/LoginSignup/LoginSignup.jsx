import React, { useState } from 'react';
import './LoginSignup.css';
import key_icon from '../Assets/key_icon.svg';
import lock_icon from '../Assets/lock_icon.svg';
import user_icon from '../Assets/user_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const [action, setAction] = useState('Log in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { setState } = useMyContext();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // Use navigate for redirection

  const backendUrl = 'http://localhost:5001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (action === 'Log in') {
        response = await axios.post(`${backendUrl}/api/login`, { username, password });
      } else {
        response = await axios.post(`${backendUrl}/api/register`, { username, password, adminPassword });
      }

      if (response.data.success) {
        // Store token in localStorage after successful login
        if (action === 'Log in') {
          localStorage.setItem('token', response.data.token);  // Store the token
        }
        setState('Logged in');
        navigate('/manage-employees');  // Redirect to the manage employees page
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
