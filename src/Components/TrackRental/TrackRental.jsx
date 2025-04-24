/*

Shows which customers are renting which DVDs, along with due dates. Can return DVDs from this same page.
Resources: 
    ChatGPT (for refactoring, implementation, explaining to us what the code does)

*/



import React, { useState, useEffect } from 'react';
import '../VideoShoppeUIStyleSheets/TrackRental.css';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import lock_icon from '../Assets/lock_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrackRental = () => {
    const { setState } = useMyContext();
    const navigate = useNavigate();
    
    // State for rentals and UI
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'out', 'overdue', 'returned'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('customer'); // 'customer' or 'title'
    
    const backendUrl = 'http://localhost:5001';

    // Set page title
    useEffect(() => {
        document.title = 'Track Rental';
    }, []);

    // Fetch all rentals on component mount
    useEffect(() => {
        fetchRentals();
    }, []);

    // Apply filters when rentals, filterStatus, searchTerm, or searchBy change
    useEffect(() => {
        applyFilters();
    }, [rentals, filterStatus, searchTerm, searchBy]);

    // Fetch rentals from the API
    const fetchRentals = async () => {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authorization token found');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/rentals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setRentals(response.data.rentals || []);
        } catch (err) {
            console.error('Error fetching rentals:', err);
            setError('Failed to fetch rentals: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Apply filters to the rentals
    const applyFilters = () => {
        let filtered = [...rentals];
        
        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(rental => rental.status === filterStatus);
        }
        
        // Apply search filter
        if (searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            
            if (searchBy === 'customer') {
                filtered = filtered.filter(rental => 
                    rental.customer_name && rental.customer_name.toLowerCase().includes(searchLower)
                );
            } else if (searchBy === 'title') {
                filtered = filtered.filter(rental => 
                    rental.title && rental.title.toLowerCase().includes(searchLower)
                );
            }
        }
        
        setFilteredRentals(filtered);
    };

    // Handle rental return
    const handleReturnRental = async (rentalId) => {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        
        try {
            await axios.put(`${backendUrl}/api/rentals/${rentalId}/return`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh the rentals list
            fetchRentals();
            
        } catch (err) {
            console.error('Error returning rental:', err);
            setError('Failed to return rental: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Check if a rental is overdue
    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0); // Reset time to start of day
        
        return due < today;
    };

    // Handle search term change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search by filter change
    const handleSearchByChange = (e) => {
        setSearchBy(e.target.value);
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    return (
        <div className="container">
            {/* Logout button */}
            <button className='logout' onClick={() => { 
                setState('Logged out'); 
                localStorage.removeItem('token');
                navigate('/login'); 
            }}>
                <img src={lock_icon} alt='Lock' />
            </button>

            <button className="back-button" onClick={() => navigate('/home')}>
                Back
            </button>

            {/* Header */}
            <div className="header">
                <div className="text">Track Rentals</div>
                <div className="underline"></div>
            </div>

            {/* Error/Loading Messages */}
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Loading...</div>}

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-container">
                    <div className="search-filter-row">
                        <select value={searchBy} onChange={handleSearchByChange}>
                            <option value="customer">Customer</option>
                            <option value="title">DVD Title</option>
                        </select>
                        <input
                            type="text"
                            placeholder={`Search by ${searchBy}`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                
                <div className="status-filter">
                    <label>Filter by Status:</label>
                    <select value={filterStatus} onChange={handleStatusFilterChange}>
                        <option value="all">All Rentals</option>
                        <option value="out">Currently Out</option>
                        <option value="overdue">Overdue</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>
                
                <button className="refresh-btn" onClick={fetchRentals}>
                    Refresh List
                </button>
            </div>

            {/* Rentals Table */}
            {filteredRentals.length > 0 ? (
                <div className="rentals-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>DVD Title</th>
                                <th>Rental Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Return Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRentals.map((rental) => {
                                // Check if rental is overdue but status hasn't been updated
                                const overdueStatus = isOverdue(rental.due_date) && rental.status === 'out' ? 'overdue' : rental.status;
                                
                                return (
                                    <tr key={rental.rental_id} className={overdueStatus}>
                                        <td>{rental.customer_name}</td>
                                        <td>{rental.title}</td>
                                        <td>{formatDate(rental.rental_date)}</td>
                                        <td>{formatDate(rental.due_date)}</td>
                                        <td className={`status ${overdueStatus}`}>
                                            {overdueStatus === 'overdue' ? 'OVERDUE' : 
                                             overdueStatus === 'out' ? 'Out' : 'Returned'}
                                        </td>
                                        <td>{formatDate(rental.return_date)}</td>
                                        <td>
                                            {rental.status === 'out' && (
                                                <button 
                                                    className="return-btn"
                                                    onClick={() => handleReturnRental(rental.rental_id)}
                                                >
                                                    Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-rentals">
                    <p>{searchTerm || filterStatus !== 'all' ? 'No rentals match your search criteria' : 'No rentals found'}</p>
                </div>
            )}
        </div>
    );
};

export default TrackRental;