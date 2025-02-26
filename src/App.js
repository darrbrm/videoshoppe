import React from 'react';
import './App.css';
import HomePage  from './Components/HomePage/HomePage.jsx';
import LoginSignup from './Components/LoginSignup/LoginSignup.jsx';
import Inventory from './Components/Inventory/Inventory.jsx';
import ManageAlerts from './Components/ManageAlerts/ManageAlerts.jsx';
import ManageEmployees from './Components/ManageEmployees/ManageEmployees.jsx';
import RentSellDVD from './Components/RentSellDVD/RentSellDVD.jsx';
import ReturnDVD from './Components/ReturnDVD/ReturnDVD.jsx';
import TrackRental from './Components/TrackRental/TrackRental.jsx';
import { NavigationManager } from './Components/NavigationManager/NavigationManager.jsx';
import { useMyContext } from './Components/NavigationManager/NavigationManager.jsx';

function App() {
  const { state } = useMyContext();

  return (
    <>
      {state === 'Logged out' && <LoginSignup />}
      {state === 'Logged in' && <HomePage />}
      {state === 'Inventory' && <Inventory />}
      {state === 'Manage Alerts' && <ManageAlerts />}
      {state === 'Manage Employees' && <ManageEmployees />}
      {state === 'Rent / Sell DVD' && <RentSellDVD />}
      {state === 'Return DVD' && <ReturnDVD />}
      {state === 'Track Rental' && <TrackRental />}
    </>
  );
}
export default App;
