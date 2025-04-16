import { useState, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import { createContext, useReducer } from "react";
import { reducer, initialState } from "./reducers/UseReducer"

import '@splidejs/splide/dist/css/splide.min.css';

import './App.css'
import './CSS/Navbar.css';
import './CSS/Homepage.css';
import './CSS/Footer.css';
import './CSS/Signup.css';
import './CSS/Login.css';
import './CSS/UserProfile.css';
import './CSS/BreakfastRecipes.css';
import './CSS/LunchRecipies.css';
import './CSS/DinnerRecipies.css';
import './CSS/SearchRecipies.css';

import Navbar from "./Components/NavbarFooter/Navbar"
import Footer from "./Components/NavbarFooter/Footer"
import Homepage from "./Pages/Homepage"
import Signup from "./Pages/Signup"
import Login from "./Pages/Login"
import UserProfile from "./Pages/Profile/UserProfile"
import BreakfastRecipies from "./Pages/NavbarRecipiesPages/BreakfastRecipies"
import LunchRecipies from "./Pages/NavbarRecipiesPages/LunchRecipies"
import DinnerRecipies from "./Pages/NavbarRecipiesPages/DinnerRecipies"
import SearchRecipies from "./Pages/SearchRecipies"


function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (



    <div className={isDarkMode ? 'dark' : 'light'}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/BreakfastRecipies" element={<BreakfastRecipies />} />
          <Route path="/LunchRecipies" element={<LunchRecipies />} />
          <Route path="/DinnerRecipies" element={<DinnerRecipies />} />
          <Route path="/SearchRecipies" element={<SearchRecipies />} />
        </Routes>
        <Footer />
      </Router>
    </div>

  )
}

export default App
