import React, { useState } from 'react';
import './LoginSignup.css';
import key_icon from '../Assets/key_icon.svg';
import lock_icon from '../Assets/lock_icon.svg';
import user_icon from '../Assets/user_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import axios from 'axios';

const LoginSignup = () => {
  const [action, setAction] = useState('Log in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { setState } = useMyContext();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state

  // Backend URL (make sure it's correct for your environment)
  const backendUrl = 'http://localhost:5001';  // Adjust this as needed

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent form from refreshing the page
    setError('');  // Reset error state
    setLoading(true);  // Set loading state to true

    try {
      let response;

      if (action === 'Log in') {
        // Sending a POST request for login
        response = await axios.post(`${backendUrl}/api/login`, { username, password });
        if (response.data.success) {
          setState('Logged in');
          console.log('Login successful');
        } else {
          setError(response.data.message);
        }
      } else if (action === 'Register Employee') {
        // Sending a POST request for registration
        response = await axios.post(`${backendUrl}/api/register`, { username, password, adminPassword });
        if (response.data.success) {
          console.log('Registration successful');
          setState('Logged in');
        } else {
          setError(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error during request:', error);
      setError('An error occurred, please try again later.');
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      {/* Form for input fields */}
      <form className="inputs" onSubmit={handleSubmit}>
        <div className="input">
          <img src={user_icon} alt="username icon" />
          <input
            placeholder="Username"
            type="text"
            value={username}  // Bind state
            onChange={(e) => setUsername(e.target.value)}  // Update state on input change
          />
        </div>

        <div className="input">
          <img src={lock_icon} alt="lock icon" />
          <input
            placeholder="Password"
            type="password"
            value={password}  // Bind state
            onChange={(e) => setPassword(e.target.value)}  // Update state on input change
          />
        </div>

        {action === 'Register Employee' && (
          <div className="input">
            <img src={key_icon} alt="key icon" />
            <input
              placeholder="Administrator Password"
              type="password"
              value={adminPassword}  // Bind state
              onChange={(e) => setAdminPassword(e.target.value)}  // Update state on input change
            />
          </div>
        )}

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        <div className="submit-container">
          <button type="submit" className={action === 'Register Employee' ? 'submit gray' : 'submit'} disabled={loading}>
            {loading ? 'Processing...' : action === 'Log in' ? 'Login Employee' : 'Register Employee'}
          </button>

          <div
            className={action === 'Log in' ? 'submit gray' : 'submit'}
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
