import {Button} from 'react-bootstrap';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import ImageForm from './ImageForm'
import React, {useState} from 'react';

const NavBar = () =>{
  const [showLogin, setShowLogin] = useState(false)
  const [showSign, setSign] = useState(false)
  const [uploadShow, setUploadShow] = useState(false)

  return(
      <div className="container">
      <Button onClick={() => setUploadShow(true)}>Upload image</Button>
        <ImageForm title="Upload" onClose={() => setUploadShow(false)} show={uploadShow}></ImageForm>

      <Button onClick={() => setShowLogin(true)}>Log in!</Button>
        <LoginModal onClose={() => setShowLogin(false)} show={showLogin} />

        <Button onClick={() => setSign(true)}>Sign up!</Button>
        <SignupModal onClose={() => setSign(false)} show={showSign} />
      </div>
  )
}
export default NavBar