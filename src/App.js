import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './Components/HomePage/HomePage.jsx';
import LoginSignup from './Components/LoginSignup/LoginSignup.jsx';
import Inventory from './Components/Inventory/Inventory.jsx';
import ManageAlerts from './Components/ManageAlerts/ManageAlerts.jsx';
import ManageEmployees from './Components/ManageEmployees/ManageEmployees.jsx';
import RentSellDVD from './Components/RentSellDVD/RentSellDVD.jsx';
import ReturnDVD from './Components/ReturnDVD/ReturnDVD.jsx';
import TrackRental from './Components/TrackRental/TrackRental.jsx';
import { NavigationManager, useMyContext } from './Components/NavigationManager/NavigationManager.jsx';



function App() {
  return (
    
    <NavigationManager>
      <Routes>
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/manage-alerts" element={<ManageAlerts />} />
        <Route path="/manage-employees" element={<ManageEmployees />} />
        <Route path="/rent-sell-dvd" element={<RentSellDVD />} />
        <Route path="/return-dvd" element={<ReturnDVD />} />
        <Route path="/track-rental" element={<TrackRental />} />
        <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect unknown routes */}
      </Routes>
    </NavigationManager>
    
  );
}

export default App;
