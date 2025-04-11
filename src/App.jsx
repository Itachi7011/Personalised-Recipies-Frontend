import { useState, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import { createContext, useReducer } from "react";
import { reducer, initialState } from "./reducers/UseReducer"


import './App.css'
import './CSS/Navbar.css';
import './CSS/Homepage.css';
import './CSS/Footer.css';

import Navbar from "./Components/NavbarFooter/Navbar"
import Footer from "./Components/NavbarFooter/Footer"
import Homepage from "./Pages/Homepage"


function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (



    <div className={isDarkMode ? 'dark' : 'light'}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
        <Footer />
      </Router>
    </div>

  )
}

export default App
