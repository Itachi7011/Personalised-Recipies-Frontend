import { useState ,useContext} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import { createContext, useReducer } from "react";
import { reducer, initialState } from "./reducers/UseReducer"


import './App.css'
import './CSS/Navbar.css';
import './CSS/Footer.css';

import Navbar from "./Components/NavbarFooter/Navbar"
import Footer from "./Components/NavbarFooter/Footer"


function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (


    <div className={isDarkMode ? 'dark' : 'light'}>
      <Navbar />
      <Footer />
    </div>
  )
}

export default App
