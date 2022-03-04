import {Button, Form, Modal} from 'react-bootstrap';
import React, {useRef, useState} from 'react';
import axios from 'axios';
import LoginModal from './LoginModal';

const SignupModal = props =>{
  const [username, setUsername] = useState('')
  const [passwd, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [validated, setValidated] = useState(false)
  const [httpStatus, setStatus] = useState(0)

  const [show, setShow] = useState(false)
  const [modalShow, setModal] = useState(false)
  const [showSignup, setSignup] = useState(false)
  const [modalMessage, setMessage] = useState('')
  const handleClose = () => setShow(false)
  const handleSignClose = () => setSignup(false)
  const handleModalClose = () =>{ setModal(false) }

  console.log("SIGNUP MODAL SHOW IS -> "+showSignup)

  const formRef = useRef(null)

  let signupObject = {
    email: email,
    username: username,
    password: passwd
  }

  const handleReset = () =>{
    console.log("Testing -> "+modalMessage)
    formRef.current.reset()
    setValidated(false)
  }

  const handleUsernameChange = (event) => {
    console.log(event.target.value)
    setUsername(event.target.value)
  }
  const handlePasswordChange = (event) => {
    console.log(event.target.value)
    setPassword(event.target.value)
  }
  const handleEmailChange = (event) => {
    console.log(event.target.value)
    setEmail(event.target.value)
  }

  const updateSignup = (email, username, passwd) => {
    console.log("Username is -> "+username+" and password is -> "+passwd+" and email is -> "+email)

    signupObject = {
      email: email,
      username: username,
      password: passwd
    }
  }

  const signUp = async (event) => {

    event.preventDefault()
    const form = event.currentTarget

    if(form.checkValidity() === false){
      event.stopPropagation()
    }

    console.log("Got past the validity check")
    setValidated(true)

    if(form.checkValidity() === false){
      console.log("Form is invalid, returning!")
      return
    }
    updateSignup(email,username, passwd)
    console.log("CheckUser: signupObject: "+JSON.stringify(signupObject))

    axios
        .post('http://localhost:8082/signup', signupObject)
        .then(response=>{
          console.log("response+post promise fulfilled ->"+signupObject)
          setStatus(response.status)
          if(response.status === 201){
            setMessage("Signup OK!")
            console.log("Signing up went okay!"+modalMessage)

          }else if(response.status === 202){
            setMessage("This user exists already!")
            console.log("Testing -> "+modalMessage)
          }else{
            setMessage("Something unpredictable went wrong!")
            console.log("Testing -> "+modalMessage)
          }
          setModal(true)
          handleReset()
        })
        .catch(error => {
          console.log(error)
        })
  }


  return(
      <div className={`modal ${props.show ? 'show' : ''}`}>
        <Form className="form" show={showSignup} onHide={handleClose}>
          <Form.Group className="mb-3" controlId="signUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control required
                          type="email"
                          placeholder="Enter username"
                          name="signUsername"
                          onChange={handleUsernameChange}/>
          </Form.Group>

          <Form.Group className="mb-3" controlId="signEmail">
            <Form.Label>E-mail</Form.Label>
            <Form.Control required
                          type="email"
                          placeholder="Enter email"
                          name="email" onChange={handleEmailChange} />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control required type="password" placeholder="Password" name="password" onChange={handlePasswordChange}/>
          </Form.Group>
          <Button variant="primary" type="submit" onClick={signUp}>Submit</Button>
          <Button variant="primary" style={{background: 'orange', marginLeft: 20}} onClick={props.onClose}>Exit</Button>
        </Form>

    <Modal show={modalShow} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Info</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
  )
}
export default SignupModal