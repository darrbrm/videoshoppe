import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Inventory/Inventory.css'; 
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import { useMyContext } from '../NavigationManager/NavigationManager.jsx';
import { useNavigate } from 'react-router-dom';
import lock_icon from '../Assets/lock_icon.svg'; // Assuming you want to use the same lock icon

const Inventory = () => {
  const { setState } = useMyContext();
  const navigate = useNavigate();

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('genre'); // Default search by genre

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const filteredDvds = dvds.filter((dvd) => {
    if (searchTerm === '') return true;
    if (searchBy === 'genre' && dvd.genre.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    if (searchBy === 'director' && dvd.director.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    if (searchBy === 'actors' && dvd.actors.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    return false;
  });

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

  const handleLogout = () => {
    setState('Logged out');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      {/* Logout Button */}
      <button className="logout" onClick={handleLogout}>
        <img src={lock_icon} alt="Lock" />
      </button>

      <div className="header">
        <h1>Inventory Management</h1>
        <div className="underline"></div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      {/* Search Section */}
      <div className="search-section">
        <label>Search by</label>
        <select value={searchBy} onChange={handleSearchByChange}>
          <option value="genre">Genre</option>
          <option value="director">Director</option>
          <option value="actors">Actors</option>
        </select>
        <input
          type="text"
          placeholder={`Search by ${searchBy}`}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

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

      {filteredDvds.length > 0 ? (
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
              {filteredDvds.map((dvd) => (
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
