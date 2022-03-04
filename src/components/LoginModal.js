import React, {useEffect, useRef, useState} from 'react';
import {Form, Button, Modal} from 'react-bootstrap'
import './Modal.css'
import axios from 'axios';
import SignupModal from './SignupModal';

const LoginModal = props => {
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

  const formRef = useRef(null)

  let loginObject = {
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

  const checkUser = async (event) => {
    console.log("Checking user!"+event)

    console.log(loginObject)

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
    updateLogin(username, passwd)
    console.log("CheckUser: loginObject: "+JSON.stringify(loginObject))

    axios
        .post('http://localhost:8082/login', loginObject)
        .then(response=>{
          console.log("response+post promise fulfilled ->"+loginObject)
        setStatus(response.status)
        if(response.status === 202){
          setMessage("Login OK!")
          console.log("Login went okay!"+modalMessage)

          let tokenKey = "myToken"
          let token, tokenObj
          localStorage.setItem(tokenKey, JSON.stringify(response.data))
          token = localStorage.getItem(tokenKey)
          tokenObj = JSON.parse(token)
          console.log("From local storage -> "+tokenObj.accessToken)
        }else if(response.status === 401){
          setMessage("Password is incorrect!")
          console.log("Testing -> "+modalMessage)
        }else if(response.status === 402){
          setMessage("Username not found!")
          console.log("Testing -> "+modalMessage)
        }
        setModal(true)
      handleReset()
    })
        .catch(error => {
          console.log(error)
        })
  }

  const updateLogin = (username, passwd) => {
    console.log("Username is -> "+username+" and password is -> "+passwd)

    loginObject = {
      username: username,
      password: passwd
    }
  }

  const switchViews = () => {
    console.log("Show is ->"+show)
    console.log("And signup is -> "+showSignup)
    setShow(!show)
    setSignup(!showSignup)
  }

  return (
      <div className={`modal ${props.show ? 'show' : ''}`}>
        <Form className={`form ${props.show ? 'show' : ''}`}  >
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control required
                          placeholder="Enter username"
                          name="username"
                          onChange={handleUsernameChange} />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control required
                          type="password"
                          placeholder="Password"
                          name="password"
                          onChange={handlePasswordChange}/>

          </Form.Group>
          <Button variant="primary" type="submit" onClick={checkUser}>Submit</Button>
          <Button variant="primary" style={{background: 'orange', marginLeft: 20}} onClick={props.onClose}>Exit</Button>
        </Form>
      </div>

  );
}

export default LoginModal