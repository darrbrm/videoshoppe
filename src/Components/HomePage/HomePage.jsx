import React, {useState} from 'react'
import '../VideoShoppeUIStyleSheets/GenericStyle.css'
import lock_icon from '../Assets/lock_icon.svg'
import { useMyContext } from '../NavigationManager/NavigationManager';

const HomePage = () => {
    const { setState } = useMyContext();

    // Function to handle state change and page transition
    const handleStateChange = (newState) => {
        setState(newState);  // This will immediately trigger the page transition
    };

    return (
        <div className='container'>
            <button className='logout' onClick={() => setState('Logged out')}>
                <img src={lock_icon} alt='Lock' />
            </button>
            <div className='header'>
                <div className='text'>Home Page</div>
                <div className='underline'></div>
            </div>
            <div className='submit-container'>

                {/* Rent / Sell DVD */}
                <div className='submit' onClick={() => handleStateChange('Rent / Sell DVD')}>
                    Rent / Sell DVD
                </div>

                {/* Manage Employees */}
                <div className='submit' onClick={() => handleStateChange('Manage Employees')}>
                    Manage Employees
                </div>

                {/* Track Rental */}
                <div className='submit' onClick={() => handleStateChange('Track Rental')}>
                    Track Rental
                </div>

                {/* Return DVD */}
                <div className='submit' onClick={() => handleStateChange('Return DVD')}>
                    Return DVD
                </div>

                {/* Manage Alerts */}
                <div className='submit' onClick={() => handleStateChange('Manage Alerts')}>
                    Manage Alerts
                </div>

                {/* Inventory */}
                <div className='submit' onClick={() => handleStateChange('Inventory')}>
                    Inventory
                </div>

            </div>
        </div>
    );
};

export default HomePage;
