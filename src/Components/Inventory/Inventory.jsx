import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inventory.css'; 
import { useMyContext } from '../NavigationManager/NavigationManager.jsx';

const Inventory = () => { 
  const { setState } = useMyContext();

  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    director: '',
    actors: '',
    release_year: '',
    quantity: 0,
    price: 0,
    available: true,
    requested_count: 0
  });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('title'); // Default search by title

  const backendUrl = 'http://localhost:5001';

  useEffect(() => {
    // This will be implemented later when connecting to the backend
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Sample data for visual demonstration
      setInventory([
        {
          id: 1,
          title: 'The Shawshank Redemption',
          genre: 'Drama',
          director: 'Frank Darabont',
          actors: 'Tim Robbins, Morgan Freeman',
          release_year: '1994',
          quantity: 5,
          price: 9.99,
          available: true,
          requested_count: 2
        },
        {
          id: 2,
          title: 'The Godfather',
          genre: 'Crime, Drama',
          director: 'Francis Ford Coppola',
          actors: 'Marlon Brando, Al Pacino',
          release_year: '1972',
          quantity: 3,
          price: 8.99,
          available: true,
          requested_count: 1
        }
      ]);
    }, 1000);
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

    // This will be implemented later when connecting to the backend
    if (isCreating) {
      const newDVD = {
        ...formData,
        id: inventory.length + 1
      };
      setInventory([...inventory, newDVD]);
    } else {
      const updatedInventory = inventory.map(dvd => 
        dvd.id === formData.id ? formData : dvd
      );
      setInventory(updatedInventory);
    }

    // Reset form
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
      requested_count: 0
    });
  };

  const handleRowClick = (dvd) => {
    setIsCreating(false);
    setFormData(dvd);
  };

  const handleBackToHome = () => {
    setState('Logged in');
  };

  const handleDeleteDVD = () => {
    // This will be implemented later when connecting to the backend
    const updatedInventory = inventory.filter(dvd => dvd.id !== formData.id);
    setInventory(updatedInventory);

    // Reset form
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
      requested_count: 0
    });
  };

  const handleCreateNewDVD = () => {
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
      requested_count: 0
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchCategoryChange = (e) => {
    setSearchCategory(e.target.value);
  };

  // Filter the inventory based on search query and category
  const filteredInventory = inventory.filter(dvd => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    switch(searchCategory) {
      case 'title':
        return dvd.title.toLowerCase().includes(query);
      case 'genre':
        return dvd.genre.toLowerCase().includes(query);
      case 'director':
        return dvd.director.toLowerCase().includes(query);
      case 'actors':
        return dvd.actors.toLowerCase().includes(query);
      default:
        return true;
    }
  });

  return (
    <div className="container">
      <div className="header">
        <h1>DVD Inventory</h1> 
        <div className="underline"></div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      {/* Search Section */}
      <div className="search-container">
        <select 
          className="search-category" 
          value={searchCategory} 
          onChange={handleSearchCategoryChange}
        >
          <option value="title">Title</option>
          <option value="genre">Genre</option>
          <option value="director">Director</option>
          <option value="actors">Actors</option>
        </select>
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={searchQuery} 
          onChange={handleSearchChange} 
          className="search-input"
        />
      </div>

      {(isCreating || formData.id) && (
        <form onSubmit={handleFormSubmit} className="form-container">
          <h2>{formData.id ? 'Edit DVD' : 'Add New DVD'}</h2>
          <div className="form-group">
            <label>Title*</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Genre*</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Director*</label>
            <input type="text" name="director" value={formData.director} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Actors</label>
            <input type="text" name="actors" value={formData.actors} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Release Year</label>
            <input type="text" name="release_year" value={formData.release_year} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Available</label>
            <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Requested Count</label>
            <input type="number" name="requested_count" value={formData.requested_count} onChange={handleInputChange} />
          </div>
          <button type="submit" className="save-button">
            {formData.id ? 'Update DVD' : 'Add DVD'}
          </button>
          {formData.id && (
            <button type="button" onClick={handleDeleteDVD} className="delete-button">
              Delete DVD
            </button>
          )}
        </form>
      )}

      {filteredInventory.length > 0 ? (
        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Director</th>
                <th>Actors</th>
                <th>Release Year</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Available</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((dvd) => (
                <tr key={dvd.id} onClick={() => handleRowClick(dvd)}>
                  <td>{dvd.title}</td>
                  <td>{dvd.genre}</td>
                  <td>{dvd.director}</td>
                  <td>{dvd.actors}</td>
                  <td>{dvd.release_year}</td>
                  <td>{dvd.quantity}</td>
                  <td>${dvd.price.toFixed(2)}</td>
                  <td>{dvd.available ? 'Yes' : 'No'}</td>
                  <td>{dvd.requested_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No DVDs available in inventory</p>
      )}

      <div className="back-home-button-container">
        <button className="back-to-home" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>

      <div className="create-new-employee-button-container">
        <button className="create-new-employee" onClick={handleCreateNewDVD}>
          Add New DVD
        </button>
      </div>
    </div>
  );
};

export default Inventory; 