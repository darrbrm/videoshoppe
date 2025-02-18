import React, { useState } from 'react';
import './ManageEmployees.css';
import lock_icon from '../Assets/lock_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';

const ManageEmployees = () => {
    const [action, setAction] = useState('Manage Employees');
    const { setState } = useMyContext();

    // Static employee data for the table
    const sampleEmployees = [
        { id: 1, username: 'john_doe', password: 'password123', admin_password: 'adminpass1' },
        { id: 2, username: 'jane_smith', password: 'password456', admin_password: 'adminpass2' },
        { id: 3, username: 'sam_brown', password: 'password789', admin_password: 'adminpass3' },
    ];

    const handleEdit = (id) => {
        console.log(`Edit employee with ID: ${id}`);
        // Placeholder for edit functionality
    };

    const handleDelete = (id) => {
        console.log(`Delete employee with ID: ${id}`);
        // Placeholder for delete functionality
    };

    return (
        <div className='container'>
            {/* Logout button */}
            <button className='logout' onClick={() => setState('Logged out')}>
                <img src={lock_icon} alt='Lock' />
            </button>

            {/* Back to Home button */}
            <button className='back-to-home' onClick={() => setState('Logged in')}>
                Back to Home
            </button>

            {/* Header Section */}
            <div className='header'>
                <div className='text'>Manage Employees</div>
                <div className='underline'></div>
            </div>

            {/* Employee Management Table */}
            <table className='employee-table'>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Admin Password</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleEmployees.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.username}</td>
                            <td>{employee.password}</td>
                            <td>{employee.admin_password}</td>
                            <td>
                                <button onClick={() => handleEdit(employee.id)}>Edit</button>
                                <button onClick={() => handleDelete(employee.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add New Employee Button (Placeholder) */}
            <div className='action-buttons'>
                <button>Add New Employee</button>
            </div>
        </div>
    );
};

export default ManageEmployees;
