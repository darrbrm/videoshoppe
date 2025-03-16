import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Inventory/Inventory.css'; // Correct path to the CSS file
import { useMyContext } from '../NavigationManager/NavigationManager.jsx';

const Inventory = () => {
  const { setState } = useMyContext();

  const [dvds, setDvds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    director: '',
    actors: '',
    release_year: '',
    quantity: 0,
    price: 0,
    available: true,
    requested_count: 0,
  });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const backendUrl = 'http://localhost:5001'; // Ensure your backend is running at this URL

  useEffect(() => {
    const fetchDvds = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authorization token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/dvds`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDvds(response.data.dvds || []);
      } catch (err) {
        setError('Error fetching inventory: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDvds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    if (!formData.title || !formData.genre || !formData.director) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authorization token found');
      return;
    }

    try {
      if (isCreating) {
        await axios.post(`${backendUrl}/api/dvds`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get(`${backendUrl}/api/dvds`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDvds(response.data.dvds || []);
      } else {
        await axios.put(`${backendUrl}/api/dvds/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get(`${backendUrl}/api/dvds`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDvds(response.data.dvds || []);
      }
      setIsCreating(false);
      setFormData({
        title: '',
        genre: '',
        director: '',
        actors: '',
        release_year: '',
        quantity: 0,
        price: 0,
        available: true,
        requested_count: 0,
      });
    } catch (err) {
      setError('Error saving DVD: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleRowClick = (dvd) => {
    setIsCreating(false);
    setFormData(dvd);
  };

  const handleDeleteDvd = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authorization token found');
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/dvds/${formData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axios.get(`${backendUrl}/api/dvds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDvds(response.data.dvds || []);

      setIsCreating(false);
      setFormData({
        title: '',
        genre: '',
        director: '',
        actors: '',
        release_year: '',
        quantity: 0,
        price: 0,
        available: true,
        requested_count: 0,
      });
    } catch (err) {
      setError('Error deleting DVD: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const handleCreateNewDvd = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      genre: '',
      director: '',
      actors: '',
      release_year: '',
      quantity: 0,
      price: 0,
      available: true,
      requested_count: 0,
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Inventory Management</h1>
        <div className="underline"></div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      {(isCreating || formData.id) && (
        <form onSubmit={handleFormSubmit} className="form-container">
          <h2>{formData.id ? 'Edit DVD' : 'Create New DVD'}</h2>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Director</label>
            <input type="text" name="director" value={formData.director} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Actors</label>
            <input type="text" name="actors" value={formData.actors} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Release Year</label>
            <input type="number" name="release_year" value={formData.release_year} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Available</label>
            <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Requested Count</label>
            <input type="number" name="requested_count" value={formData.requested_count} onChange={handleInputChange} />
          </div>
          <button type="submit" className="save-button">{formData.id ? 'Update DVD' : 'Create DVD'}</button>
          {formData.id && (
            <button type="button" onClick={handleDeleteDvd} className="delete-button">
              Delete DVD
            </button>
          )}
        </form>
      )}

      {dvds.length > 0 ? (
        <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Genre</th>
              <th>Director</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {dvds.map((dvd) => (
              <tr key={dvd.id} onClick={() => handleRowClick(dvd)}>
                <td>{dvd.title}</td>
                <td>{dvd.genre}</td>
                <td>{dvd.director}</td>
                <td>{dvd.quantity}</td>
                <td>${dvd.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        <p>No DVDs available in the inventory</p>
      )}

      <button onClick={handleCreateNewDvd} className="create-new-inventory-item">Create New DVD</button>
    </div>
  );
};

export default Inventory;
