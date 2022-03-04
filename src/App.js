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

function App() {



  const [show, setShow] = useState(false)
  const [showSign, setSign] = useState(false)
  return (
    <div className="App">
    <Router>
      <Link to={"home"}>
      <Button>Home</Button>
      </Link>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
      </Routes>
    </Router>

      <div>
        <Button onClick={() => setShow(true)}>Log in!</Button>
        <LoginModal onClose={() => setShow(false)} show={show} />
      </div>

      <div>
        <Button onClick={() => setSign(true)}>Sign up!</Button>
        <SignupModal onClose={() => setSign(false)} show={showSign} />
      </div>

    </div>
  );
}

export default App;
