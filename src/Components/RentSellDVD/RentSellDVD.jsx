/*

Fulfills the use case of customer wanting to purchase or rent a dvd. Allows for new customers to be entered into the system.
Resources: 
    ChatGPT (for refactoring, implementation, explaining to us what the code does)

*/

import React, { useState, useEffect } from 'react';
import '../RentSellDVD/RentSellDVD.css';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import lock_icon from '../Assets/lock_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RentSellDVD = () => {
    const { setState } = useMyContext();
    const navigate = useNavigate();
    
    // Customer search states
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Transaction states
    const [transactionStep, setTransactionStep] = useState('customer-search'); // customer-search, dvd-selection, transaction-details, transaction-complete
    const [selectedDvd, setSelectedDvd] = useState(null);
    const [transactionType, setTransactionType] = useState(''); // 'rent' or 'sell'
    const [dueDate, setDueDate] = useState('');
    const [transactionComplete, setTransactionComplete] = useState(false);
    
    // DVD inventory states (reused from Inventory component)
    const [dvds, setDvds] = useState([]);
    const [dvdSearchTerm, setDvdSearchTerm] = useState('');
    const [dvdSearchBy, setDvdSearchBy] = useState('title');
    
    // New customer form state
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

    // Fetch DVDs from the inventory when in DVD selection mode
    useEffect(() => {
        if (transactionStep === 'dvd-selection') {
            fetchDvds();
        }
    }, [transactionStep]);

    // Fetch DVD inventory
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

    // Handle customer search input change
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

    // Handle DVD search input change
    const handleDvdSearchChange = (e) => {
        setDvdSearchTerm(e.target.value);
    };

    // Handle search-by filter change for DVDs
    const handleDvdSearchByChange = (e) => {
        setDvdSearchBy(e.target.value);
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
                        params: { name: `${newCustomer.first_name}` }
                    })
                    .then(response => {
                        if (response.data.customer) {
                            setCustomer(response.data.customer);
                        }
                    })
                    .catch(err => {
                        console.error('Delayed search error:', err);
                    });
                }, 1000);
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

    // Filter DVDs based on search term
    const filteredDvds = dvds.filter((dvd) => {
        if (dvdSearchTerm === '') return true;
        if (dvdSearchBy === 'title' && dvd.title.toLowerCase().includes(dvdSearchTerm.toLowerCase())) return true;
        if (dvdSearchBy === 'genre' && dvd.genre.toLowerCase().includes(dvdSearchTerm.toLowerCase())) return true;
        if (dvdSearchBy === 'director' && dvd.director.toLowerCase().includes(dvdSearchTerm.toLowerCase())) return true;
        if (dvdSearchBy === 'actors' && dvd.actors && dvd.actors.toLowerCase().includes(dvdSearchTerm.toLowerCase())) return true;
        return false;
    });

    // Set minimum due date to tomorrow
    const getMinDueDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Handle selecting a customer
    const handleSelectCustomer = () => {
        if (customer) {
            setTransactionStep('dvd-selection');
        }
    };

    // Handle selecting a DVD from inventory
    const handleSelectDvd = (dvd) => {
        setSelectedDvd(dvd);
        
        // Calculate if the DVD is over a year old
        const currentYear = new Date().getFullYear();
        const isOverOneYearOld = dvd.release_year && (currentYear - dvd.release_year > 1);
        
        // If it's over a year old, automatically set transaction type to 'sell'
        if (isOverOneYearOld) {
          setTransactionType('sell');
        } else {
          // Reset transaction type if selecting a different DVD
          setTransactionType('');
        }
        
        setTransactionStep('transaction-details');
      };

    // Process the transaction (rent or sell)
    const handleProcessTransaction = async () => {
        if (!selectedDvd || !transactionType) {
            setError('Please select a transaction type');
            return;
        }
        
        if (transactionType === 'rent' && !dueDate) {
            setError('Please set a due date for rental');
            return;
        }
        
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            // Update DVD inventory (decrement quantity)
            const updatedDvd = {
                ...selectedDvd,
                quantity: selectedDvd.quantity - 1,
                available: selectedDvd.quantity > 1
            };
            
            await axios.put(`${backendUrl}/api/dvds/${selectedDvd.id}`, updatedDvd, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // For rentals, update customer's outstanding_rentals and due_dates
            if (transactionType === 'rent') {
                // Get the latest customer data to ensure we have the most current values
                const customerResponse = await axios.get(`${backendUrl}/api/customers/${customer.customer_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const currentCustomer = customerResponse.data.customer;
                
                // Calculate new outstanding_rentals value
                const newOutstandingRentals = (currentCustomer.outstanding_rentals || 0) + 1;
                
                // Handle due_dates array
                let dueDatesArray = [];
                
                // Parse existing due_dates if any
                if (currentCustomer.due_dates) {
                    // Handle JSON string case
                    if (typeof currentCustomer.due_dates === 'string') {
                        try {
                            dueDatesArray = JSON.parse(currentCustomer.due_dates);
                        } catch (e) {
                            // If it's not valid JSON but is a string, treat it as a single date
                            dueDatesArray = [currentCustomer.due_dates];
                        }
                    } else if (Array.isArray(currentCustomer.due_dates)) {
                        // Already an array, clone it
                        dueDatesArray = [...currentCustomer.due_dates];
                    }
                }
                
                // Add new due date
                dueDatesArray.push(dueDate);
                
                // Create updated customer object
                const updatedCustomer = {
                    ...currentCustomer,
                    outstanding_rentals: newOutstandingRentals,
                    due_dates: JSON.stringify(dueDatesArray)
                };
                
                // Update customer in database
                await axios.put(`${backendUrl}/api/customers/${customer.customer_id}`, updatedCustomer, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Create a new rental record for tracking
                const rentalRecord = {
                    customer_id: customer.customer_id,
                    dvd_id: selectedDvd.id,
                    rental_date: new Date().toISOString().split('T')[0],
                    due_date: dueDate,
                    return_date: null,
                    status: 'out',
                    title: selectedDvd.title, // Store title for easier lookup
                    customer_name: `${customer.first_name} ${customer.last_name}` // Store name for easier lookup
                };
                
                // Save the rental record to database
                await axios.post(`${backendUrl}/api/rentals`, rentalRecord, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Update local customer state to reflect changes
                setCustomer({
                    ...customer,
                    outstanding_rentals: newOutstandingRentals,
                    due_dates: dueDatesArray
                });
                
                console.log('Rental transaction processed', {
                    customerId: customer.customer_id,
                    dvdId: selectedDvd.id,
                    dueDate
                });
            } else {
                // For sales, just log the transaction
                console.log('Sale transaction processed', {
                    customerId: customer.customer_id,
                    dvdId: selectedDvd.id
                });
            }
            
            setTransactionComplete(true);
            setTransactionStep('transaction-complete');
            
        } catch (err) {
            console.error('Error processing transaction:', err);
            setError('Failed to process transaction: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Handle going back to previous step
    const handleBack = () => {
        if (transactionStep === 'dvd-selection') {
            setTransactionStep('customer-search');
        } else if (transactionStep === 'transaction-details') {
            setTransactionStep('dvd-selection');
            setSelectedDvd(null);
        }
    };

    // Reset the entire transaction flow
    const handleNewTransaction = () => {
        setCustomer(null);
        setSelectedDvd(null);
        setTransactionType('');
        setDueDate('');
        setTransactionComplete(false);
        setTransactionStep('customer-search');
        setSearchTerm('');
        setDvdSearchTerm('');
    };

    // Generate a receipt for the transaction
    const handlePrintReceipt = () => {
        const receiptWindow = window.open('', '_blank');
        
        const transactionTypeText = transactionType === 'rent' ? 'Rental' : 'Purchase';
        const dueDateText = transactionType === 'rent' ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : '';
        
        receiptWindow.document.write(`
            <html>
                <head>
                    <title>Video Shoppe - Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; }
                        h1 { text-align: center; }
                        .receipt { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
                        .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        .footer { border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; }
                        .item { margin-bottom: 10px; }
                        .total { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>Video Shoppe</h1>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Transaction:</strong> DVD ${transactionTypeText}</p>
                            <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name}</p>
                        </div>
                        
                        <div class="item">
                            <p><strong>Title:</strong> ${selectedDvd.title}</p>
                            <p><strong>Genre:</strong> ${selectedDvd.genre}</p>
                            <p><strong>Director:</strong> ${selectedDvd.director}</p>
                            ${dueDateText}
                        </div>
                        
                        <div class="footer">
                            <p class="total"><strong>Total Amount:</strong> $${selectedDvd.price}</p>
                            <p>Thank you for your business!</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        
        receiptWindow.document.close();
        receiptWindow.print();
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


            {/* Header */}
            <div className="header">
                <div className="text">Rent / Sell DVD</div>
                <div className="underline"></div>
            </div>

            {/* Error/Loading Messages */}
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Loading...</div>}

            {/* Customer Search/Selection Step */}
            {transactionStep === 'customer-search' && (
                <div className="customer-section">
                    {/* Create New Customer Button */}
                    <button 
                        className="create-new-customer"
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

                    {/* Display customer information if found */}
                    {customer && !loading && !error && (
                        <div className="customer-details">
                            <h3>Customer Information</h3>
                            <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
                            <p><strong>Birthday:</strong> {customer.birthdate || 'N/A'}</p>
                            <p><strong>Phone Number:</strong> {customer.phone_number || 'N/A'}</p>
                            <p><strong>Home Address:</strong> {customer.home_address || 'N/A'}</p>
                            <p><strong>Credit Card:</strong> {customer.credit_card_number ? '****' + customer.credit_card_number.slice(-4) : 'N/A'}</p>
                            <p><strong>Outstanding Rentals:</strong> {customer.outstanding_rentals || 0}</p>
                            {customer.due_dates && customer.due_dates.length > 0 && (
                                <p><strong>Due Dates:</strong> {Array.isArray(customer.due_dates) ? customer.due_dates.join(', ') : customer.due_dates}</p>
                            )}
                            
                            <button 
                                className="select-customer-btn" 
                                onClick={handleSelectCustomer}
                            >
                                Continue with this Customer
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* DVD Selection Step */}
            {transactionStep === 'dvd-selection' && (
                <div className="dvd-selection-section">
                    <button className="back-button" onClick={handleBack}>
                        &larr; Back to Customer Selection
                    </button>
                    
                    <h3>Select DVD for {customer.first_name} {customer.last_name}</h3>
                    
                    {/* DVD Search Section */}
                    <div className="search-section">
                        <label>Search DVDs</label>
                        <div className="search-filter-row">
                            <select value={dvdSearchBy} onChange={handleDvdSearchByChange}>
                                <option value="title">Title</option>
                                <option value="genre">Genre</option>
                                <option value="director">Director</option>
                                <option value="actors">Actors</option>
                            </select>
                            <input
                                type="text"
                                placeholder={`Search by ${dvdSearchBy}`}
                                value={dvdSearchTerm}
                                onChange={handleDvdSearchChange}
                            />
                        </div>
                    </div>
                    
                    {/* DVD Table */}
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
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDvds.map((dvd) => (
                                        <tr key={dvd.id}>
                                            <td>{dvd.title}</td>
                                            <td>{dvd.genre}</td>
                                            <td>{dvd.director}</td>
                                            <td>{dvd.quantity}</td>
                                            <td>${dvd.price}</td>
                                            <td>{dvd.available ? 'Available' : 'Unavailable'}</td>
                                            <td>
                                                <button 
                                                    className="select-dvd-btn" 
                                                    onClick={() => handleSelectDvd(dvd)}
                                                    disabled={!dvd.available || dvd.quantity <= 0}
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No DVDs match your search criteria</p>
                    )}
                </div>
            )}

            {/* Transaction Details Step */}
            {transactionStep === 'transaction-details' && selectedDvd && (
                <div className="transaction-details-section">
                    <button className="back-button" onClick={handleBack}>
                        &larr; Back to DVD Selection
                    </button>
                    
                    <h3>Transaction Details</h3>
                    
                    <div className="transaction-info">
                        <div className="customer-summary">
                            <h4>Customer</h4>
                            <p>{customer.first_name} {customer.last_name}</p>
                            <p>{customer.phone_number || 'No phone'}</p>
                        </div>
                        
                        <div className="dvd-summary">
                            <h4>Selected DVD</h4>
                            <p><strong>Title:</strong> {selectedDvd.title}</p>
                            <p><strong>Genre:</strong> {selectedDvd.genre}</p>
                            <p><strong>Release Year:</strong> {selectedDvd.release_year}</p>
                            <p><strong>Price:</strong> ${selectedDvd.price}</p>
                            
                            {/* Show a note if the DVD is over a year old */}
                            {selectedDvd.release_year && (new Date().getFullYear() - selectedDvd.release_year > 1) && (
                                <p className="age-restriction-note">
                                    * This DVD is over a year old and can only be sold, not rented.
                                </p>
                            )}
                        </div>
                        
                        <div className="transaction-type">
                            <h4>Transaction Type</h4>
                            <div className="transaction-buttons">
                                <button 
                                    className={`transaction-type-btn ${transactionType === 'rent' ? 'selected' : ''}`}
                                    onClick={() => setTransactionType('rent')}
                                    disabled={selectedDvd.release_year && (new Date().getFullYear() - selectedDvd.release_year > 1)}
                                >
                                    Rent
                                </button>
                                <button 
                                    className={`transaction-type-btn ${transactionType === 'sell' ? 'selected' : ''}`}
                                    onClick={() => setTransactionType('sell')}
                                >
                                    Sell
                                </button>
                            </div>
                        </div>
                        
                        {transactionType === 'rent' && (
                            <div className="due-date-section">
                                <h4>Due Date</h4>
                                <input 
                                    type="date" 
                                    min={getMinDueDate()} 
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                                <p className="note">* Items are due back by closing time on the date selected</p>
                            </div>
                        )}
                        
                        <button 
                            className="process-transaction-btn"
                            onClick={handleProcessTransaction}
                            disabled={!transactionType || (transactionType === 'rent' && !dueDate)}
                        >
                            Complete Transaction
                        </button>
                    </div>
                </div>
            )}

            {/* Transaction Complete Step */}
            {transactionStep === 'transaction-complete' && transactionComplete && (
                <div className="transaction-complete-section">
                    <h3>Transaction Completed Successfully!</h3>
                    
                    <div className="transaction-summary">
                        <p><strong>Customer:</strong> {customer.first_name} {customer.last_name}</p>
                        <p><strong>DVD:</strong> {selectedDvd.title}</p>
                        <p><strong>Transaction Type:</strong> {transactionType === 'rent' ? 'Rental' : 'Sale'}</p>
                        {transactionType === 'rent' && <p><strong>Due Date:</strong> {new Date(dueDate).toLocaleDateString()}</p>}
                        <p><strong>Amount:</strong> ${selectedDvd.price}</p>
                    </div>
                    
                    <div className="action-buttons">
                        <button className="print-receipt-btn" onClick={handlePrintReceipt}>
                            Print Receipt
                        </button>
                        <button className="new-transaction-btn" onClick={handleNewTransaction}>
                            New Transaction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentSellDVD;