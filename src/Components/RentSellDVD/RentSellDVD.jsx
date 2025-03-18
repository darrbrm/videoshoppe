import React, { useState, useEffect } from 'react';
import '../RentSellDVD/RentSellDVD.css';
import '../VideoShoppeUIStyleSheets/GenericStyle.css'
import lock_icon from '../Assets/lock_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RentSellDVD = () => {
    const [action, setAction] = useState('Rent / Sell DVD');
    const { setState } = useMyContext();
    const navigate = useNavigate();
    
    // State variables for search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState(null); // Holds the searched customer
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const backendUrl = 'http://localhost:5001'; // Adjust this if needed for your backend

    // Set page title dynamically
    useEffect(() => {
        document.title = 'Rent-Sell-DVD';
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Fetch customer data by name whenever searchTerm changes
    useEffect(() => {
        if (searchTerm.trim() === '') return; // Don't search if the input is empty
        setLoading(true);
        setError('');

        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/customers/search`, {
                    params: { name: searchTerm },
                });
                if (response.data.customer) {
                    setCustomer(response.data.customer); // Assuming response contains the customer object
                } else {
                    setCustomer(null);
                    setError('Customer not found');
                }
            } catch (err) {
                setError('Customer not found');
                setCustomer(null); // Reset customer if error occurs
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [searchTerm]); // Re-run the effect when searchTerm changes

    return (
        <div className="container">
            {/* Logout button */}
            <button className='logout' onClick={() => { 
                setState('Logged out'); 
                localStorage.removeItem('authState'); // Clear auth on logout
                navigate('/login'); 
            }}>
                <img src={lock_icon} alt='Lock' />
            </button>

            {/* Header */}
            <div className="header">
                <div className="text">Rent / Sell DVD</div>
                <div className="underline"></div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <label>Search Customer by Name</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Enter customer name"
                />
            </div>

            {/* Display loading or error messages */}
            {loading && <div className="loading-message">Loading...</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Display customer information if found */}
            {customer && !loading && !error && (
                <div className="customer-details">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
                    <p><strong>Birthday:</strong> {customer.birthdate}</p>
                    <p><strong>Phone Number:</strong> {customer.phone_number}</p>
                    <p><strong>Home Address:</strong> {customer.home_address}</p>
                    <p><strong>Credit Card:</strong> {customer.credit_card_number}</p>
                    <p><strong>Outstanding Rentals:</strong> {customer.outstanding_rentals}</p>
                    <p><strong>Due Dates:</strong> {customer.due_dates.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export default RentSellDVD;