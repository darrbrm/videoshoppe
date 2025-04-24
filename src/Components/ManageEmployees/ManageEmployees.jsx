/*

Allows admins only to perform CRUD manipulations on the employee data. Makes requests to middleware which processes backend requests via HTTP.
Resources: ChatGPT (for refactoring, implementation, explaining to us what the code does)

*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../VideoShoppeUIStyleSheets/ManageEmployees.css';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import { useMyContext } from '../NavigationManager/NavigationManager.jsx';
import { useNavigate } from 'react-router-dom';
import lock_icon from '../Assets/lock_icon.svg';

const ManageEmployees = () => {
  const { setState } = useMyContext(); // sets the context, telling react what page to render
  const navigate = useNavigate();  // allows url navigation

// JSON data for employee information
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone_number: '',
    full_time: false,
    hours_worked: 0,
    isAdmin: false
  });
  const [error, setError] = useState(''); // error handling
  const [isCreating, setIsCreating] = useState(false); // renders the form based on whether the admin wants to create a new employee
  const [loading, setLoading] = useState(false); // page loading

  const backendUrl = 'http://localhost:5001'; // declaring backend url

// loads page after verifying token
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authorization token found');
        setLoading(false);
        return;
      }
// returns all employee data after verifying token, viewed as a table
      try {
        const response = await axios.get(`${backendUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data.employees || []); // returns an empty list if the employees table is empty
      } catch (err) { 
        setError('Error fetching employees'); // throws an error if the fetch fails
      } finally {
        setLoading(false); 
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

// ensures form is completely filled
  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.phone_number) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

// validates session and manages the creation of employees
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
        await axios.post(`${backendUrl}/api/employees`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const response = await axios.get(`${backendUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data.employees || []);
      } else {
        await axios.put(`${backendUrl}/api/employees/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const response = await axios.get(`${backendUrl}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data.employees || []);
      }
      setIsCreating(false);
      setFormData({
        name: '',
        address: '',
        phone_number: '',
        full_time: false,
        hours_worked: 0,
      });
    } catch (err) {
      setError('Error saving employee: ' + (err.response?.data?.message || err.message || 'Unknown error')); // raises an exception if saving data fails
    }
  };

// row click allows for editing data of the tuple (instance of employee)
  const handleRowClick = (employee) => {
    setIsCreating(false);
    setFormData(employee);
  };
// routes user to login page and clears token
  const handleLogout = () => {
    setState('Logged out');
    localStorage.removeItem('token');
    navigate('/login');
  };

// manages deletion of employee after validating session
  const handleDeleteEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authorization token found');
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/employees/${formData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axios.get(`${backendUrl}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees || []);

      setIsCreating(false);
      setFormData({
        name: '',
        address: '',
        phone_number: '',
        full_time: false,
        hours_worked: 0,
      });
    } catch (err) {
      setError('Error deleting employee: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

// JSON data for creating a new employee with a form
  const handleCreateNewEmployee = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      address: '',
      phone_number: '',
      full_time: false,
      hours_worked: 0,
    });
  };

// HTML returned by React
  return (
    <div className="container">
      <div className="header">
        <h1>Manage Employees</h1>
        <div className="underline"></div>
      </div>

      <button className="logout" onClick={handleLogout}>
        <img src={lock_icon} alt="Lock" />
      </button>

      <button className="back-button" onClick={() => navigate('/home')}>
          Back
     </button>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      {(isCreating || formData.id) && (
        <form onSubmit={handleFormSubmit} className="form-container">
          <h2>{formData.id ? 'Edit Employee' : 'Create New Employee'}</h2>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Full-Time</label>
            <input type="checkbox" name="full_time" checked={formData.full_time} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Hours Worked</label>
            <input type="number" name="hours_worked" value={formData.hours_worked} onChange={handleInputChange} />
          </div>
          <button type="submit" className="save-button">{formData.id ? 'Update Employee' : 'Create Employee'}</button>
          {formData.id && (
            <button type="button" onClick={handleDeleteEmployee} className="delete-button">
              Delete Employee
            </button>
          )}
        </form>
      )}

      {employees.length > 0 ? (
        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone Number</th>
                <th>Full-Time</th>
                <th>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} onClick={() => handleRowClick(employee)}>
                  <td>{employee.name}</td>
                  <td>{employee.address}</td>
                  <td>{employee.phone_number}</td>
                  <td>{employee.full_time ? 'Yes' : 'No'}</td>
                  <td>{employee.hours_worked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No employees available</p>
      )}

      <div className="create-new-employee-button-container">
        <button className="create-new-employee" onClick={handleCreateNewEmployee}>
          Create New Employee
        </button>
      </div>
    </div>
  );
};

export default ManageEmployees;