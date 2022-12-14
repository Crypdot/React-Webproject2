//import logo from './logo.svg';
import './App.css';
import React, {useState} from "react"
import Home from './components/Home';
import {Button} from 'react-bootstrap';
import LoginModal from './components/LoginModal'
import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'
import SignupModal from './components/SignupModal';
import NavBar from './components/NavBar';

function App() {

  return (
    <div className="App">
      <NavBar className="NavBar"/>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
