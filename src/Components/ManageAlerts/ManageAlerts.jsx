import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import { useMyContext } from '../NavigationManager/NavigationManager.jsx';
import { useNavigate } from 'react-router-dom';
import lock_icon from '../Assets/lock_icon.svg';

const ManageAlerts = () => {
  const { setState } = useMyContext();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [formData, setFormData] = useState({ message: '', alert_type: 'info' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = 'http://localhost:5001';

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authorization token found');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/api/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(response.data.alerts || []);
      } catch (err) {
        setError('Error fetching alerts: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authorization token found');
      return;
    }
    try {
      await axios.post(`${backendUrl}/api/alerts`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`${backendUrl}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(response.data.alerts || []);
      setFormData({ message: '', alert_type: 'info' });
    } catch (err) {
      setError('Error saving alert: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleDeleteAlert = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authorization token found');
      return;
    }
    try {
      await axios.delete(`${backendUrl}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter(alert => alert.id !== id));
    } catch (err) {
      setError('Error deleting alert: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    setState('Logged out');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <button className="logout" onClick={handleLogout}>
        <img src={lock_icon} alt="Lock" />
      </button>
      <div className="header">
        <h1>Manage Alerts</h1>
        <div className="underline"></div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      <form onSubmit={handleFormSubmit} className="form-container">
        <h2>Create New Alert</h2>
        <div className="form-group">
          <label>Message</label>
          <input type="text" name="message" value={formData.message} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Alert Type</label>
          <select name="alert_type" value={formData.alert_type} onChange={handleInputChange}>
            <option value="DVD Available">DVD Available</option>
            <option value="Credit Card Invalid">Credit Card Invalid</option>
            <option value="Overdue Late Fees">Overdue Late Fees</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="save-button">Create Alert</button>
      </form>

      {alerts.length > 0 ? (
        <div className="alert-table">
          <table>
            <thead>
              <tr>
                <th>Message</th>
                <th>Alert Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.message}</td>
                  <td>{alert.alert_type}</td>
                  <td>
                    <button onClick={() => handleDeleteAlert(alert.id)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No alerts available</p>
      )}
    </div>
  );
};

export default ManageAlerts;
