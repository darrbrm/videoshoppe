import React, {useState} from 'react'
import './HomePage.css'
import lock_icon from '../Assets/lock_icon.svg'
import { useMyContext } from '../NavigationManager/NavigationManager';

const HomePage = () => {
    const [action, setAction] = useState("HomePage");
    const {setState} = useMyContext();
    return (

/* container class which contains all of the elements (subclasses) of the page */
        <div className = 'container'>
            <button className = 'logout'
                onClick = {() => setState('Logged out')}>
                <img src = {lock_icon} alt = 'Lock'></img>
                
            </button>
            <div className = 'header'>
                <div className = 'text'>HomePage</div>
                <div className = 'underline'></div>
            </div>
            <div className = 'submit-container'>

            
{ /* click of the rent / sell dvd button while current action is anything else swaps the state to rent / sell dvd */ }
            <div className = {action === 'Rent / Sell DVD' ? 'submit gray' : 'submit'}
                onClick = {action === 'Rent / Sell DVD' ? () => setState('Rent / Sell DVD') : () => setAction('Rent / Sell DVD')}
                >Rent / Sell DVD
                </div>

{ /* click of the manage employee button while current action is anything else swaps the state to manage employees */ }
                <div className = {action === 'Manage Employees' ? 'submit gray' : 'submit'}
                onClick = {action === 'Manage Employees' ? () => setState('Manage Employees') : () => setAction('Manage Employees')}
                >Manage Employees
                </div>
{ /* click of the track rental button while current action is anything else swaps the state to track rental */ }
                <div className = {action === 'Track Rental' ? 'submit gray' : 'submit'}
                onClick = {action === 'Track Rental' ? () => setState('Track Rental') : () => setAction('Track Rental')}
                >Track Rental
                </div>
{ /* click of the manage employee button while current action is anything else swaps the state to retrun DVD */ }
                <div className = {action === 'Return DVD' ? 'submit gray' : 'submit'}
                onClick = {action === 'Return DVD' ? () => setState('Return DVD') : () => setAction('Return DVD')}
                >Return DVD
                </div>
{ /* click of the manage alerts button while current action is anything else swaps the state to manage alerts */ }
                <div className = {action === 'Manage Alerts' ? 'submit gray' : 'submit'}
                onClick = {action === 'Manage Alerts' ? () => setState('Manage Alerts') : () => setAction('Manage Alerts')}
                >Manage Alerts
                </div>
{ /* click of the inventory button while current action is anything else swaps the state to inventory */ }
                <div className = {action === 'Inventory' ? 'submit gray' : 'submit'}
                onClick = {action === 'Inventory' ? () => setState('Inventory') : () => setAction('Inventory')}
                >Inventory
                </div>
                
            </div>
        </div>
        


    );
};

export default HomePage;