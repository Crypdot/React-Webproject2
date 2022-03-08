import {Button} from 'react-bootstrap';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import ImageForm from './ImageForm'
import React, {useState} from 'react';
import './NavBar.css'

const NavBar = () =>{
  const [showLogin, setShowLogin] = useState(false)
  const [showSign, setSign] = useState(false)
  const [uploadShow, setUploadShow] = useState(false)

  return(
      <div className="NavBar">
        <div className="Upload">
          <Button className="Upload" onClick={() => setUploadShow(true)}>Upload image</Button>
          <ImageForm title="Upload" onClose={() => setUploadShow(false)} show={uploadShow}/>
        </div>

        <div className="User">
          <Button className="Login" onClick={() => setShowLogin(true)}>Log in!</Button>
          <LoginModal onClose={() => setShowLogin(false)} show={showLogin} />

          <Button className="Signup" onClick={() => setSign(true)}>Sign up!</Button>
          <SignupModal onClose={() => setSign(false)} show={showSign} />
        </div>

      </div>
  )
}
export default NavBar