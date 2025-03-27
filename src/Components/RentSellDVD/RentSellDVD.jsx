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
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New state for creating a customer
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        first_name: '',
        last_name: '',
        birthdate: '',
        credit_card_number: '',
        credit_card_expiry: '',
        credit_card_cvc: '',
        home_address: '',
        phone_number: ''
    });

    const backendUrl = 'http://localhost:5001';

    // Set page title dynamically
    useEffect(() => {
        document.title = 'Rent-Sell-DVD';
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Fetch customer data by name
    useEffect(() => {
        if (searchTerm.trim() === '') return;
        setLoading(true);
        setError('');

        const fetchCustomer = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/customers/search`, {
                    params: { name: searchTerm },
                });
                if (response.data.customer) {
                    setCustomer(response.data.customer);
                } else {
                    setCustomer(null);
                    setError('Customer not found');
                }
            } catch (err) {
                setError('Customer not found');
                setCustomer(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [searchTerm]);

    // Handle input changes for new customer form
    const handleNewCustomerChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({
            ...prev,
            [name]: value
        }));
    };

   // Submit new customer form
const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await axios.post(
            `${backendUrl}/api/customers/create`, 
            newCustomer,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // If the response includes the newly created customer, use it directly
        if (response.data.customer) {
            setCustomer(response.data.customer);
        } else {
            // If not, search for the customer with a slightly longer delay
            setTimeout(() => {
                axios.get(`${backendUrl}/api/customers/search`, {
                    params: { name: `${newCustomer.first_name}` } // Using just first name for broader search
                })
                .then(response => {
                    if (response.data.customer) {
                        setCustomer(response.data.customer);
                    }
                })
                .catch(err => {
                    console.error('Delayed search error:', err);
                });
            }, 1000); // Increased to 1000ms delay
        }
        
        // Reset form
        setNewCustomer({
            first_name: '',
            last_name: '',
            birthdate: '',
            credit_card_number: '',
            credit_card_expiry: '',
            credit_card_cvc: '',
            home_address: '',
            phone_number: ''
        });
        setShowCreateForm(false);
        
    } catch (err) {
        console.error('Error creating customer:', err);
        setError('Failed to create customer. Please check your inputs.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="container">
            {/* Logout button */}
            <button className='logout' onClick={() => { 
                setState('Logged out'); 
                localStorage.removeItem('authState');
                navigate('/login'); 
            }}>
                <img src={lock_icon} alt='Lock' />
            </button>

            {/* Header */}
            <div className="header">
                <div className="text">Rent / Sell DVD</div>
                <div className="underline"></div>
            </div>

            {/* Create New Customer Button */}
            <button 
                className="create-customer-btn" 
                onClick={() => setShowCreateForm(!showCreateForm)}
            >
                {showCreateForm ? 'Cancel' : 'Create New Customer'}
            </button>

            {/* Create New Customer Form */}
            {showCreateForm && (
                <form onSubmit={handleCreateCustomer} className="create-customer-form">
                    <h3>Create New Customer</h3>
                    <div className="form-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={newCustomer.first_name}
                            onChange={handleNewCustomerChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={newCustomer.last_name}
                            onChange={handleNewCustomerChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Birthdate</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={newCustomer.birthdate}
                            onChange={handleNewCustomerChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={newCustomer.phone_number}
                            onChange={handleNewCustomerChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Home Address</label>
                        <input
                            type="text"
                            name="home_address"
                            value={newCustomer.home_address}
                            onChange={handleNewCustomerChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Credit Card Number</label>
                        <input
                            type="text"
                            name="credit_card_number"
                            value={newCustomer.credit_card_number}
                            onChange={handleNewCustomerChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Credit Card Expiry</label>
                        <input
                            type="date"
                            name="credit_card_expiry"
                            value={newCustomer.credit_card_expiry}
                            onChange={handleNewCustomerChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Credit Card CVC</label>
                        <input
                            type="text"
                            name="credit_card_cvc"
                            value={newCustomer.credit_card_cvc}
                            onChange={handleNewCustomerChange}
                            maxLength="3"
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Create Customer
                    </button>
                </form>
            )}

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