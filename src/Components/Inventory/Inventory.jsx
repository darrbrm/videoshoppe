import React, {useState} from 'react'
import '../VideoShoppeUIStyleSheets/GenericStlye.css'
import lock_icon from '../Assets/lock_icon.svg'
import { useMyContext } from '../NavigationManager/NavigationManager';

const Inventory = () => {
    const [action, setAction] = useState('Inventory');
    const {setState} = useMyContext();
    return (

/* container class which contains all of the elements (subclasses) of the page */
        <div className = 'container'>
            <button className = 'logout'
                onClick = {() => setState('Logged out')}>
                <img src = {lock_icon} alt = 'Lock'></img>
                
            </button>
            <div className = 'header'>
                <div className = 'text'>Inventory</div>
                <div className = 'underline'></div>
            </div>
            <div className = 'submit-container'>

            </div>
        </div>
    );
};

export default Inventory;