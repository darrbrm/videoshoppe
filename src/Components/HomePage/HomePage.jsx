import React from 'react';
import '../VideoShoppeUIStyleSheets/GenericStyle.css';
import lock_icon from '../Assets/lock_icon.svg';
import { useMyContext } from '../NavigationManager/NavigationManager';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AdminAuth/AdminAuth';


const HomePage = () => {
    const { setState } = useMyContext();
    const {isAuthenticated, isAdmin} = useAuth();
    const navigate = useNavigate(); // <-- Add this

    const handleNavigation = (newState, path) => {
        setState(newState);
        navigate(path); // <-- Update the URL properly
    };

    if (isAuthenticated && isAdmin) {
        return (
            <div className='container'>
                <button className='logout' onClick={() => { 
                    setState('Logged out'); 
                    localStorage.removeItem('authState'); // Clear auth on logout
                    navigate('/login'); 
                }}>
                    <img src={lock_icon} alt='Lock' />
                </button>
                <div className='header'>
                    <div className='text'>Home Page</div>
                    <div className='underline'></div>
                </div>
                <div className='submit-container'>
                    <div className='submit' onClick={() => handleNavigation('Rent / Sell DVD', '/rent-sell-dvd')}>
                        Rent / Sell DVD
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Manage Employees', '/manage-employees')}>
                        Manage Employees
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Track Rental', '/track-rental')}>
                        Track Rental
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Return DVD', '/return-dvd')}>
                        Return DVD
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Manage Alerts', '/manage-alerts')}>
                        Manage Alerts
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Inventory', '/inventory')}>
                        Inventory
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className='container'>
                <button className='logout' onClick={() => { 
                    setState('Logged out'); 
                    localStorage.removeItem('authState'); // Clear auth on logout
                    navigate('/login'); 
                }}>
                    <img src={lock_icon} alt='Lock' />
                </button>
                <div className='header'>
                    <div className='text'>Home Page</div>
                    <div className='underline'></div>
                </div>
                <div className='submit-container'>
                    <div className='submit' onClick={() => handleNavigation('Rent / Sell DVD', '/rent-sell-dvd')}>
                        Rent / Sell DVD
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Track Rental', '/track-rental')}>
                        Track Rental
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Return DVD', '/return-dvd')}>
                        Return DVD
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Manage Alerts', '/manage-alerts')}>
                        Manage Alerts
                    </div>
                    <div className='submit' onClick={() => handleNavigation('Inventory', '/inventory')}>
                        Inventory
                    </div>
                </div>
            </div>
        );
    
};


export default HomePage;
