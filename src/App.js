//import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import {Button} from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Routes, Route, Link, BrowserRouter
} from 'react-router-dom'

function App() {
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

    </div>
  );
}

export default App;
